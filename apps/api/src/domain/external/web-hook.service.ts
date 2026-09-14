import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { FindOptionsWhere, In } from 'typeorm'

import { WebhookPayload, WebhookType } from '@/application/admin/web-hooks/dto/web-hook.dto'
import { Institution } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { NotificationStatus } from '@/models/notification-record.entity'
import InvoiceWorker from '@/modules/worker/invoice.worker'
import LessonWorker from '@/modules/worker/lesson.worker'
import { shallow } from '@/utils/shallow.utils'

import { NotificationRecordService } from '../service/notification-log.service'
import { UsersService } from '../service/users.service'

@Injectable()
export class WebHookService {
  private readonly logger: Logger
  constructor(
    private readonly notificationRecordService: NotificationRecordService,
    private readonly institutionRepository: InstitutionsRepository,
    private readonly invoiceWorker: InvoiceWorker,
    private readonly lessonWorker: LessonWorker,
    private readonly usersService: UsersService
  ) {
    this.logger = new Logger(WebHookService.name)
  }

  async handleWebHook(payload: WebhookPayload) {
    const { type, ...otherPayload } = payload
    try {
      this.logger.log(`Handling webhook for type: ${type}`)
      switch (type) {
        case WebhookType.COLLECT_INVOICES:
          return this.handleCollectInvoices(otherPayload)
        case WebhookType.CREATE_INVOICE:
          return this.invoiceWorker.handleCreateInvoice(otherPayload.invoiceIds)
        case WebhookType.NEXT_BILLING_INVOICE:
          return this.handleNextBillingCycle(payload)
        case WebhookType.RECORD_NOTIF_LOG:
          return this.saveNotificationLog(otherPayload)
        case WebhookType.COLLECT_LESSONS:
          return this.handleCollectLessons(otherPayload)
        case WebhookType.GET_INSTITUTION:
          return this.handleGetInstitution()
      }
    } catch (error) {
      this.logger.error(`Error handling webhook for type: ${type}`, error)
      throw new InternalServerErrorException('Error handling webhook')
    }
  }

  async handleGetInstitution() {
    const institutionIds =
      process.env.TESTING_INSTITUTION_IDS !== ''
        ? process.env.TESTING_INSTITUTION_IDS.split(',')
        : []
    const where: FindOptionsWhere<Institution> = {}
    let institutions = []

    if (institutionIds.length > 0) {
      where.id = In(institutionIds.map(Number))
      institutions = await this.institutionRepository.find({
        where,
        select: ['id', 'name', 'phone', 'siteId', 'n8nWorkflowId'],
      })
    } else {
      institutions = await this.institutionRepository.find({
        select: ['id', 'name', 'phone', 'siteId', 'n8nWorkflowId'],
      })
    }

    return institutions.map((institution) =>
      shallow({
        source: institution,
        fields: ['id', 'name', 'phone', 'siteId', 'n8nWorkflowId'],
      })
    )
  }

  async handleCollectInvoices(payload: any) {
    const { meta, institutionId } = payload
    if (meta.length <= 0) {
      return
    }
    const { field, ...other } = meta[0]
    const value = other[`${field}Interval`]
    return this.invoiceWorker.collectInvoices(institutionId, [], `${value} ${field}`)
  }

  async handleCollectLessons(payload: any) {
    const { meta, institutionId, intervalBeforeLesson } = payload
    if (meta.length <= 0) {
      return
    }
    const { field, ...other } = meta[0]
    const value = other[`${field}Interval`]
    return this.lessonWorker.collectLessons(
      institutionId,
      [],
      `${value} ${field}`,
      intervalBeforeLesson
    )
  }

  async handleNextBillingCycle(payload) {
    const { meta, institutionId } = payload
    const { interval, value } = meta['Rules']
    return this.invoiceWorker.handleNextBillingInvoice({
      institutionId,
      courseIds: [],
      interval: `${value} ${interval}`,
    })
  }

  async saveNotificationLog(payload) {
    const { institutionId, message, success, to } = payload
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    })
    const adminUser = await this.usersService.getUserOwnerOfInstitution(institutionId)
    if (!institution || !adminUser) {
      return
    }
    await this.notificationRecordService.saveNotificationLog({
      messageContent: message,
      notificationStatus: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
      recipientUserId: adminUser.id,
      recipientUserPhone: to?.split('@')[0] || institution.phone,
      institutionId: institution.id,
      siteId: institution.siteId,
    })
  }
}
