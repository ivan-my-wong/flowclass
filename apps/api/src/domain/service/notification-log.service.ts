import { BadRequestException, Injectable } from '@nestjs/common'
import { isArray } from 'class-validator'
import * as dayjs from 'dayjs'
import { And, FindOptionsWhere, ILike, LessThanOrEqual, Like, MoreThanOrEqual, Raw } from 'typeorm'

import {
  GetNotificationLogDto,
  GetNotificationLogResponseDto,
  GetNotificationLogSelectFieldsDto,
  GetRecordLogByContactDto,
} from '@/application/admin/record-log/dto/get-list-record-log.dto'
import {
  AddLessonEmailDTO,
  ChangeLessonWtsDTO,
} from '@/application/admin/setting-notifications/setting-notifications.dto'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { RemindPaymentWts } from '@/domain/external/whatsapp.service'
import {
  AssociatedClassType,
  NotificationChannel,
  NotificationRecord,
  NotificationStatus,
} from '@/models/notification-record.entity'
import { NotificationRecordRepository } from '@/models/notification-record.repository'
import { WhatsappTemplateEntity } from '@/models/whatsapp-template.entity'
import { shallow } from '@/utils/shallow.utils'

type WhatsappDeliveryMessage = {
  sid?: string
  body?: string
  errorCode?: string | number | null
}

export type WriteWANotificationRecordParams = {
  msgData: RemindPaymentWts | ChangeLessonWtsDTO | AddLessonEmailDTO
  message: WhatsappDeliveryMessage
  whatsappTemplate?: WhatsappTemplateEntity
  notificationRecord?: NotificationRecord
}

export type PutNotifAtQueueParams = {
  msgData: RemindPaymentWts | ChangeLessonWtsDTO | AddLessonEmailDTO
  messageContent: string
  whatsappTemplate?: WhatsappTemplateEntity
  invoiceMetadata?: Record<string, any>
  sentAt?: Date
}

export type SaveNotificationLogParams = {
  messageContent: string
  notificationStatus: NotificationStatus
  whatsappTemplateId?: number
  invoiceMetadata?: Record<string, any>
  recipientUserId: number
  recipientUserPhone: string
  institutionId: number
  siteId: number
}

@Injectable()
export class NotificationRecordService {
  constructor(
    private readonly logger: CloudWatchLoggerProvider,
    private readonly notificationRecordRepository: NotificationRecordRepository
  ) {}

  async getNotificationLogBySiteSchool(
    params: GetNotificationLogDto,
    payload: GetNotificationLogSelectFieldsDto
  ): Promise<GetNotificationLogResponseDto[]> {
    const whereClause: FindOptionsWhere<NotificationRecord> = {
      siteId: params.siteId,
    }

    if (params.institutionId) {
      whereClause.institutionId = params.institutionId
    }

    if (payload.startDate && payload.endDate) {
      const endDate = dayjs(payload.endDate).endOf('day').toDate()

      whereClause.createdAt = And(MoreThanOrEqual(payload.startDate), LessThanOrEqual(endDate))
    } else if (payload.startDate && !payload.endDate) {
      whereClause.createdAt = MoreThanOrEqual(payload.startDate)
    } else if (payload.endDate && !payload.startDate) {
      const endDate = dayjs(payload.endDate).endOf('day').toDate()

      whereClause.createdAt = LessThanOrEqual(endDate)
    }

    if (payload.search) {
      whereClause.user = [
        {
          firstName: Like(`%${payload.search}%`),
        },
        {
          phone: Like(`%${payload.search}%`),
        },
        {
          email: Like(`%${payload.search}%`),
        },
      ]
    }

    return await this.notificationRecordRepository.find({
      where: whereClause,
      relations: {
        whatsappTemplate: true,
        user: true,
      },
      select: payload?.select,
    })
  }

  serializeAssociatedClass(
    associatedClass?: AssociatedClassType[] | AssociatedClassType
  ): AssociatedClassType[] {
    if (!associatedClass) return []
    if (isArray(associatedClass)) return associatedClass
    return [associatedClass]
  }

  async writeWhatsappNotificationRecord({
    msgData,
    message,
    whatsappTemplate,
    notificationRecord,
  }: WriteWANotificationRecordParams) {
    const associatedClass = this.serializeAssociatedClass(msgData.associatedClass)
    const notifLog = notificationRecord
      ? notificationRecord // <== This if existing notification record in this case will be used for Queue message
      : this.notificationRecordRepository.create({
          channel: NotificationChannel.WHATSAPP,
          recipientUserId: msgData.recipientUserId,
          recipientUserPhone: msgData.studentPhone,
          institutionId: msgData.institutionId,
          siteId: msgData.siteId,
          message: message.body,
          whatsappTemplateId: whatsappTemplate?.id,
          associatedClass: associatedClass.map((d) =>
            shallow({
              source: d,
              fields: ['id', 'name'],
            })
          ),
        })
    // Will be updated the status to send or failed for notification log
    // If before status in queue will be updated here
    notifLog.notificationStatus = message.errorCode
      ? NotificationStatus.FAILED
      : NotificationStatus.SENT
    this.logger.log(JSON.stringify(message))
    await this.notificationRecordRepository.save(notifLog)
    return message
  }

  getNotificationByInvoice(invoiceId: number) {
    return this.notificationRecordRepository.findOneBy({
      notificationStatus: NotificationStatus.QUEUED,
      invoiceMetadata: Raw((alias) => `${alias} @> :value`, {
        value: JSON.stringify({
          invoiceId,
        }),
      }),
    })
  }

  putNotificationInQueue({
    msgData,
    messageContent,
    invoiceMetadata,
    sentAt,
    whatsappTemplate,
  }: PutNotifAtQueueParams) {
    const associatedClass = this.serializeAssociatedClass(msgData.associatedClass)
    const notifLog = this.notificationRecordRepository.create({
      channel: NotificationChannel.WHATSAPP,
      recipientUserId: msgData.recipientUserId,
      recipientUserPhone: msgData.studentPhone,
      institutionId: msgData.institutionId,
      siteId: msgData.siteId,
      message: messageContent,
      notificationStatus: NotificationStatus.QUEUED,
      whatsappTemplateId: whatsappTemplate?.id,
      invoiceMetadata,
      sentAt,
      associatedClass: associatedClass.map((d) =>
        shallow({
          source: d,
          fields: ['id', 'name'],
        })
      ),
    })
    return this.notificationRecordRepository.save(notifLog)
  }

  async getNotificationLogByContact(
    params: GetRecordLogByContactDto
  ): Promise<NotificationRecord[]> {
    const { institutionId, email, phone } = params
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided')
    }
    const where: any = { institutionId }
    if (email) {
      where.recipientUserEmail = ILike(`%${email}%`)
    }
    if (phone) {
      where.recipientUserPhone = ILike(`%${phone}%`)
    }
    return this.notificationRecordRepository.find({
      where,
      order: { createdAt: 'DESC' },
    })
  }

  saveNotificationLog(dto: SaveNotificationLogParams) {
    const {
      messageContent,
      notificationStatus,
      whatsappTemplateId,
      invoiceMetadata,
      recipientUserId,
      recipientUserPhone,
      institutionId,
      siteId,
    } = dto
    const notificationLog = this.notificationRecordRepository.create({
      channel: NotificationChannel.WHATSAPP,
      recipientUserId,
      recipientUserPhone,
      institutionId,
      siteId,
      message: messageContent,
      notificationStatus,
      whatsappTemplateId,
      invoiceMetadata,
    })
    return this.notificationRecordRepository.save(notificationLog)
  }
}
