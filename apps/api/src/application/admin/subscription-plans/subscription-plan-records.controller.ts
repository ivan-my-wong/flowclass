import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { Transactional } from 'typeorm-transactional'

import { ApiResult, IApiResult } from '@/common/api-formats/api-result'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { AddSubscriptionPlanService } from '@/domain/service/subscription-service/add-subscription.service'
import { CancelSubscriptionService } from '@/domain/service/subscription-service/cancel-subscription.service'
import { DowngradeSubscriptionService } from '@/domain/service/subscription-service/downgrade-subscription.service'
import { SubscriptionPresetPlansService } from '@/domain/service/subscription-service/preset-plans.service'
import { SubmitSubscriptionService } from '@/domain/service/subscription-service/submit-subscription.service'
import { SubscriptionPlanRecordsService } from '@/domain/service/subscription-service/subscription-plan-records.service'
import { SubscriptionSummaryService } from '@/domain/service/subscription-service/subscription-summary.service'
import { SubstituteSubscriptionService } from '@/domain/service/subscription-service/substitute-subscription.service'
import { UpgradeSubscriptionService } from '@/domain/service/subscription-service/upgrade-subscription.service'
import { RequireParam, Role } from '@/models/enums'
import { SubscriptionPlanRecordsEntity } from '@/models/subscription-plan-records.entity'
import { PlanType } from '@/models/subscription-plans.entity'
import { shallow } from '@/utils/shallow.utils'

import { CreatePlanDto } from './dto/create-subscription-plans.dto'
import { SubscribePresetPlansDto } from './dto/preset-plans.dto'
import {
  GetPlansQuota,
  PlanWithQuotas,
  QuotaItems,
  SubscriptionPlanCheckoutResponse,
} from './dto/subscription-plans.dto'
import {
  getAllPlanSchema,
  getPlanWithQuotas,
  getSubscriptionPlanCheckoutResponse,
} from './dto/subscription-plans.schema'
import { UpdateSubscriptionPlanRecordsDto } from './dto/update-subscription-plan-records.dto'
import {
  AddPlanDto,
  CancelPlanDto,
  DowngradeSubscriptionPlanDto,
  SubstitutePlanDto,
  UpgradePlanRequestDto,
  UpgradeSubscriptionPlanDto,
} from './dto/upgrade-subscription-plans.dto'

@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('subscription-plan-records')
export class SubscriptionPlanRecordsController {
  constructor(
    private readonly subscriptionService: SubscriptionPlanRecordsService,
    private readonly subscriptionSummaryService: SubscriptionSummaryService,
    private readonly substituteSubscriptionService: SubstituteSubscriptionService,
    private readonly cancelSubscriptionService: CancelSubscriptionService,
    private readonly submitSubscriptionService: SubmitSubscriptionService,
    private readonly upgradeSubscriptionService: UpgradeSubscriptionService,
    private readonly addSubscriptionService: AddSubscriptionPlanService,
    private readonly downgradeSubscriptionService: DowngradeSubscriptionService,
    private readonly presetPlansService: SubscriptionPresetPlansService
  ) {}

  // The following are those that can be done by MASTER_ADMIN

  @Get()
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  async findAll(@Query('siteId') siteId?: number) {
    return this.subscriptionService.findAll(siteId ? Number(siteId) : undefined)
  }

  @Post('direct-upgrade')
  @ApiOperation({
    summary: 'This api for institution manager use to subscribe or upgrade plans',
  })
  @ApiOkResponse({
    schema: getAllPlanSchema,
  })
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  async upgradePlanDirectly(
    @Body() upgradePlanDto: UpgradePlanRequestDto
  ): Promise<SubscriptionPlanRecordsEntity> {
    return this.upgradeSubscriptionService.upgradePlanDirectly({
      plans: upgradePlanDto.plans,
      siteId: upgradePlanDto.siteId,
      interval: upgradePlanDto.interval,
      totalPrice: upgradePlanDto.totalPrice,
      currency: upgradePlanDto.currency,
      // stripeSubscriptionId: upgradePlanDto.stripeSubscriptionId,
    })
  }

  // The following are those that can be done by SITE_MANAGER

