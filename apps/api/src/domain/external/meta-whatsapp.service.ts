import { Injectable } from '@nestjs/common'
import { In } from 'typeorm'

import {
  AddLessonEmailDTO,
  ChangeLessonWtsDTO,
  SendWtsDTO,
} from '@/application/admin/setting-notifications/setting-notifications.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { ActionTypeLessonWts, AutomationFunctionNames } from '@/common/constants/automationFlow'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { NotificationRecordService } from '@/domain/service/notification-log.service'
import { AutomationFlow } from '@/models/automation-flow.entity'
import { ClassRepository } from '@/models/classes.repository'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import {
  AssociatedClassType,
  NotificationChannel,
  NotificationRecord,
  NotificationStatus,
  NotificationType,
} from '@/models/notification-record.entity'
import { NotificationRecordRepository } from '@/models/notification-record.repository'
import { SettingNotificationsRepository } from '@/models/setting-notifications.entity'
import {
  WhatsAppProvider,
  WhatsAppProviderConnectionRepository,
  WhatsAppProviderConnectionStatus,
} from '@/models/whatsapp-provider-connection.entity'
import { WhatsappTemplateEntity } from '@/models/whatsapp-template.entity'
import { shallow } from '@/utils/shallow.utils'

import { WhatsappTemplateService } from '../service/whatsapp-template.service'

import { MetaGraphApiService } from './meta/meta-graph-api.service'
import { WhatsAppProviderCredentialService } from './meta/whatsapp-provider-credential.service'

export interface RemindPaymentWts {
  recipientUserId: number
  institutionId: number
  siteId: number
  customMessage?: string
  studentPhone: string
  templateName?: string
  templateLanguage?: string
  templateVariables?: Record<string, string>
  associatedClass?: AssociatedClassType | AssociatedClassType[]
  // legacy compatibility fields
  apiSid?: string
  apiToken?: string
  wtsPhoneNumber?: string
  contentSid?: string
  contentVariables?: Record<string, string>
}

@Injectable()
export class MetaWhatsappService {
  constructor(
    private readonly logger: CloudWatchLoggerProvider,
    private readonly notificationRecordRepository: NotificationRecordRepository,
    private readonly settingNotificationsRepository: SettingNotificationsRepository,
    private readonly whatsappTemplateService: WhatsappTemplateService,
    private readonly notificationLogService: NotificationRecordService,
    private readonly classRepository: ClassRepository,
    private readonly metaGraphApiService: MetaGraphApiService,
    private readonly connectionRepository: WhatsAppProviderConnectionRepository,
    private readonly credentialService: WhatsAppProviderCredentialService
  ) {}

  private async getSenderContext(institutionId?: number): Promise<{
    phoneNumberId: string
    accessToken: string
  } | null> {
    if (institutionId) {
      const connection = await this.connectionRepository.findByInstitutionId(institutionId)
      if (
        connection &&
        connection.provider === WhatsAppProvider.META_CLOUD &&
        connection.status === WhatsAppProviderConnectionStatus.CONNECTED &&
        connection.externalPhoneNumberId
      ) {
        const cred = await this.credentialService.getMeta(institutionId)
        if (cred?.accessToken) {
          return {
            phoneNumberId: connection.externalPhoneNumberId,
            accessToken: cred.accessToken,
          }
        }
      }
    }

    const fallbackPhoneId = process.env.META_PHONE_NUMBER_ID
    const fallbackToken = process.env.META_SYSTEM_USER_TOKEN
    if (fallbackPhoneId && fallbackToken) {
      return { phoneNumberId: fallbackPhoneId, accessToken: fallbackToken }
    }
    return null
  }

  public async sendDirectWhatsappMessage(params: {
    toPhone: string
    body: string
    mediaUrl?: string
    institutionId?: number
  }): Promise<any> {
    const context = await this.getSenderContext(params.institutionId)
    const normalizedTo = params.toPhone.replace(/^whatsapp:/, '').replace(/[^\d]/g, '')

    if (!context) {
      this.logger.log(
        `[MOCK META WHATSAPP DIRECT] to ${normalizedTo} body: ${params.body} mediaUrl: ${params.mediaUrl}`
      )
      return { messages: [{ id: 'mock_meta_' + Math.random().toString(36).substring(7) }] }
    }

    try {
      if (params.mediaUrl) {
        const res = await this.metaGraphApiService.sendMediaMessage({
          phoneNumberId: context.phoneNumberId,
          accessToken: context.accessToken,
          recipient: normalizedTo,
          type: 'image',
          url: params.mediaUrl,
          caption: params.body,
        })
        return res
      }

      const res = await this.metaGraphApiService.sendTextMessage({
        phoneNumberId: context.phoneNumberId,
        accessToken: context.accessToken,
        recipient: normalizedTo,
        message: params.body,
      })
      return res
    } catch (err: any) {
      this.logger.error('[META WHATSAPP DIRECT ERROR]', JSON.stringify(err))
      return { success: false, error: err?.message || 'Meta send failed' }
    }
  }

