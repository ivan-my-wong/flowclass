import { Injectable } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { Between, FindOptionsWhere } from 'typeorm'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import { AuthService } from '@/domain/service/auth.service'
import { CustomMessageService } from '@/domain/service/custom-message.service'
import { UsersService } from '@/domain/service/users.service'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { Invoice } from '@/models/invoice.entity'
import { InvoiceRepository } from '@/models/invoice.repository'
import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentNotificationSettingRepository } from '@/models/student-notification-setting.entity'
import { replaceContentVariables } from '@/utils/shallow.utils'
import { generateIntervalUnit } from '@/utils/time.utils'

import { SetupReminderWorker } from './setup-reminder.worker'

@Injectable()
class LessonWorker {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly setupReminderWorker: SetupReminderWorker,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly classRepository: ClassRepository,
    private readonly authService: AuthService,
    private readonly institutionRepository: InstitutionsRepository,
    private readonly usersService: UsersService,
    private readonly customMessageService: CustomMessageService,
    private readonly studentNotificationSettingRepository: StudentNotificationSettingRepository
  ) {}
  get invoiceRelations() {
    return {
      studentSchedules: {
        studentLessons: true,
        class: true,
        recurringSchedule: true,
      },
      enrollCourse: true,
      site: true,
      institution: true,
      course: true,
      user: true,
    }
  }

  async collectLessons(
    institutionId: number,
    courseIds: number[],
    interval?: string,
    intervalBeforeLesson?: string[],
    enabledClasses?: ClassEntity[]
  ): Promise<any> {
    // For testing purpose
    // const remindedAt = dayjs('2024-09-26T23:26:25.152Z').toDate()
    const institution = await this.institutionRepository.findOne({ where: { id: institutionId } })
    const userOwnerOfInstitution = await this.usersService.getUserOwnerOfInstitution(institutionId)
    if (!institution || !userOwnerOfInstitution || !institution.phone) {
      return []
    }
    const { accessToken } = await this.authService.generateToken(userOwnerOfInstitution)
    const { phone } = institution
    const currentTime = dayjs().toDate()
    const filtersDate = (intervalBeforeLesson || [])?.map((d) => {
      const [intervalNumber, unit] = generateIntervalUnit(d)
      const nextDate = dayjs(currentTime).add(intervalNumber, unit).toDate()
      return nextDate
    })
    const filterTimes: FindOptionsWhere<StudentLesson>[] = filtersDate.map((date) => ({
      startTime: Between(currentTime, date),
      institutionId,
    }))

    const lessons = await this.studentLessonRepository.find({
      where: filterTimes,
      relations: {
        class: {
          locationRoom: true,
          instructor: true,
        },
        studentSchedule: {
          invoice: {
            site: true,
            institution: true,
            course: true,
            enrollCourses: true,
          },
          studentLessons: true,
        },
      },
    })

    const result = []
    const customMessage = await this.customMessageService.getCustomMessageByType(
      institutionId,
      SupportedType.STUDENT_LESSON_REMINDER
    )
    for (const lesson of lessons) {
      const jobData = await this.setupReminderWorker.preparePayloadLessonReminder({
        item: lesson,
        currentTime: dayjs(currentTime),
      })
      const studentNotificationSetting =
        await this.studentNotificationSettingRepository.getByStudentAndType(
          lesson.userId,
          institutionId,
          SupportedType.STUDENT_LESSON_REMINDER
        )
      jobData['isWhatsappEnabled'] = studentNotificationSetting?.whatsapp || false
      jobData['isEmailEnabled'] = studentNotificationSetting?.email || false
      if (customMessage && jobData) {
        const contentMessage = replaceContentVariables(customMessage.content, jobData)
        jobData['content'] = contentMessage
        jobData['token'] = accessToken
        jobData['senderPhone'] = phone
        result.push(jobData)
      }
    }
    return result
  }

  async getDetailInvoice(invoiceId: number): Promise<Invoice | undefined> {
    return this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: this.invoiceRelations,
    })
  }

  async getDetailClass(classId: number): Promise<ClassEntity | undefined> {
    return this.classRepository.findOne({
      where: { id: classId },
      relations: {
        recurringFormat: true,
        regularPeriods: true,
        recurringSchedules: true,
      },
    })
  }
}

export default LessonWorker
