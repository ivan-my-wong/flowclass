import { BadRequestException, Injectable } from '@nestjs/common'
import * as dayjs from 'dayjs'
import * as _ from 'lodash'
import {
  Between,
  FindOptionsWhere,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
} from 'typeorm'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import {
  GenerateInvoicesNextMonthDTO,
  SendCustomMessagesDto,
} from '@/application/admin/invoices/dto/invoices.dto'
import { AuthService } from '@/domain/service/auth.service'
import { ClassLessonService } from '@/domain/service/class-lesson.service'
import { RecurringSchedulesService } from '@/domain/service/course-recurring-schedules.service'
import { CustomMessageService } from '@/domain/service/custom-message.service'
import { EnrollCoursesService } from '@/domain/service/enroll-courses.service'
import { InvoiceService } from '@/domain/service/invoice.service'
import { NotificationRecordService } from '@/domain/service/notification-log.service'
import { SetingBlockTimeService } from '@/domain/service/setting-block-time.service'
import { StudentNotifSettingService } from '@/domain/service/student-notif-setting.service'
import { UsersService } from '@/domain/service/users.service'
import { WhatsappWebService } from '@/domain/service/whatsapp-web.service'
import { InvoiceErrorMessage } from '@/exceptions/error-message/invoice'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import {
  RecurringSchedules,
  RecurringSchedulesRepository,
} from '@/models/course-recurring-schedules.entity'
import { Course } from '@/models/courses.entity'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import { ClassTypeEnum } from '@/models/enums'
import { PaymentStatus } from '@/models/enums/status'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { Invoice } from '@/models/invoice.entity'
import { InvoiceRepository } from '@/models/invoice.repository'
import { SettingNotificationsRepository } from '@/models/setting-notifications.entity'
import { StudentSchedule } from '@/models/student-schedule.entity'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { UsersRepository } from '@/models/users.repository'
import { buildUploadReceiptLink } from '@/utils/payment-link.utils'
import { replaceContentVariables, shallow } from '@/utils/shallow.utils'
import { generateIntervalUnit } from '@/utils/time.utils'

import { SetupReminderWorker } from './setup-reminder.worker'

