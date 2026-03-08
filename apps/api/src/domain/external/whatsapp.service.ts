import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'

import {
  AddLessonEmailDTO,
  ChangeLessonWtsDTO,
  SendWtsDTO,
} from '@/application/admin/setting-notifications/setting-notifications.dto'
import { ApiError } from '@/common/api-formats/api-error'
import {
  ActionTypeLessonWts,
  AutomationFunctionNames,
  GlobalWhatsappContentSID,
} from '@/common/constants/whatsappTemplate'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { NotificationRecordService } from '@/domain/service/notification-log.service'
import { WhatsappTemplateErrorMessage } from '@/exceptions/error-message/whatsapp-template'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import {
  AssociatedClassType,
  NotificationRecord,
  NotificationType,
} from '@/models/notification-record.entity'
import { WhatsappTemplateEntity } from '@/models/whatsapp-template.entity'
import { shallow } from '@/utils/shallow.utils'

import { WhatsappTemplateService } from '../service/whatsapp-template.service'

export interface RemindPaymentWts {
  recipientUserId: number
  institutionId: number
  siteId: number
  customMessage?: string
  apiSid?: string
  apiToken?: string
  wtsPhoneNumber?: string
  studentPhone: string
  contentSid?: string
  contentVariables?: Record<string, string>
  associatedClass?: AssociatedClassType | AssociatedClassType[]
}

@Injectable()
export class WhatsappService {
  constructor(
    private readonly logger: CloudWatchLoggerProvider,
    private readonly whatsappTemplateService: WhatsappTemplateService,
    private readonly notificationLogService: NotificationRecordService
  ) {}

  async sendWhatsappMessage(sendWtsDTO: SendWtsDTO, userId: number): Promise<any> {
    const template = await this.whatsappTemplateService.getTemplateById(
      sendWtsDTO.templateId,
      sendWtsDTO.institutionId
    )
    if (!template) {
      throw new ApiError(WhatsappTemplateErrorMessage.TEMPLATE_NOT_FOUND)
    }

    await this.sendReminderWhatsapp(
      {
        recipientUserId: userId,
        institutionId: sendWtsDTO.institutionId,
        siteId: sendWtsDTO.siteId,
        contentSid: template.twilioContentId,
        contentVariables: sendWtsDTO.variables,
        apiSid: sendWtsDTO.wtsApiSid,
        apiToken: sendWtsDTO.wtsApiToken,
        wtsPhoneNumber: sendWtsDTO.wtsApiPhoneNumber,
        studentPhone: sendWtsDTO.studentPhone,
      },
      NotificationType.REMINDER
    )
    return {
      sid: this.createMessageSid(),
      status: 'failed',
      errorCode: 'WHATSAPP_PROVIDER_DISABLED',
      body: 'WhatsApp delivery is disabled in OSS mode.',
    }
  }

  public async remindCourseScheduler(msgData: RemindPaymentWts): Promise<string | void> {
    await this.sendReminderWhatsapp(msgData, NotificationType.REMINDER)
    return 'WHATSAPP_PROVIDER_DISABLED'
  }

  public async sendReminderWhatsapp(
    msgData: RemindPaymentWts,
    _notificationType: NotificationType,
    whatsappTemplate?: WhatsappTemplateEntity,
    _enrollCourse?: EnrollCourse,
    notificationRecord?: NotificationRecord
  ): Promise<void> {
    const message = {
      sid: this.createMessageSid(),
      body: msgData.customMessage || 'WhatsApp delivery disabled in OSS mode.',
      errorCode: 'WHATSAPP_PROVIDER_DISABLED',
    }
    this.logger.warn(`Skipping WhatsApp send for recipient ${msgData.recipientUserId}`)
    await this.notificationLogService.writeWhatsappNotificationRecord({
      msgData,
      message,
      whatsappTemplate,
      notificationRecord,
    })
  }

  buildVariables(payload: Record<string, any>, actionType: ActionTypeLessonWts) {
    const fields = [
      'studentFirstName',
      'institutionName',
      'courseName',
      'className',
      'classLessonDate',
      'location',
      'adminPhone',
    ]
    return shallow({
      source: payload,
      fields:
        actionType === ActionTypeLessonWts.CHANGE_LESSON
          ? fields
          : [...fields, 'newClassLessonDate'],
      fieldsReplace: {
        studentFirstName: 'studentName',
      },
    })
  }

  async getDefaultWhatsappTemplate(
    institutionId: number,
    functionName: AutomationFunctionNames
  ): Promise<WhatsappTemplateEntity> {
    const whatsappTemplates = await this.whatsappTemplateService.getDefaultTemplates(institutionId)
    return whatsappTemplates.find((template) => template.assignedTo?.functionName === functionName)
  }

  async generateContentSID(
    institutionId: number,
    actionType: ActionTypeLessonWts
  ): Promise<string> {
    let functionName: AutomationFunctionNames
    switch (actionType) {
      case ActionTypeLessonWts.ADD_CLASS:
        functionName = AutomationFunctionNames.SEND_ADD_CLASS_REMINDER
        break
      case ActionTypeLessonWts.ADD_LESSON:
        functionName = AutomationFunctionNames.SEND_ADD_LESSON_REMINDER
        break
      case ActionTypeLessonWts.CHANGE_LESSON:
        functionName = AutomationFunctionNames.SEND_CHANGE_SCHEDULE_LESSON
        break
      default:
        break
    }
    const whatsappTemplate = await this.getDefaultWhatsappTemplate(institutionId, functionName)
    if (whatsappTemplate && whatsappTemplate.twilioContentId) {
      return whatsappTemplate.twilioContentId
    }
    return GlobalWhatsappContentSID[actionType]
  }

  public async sendChangeAddLessonWts(
    changeLessonWtsDto: ChangeLessonWtsDTO | AddLessonEmailDTO,
    actionType: ActionTypeLessonWts,
    whatsappTemplate?: WhatsappTemplateEntity
  ): Promise<void> {
    const variables = this.buildVariables(changeLessonWtsDto, actionType)
    await this.notificationLogService.writeWhatsappNotificationRecord({
      msgData: {
        ...changeLessonWtsDto,
        contentSid: await this.generateContentSID(changeLessonWtsDto.institutionId, actionType),
        contentVariables: variables,
      },
      message: {
        sid: this.createMessageSid(),
        body: 'WhatsApp delivery disabled in OSS mode.',
        errorCode: 'WHATSAPP_PROVIDER_DISABLED',
      },
      whatsappTemplate,
    })
  }

  public async sendChangeAddClassWts(
    addClassWtsDto: ChangeLessonWtsDTO | AddLessonEmailDTO,
    whatsappTemplate?: WhatsappTemplateEntity
  ): Promise<void> {
    const variables = this.buildVariables(addClassWtsDto, ActionTypeLessonWts.ADD_CLASS)
    await this.notificationLogService.writeWhatsappNotificationRecord({
      msgData: {
        ...addClassWtsDto,
        contentSid: await this.generateContentSID(
          addClassWtsDto.institutionId,
          ActionTypeLessonWts.ADD_CLASS
        ),
        contentVariables: variables,
      },
      message: {
        sid: this.createMessageSid(),
        body: 'WhatsApp delivery disabled in OSS mode.',
        errorCode: 'WHATSAPP_PROVIDER_DISABLED',
      },
      whatsappTemplate,
    })
  }

  private createMessageSid(): string {
    return `local-wa-${randomUUID()}`
  }
}