  async sendWhatsappMessage(sendWtsDTO: SendWtsDTO, userId: number): Promise<any> {
    const template = await this.whatsappTemplateService.getTemplateById(
      sendWtsDTO.templateId,
      sendWtsDTO.institutionId
    )
    if (!template) {
      throw new ApiError('Template not found')
    }

    return this.sendReminderWhatsapp(
      {
        recipientUserId: userId,
        institutionId: sendWtsDTO.institutionId,
        siteId: sendWtsDTO.siteId,
        templateName: template.name,
        templateLanguage: template.language || 'en',
        templateVariables: sendWtsDTO.variables,
        studentPhone: sendWtsDTO.studentPhone,
      },
      NotificationType.REMINDER
    )
  }

  public async remindCourseScheduler(msgData: RemindPaymentWts): Promise<string | void> {
    const log = this.notificationRecordRepository.create({
      channel: NotificationChannel.WHATSAPP,
      recipientUserId: msgData.recipientUserId,
      recipientUserPhone: msgData.studentPhone,
      institutionId: msgData.institutionId,
      siteId: msgData.siteId,
      message: msgData.customMessage,
      notificationType: NotificationType.REMINDER,
    })

    const context = await this.getSenderContext(msgData.institutionId)
    const normalizedTo = msgData.studentPhone.replace(/^whatsapp:/, '').replace(/[^\d]/g, '')

    try {
      let res: any
      if (context && msgData.templateName) {
        const components: any[] = []
        if (msgData.templateVariables && Object.keys(msgData.templateVariables).length > 0) {
          components.push({
            type: 'body',
            parameters: Object.values(msgData.templateVariables).map((text) => ({
              type: 'text',
              text: String(text),
            })),
          })
        }
        res = await this.metaGraphApiService.sendTemplateMessage({
          phoneNumberId: context.phoneNumberId,
          accessToken: context.accessToken,
          recipient: normalizedTo,
          templateName: msgData.templateName,
          languageCode: msgData.templateLanguage || 'en',
          components,
        })
      } else if (context && msgData.customMessage) {
        res = await this.metaGraphApiService.sendTextMessage({
          phoneNumberId: context.phoneNumberId,
          accessToken: context.accessToken,
          recipient: normalizedTo,
          message: msgData.customMessage,
        })
      } else {
        this.logger.log(
          `[MOCK META WHATSAPP REMIND] to ${normalizedTo} template: ${
            msgData.templateName || msgData.customMessage
          }`
        )
        res = { messages: [{ id: 'mock_meta_' + Math.random().toString(36).substring(7) }] }
      }

      log.notificationStatus = NotificationStatus.SENT
      await this.notificationRecordRepository.save(log)
      return JSON.stringify(res)
    } catch (err: any) {
      log.message = JSON.stringify(err)
      log.notificationStatus = NotificationStatus.FAILED
      await this.notificationRecordRepository.save(log)
      this.logger.error('whatsapp', JSON.stringify(err))
      throw new ApiError('Meta WhatsApp send failed', err)
    }
  }

  public async sendReminderWhatsapp(
    msgData: RemindPaymentWts,
    notificationType: NotificationType,
    automationFlow?: AutomationFlow,
    whatsappTemplate?: WhatsappTemplateEntity,
    enrollCourse?: EnrollCourse,
    notificationRecord?: NotificationRecord
  ): Promise<any | void> {
    this.logger.log(`WA: notificationType ${notificationType}`)
    const classIds = enrollCourse?.multipleClassMapping
      ? enrollCourse?.multipleClassMapping?.map((d) => d.classId)
      : enrollCourse?.studentSchedule?.map((d) => d.classId)
    const classIdsSet = Array.from(new Set(classIds || []))
    const classes = classIdsSet.length
      ? await this.classRepository.findBy({
          id: In(classIdsSet),
        })
      : []

    msgData.associatedClass = classes.map((d) =>
      shallow({
        source: d,
        fields: ['id', 'name'],
      })
    )

    const context = await this.getSenderContext(msgData.institutionId)
    const normalizedTo = msgData.studentPhone.replace(/^whatsapp:/, '').replace(/[^\d]/g, '')
    const templateName = whatsappTemplate?.name || msgData.templateName

    try {
      let res: any
      if (context && templateName) {
        const components: any[] = []
        const vars = msgData.templateVariables || msgData.contentVariables
        if (vars && Object.keys(vars).length > 0) {
          components.push({
            type: 'body',
            parameters: Object.values(vars).map((text) => ({
              type: 'text',
              text: String(text),
            })),
          })
        }
        res = await this.metaGraphApiService.sendTemplateMessage({
          phoneNumberId: context.phoneNumberId,
          accessToken: context.accessToken,
          recipient: normalizedTo,
          templateName,
          languageCode: whatsappTemplate?.language || msgData.templateLanguage || 'en',
          components,
        })
      } else if (context && msgData.customMessage) {
        res = await this.metaGraphApiService.sendTextMessage({
          phoneNumberId: context.phoneNumberId,
          accessToken: context.accessToken,
          recipient: normalizedTo,
          message: msgData.customMessage,
        })
      } else {
        this.logger.log(`[MOCK META WHATSAPP] to ${normalizedTo}`)
        res = { messages: [{ id: 'mock_meta_' + Math.random().toString(36).substring(7) }] }
      }

      await this.notificationLogService.writeWhatsappNotificationRecord({
        msgData: msgData as any,
        message: res,
        automationFlow,
        whatsappTemplate,
        notificationRecord,
      })
      return res
    } catch (err: any) {
      this.logger.error('whatsapp', JSON.stringify(err))
    }
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
  ): Promise<WhatsappTemplateEntity | undefined> {
    const whatsappTemplates = await this.whatsappTemplateService.getDefaultTemplates(institutionId)
    return whatsappTemplates.find((template) => template.assignedTo?.functionName === functionName)
  }