  @Get(':id')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.findOne(id)
  }

  @Put(':id')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async update(@Param('id') id: number, @Body() data: UpdateSubscriptionPlanRecordsDto) {
    return this.subscriptionService.update(id, data)
  }

  @Delete(':id')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: number) {
    await this.subscriptionService.delete(id)
    return { success: true }
  }

  @Post('create-multiple')
  @ApiOperation({
    summary:
      'Create subscription plan records for institution and site with multiple plans/intervals',
  })
  @ApiOkResponse({
    schema: getSubscriptionPlanCheckoutResponse,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async createPlanRecords(
    @Body() createPlanDto: CreatePlanDto
  ): Promise<SubscriptionPlanCheckoutResponse> {
    return this.submitSubscriptionService.createMultiplePlanRecords({
      institutionId: createPlanDto.institutionId,
      siteId: createPlanDto.siteId,
      plans: createPlanDto.plans,
    })
  }

  @Post(':siteId/substitute-plan')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async substitutePlan(
    @Param('siteId') siteId: number,
    @Body() substitutePlanDto: SubstitutePlanDto
  ) {
    return this.substituteSubscriptionService.substitutePlan(siteId, substitutePlanDto)
  }

  @Put(':siteId/cancel-plan')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async cancelPlan(@Param('siteId') siteId: number, @Body() cancelDto: CancelPlanDto) {
    return this.cancelSubscriptionService.cancelPlan(siteId, cancelDto)
  }

  @Post(':siteId/add-plan')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async addPlan(@Param('siteId') siteId: number, @Body() addPlanDto: AddPlanDto) {
    return this.addSubscriptionService.addPlan(siteId, addPlanDto)
  }
  @Post(':siteId/preview-add-plan')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async previewAddPlan(@Param('siteId') siteId: number, @Body() addPlanDto: AddPlanDto) {
    const record = await this.subscriptionService.getActivePlan(siteId)
    const stripeConnectAccount = await this.subscriptionService.getConnectAccount(siteId)
    const result = await this.addSubscriptionService.previewAddPlan(
      record,
      addPlanDto,
      stripeConnectAccount?.customerId
    )
    return {
      currency: record.currency,
      ...shallow({
        source: result,
        fields: Object.keys(result),
        exceptFields: ['upcomingInvoice', 'subscriptionItems', 'plans'],
      }),
    }
  }

  @Post(':siteId/upgrade-plan')
  @ApiOperation({
    summary: 'This api for institution manager use to upgrade plans and enable features',
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  upgradePlan(@Param('siteId') siteId: number, @Body() upgradeDto: UpgradeSubscriptionPlanDto) {
    return this.upgradeSubscriptionService.upgradePlan(siteId, upgradeDto)
  }

  @Post(':siteId/preview-upgrade-plan')
  @ApiOperation({
    summary: 'This api for institution manager use to preview upgrade plans and enable features',
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  previewUpgradePlan(
    @Param('siteId') siteId: number,
    @Body() upgradeDto: UpgradeSubscriptionPlanDto
  ) {
    const { newPlans } = upgradeDto
    try {
      return this.upgradeSubscriptionService.previewUpgradeCost(siteId, newPlans)
    } catch (error) {
      throw new BadRequestException('Failed to preview upgrade plan')
    }
  }

  @Post(':siteId/downgrade-plan')
  @ApiOperation({
    summary: 'This api for institution manager use to downgrade plans and disable features',
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  downgradePlan(
    @Param('siteId') siteId: number,
    @Body() downgradeDto: DowngradeSubscriptionPlanDto
  ) {
    return this.downgradeSubscriptionService.downgradePlan(siteId, downgradeDto)
  }

  @Delete(':siteId/cancel-subscription')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async cancelSubscription(@Param('siteId') siteId: number) {
    return this.subscriptionService.cancelSubscription(siteId)
  }

  // The below section are reserved for institution manager
  // Find One by institutionId
  @Get('site/:siteId')
  async findOneBySiteId(@Param('siteId') siteId: number) {
    return this.subscriptionService.getSubscriptionPlanRecordWithPlans(siteId, true)
  }

  @Get('site/:siteId/active')
  @ApiOperation({
    summary: 'This api for institution manager use to get plan and quotas',
  })
  @ApiExtraModels(PlanWithQuotas)
  @ApiOkResponse({
    schema: getPlanWithQuotas,
  })
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getActivePlan(@Param('siteId') siteId: number): Promise<SubscriptionPlanRecordsEntity> {
    return this.subscriptionService.getActivePlan(siteId)
  }

  @Post('site/:siteId/create-trial')
  @ApiOperation({
    summary: 'This api for institution manager use to create trial plan',
  })
  @ApiOkResponse({
    schema: getAllPlanSchema,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async createTrialPlan(@Param('siteId') siteId: number): Promise<SubscriptionPlanRecordsEntity> {
    return this.subscriptionService.createTrialPlan(siteId)
  }

  @Post(':siteId/quotas')
  @ApiOperation({
    summary:
      'This api for site manager or institution manager to get quotas of plans based on given planIds',
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getSiteQuotas(
    @Param('siteId') siteId: number,
    @Body() getPlanQuotasDto: GetPlansQuota
  ): Promise<IApiResult<Record<PlanType, QuotaItems>>> {
    const result = await this.subscriptionSummaryService.getPlanQuotas(
      siteId,
      getPlanQuotasDto.planIds
    )
    return new ApiResult<Record<PlanType, QuotaItems>>().success(result)
  }

  @Get('institution/:institutionId/quotas')
  @ApiOperation({
    summary: 'This api for institution manager use to get plan and quotas',
  })
  @ApiExtraModels(PlanWithQuotas)
  @ApiOkResponse({
    schema: getPlanWithQuotas,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getQuotas(
    @Param('institutionId') institutionId: number
  ): Promise<IApiResult<PlanWithQuotas>> {
    const result = await this.subscriptionSummaryService.myPlanAndQuotas(institutionId)
    return new ApiResult<PlanWithQuotas>().success(result)
  }

  @Get('site/:siteId/payment-history')
  @ApiOperation({
    summary: 'This api for institution manager use to get payment history',
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getPaymentHistory(@Param('siteId') siteId: number) {
    return this.subscriptionService.getPaymentHistory(siteId)
  }

  @Post('preset-plans/subscribe')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR,
    Role.STUDENT
  )
  @UseGuards(RolesGuard)
  async createPresetSubscription(@Body() presetDto: SubscribePresetPlansDto) {
    return this.presetPlansService.createPresetSubscription(presetDto)
  }
}
