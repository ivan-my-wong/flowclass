import { Injectable } from '@nestjs/common'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import { StudentNotificationSettings } from '@/application/admin/student-onboard/dtos/student-memo.dto'
import { StudentNotificationSettingRepository } from '@/models/student-notification-setting.entity'
import { User } from '@/models/user.entity'

@Injectable()
export class StudentNotifSettingService {
  constructor(
    private readonly studentNotifSettingRepository: StudentNotificationSettingRepository
  ) {}
  async getByStudentAndType(studentId: number, institutionId: number, type: SupportedType) {
    return this.studentNotifSettingRepository.getByStudentAndType(studentId, institutionId, type)
  }
  async getNotificationSettings(user: User, institutionId: number) {
    return this.studentNotifSettingRepository.find({
      where: {
        studentId: user.id,
        institutionId,
      },
      order: {
        notificationType: 'ASC',
      },
    })
  }

  async getOrCreateNotification(user: User, institutionId: number) {
    const notifications = await this.getNotificationSettings(user, institutionId)
    const notificationTypes = Object.values(SupportedType)
    const createdNotificationTypes = notifications.map((n) => n.notificationType)
    if (createdNotificationTypes.length !== notificationTypes.length) {
      for (const notificationType of notificationTypes.filter(
        (n) => !createdNotificationTypes.includes(n)
      )) {
        const notification = await this.studentNotifSettingRepository.save(
          this.studentNotifSettingRepository.create({
            studentId: user.id,
            institutionId,
            notificationType,
            whatsapp: false,
            email: false,
          })
        )
        notifications.push(notification)
      }
    }
    return notifications.sort((a, b) => a.notificationType.localeCompare(b.notificationType))
  }

  async updateNotificationSettings(
    user: User,
    institutionId: number,
    payload: StudentNotificationSettings[]
  ) {
    for (const notification of payload) {
      await this.studentNotifSettingRepository.update(
        {
          id: notification.id,
          studentId: user.id,
          institutionId,
          notificationType: notification.notificationType as unknown as SupportedType,
        },
        {
          whatsapp: notification.whatsapp,
          email: notification.email,
        }
      )
    }
    return this.getNotificationSettings(user, institutionId)
  }
}
