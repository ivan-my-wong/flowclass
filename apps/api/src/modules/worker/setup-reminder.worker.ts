import { Injectable } from '@nestjs/common'
import { utcToZonedTime } from 'date-fns-tz'
import * as dayjs from 'dayjs'
import { In } from 'typeorm'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import { StudentData } from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { SettingSiteService } from '@/domain/service/setting-site.service'
import { StudentNotifSettingService } from '@/domain/service/student-notif-setting.service'
import { CoursesRepository } from '@/models/courses.repository'
import { Invoice } from '@/models/invoice.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { User } from '@/models/user.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UsersRepository } from '@/models/users.repository'
import { buildUploadReceiptLink } from '@/utils/payment-link.utils'
import { shallow } from '@/utils/shallow.utils'
import { addressObjectToString } from '@/utils/string.utils'
import { offsetToISO } from '@/utils/time.utils'
import { validateDomain } from '@/utils/validate/validate.utils'

@Injectable()
export class SetupReminderWorker {
  constructor(
    private readonly settingSiteService: SettingSiteService,
    private readonly courseRepository: CoursesRepository,
    private readonly userAliasesRepository: UserAliasesRepository,
    private readonly userRepository: UsersRepository,
    private readonly studentNotifSettingService: StudentNotifSettingService
  ) {}
  async buildPayloadSendingInvoiceMassage(invoice: Invoice) {
    const enrollCourse = invoice.enrollCourses.at(0)
    if (!enrollCourse) return
    const institution = invoice.institution
    institution.site = invoice.site

    const course = invoice.course
    const paymentLink = buildUploadReceiptLink({
      institution,
      invoice,
      customDomain: institution.site?.customDomain,
      siteUrl: institution.site?.url,
      coursePath: invoice.course?.path,
    })

    const studentNotificationSetting = await this.studentNotifSettingService.getByStudentAndType(
      enrollCourse.userId,
      institution.id,
      SupportedType.STUDENT_NOTIF_PAYMENT_REMINDER
    )
    const location = addressObjectToString(institution.address)
    const price = [enrollCourse.currency || '', enrollCourse.paymentAmount || ''].join('')
    const timeZoneOffset = await this.settingSiteService.getTimeZoneOffset(invoice.siteId)
    const timeZone = offsetToISO(timeZoneOffset * 60)
    const classes = invoice.studentSchedules.flatMap((d) => d.class).filter(Boolean)
    return {
      id: invoice.id,
      paymentAmount: price,
      paymentMethod: invoice.paymentMethod,
      location,
      uploadPaymentUrl: paymentLink,
      timeZone,
      courseName: course.name,
      courseId: course.id,
      siteId: course.siteId,
      institutionId: institution?.id,
      enrollCourseId: enrollCourse?.id,
      institutionName: institution.name,
      recipientUserId: invoice.userId,
      adminEmail: institution.email,
      adminPhone: institution.phone,
      associatedClass: classes.map((d) =>
        shallow({
          source: d,
          fields: ['id', 'name', 'type', 'courseId'],
        })
      ),
      className: classes.at(0)?.name || '',
      studentEmail: enrollCourse?.preferredEmail || '',
      studentName: enrollCourse?.preferredName || '',
      studentPhone: enrollCourse?.preferredPhone || '',
      isWhatsappEnabled: studentNotificationSetting?.whatsapp,
      isEmailEnabled: studentNotificationSetting?.email,
      // contentSid: whatsappTemplate.twilioContentId,
      // contentVariables: {},
    }
  }

  async preparePayloadLessonReminder({
    item,
    currentTime,
  }: {
    item: StudentLesson
    currentTime: dayjs.Dayjs
  }): Promise<any> {
    const studentSchedule = item.studentSchedule

    if (!studentSchedule) {
      return
    }

    const invoice = studentSchedule.invoice

    if (!invoice) {
      return
    }

    const enrollCourse = invoice.enrollCourses.at(0)
    const institution = invoice.institution
    const course = await this.courseRepository.findOneBy({
      id: invoice.courseId,
    })
    const site = invoice.site

    if (!enrollCourse) {
      return
    }
    if (!course) {
      return
    }

    // const location = addressObjectToString(institution.address)
    const userTimeZone = site.timeZone?.id || 'Asia/Hong_Kong'

    const actualStartTime = item.startTime
    const location = item.class?.locationRoom?.name || ''
    const instructor = item.class?.instructor?.fullName || ''
    const hourDiffWithCreationOfInvoice = dayjs(actualStartTime).diff(currentTime, 'hours')

    console.log(
      `CHECKING NEXT LESSON OF ${hourDiffWithCreationOfInvoice} HOURS FOR ${actualStartTime}`
    )

    // if (hourDiffWithCreationOfInvoice === 24) {
    let contactEmail = enrollCourse.preferredEmail
    let contactName = enrollCourse.preferredName
    let contactPhone = enrollCourse.preferredPhone

    const actualEndTime = item.endTime
    const localStartTime = utcToZonedTime(actualStartTime, userTimeZone)
    const localEndTime = utcToZonedTime(actualEndTime, userTimeZone)

    const paymentReceiptUploadLinkParams = new URLSearchParams({
      school: institution.url ?? '',
      schoolId: institution.id.toString(),
      course: course.path,
      enrolId: enrollCourse.id.toString(),
      token: invoice.proofToken,
    })
    const studentNotificationSetting = await this.studentNotifSettingService.getByStudentAndType(
      enrollCourse.userId,
      institution.id,
      SupportedType.STUDENT_LESSON_REMINDER
    )
    const applicants: User[] = await this.userRepository.find({
      where: { id: In(invoice.applicants) },
    })
    const applicantsData: StudentData[] = applicants.map((applicant) => ({
      id: applicant.id,
      studentName: applicant.firstName + ' ' + applicant.lastName,
      email: applicant.email,
      phoneNumber: applicant.phone,
    }))
    const jobData = {
      // ...item,
      location,
      className: item.class?.name || '',
      instructor,
      siteId: site.id,
      recipientUserId: item.userId,
      adminPhone: institution.phone,
      adminEmail: institution.email,
      firstLesson: `${localStartTime.toISOString()} ${localEndTime.toISOString()}`,
      enrollCourseId: enrollCourse.id,
      priceWithCurrency: `${invoice.currency} ${invoice.payAmount}`,
      courseName: course.name,
      studentName: contactName,
      studentEmail: contactEmail,
      studentPhone: contactPhone,
      institutionName: institution.name,
      applicants: applicantsData,
      timeZone: userTimeZone,
      isWhatsappEnabled: studentNotificationSetting?.whatsapp,
      isEmailEnabled: studentNotificationSetting?.email,
      classDateTime: `${localStartTime.toISOString()} ${localEndTime.toISOString()}`,
      classLessonDate: dayjs(localStartTime).format('DD/MM/YYYY'),
      lessonTime: dayjs(localStartTime).format('HH:mm'),
      duration: `${dayjs(localEndTime).diff(localStartTime, 'minutes')} minutes`,
      // studentSchedule,
      successPaymentLink: `https://${
        validateDomain(site.customDomain) ? site.customDomain : site.url
      }/enrol/success-payment?${paymentReceiptUploadLinkParams.toString()}`,
    }
    return jobData
  }
}
