import { Injectable } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { In, MoreThanOrEqual } from 'typeorm'

import {
  PlanWithQuotas,
  QuotaItems,
} from '@/application/admin/subscription-plans/dto/subscription-plans.dto'
import { FREE_SUBSCRIPTION_PLAN_RECORDS } from '@/common/constants/subscription-plans.constant'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { NotificationRecordRepository } from '@/models/notification-record.repository'
import { SubscriptionPlanRecordsEntity } from '@/models/subscription-plan-records.entity'
import { PlanType, SubscriptionPlan } from '@/models/subscription-plans.entity'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { UsersRepository } from '@/models/users.repository'

import { SubscriptionPlanRecordsService } from './subscription-plan-records.service'

@Injectable()
export class SubscriptionSummaryService {
  constructor(
    private readonly userRoleRepository: UserRolesRepository,
    private readonly userRepository: UsersRepository,
    private readonly subscriptionService: SubscriptionPlanRecordsService,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly notificationRecordRepository: NotificationRecordRepository
  ) {}

  async myPlanAndQuotas(institutionId: number): Promise<PlanWithQuotas> {
    const institution = await this.institutionsRepository.findOne({ where: { id: institutionId } })

    const subscriptionPlanRecords = await this.subscriptionService.getActivePlan(institution.siteId)

    if (!subscriptionPlanRecords) {
      return await this.generateQuotas(
        institution.siteId,
        institutionId,
        FREE_SUBSCRIPTION_PLAN_RECORDS.baseUserQuantity,
        FREE_SUBSCRIPTION_PLAN_RECORDS.notificationQuantity
      )
    }

    return await this.generateQuotas(
      institution.siteId,
      institutionId,
      subscriptionPlanRecords.baseUserQuantity,
      subscriptionPlanRecords.notificationQuantity
    )
  }

  async generateQuotas(
    siteId: number,
    institutionId: number,
    baseUserQuantity: number,
    notificationQuantity: number
  ): Promise<PlanWithQuotas> {
    const [activeStudentsCount, monthlyNotificationSent] = await Promise.all([
      this.getActiveStudents(siteId, institutionId),
      this.getMonthlyNotificationSent(siteId, institutionId),
    ])

    return {
      activeStudents: {
        quota: baseUserQuantity,
        used: activeStudentsCount,
      },
      reminder: {
        quota: notificationQuantity,
        used: monthlyNotificationSent,
      },
    }
  }
  /**
   * Gets quota information for specific plans, including current usage and available quotas.
   * @param siteId - The site ID to get quotas for
   * @param planIds - Array of plan IDs to retrieve quota information for
   * @returns Record mapping plan Types to their quota information
   */
  async getPlanQuotas(siteId: number, planIds: number[]): Promise<Record<PlanType, QuotaItems>> {
    // Get the plan record and plan details
    const [planRecord, plans] = await Promise.all([
      this.subscriptionService.getSubscriptionPlanRecordWithPlans(siteId, false),
      this.subscriptionService.getPlansById(planIds),
    ])

    // Generate quotas for each plan
    const quotasMap = {}

    for (const plan of plans) {
      const quotaInfo = await this.calculateQuotaForPlan(plan, planRecord, siteId)
      if (quotaInfo) {
        quotasMap[plan.type] = quotaInfo
      }
    }

    return quotasMap as Record<PlanType, QuotaItems>
  }

  async getActiveStudents(siteId: number, institutionId?: number): Promise<number> {
    const whereCondition = {
      siteId,
    }
    if (institutionId) {
      whereCondition['institutionId'] = institutionId
    }
    const userRoles = await this.userRoleRepository.find({
      where: whereCondition,
      withDeleted: false,
    })

    const userRolesIds = userRoles.map((ur) => ur.userId)
    return this.userRepository.count({
      where: {
        id: In(userRolesIds),
      },
    })
  }

  async getMonthlyNotificationSent(siteId: number, institutionId?: number): Promise<number> {
    const currentTime = dayjs()
    const whereCondition = {
      siteId,
      createdAt: MoreThanOrEqual(currentTime.startOf('month').toDate()),
    }

    if (institutionId) {
      whereCondition['institutionId'] = institutionId
    }
    return await this.notificationRecordRepository.count({
      where: whereCondition,
    })
  }

  /**
   * Calculates quota information for a specific plan type.
   */
  private async calculateQuotaForPlan(
    plan: SubscriptionPlan,
    planRecord: SubscriptionPlanRecordsEntity,
    siteId: number
  ): Promise<QuotaItems | null> {
    const quotaCalculators = {
      [PlanType.MULTIPLE_TUTOR]: async () => this.calculateTutorQuota(planRecord, siteId),
      [PlanType.MULTIPLE_ADMIN]: () => this.calculateAdminQuota(planRecord, siteId),
      [PlanType.MULTIPLE_SCHOOL]: () => this.calculateSchoolQuota(planRecord, siteId),
      [PlanType.BASE_USER]: () => this.calculateBaseUserQuota(planRecord, siteId),
      [PlanType.NOTIFICATION_QUOTA]: () => this.calculateNotificationQuota(planRecord, siteId),
    }

    const calculator = quotaCalculators[plan.type]
    return calculator ? await calculator() : null
  }

  /**
   * Calculates tutor quota information.
   **/
  private async calculateTutorQuota(planRecord: SubscriptionPlanRecordsEntity, siteId: number) {
    const used = await this.getCountTutorUserRoles(siteId)
    return {
      quota: planRecord.tutorQuantity,
      used,
    }
  }

  /**
   * Calculates admin quota information.
   */
  private async calculateAdminQuota(
    planRecord: SubscriptionPlanRecordsEntity,
    siteId: number
  ): Promise<QuotaItems> {
    const used = await this.getCountAdminUserRoles(siteId)
    return {
      quota: planRecord.adminQuantity,
      used,
    }
  }

  /**
   * Calculates school quota information.
   */
  private async calculateSchoolQuota(
    planRecord: SubscriptionPlanRecordsEntity,
    siteId: number
  ): Promise<QuotaItems> {
    const used = await this.getCountOfSchools(siteId)
    return {
      quota: planRecord.schoolQuantity,
      used,
    }
  }

  /**
   * Calculates base user quota information.
   */
  async calculateBaseUserQuota(
    planRecord: SubscriptionPlanRecordsEntity,
    siteId: number
  ): Promise<QuotaItems> {
    const used = await this.getActiveStudents(siteId)
    return {
      quota: planRecord.baseUserQuantity,
      used,
    }
  }

  /**
   * Calculates notification quota information.
   */
  async calculateNotificationQuota(
    planRecord: SubscriptionPlanRecordsEntity,
    siteId: number
  ): Promise<QuotaItems> {
    const used = await this.getMonthlyNotificationSent(siteId)
    return {
      quota: planRecord.notificationQuantity,
      used,
    }
  }

  async getCountAdminUserRoles(siteId: number) {
    return this.userRepository.count({
      where: {
        userRoles: [
          { siteId, isSiteManager: true },
          { siteId, isMasterAdmin: true },
          { siteId, isOperator: true },
        ],
      },
      relations: ['userRoles'],
    })
  }

  async getCountTutorUserRoles(siteId: number) {
    return this.userRepository.count({
      where: {
        userRoles: { siteId, isInstructor: true },
      },
      relations: ['userRoles'],
    })
  }

  async getCountOfSchools(siteId: number): Promise<number> {
    return this.institutionsRepository.count({
      where: { siteId },
    })
  }
}