@Injectable()
class InvoiceWorker {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly setupReminderWorker: SetupReminderWorker,
    private readonly recurrScheduleRepository: RecurringSchedulesRepository,
    private readonly invoiceService: InvoiceService,
    private readonly recurrScheduleService: RecurringSchedulesService,
    private readonly userRepository: UsersRepository,
    private readonly enrollCourseService: EnrollCoursesService,
    private readonly classRepository: ClassRepository,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly settingNotificationsRepository: SettingNotificationsRepository,
    private readonly authService: AuthService,
    private readonly institutionRepository: InstitutionsRepository,
    private readonly usersService: UsersService,
    private readonly customMessageService: CustomMessageService,
    private readonly studentScheduleRepository: StudentScheduleRepository,
    private readonly notificationRecordService: NotificationRecordService,
    private readonly studentNotifSettingService: StudentNotifSettingService,
    private readonly classLessonService: ClassLessonService,
    private readonly recurrSchedulesService: RecurringSchedulesService,
    private readonly blockTimeService: SetingBlockTimeService,
    private readonly whatsappWebService: WhatsappWebService
  ) {}
  get invoiceRelations() {
    return {
      studentSchedules: {
        studentLessons: true,
        class: true,
        recurringSchedule: true,
      },
      enrollCourses: true,
      site: true,
      institution: true,
      course: true,
      user: true,
      userAlias: {
        user: true,
      },
    }
  }
  async getSettingNotifications(institutionId: number) {
    return this.settingNotificationsRepository.findOne({
      where: {
        institutionId,
      },
    })
  }

  async getInvoices(invoiceIds: number[]): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: {
        id: In(invoiceIds),
      },
      relations: this.invoiceRelations,
    })
  }
  async collectInvoices(
    institutionId: number,
    courseIds: number[],
    interval?: string,
    enabledClasses?: ClassEntity[]
  ): Promise<any> {
    const currentTime = dayjs(new Date())
    const tempInterval = '2 days'
    const [intervalNumber, unit] = tempInterval
      ? generateIntervalUnit(tempInterval)
      : ['14', 'days']
    const someTimeAgo = dayjs(currentTime)
      .subtract(Number(intervalNumber), unit as dayjs.ManipulateType)
      .toDate()
    // For testing purpose
    // const remindedAt = dayjs('2024-09-26T23:26:25.152Z').toDate()
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    })
    if (!institution) {
      console.warn(
        `[InvoiceWorker.collectInvoices] Institution not found, skipping. institutionId=${institutionId}`
      )
      return []
    }
    const userOwnerOfInstitution = await this.usersService.getUserOwnerOfInstitution(institutionId)
    if (!userOwnerOfInstitution || !institution.phone) {
      return []
    }
    const { accessToken } = await this.authService.generateToken(userOwnerOfInstitution)
    const { phone } = institution
    const whereOptions: FindOptionsWhere<Invoice> = {
      paymentState: In([PaymentStatus.PENDING, PaymentStatus.SUBMITTED]),
      // courseId: In(courseIds),
      // Set it so it only fetches invoices that are created 14 days before the current time
      // Get invoices that created at between lastReminderAt and currentTime
      institutionId,
      createdAt: Between(someTimeAgo, currentTime.toDate()),
    }
    if (enabledClasses) {
      whereOptions.studentSchedules = {
        classId: In(enabledClasses.map((classEntity) => classEntity.id)),
      }
    }
    const res = await this.invoiceRepository.find({
      where: whereOptions,
      relations: this.invoiceRelations,
      order: {
        createdAt: 1,
      },
      withDeleted: false,
    })
    const customMessage = await this.customMessageService.getCustomMessageByType(
      institutionId,
      SupportedType.CREATE_INVOICE
    )
    const result = []
    for (const invoice of res) {
      const jobData = await this.setupReminderWorker.buildPayloadSendingInvoiceMassage(invoice)
      if (!jobData) continue
      jobData['token'] = accessToken
      jobData['senderPhone'] = phone
      const contentMessage = replaceContentVariables(customMessage.content, jobData)
      jobData['content'] = contentMessage
      result.push(jobData)
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
  async createInvoice(payload: any) {
    const { type, siteId, institutionId, classId, invoiceId } = payload
    if (type === 'recurring') {
      await this.handleNextRecurringSchedule(siteId, institutionId, classId, invoiceId)
    } else if (type === 'regular') {
      await this.handleCreateRegularInvoice(classId, invoiceId)
    } else if (type === 'appointment') {
      // TODO: Handle for appointment class
      // Create application link ant then send to student
      // await this.handleCreateSubscriptionInvoice(classId, invoiceId)
    }
    // TODO: Handle for subscription class
  }

  async handleNextRecurringSchedule(
    siteId: number,
    institutionId: number,
    classId: number,
    invoiceId: number
  ): Promise<RecurringSchedules | null> {
    const classItem = await this.getDetailClass(classId)
    const invoice = await this.getDetailInvoice(invoiceId)
    if (!classItem || !invoice) return
    const enrollCourse = invoice.enrollCourses.at(0)
    if (!enrollCourse) {
      throw new BadRequestException(InvoiceErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }
    const institution = invoice.institution
    institution.site = invoice.site
    const redirectUrl = buildUploadReceiptLink({
      institution,
      invoice,
      customDomain: institution.site?.customDomain,
      siteUrl: institution.site?.url,
      coursePath: invoice.course?.path,
    })
    const { course } = invoice
    const blockTimeList = await this.blockTimeService.getBlockTimeArray({
      institutionId,
    })
    const studentSchedules = await this.getNextStudentLessons({
      classIds: [classId],
    })
    for (const studentSchedule of studentSchedules) {
      const recurringSchedule = studentSchedule.recurringSchedule
      if (!recurringSchedule) {
        console.log(`============== RECURRING SCHEDULE NOT FOUND ===============`)
        continue
      }
      console.log(`============== RECURRING ${recurringSchedule?.id} READY ===============`)
      const studentLesson = studentSchedule.studentLessons[0]
      const futureLessons = this.recurrSchedulesService.getRecurringWeekdayLessons({
        startDate: studentLesson.startTime,
        endDate: studentLesson.endTime,
        weekDay: studentSchedule.recurringSchedule?.weekDay,
        numberOfLessons: studentSchedule.invoice?.numOfLesson || 1,
        blockTimeList,
        timeZone: studentSchedule.invoice?.site?.timeZone?.id || 'UTC',
      })
      const firstLessonDateTime = futureLessons[0]
      const metaRef = {
        type: classItem.type,
        classId: classItem.id,
        pickedClass: classItem,
        lessonDateId: recurringSchedule.id,
        pickedFirstDate: firstLessonDateTime,
        pickedRecurringSchedule: recurringSchedule,
        lessonPrice: invoice.payAmount,
        lessonCount: invoice.numOfLesson || 1,
      }
      const { applicants, userId } = invoice
      const firstApplicant = await this.userRepository.findOneById(userId)

      //   Make sure userId of invoice is not included at studentApplicants
      const studentApplicants = (
        await this.userRepository.findBy({
          id: In(applicants),
        })
      ).filter((d) => d.id !== userId)
      if (!firstApplicant) return
      await this.enrollCourseService.addNewScheduleToEnrollment(
        enrollCourse.id,
        {
          courseId: course.id,
          meta: metaRef,
          institutionId,
          siteId,
          redirectUrl,
          enrollInto: {
            type: classItem.type,
            courseName: course.name,
            secondLevelName: classItem.name,
            lessonCount: invoice.numOfLesson || 1,
          },
        },
        [firstApplicant, ...studentApplicants],
        course,
        recurringSchedule.id
      )
      for (const period of classItem.regularPeriods) {
        await this.invoiceService.handleUpdateLessson({ periodId: period.id })
      }
    }
  }
  async handleCreateRegularInvoice(
    classId: number,
    invoiceId: number
    // step: AutomationFlowStep
  ) {
    const invoice = await this.getDetailInvoice(invoiceId)
    const classItem = await this.getDetailClass(classId)

    if (!invoice || !classItem) return

    const institution = invoice.institution
    institution.site = invoice.site
    const enrollCourse = invoice.enrollCourses.at(0)
    if (!enrollCourse) {
      throw new BadRequestException(InvoiceErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }
    const redirectUrl = buildUploadReceiptLink({
      institution,
      invoice,
      customDomain: institution.site?.customDomain,
      siteUrl: institution.site?.url,
      coursePath: invoice.course?.path,
    })
    const today = dayjs().format('YYYY-MM-DD')
    const currentPeriod = classItem.regularPeriods.find((d) => {
      const lessons = d.lessons.filter((lesson) =>
        dayjs(dayjs(lesson.startTime).format('YYYY-MM-DD')).isSameOrBefore(today, 'day')
      )
      return lessons.length > 0
    })
    const nextPeriod = classItem.regularPeriods.find((d) => {
      return (
        currentPeriod.id !== d.id ||
        !!d.lessons.find((lesson) => dayjs(lesson.startTime).isAfter(today))
      )
    })
    if (!nextPeriod) return

    const metaRef = {
      type: classItem.type,
      classId: classItem.id,
      pickedClass: classItem,
      lessonDateId: nextPeriod.lessons[0].id,
      periodId: nextPeriod.id,
      pickedFirstDate: `${nextPeriod.lessons[0].startTime.toString()} ${nextPeriod.lessons[0].endTime.toString()}`,
      lessonPrice: invoice.payAmount,
      lessonCount: classItem.classLessons?.length || 1,
    }
    const { institutionId, siteId, userId, applicants } = invoice
    const firstEnrollCourse = invoice.enrollCourses.at(0)
    if (!firstEnrollCourse) {
      throw new BadRequestException(InvoiceErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }
    const course = firstEnrollCourse.course
    const enrollId = firstEnrollCourse?.id
    const firstApplicant = await this.userRepository.findOneById(userId)

    //   Make sure userId of invoice is not included at studentApplicants
    const studentApplicants = (
      await this.userRepository.findBy({
        id: In(applicants),
      })
    ).filter((d) => d.id !== userId)
    if (!firstApplicant) return
    await this.enrollCourseService.addNewScheduleToEnrollment(
      enrollId,
      {
        courseId: course.id,
        meta: metaRef,
        institutionId,
        siteId,
        redirectUrl,
        enrollInto: {
          type: classItem.type,
          courseName: course.name,
          secondLevelName: classItem.name,
          lessonCount: metaRef.lessonCount,
        },
      },
      [firstApplicant, ...studentApplicants],
      course
    )
  }

  async handleNextBillingInvoice({ institutionId, courseIds, interval }: any) {
    const nextBillingInvoices = await this.collectNextBillingInvoices(
      institutionId,
      courseIds,
      interval
    )
    const groupedInvoices = _.groupBy(nextBillingInvoices, 'enrollId')
    const listGroupedInvoices: Invoice[] = Object.keys(groupedInvoices).map(
      (key) => groupedInvoices[key][0]
    )
    const responses = []
    for (const invoice of listGroupedInvoices) {
      const jobData = await this.setupReminderWorker.buildPayloadSendingInvoiceMassage(invoice)
      if (!jobData) continue
      const classes = invoice.studentSchedules.flatMap((d) => d.class)

      jobData['associatedClass'] = classes.map((d) =>
        shallow({
          source: d,
          fields: ['id', 'name', 'courseId'],
        })
      )

      jobData['studentEmail'] = invoice.userAlias?.email
      jobData['studentName'] = invoice.userAlias?.name
      jobData['studentPhone'] = invoice.user?.phone
      jobData['className'] = classes.at(0)?.name || ''
      for (const studentSchedule of invoice.studentSchedules) {
        const classItem = await this.classRepository.findOneById(studentSchedule.classId)
        if (!classItem) {
          continue
        }
        for (const enrollCourse of invoice.enrollCourses) {
          const hasNextBillingInvoiceGenerated = await this.hasNextBillingInvoiceGenerated(
            enrollCourse,
            enrollCourse.billingNextDate
          )
          if (hasNextBillingInvoiceGenerated) {
            continue
          }

          await this.createNextBillingInvoice(
            invoice.institutionId,
            invoice,
            enrollCourse,
            invoice.course,
            classItem
          )
        }
      }
      responses.push(jobData)
    }
    return responses
  }

  async collectNextBillingInvoices(
    institutionId: number,
    courseIds: number[],
    interval: string,
    enabledClasses?: ClassEntity[]
  ): Promise<Invoice[]> {
    const currentTime = dayjs(new Date())

    const [intervalNumber, unit] = interval ? generateIntervalUnit(interval) : ['14', 'days']
    const someTimeAgo = dayjs(currentTime)
      .subtract(Number(intervalNumber), unit as dayjs.ManipulateType)
      .toDate()
    const whereOptions: FindOptionsWhere<Invoice> = {
      paymentState: PaymentStatus.PAID,
      institutionId,
      enrollCourses: {
        billingFormatId: Not(IsNull()),
        // Invoice filtered by billingStartDate and billingEndDate
        billingStartDate: MoreThanOrEqual(someTimeAgo),
        billingEndDate: LessThanOrEqual(currentTime.toDate()),
      },
    }
    if (courseIds.length > 0) {
      whereOptions.courseId = In(courseIds)
    }
    if (enabledClasses) {
      whereOptions.studentSchedules = In(enabledClasses.map((classEntity) => classEntity.id))
    }
    return this.invoiceRepository.find({
      where: whereOptions,
      relations: {
        studentSchedules: {
          studentLessons: true,
          recurringSchedule: true,
          class: true,
        },
        enrollCourses: {
          repeatFormat: true,
        },
        site: true,
        institution: true,
        course: true,
        user: true,
      },
      order: {
        createdAt: 'DESC',
      },
    })
  }

  async hasNextBillingInvoiceGenerated(
    enrollCourse: EnrollCourse,
    billingNextDate: Date
  ): Promise<boolean> {
    const whereCondition: FindOptionsWhere<Invoice> = {
      enrollCourses: {
        billingNextDate: MoreThanOrEqual(billingNextDate),
      },
    }
    if (enrollCourse.invoice?.id) {
      whereCondition.id = Not(enrollCourse.invoice.id)
    }
    return this.invoiceRepository.exist({
      where: whereCondition,
      relations: {
        enrollCourses: {
          repeatFormat: true,
        },
      },
    })
  }

  async createNextBillingInvoice(
    institutionId: number,
    invoice: Invoice,
    enrollCourse: EnrollCourse,
    course: Course,
    classItem: ClassEntity
  ) {
    if (!enrollCourse.repeatFormat) return
    const institution = invoice.institution
    institution.site = invoice.site
    const { billingNextDate, repeatFormat } = enrollCourse
    if ([PaymentStatus.PENDING].includes(invoice.paymentState)) {
      return
    }
    const applicants = await this.userRepository.findBy({
      id: In(invoice.applicants),
    })
    const nextBillingDate = dayjs().add(
      repeatFormat.every,
      repeatFormat.unit as dayjs.ManipulateType
    )

    const billingStart = dayjs(billingNextDate).subtract(
      repeatFormat.every,
      repeatFormat.unit as dayjs.ManipulateType
    )
    classItem.type = ClassTypeEnum.SUBSCRIPTION
    // const selectedClassMeta = new MetaRefExtended()
    const selectedClassMeta = {
      classId: classItem.id,
      type: ClassTypeEnum.SUBSCRIPTION,
      pickedClass: classItem,
      billingStartDate: billingStart.toISOString(),
      billingEndDate: nextBillingDate.toISOString(),
      billingNextDate: nextBillingDate.toISOString(),
      billingFormatId: enrollCourse.billingFormatId,
      lessonPrice: +invoice.payAmount,
      lessonCount: classItem.recurringFormat?.times || 1,
    }
    enrollCourse.billingEndDate = nextBillingDate.toDate()
    enrollCourse.billingNextDate = nextBillingDate.toDate()
    enrollCourse.billingStartDate = billingStart.toDate()
    await this.enrollCourseRepository.save(enrollCourse)
    await this.enrollCourseService.addNewScheduleToEnrollment(
      enrollCourse.id,
      {
        courseId: invoice.courseId,
        meta: selectedClassMeta,
        institutionId,
        siteId: invoice.siteId,
        redirectUrl: buildUploadReceiptLink({
          institution,
          invoice,
          customDomain: institution.site?.customDomain,
          siteUrl: institution.site?.url,
          coursePath: invoice.course?.path,
        }),
        enrollInto: {
          type: classItem.type,
          courseName: course.name,
          secondLevelName: classItem.name,
          lessonCount: classItem.recurringFormat?.times || 1,
        },
      },
      applicants,
      course
    )
  }
  async handleCreateInvoice(invoiceIds: number[]) {
    const invoices = await this.getInvoices(invoiceIds)
    for (const invoice of invoices) {
      const classes = invoice.studentSchedules.flatMap((d) => d.class).filter(Boolean)
      const setOfClasses = _.uniqBy(classes, 'id')
      for (const classItem of setOfClasses) {
        await this.createInvoice({
          type: classItem.type,
          siteId: invoice.siteId,
          institutionId: invoice.institutionId,
          classId: classItem.id,
          invoiceId: invoice.id,
        })
      }
    }
  }

  async getNextStudentLessons(dto: GenerateInvoicesNextMonthDTO): Promise<StudentSchedule[]> {
    const start = dayjs().add(1, 'month').startOf('month').toDate()
    const end = dayjs().add(1, 'month').endOf('month').toDate()

    return this.studentScheduleRepository
      .createQueryBuilder('studentSchedule')
      .leftJoinAndSelect('studentSchedule.recurringSchedule', 'recurringSchedule')
      .leftJoinAndSelect('studentSchedule.class', 'class')
      .leftJoinAndSelect('studentSchedule.studentLessons', 'studentLesson')
      .leftJoinAndSelect('studentLesson.user', 'user')
      .leftJoinAndSelect('studentSchedule.invoice', 'invoice')
      .leftJoinAndSelect('invoice.institution', 'institution')
      .leftJoinAndSelect('invoice.site', 'site')
      .leftJoinAndSelect('invoice.enrollCourses', 'enrollCourses')
      .where('studentSchedule.classId IN (:...classIds)', { classIds: dto.classIds })
      .andWhere('studentLesson.startTime BETWEEN :start AND :end', { start, end })
      .orderBy('studentLesson.endTime', 'DESC')
      .addOrderBy('studentLesson.endTime', 'DESC')
      .getMany()
  }

  async previewInvoicesNextMonth(institutionId: number, dto: GenerateInvoicesNextMonthDTO) {
    const studentSchedules = await this.getNextStudentLessons(dto)
    if (studentSchedules.length === 0) {
      throw new BadRequestException(InvoiceErrorMessage.NO_STUDENT_SCHEDULES_FOUND)
    }
    const blockTimeList = await this.blockTimeService.getBlockTimeArray({
      institutionId,
    })

    const results = []
    for (const ss of studentSchedules) {
      const studentLesson = ss.studentLessons[0]
      if (!ss.invoice?.enrollCourses.at(0)) {
        continue
      }
      const futureLessons = this.recurrSchedulesService.getRecurringWeekdayLessons({
        startDate: studentLesson.startTime,
        endDate: studentLesson.endTime,
        weekDay: ss.recurringSchedule?.weekDay,
        numberOfLessons: ss.invoice?.numOfLesson || 1,
        blockTimeList,
        timeZone: ss.invoice?.site?.timeZone?.id || 'UTC',
      })

      const result = {
        student: shallow({
          source: studentLesson?.user,
          fields: ['id', 'firstName', 'lastName', 'email', 'phone', 'fullName'],
        }),
        studentScheduleId: ss.id,
        classId: ss.class.id,
        invoiceId: ss.invoiceId,
        payAmount: ss.invoice?.payAmount || 0,
        lessons: futureLessons,
      }
      results.push(result)
    }
    return _.groupBy(results, 'classId')
  }

  async generateInvoiceForNextMonth(dto: GenerateInvoicesNextMonthDTO) {
    const studentSchedules = await this.getNextStudentLessons(dto)
    if (studentSchedules.length === 0) {
      throw new BadRequestException(InvoiceErrorMessage.NO_STUDENT_SCHEDULES_FOUND)
    }

    const invoiceIds = studentSchedules.map((ss) => ss.invoiceId).filter(Boolean)
    await this.handleCreateInvoice(_.uniq(invoiceIds))
  }

  async sendCustomMessages(dto: SendCustomMessagesDto) {
    try {
      const invoices = await this.getInvoices(dto.invoiceIds)
      for (const invoice of invoices) {
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
        const studentPhone = invoice.userAlias?.user.phone || enrollCourse.phone
        const jobData = {
          studentName: invoice.userAlias?.name || enrollCourse.name,
          studentPhone,
          courseName: course.name,
          className: invoice.studentSchedules.at(0)?.class?.name || '',
          paymentAmount: invoice.payAmount,
          paymentLink,
        }
        const contentMessage = replaceContentVariables(dto.message, jobData)

        await this.whatsappWebService.sendMessage(institution.id, studentPhone, contentMessage)
      }
    } catch (error) {
      console.log('ERROR', error)
      throw new BadRequestException(InvoiceErrorMessage.SEND_CUSTOM_MESSAGES_FAILED)
    }
  }
}

export default InvoiceWorker