  public async sendChangeAddLessonWts(
    changeLessonWtsDto: ChangeLessonWtsDTO | AddLessonEmailDTO,
    actionType: ActionTypeLessonWts,
    automationFlow?: AutomationFlow,
    whatsappTemplate?: WhatsappTemplateEntity
  ): Promise<any | void> {
    const { institutionId, studentPhone } = changeLessonWtsDto
    const template =
      whatsappTemplate ||
      (await this.getDefaultWhatsappTemplate(
        institutionId,
        actionType === ActionTypeLessonWts.CHANGE_LESSON
          ? AutomationFunctionNames.SEND_CHANGE_SCHEDULE_LESSON
          : AutomationFunctionNames.SEND_ADD_LESSON_REMINDER
      ))

    const context = await this.getSenderContext(institutionId)
    const normalizedTo = studentPhone.replace(/^whatsapp:/, '').replace(/[^\d]/g, '')
    const variables = this.buildVariables(changeLessonWtsDto, actionType)

    try {
      let res: any
      if (context && template?.name) {
        res = await this.metaGraphApiService.sendTemplateMessage({
          phoneNumberId: context.phoneNumberId,
          accessToken: context.accessToken,
          recipient: normalizedTo,
          templateName: template.name,
          languageCode: template.language || 'en',
          components: [
            {
              type: 'body',
              parameters: Object.values(variables).map((text) => ({
                type: 'text',
                text: String(text),
              })),
            },
          ],
        })
      } else {
        this.logger.log(`[MOCK META WHATSAPP LESSON] to ${normalizedTo}`)
        res = { messages: [{ id: 'mock_meta_' + Math.random().toString(36).substring(7) }] }
      }

      await this.notificationLogService.writeWhatsappNotificationRecord({
        msgData: changeLessonWtsDto as any,
        message: res,
        automationFlow,
        whatsappTemplate: template,
      })
      return res
    } catch (err: any) {
      this.logger.error('whatsapp', JSON.stringify(err))
    }
  }

  public async sendChangeAddClassWts(
    addClassWtsDto: ChangeLessonWtsDTO | AddLessonEmailDTO,
    automationFlow?: AutomationFlow,
    whatsappTemplate?: WhatsappTemplateEntity
  ): Promise<any | void> {
    const { institutionId, studentPhone } = addClassWtsDto
    const template =
      whatsappTemplate ||
      (await this.getDefaultWhatsappTemplate(
        institutionId,
        AutomationFunctionNames.SEND_ADD_CLASS_REMINDER
      ))

    const context = await this.getSenderContext(institutionId)
    const normalizedTo = studentPhone.replace(/^whatsapp:/, '').replace(/[^\d]/g, '')
    const variables = this.buildVariables(addClassWtsDto, ActionTypeLessonWts.ADD_CLASS)

    try {
      let res: any
      if (context && template?.name) {
        res = await this.metaGraphApiService.sendTemplateMessage({
          phoneNumberId: context.phoneNumberId,
          accessToken: context.accessToken,
          recipient: normalizedTo,
          templateName: template.name,
          languageCode: template.language || 'en',
          components: [
            {
              type: 'body',
              parameters: Object.values(variables).map((text) => ({
                type: 'text',
                text: String(text),
              })),
            },
          ],
        })
      } else {
        this.logger.log(`[MOCK META WHATSAPP CLASS] to ${normalizedTo}`)
        res = { messages: [{ id: 'mock_meta_' + Math.random().toString(36).substring(7) }] }
      }

      await this.notificationLogService.writeWhatsappNotificationRecord({
        msgData: addClassWtsDto as any,
        message: res,
        automationFlow,
        whatsappTemplate: template,
      })
      return res
    } catch (err: any) {
      this.logger.error('whatsapp', JSON.stringify(err))
    }
  }
}
