import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import parsePhoneNumber from 'libphonenumber-js'
import * as QRCode from 'qrcode'
import { ILike, In } from 'typeorm'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import {
  AddLessonEmailDTO,
  ApplicationLinkEmailDTO,
  ChangeLessonEmailDTO,
  SendInviteEmailDto,
} from '@/application/admin/setting-notifications/setting-notifications.dto'
import { QRCodeAttendanceDto } from '@/application/admin/student-onboard/dtos/student-onboard.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { ObjectStorageProvider } from '@/config/storage/object-storage.provider'
import {
  APIResponse,
  EmailParams,
  NodemailerEmailTransport,
  Personalization,
  Recipient,
  Sender,
  Variable,
} from '@/domain/external/email-transport.provider'
import { SettingNotificationsService } from '@/domain/service/setting-notifications.service'
import { StudentScheduleService } from '@/domain/service/student-schedule.service'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'
import { ClassRepository } from '@/models/classes.repository'
import { RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import type { EmailSettings } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import {
  ClassAdminPaymentConfirmationEmailParams,
  ClassStudentRejectPaymentEmailParams,
  defaultSettingNotifications,
  GenerateQrCodeAttachment,
  GetPaymentMethodParams,
  ReminderEnrollCourseParams,
  RemindPaymentT0,
  RemindPaymentT4,
  RequestTimeChangeEmailProps,
  ResetPasswordParams,
  SendAssignCouponParams,
  SendClassAdminConfirmedEmailParams,
  SendClassAdminPaymentConfirmParams,
  SendClassAdminPaymentSubmittedParams,
  SendClassAdminRegistrationParams,
  SendClassMaterialsEmailProps,
  SendClassStudentWaitingParams,
  SendCourseEmailVerificationParams,
  SendEmailFunctionBuildParams,
  SendEmailParams,
  SendForgetPasswordParams,
  SendQuestionEmailProps,
  SendRequestAiCreditParams,
  SendStudentConfirmCourseParams,
  SendStudentPaymentConfirmedEmail,
  SendStudentPaymentRejectParams,
  SendTeacherUploadedSubmissionFeedback,
  StudentLessonReminderDto,
  StudentPostPoneParams,
  UploadPaymentReceiptEmailParams,
  VerificationEmailParams,
  WaitingStudentPaymentEmailParams,
} from '@/models/custom-types/email-params'
import { StudentEnrollCourseAlias } from '@/models/custom-types/enroll-course'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import { ClassTypeEnum, PaymentMethod } from '@/models/enums/'
import { RequestTimeChangeStatus } from '@/models/enums/status'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { Invoice } from '@/models/invoice.entity'
import { InvoiceRepository } from '@/models/invoice.repository'
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '@/models/notification-record.entity'
import { NotificationRecordRepository } from '@/models/notification-record.repository'
import { SitesRepository } from '@/models/sites.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentNotificationSettingRepository } from '@/models/student-notification-setting.entity'
import { StudentSchedule, StudentScheduleWithUserAlias } from '@/models/student-schedule.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UsersRepository } from '@/models/users.repository'
import { buildUploadReceiptLink } from '@/utils/payment-link.utils'
import { shallow } from '@/utils/shallow.utils'
import {
  addressObjectToString,
  enrollIntoInfoToString,
  exportStudentSchedule,
  lessonDateToString,
  removeEmailPlusPart,
  studentScheduleToString,
  transformEmail,
} from '@/utils/string.utils'
import { timeslotFormat } from '@/utils/time.utils'
import { validateDomain } from '@/utils/validate/validate.utils'

import { SettingSiteService } from '../service/setting-site.service'

@Injectable()
export class EmailService {
  private readonly emailTransport: NodemailerEmailTransport
  private defaultSentFrom

  constructor(
    private readonly logger: CloudWatchLoggerProvider,
    private readonly sitesRepository: SitesRepository,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly settingSiteService: SettingSiteService,
    private readonly studentScheduleService: StudentScheduleService,
    private readonly settingNotificationsService: SettingNotificationsService,
    private readonly objectStorageProvider: ObjectStorageProvider,
    private readonly coursesRepository: CoursesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly classRepository: ClassRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly regularPeriodsRepository: RegularPeriodsRepository,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly notificationRecordRepository: NotificationRecordRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly studentNotifSettingRepository: StudentNotificationSettingRepository,
    private readonly userAliasesRepository: UserAliasesRepository
  ) {
    this.emailTransport = new NodemailerEmailTransport()
    this.defaultSentFrom = new Sender('info@flowclass.ai', 'Flowclass')
  }

  private async getSenderForInstitution(
    institutionId: number | null,
    fallbackName?: string
  ): Promise<Sender> {
    if (!institutionId) return this.defaultSentFrom
    const institution = await this.institutionsRepository.findOneById(institutionId)
    if (institution?.email) {
      return new Sender(institution.email, institution.name ?? fallbackName ?? 'Institution')
    }
    return fallbackName
      ? new Sender(this.defaultSentFrom.email, fallbackName)
      : this.defaultSentFrom
  }

  async buildSendClassStudentWaitingPayload(
    firstStudentAccount: StudentEnrollCourseAlias,
    params: SendEmailFunctionBuildParams
  ): Promise<WaitingStudentPaymentEmailParams> {
    const {
      enrollCourses,
      institution,
      site,
      paymentMethod,
      classDateTime,
      multipleClassInfo,
      invoice,
      paymentLink,
    } = params

    const classes = multipleClassInfo?.classes || []
    const enrollInto = classes.map((classes) => classes.enrollInto)
    const multipleClassTotalPrice = multipleClassInfo.classes.reduce(
      (price, classes) => price + Number(classes.pricingInfo.paymentAmount),
      0
    )

    const contactEmail = institution.email ?? site.email
    const contactPhone = institution.phone ?? site.phone

    const location = classes.map((o) => o?.location?.name ?? '')
    const instructor = classes.map((o) => o?.instructor?.firstName ?? '')
    const courseNames = enrollCourses.at(0)?.course?.name ?? ''
    const courseRegistrationMes = enrollCourses.at(0)?.course?.registrationMes ?? ''
    const timeZone = await this.settingSiteService.getTimeZone(site.id)
    const className =
      classes.length <= 0
        ? enrollCourses
            .map((ec) =>
              ec.enrollInto.map((d) => `${ec.name} - ${d.courseName} - ${d.secondLevelName}`)
            )
            .join('\n')
        : enrollInto.map((info) => enrollIntoInfoToString(info))?.join('\n')
    return {
      emailAddress: invoice.userAlias?.email,
      institutionName: institution.name,
      studentName: enrollCourses.map((ec) => ec.name).join(', '),
      studentPhone: enrollCourses.map((ec) => ec.student?.phone).join(', '),
      adminEmail: contactEmail,
      adminPhone: contactPhone,
      courseName: courseNames,
      className,
      classDateTime,
      location: Array.from(new Set(location)).join(', '),
      instructor: Array.from(new Set(instructor)).join(', '),
      price: `${multipleClassInfo.classes[0]?.pricingInfo?.currency} ${multipleClassTotalPrice}`,
      paymentAmount: `${multipleClassInfo.classes[0]?.pricingInfo?.currency} ${multipleClassTotalPrice}`,
      paymentLink,
      paymentMethod,
      paymentStatus: invoice.paymentState,
      transactionId: invoice.id.toString(),
      remark: courseRegistrationMes,
      enrolId: invoice.id.toString(),
      timeZone,
      password: firstStudentAccount.createdPassword,
    }
  }

  public async sendClassStudentWaitingPayment({
    firstStudentAccount,
    parentUserAlias,
    params,
    recipientUserId,
  }: SendClassStudentWaitingParams): Promise<void | APIResponse> {
    const parentUser = {
      studentAccount: parentUserAlias.user,
      userAliasId: parentUserAlias.id,
      name: parentUserAlias.name,
      phone: parentUserAlias.user.phone,
      email: parentUserAlias?.email || parentUserAlias.user.email,
      userAlias: parentUserAlias,
    } as StudentEnrollCourseAlias
    const payload = await this.buildSendClassStudentWaitingPayload(parentUser, params)
    const personalization: Variable[] = [
      {
        email: payload.emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'studentName',
            value: payload.studentName,
          },
          {
            var: 'studentPhone',
            value: payload.studentPhone,
          },
          {
            var: 'price',
            value: payload.price,
          },
          {
            var: 'courseName',
            value: payload.courseName,
          },
          {
            var: 'className',
            value: payload.className?.replace(/\n/g, '<br />'),
          },
          {
            var: 'classDateTime',
            value: payload.classDateTime?.replace(/\n/g, '<br />'),
          },
          {
            var: 'remark',
            value: payload.remark,
          },
          {
            var: 'enrolId',
            value: payload.enrolId,
          },
          {
            var: 'location',
            value: payload.location,
          },
          {
            var: 'instructor',
            value: payload.instructor,
          },
          {
            var: 'password',
            value: payload.password,
          },
          {
            var: 'adminEmail',
            value: payload.adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${payload.adminPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'paymentMethod',
            value: payload.paymentMethod,
          },
          {
            var: 'paymentStatus',
            value: payload.paymentStatus,
          },
          {
            var: 'transactionId',
            value: payload.transactionId,
          },
          {
            var: 'institutionName',
            value: payload.institutionName,
          },
          {
            var: 'paymentLink',
            value: payload.paymentLink,
          },

          {
            var: 'timeZone',
            value: payload.timeZone,
          },
        ]),
      },
    ]

    const advancePersonalization: Personalization[] = [
      {
        email: payload.emailAddress,
        data: {
          schoolLogo: await this.checkDisplayEmailLogo(params.institutionId),
          enrollCourses: this.convertValuesToString(
            params.enrollCourses.flatMap((ec) => {
              return Object.entries(ec).map(([key, value]) => ({
                var: key,
                value,
              }))
            })
          ),
        },
      },
    ]

    const emailSubject = `${payload.institutionName} is waiting for your payment for ${payload.courseName}`

    const emailPayload = {
      emailSubject,
      emailAddress: parentUser.email,
      recipientUserId,
      recipientName: parentUser.name,
      templateId: 'remind-payment',
      personalization,
      advancePersonalization,
      notificationType: NotificationType.WAITING_FOR_PAYMENT,
      institutionName: payload.institutionName,
      institutionId: params.institutionId,
      siteId: params.site?.id,
      attachments: params?.attachments,
      subject: emailSubject,
    }

    return await this.sendEmail({
      emailPayload,
      enrollCourse: params.enrollCourses.at(0),
    })
  }

  public async sendUploadedTeacherFeedback(
    payload: SendTeacherUploadedSubmissionFeedback
  ): Promise<void | APIResponse> {
    const { fileBuffers, studentName, className, ...rest } = payload
    const attachments = fileBuffers.map((fileBuffer, index) => ({
      content: fileBuffer.toString('base64'),
      filename: `${index + 1}-${studentName}-Graded-Document-${className}.pdf`,
      disposition: 'attachment',
    }))
    const personalization = [
      {
        email: rest.emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'className',
            value: className?.replace(/\n/g, '<br />'),
          },
          {
            var: 'adminEmail',
            value: rest.adminEmail,
          },
          {
            var: 'institutionName',
            value: rest.institutionName,
          },
        ]),
      },
    ]
    const advancePersonalization: Personalization[] = [
      {
        email: rest.emailAddress,
        data: {
          schoolLogo: await this.checkDisplayEmailLogo(rest.institutionId),
        },
      },
    ]
    const emailSubject = 'Marked/Graded Document'
    const emailPayload = {
      emailSubject,
      emailAddress: rest.emailAddress,
      recipientUserId: rest.userId,
      recipientName: studentName,
      templateId: 'teacher-feedback-uploaded',
      personalization,
      advancePersonalization,
      notificationType: NotificationType.TEACHER_FEEDBACK,
      institutionName: payload.institutionName,
      institutionId: payload.institutionId,
      siteId: payload.siteId,
      attachments,
      subject: emailSubject,
    }

    return await this.sendEmail({
      emailPayload,
    })
  }

  public async sendClassStudentConfirmation({
    userAlias: userAliasProps,
    payload,
    institutionId,
    siteId,
    enrollCourse,
    invoice,
    recipientUser,
  }: SendStudentConfirmCourseParams): Promise<void | APIResponse> {
    const {
      institutionName,
      studentName,
      adminEmail,
      adminPhone,
      courseName,
      className,
      classDateTime,
      location,
      password,
      price,
      paymentMethod,
      paymentStatus,
      transactionId,
      remark,
      enrolId,
      timeZone,
      successPaymentLink,
    } = payload

    const studentLessons = await this.studentLessonRepository.findAll({
      where: { enrollCourseId: enrollCourse.id },
    })

    // Push student lesson id by userId of the studentLesson
    const studentLessonIds: Record<number, number[]> = {}

    studentLessons.forEach((lesson) => {
      if (!studentLessonIds[lesson.userId]) {
        studentLessonIds[lesson.userId] = []
      }
      studentLessonIds[lesson.userId].push(lesson.id)
    })
    let userAlias = userAliasProps
    if (!userAlias) {
      userAlias = await this.userAliasesRepository.findOne({
        where: {
          userId: recipientUser.id,
          institutionId,
          email: ILike(transformEmail(recipientUser.email)),
        },
      })
    }
    const hasQrCode = await this.isQRCodeModuleEnabled(enrollCourse.courseId)
    const effectiveEmail = userAlias?.email || recipientUser.email || payload.emailAddress

    const personalization = [
      {
        email: effectiveEmail,
        substitutions: this.convertValuesToString([
          {
            var: 'price',
            value: price,
          },
          {
            var: 'remark',
            value: remark,
          },
          {
            var: 'enrolId',
            value: enrolId,
          },
          {
            var: 'location',
            value: location,
          },
          {
            var: 'password',
            value: password,
          },
          {
            var: 'className',
            value: className?.replace(/\n/g, '<br />'),
          },
          {
            var: 'adminEmail',
            value: adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'studentEmail',
            value: effectiveEmail,
          },
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'studentPhone',
            value: recipientUser.phoneNumber || 'No phone number',
          },
          {
            var: 'classDateTime',
            value: classDateTime?.replace(/\n/g, '<br />'),
          },
          {
            var: 'paymentMethod',
            value: paymentMethod,
          },
          {
            var: 'paymentStatus',
            value: paymentStatus,
          },
          {
            var: 'transactionId',
            value: transactionId,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'timeZone',
            value: timeZone,
          },
          {
            var: 'successPaymentLink',
            value: successPaymentLink,
          },
        ]),
      },
    ]

    const emailSubject = `You are now enrolled in ${courseName} by ${institutionName}`
    const isFirstApplicant = invoice.applicants.at(0) === recipientUser.id

    // If isFirstApplicant, send all qrcode as attachment into applicants
    const attachments = await this.generateQrCodeAttachments({
      invoice,
      enrollCourse,
      studentLessonIds,
      isForFirstApplicant: isFirstApplicant,
      participantId: enrollCourse.userId,
    })
    const advancePersonalization: Personalization[] = [
      {
        email: effectiveEmail,
        data: {
          schoolLogo: await this.checkDisplayEmailLogo(institutionId),
          hasQrCode,
          attachments: attachments.map((d) => d.id),
        },
      },
    ]
    const emailPayload = {
      emailSubject,
      emailAddress: effectiveEmail,
      recipientUserId: recipientUser.id,
      recipientName: recipientUser.studentName,
      templateId: 'student-confirmation',
      personalization,
      advancePersonalization,
      notificationType: NotificationType.ENROLLED_IN_COURSE,
      institutionId,
      institutionName,
      siteId,
      attachments,
    }
    await this.sendEmail({
      emailPayload,
      enrollCourse,
    })
  }

  async generateQrCodeAttachments({
    invoice,
    enrollCourse,
    isForFirstApplicant,
    studentLessonIds,
    participantId,
  }: GenerateQrCodeAttachment) {
    const qrCodeData: QRCodeAttendanceDto = {
      enrollCourseId: enrollCourse.id,
      studentLessonIds: [],
      invoiceId: invoice.id,
    }

    // For first applicant we need to attach all participants qrcode
    if (isForFirstApplicant) {
      return Promise.all(
        invoice.applicants.map(async (applicant) => {
          qrCodeData['applicantId'] = applicant
          qrCodeData['studentLessonIds'] = studentLessonIds[applicant]
          const qrCodeImage = await this.generateQRCode(JSON.stringify(qrCodeData))
          return {
            filename: `${applicant}-qrcode.png`,
            content: qrCodeImage.split(',')[1],
            disposition: 'inline',
            id: `${applicant}-qrcode.png`,
            base64: qrCodeImage,
          }
        })
      )
    }
    const qrCodeImage = await this.generateQRCode(JSON.stringify(qrCodeData))

    return [
      {
        filename: `${participantId}-qrcode.png`,
        content: qrCodeImage.split(',')[1],
        disposition: 'inline',
        id: `${participantId}-qrcode.png`,
        base64: qrCodeImage,
      },
    ]
  }

  public async sendClassStudentPaymentConfirmedEmail({
    userAlias,
    invoice,
    transaction,
    applicants,
  }: SendStudentPaymentConfirmedEmail): Promise<void> {
    // We need to make sure there are any applicants to be confirmed
    // If there are no applicants at params, we don't need doing entire logic
    if ((applicants?.length || 0) <= 0) return
    const institution = await this.institutionsRepository.findOneById(invoice.institutionId)
    const site = await this.sitesRepository.findOneById(invoice.siteId)
    const timeZone = await this.settingSiteService.getTimeZone(invoice.siteId)

    const enrollCourseStudentSchedules = invoice.enrollCourses.flatMap(
      (enrollCourse) => enrollCourse.studentSchedule
    )

    const multipleClassMapping = invoice.enrollCourses.flatMap(
      (enrollCourse) => enrollCourse.multipleClassMapping ?? []
    )

    let classDateTime = ''
    if (enrollCourseStudentSchedules && enrollCourseStudentSchedules.length > 0) {
      const studentScheduleWithUserAlias = await this.getStudentScheduleWithUserAlias(
        invoice.institutionId,
        enrollCourseStudentSchedules
      )

      classDateTime = studentScheduleToString(
        studentScheduleWithUserAlias,
        timeZone,
        multipleClassMapping
      )
    }

    let foundCourse

    if (invoice.enrollCourses.at(0)?.course) {
      foundCourse = invoice.enrollCourses.at(0)?.course
    } else {
      foundCourse = await this.coursesRepository.findOneBy({
        id: invoice.courseId,
        institutionId: invoice.institutionId,
      })
    }

    const contactEmail = institution.email ?? site.email
    const contactPhone = institution.phone ?? site.phone
    const paymentReceiptUploadLinkParams = new URLSearchParams({
      school: institution.url ?? '',
      schoolId: institution.id.toString(),
      course: foundCourse.path,
      enrolIds: invoice.enrollCourses.map((enrollCourse) => enrollCourse.id.toString()).join(','),
      token: invoice.proofToken,
    })
    let location = ''
    if (multipleClassMapping) {
      const classLocations = multipleClassMapping
        .map((mapping) => mapping?.class?.locationRoom?.name)
        .filter(Boolean)

      location = classLocations.join(', ')
    }

    let firstEnrollCourse

    if (invoice.enrollCourses.at(0)?.course) {
      firstEnrollCourse = invoice.enrollCourses.at(0)
    } else {
      firstEnrollCourse = await this.coursesRepository.findOneBy({
        id: invoice.courseId,
        institutionId: invoice.institutionId,
      })
    }

    const enrollInto = invoice.enrollCourses.flatMap((o) => o.enrollInto)
    const emailApplicants = {
      emailAddress: userAlias?.email ?? invoice.userAlias?.email,
      studentName: userAlias?.name ?? invoice.userAlias?.name,
      studentPhone: invoice.user?.phone,
      institutionName: institution.name,
      adminEmail: contactEmail,
      adminPhone: contactPhone,
      courseName: foundCourse.name,
      className: enrollInto.map((info) => enrollIntoInfoToString(info)).join('\n'),
      classDateTime,
      location,
      price: `${invoice.currency} ${invoice.payAmount}`,
      paymentAmount: `${invoice.currency} ${invoice.payAmount}`,
      paymentMethod: this.getPaymentMethodString({
        paymentMethod: invoice.paymentMethod,
        payoutMethod: invoice.payLaterMethod,
        payAmount: invoice.payAmount,
      }),
      paymentStatus: transaction ? transaction.status.toString() : invoice.paymentState,
      transactionId: transaction ? transaction.id.toString() : '',
      remark: foundCourse.registrationMes,
      enrolId: invoice.id.toString(),
      timeZone,
      successPaymentLink: `https://${
        validateDomain(site.customDomain) ? site.customDomain : site.url
      }/enrol/success-payment?${paymentReceiptUploadLinkParams.toString()}`,
    }

    if (applicants && applicants.length > 1) {
      for (const applicant of applicants) {
        emailApplicants.studentName = applicant.studentName
        emailApplicants.studentPhone = applicant.phoneNumber

        for (const enrollCourse of invoice.enrollCourses) {
          await this.sendClassStudentConfirmation({
            userAlias: userAlias ?? invoice.userAlias,
            recipientUser: applicants[0],
            institutionId: institution.id,
            siteId: site.id,
            payload: emailApplicants,
            enrollCourse,
            invoice,
          })
        }
      }
    } else {
      for (const enrollCourse of invoice.enrollCourses) {
        await this.sendClassStudentConfirmation({
          userAlias,
          recipientUser: applicants[0],
          institutionId: institution.id,
          siteId: site.id,
          payload: emailApplicants,
          enrollCourse,
          invoice,
        })
      }
    }
  }

  async getStudentScheduleWithUserAlias(
    institutionId: number,
    enrollCourseStudentSchedules: StudentSchedule[]
  ): Promise<StudentScheduleWithUserAlias[]> {
    const studentScheduleWithUserAlias = []
    for (const enrollCourseStudentSchedule of enrollCourseStudentSchedules) {
      if (!enrollCourseStudentSchedule || !enrollCourseStudentSchedule.studentLessons?.length)
        continue
      const firstStudentLesson = enrollCourseStudentSchedule.studentLessons?.at(0)
      if (!firstStudentLesson) continue
      const userAlias = await this.userAliasesRepository.findOneBy({
        userId: firstStudentLesson.userId,
        institutionId,
      })
      if (userAlias) {
        studentScheduleWithUserAlias.push({
          ...enrollCourseStudentSchedule,
          userAlias,
        })
      }
    }
    return studentScheduleWithUserAlias as StudentScheduleWithUserAlias[]
  }

  public async sendClassStudentUploadReceiptEmail(enrollCourses: EnrollCourse[], invoice: Invoice) {
    const institution = await this.institutionsRepository.findOneById(invoice.institutionId)
    const site = await this.sitesRepository.findOneById(institution.siteId)
    const timeZone = await this.settingSiteService.getTimeZone(institution.siteId)
    // No need to send email if course is not found or course deleted
    // if (!invoice.course) return
    const enrollCourseStudentSchedules = enrollCourses.flatMap((ec) => ec.studentSchedule)

    const multipleClassMapping = enrollCourses.flatMap((ec) => ec.multipleClassMapping ?? [])

    let classDateTime = ''
    if (enrollCourseStudentSchedules && enrollCourseStudentSchedules.length > 0) {
      const studentScheduleWithUserAlias = await this.getStudentScheduleWithUserAlias(
        invoice.institutionId,
        enrollCourseStudentSchedules
      )
      classDateTime = studentScheduleToString(
        studentScheduleWithUserAlias,
        timeZone,
        multipleClassMapping
      )
    }
    const paymentMethod = this.getPaymentMethodString({
      paymentMethod: invoice.paymentMethod,
      payoutMethod: invoice.payLaterMethod,
      payAmount: invoice.payAmount,
    })
    const firstEnrollCourse = enrollCourses.at(0)
    const paymentReceiptUploadLink = buildUploadReceiptLink({
      institution,
      invoice,
      customDomain: site.customDomain,
      siteUrl: site.url,
      coursePath: firstEnrollCourse.course?.path,
    })
    await this.sendClassStudentUploadPaymentReceiptEmail(invoice.userAliasId, {
      institution,
      institutionId: institution?.id,
      site,
      enrollCourse: firstEnrollCourse,
      enrollCourses,
      invoice,
      paymentMethod,
      classDateTime,
      paymentReceiptUploadLink,
      course: firstEnrollCourse.course,
      enrollmentForm: enrollCourses.flatMap((ec) => ec.registrationForm).filter(Boolean),
    })
  }

  public async sendClassStudentPaymentRejectEmail({
    enrollCourse,
    invoice,
    transaction,
  }: SendStudentPaymentRejectParams): Promise<APIResponse | void> {
    const institution = await this.institutionsRepository.findOneById(enrollCourse.institutionId)
    const site = await this.sitesRepository.findOneById(enrollCourse.siteId)
    const timeZone = await this.settingSiteService.getTimeZone(enrollCourse.siteId)
    const contactEmail = institution.email ?? site.email
    const contactPhone = institution.phone ?? site.phone
    const reUploadPaymentReceiptLinkParams = new URLSearchParams({
      school: institution.url || '',
      course: enrollCourse.course.path,
      enrolId: invoice.id.toString(),
      token: invoice.proofToken,
    })
    const enrollCourseStudentSchedules = await this.studentScheduleService.findAllByEnrollCourseId(
      enrollCourse.id
    )

    const multipleClassMapping = enrollCourse.multipleClassMapping ?? []

    let classDateTime = ''
    if (enrollCourseStudentSchedules && enrollCourseStudentSchedules.length > 0) {
      const studentScheduleWithUserAlias = await this.getStudentScheduleWithUserAlias(
        enrollCourse.institutionId,
        enrollCourseStudentSchedules
      )
      classDateTime = studentScheduleToString(
        studentScheduleWithUserAlias,
        timeZone,
        multipleClassMapping
      )
    }
    const emailToStudentPaymentRejectedParams = {
      institutionName: institution.name,
      emailAddress: enrollCourse.preferredEmail,
      studentPhone: enrollCourse.preferredPhone,
      studentName: enrollCourse.preferredName,
      courseName: enrollCourse.course.name,
      price: `${invoice.currency} ${transaction.amountTotal}`,
      paymentAmount: `${invoice.currency} ${transaction.amountTotal}`,
      paymentMethod: this.getPaymentMethodString({
        paymentMethod: invoice.paymentMethod,
        payoutMethod: invoice.payLaterMethod,
        payAmount: invoice.payAmount,
      }),
      paymentStatus: transaction.status,
      enrolId: invoice.id.toString(),
      reUploadPaymentUrl: `https://${
        validateDomain(site.customDomain) ? site.customDomain : site.url
      }/enrol/upload-receipt?${reUploadPaymentReceiptLinkParams.toString()}`,
      transactionId: transaction.id.toString(),
      // class info
      className: enrollCourse.enrollInto?.map((info) => enrollIntoInfoToString(info)).join('\n'),
      classDateTime,
      location: addressObjectToString(institution.address),
      adminEmail: contactEmail,
      adminPhone: contactPhone,
      timeZone,
    }

    // The data of each applicant is supposed to be in "invoice.applicants"

    await this.sendClassStudentRejectPaymentEmail(
      enrollCourse.userId,
      institution.id,
      site.id,
      emailToStudentPaymentRejectedParams
    )
  }

  public async sendClassAdminNewRegistration({
    payload,
    enrollCourse,
  }: SendClassAdminRegistrationParams): Promise<void | APIResponse> {
    const {
      emailAddress,
      institutionName,
      studentEmail,
      studentName,
      studentPhone,
      courseName,
      className,
      classDateTime,
      location,
      price,
      paymentMethod,
      paymentStatus,
      transactionId,
      remark,
      enrolId,
      enrollmentForm,
      adminEmail,
      adminPhone,
      timeZone,
      recipientId,
      institutionId,
      siteId,
    } = payload
    const personalization = [
      {
        email: emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'price',
            value: price,
          },
          {
            var: 'remark',
            value: remark,
          },
          {
            var: 'enrolId',
            value: enrolId,
          },
          {
            var: 'location',
            value: location,
          },
          {
            var: 'className',
            value: className?.replace(/\n/g, '<br />'),
          },
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'studentEmail',
            value: studentEmail,
          },
          {
            var: 'studentPhone',
            value: parsePhoneNumber(`+${studentPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'classDateTime',
            value: classDateTime?.replace(/\n/g, '<br />'),
          },
          {
            var: 'paymentMethod',
            value: paymentMethod,
          },
          {
            var: 'paymentStatus',
            value: paymentStatus,
          },
          {
            var: 'transactionId',
            value: transactionId,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'adminEmail',
            value: adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'timeZone',
            value: timeZone,
          },

          {
            var: 'flowclassCrmLink',
            value: process.env.NEXT_PUBLIC_WEB_BASE_URL,
          },
        ]),
      },
    ]

    const advancePersonalization: Personalization[] = [
      {
        email: emailAddress,
        data: {
          enrollmentForm,
          schoolLogo: await this.checkDisplayEmailLogo(institutionId),
        },
      },
    ]

    const emailSubject = `${studentName} has applied for ${courseName}`
    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId: recipientId,
      recipientName: institutionName,
      templateId: 'admin-new-registration',
      personalization,
      advancePersonalization,
      notificationType: NotificationType.STUDENT_REGISTERED,
      institutionId,
      institutionName,
      siteId,
    }
    return await this.sendEmail({
      emailPayload,
      enrollCourse,
    })
  }

  public async sendClassAdminPaymentConfirmation({
    payload,
    recipientUserId,
    institutionId,
    siteId,
    enrollCourse,
  }: SendClassAdminPaymentConfirmParams): Promise<void | APIResponse> {
    const {
      emailAddress,
      institutionName,
      studentEmail,
      studentName,
      studentPhone,
      courseName,
      className,
      classDateTime,
      location,
      price,
      paymentMethod,
      paymentStatus,
      transactionId,
      enrollmentForm,
      remark,
      enrolId,
      adminEmail,
      adminPhone,
      timeZone,
      instructor,
    } = payload
    const personalization = [
      {
        email: emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'price',
            value: price,
          },
          {
            var: 'remark',
            value: remark,
          },
          {
            var: 'enrolId',
            value: enrolId,
          },
          {
            var: 'location',
            value: location,
          },
          {
            var: 'instructor',
            value: instructor,
          },
          {
            var: 'className',
            value: className?.replace(/\n/g, '<br />'),
          },
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'studentEmail',
            value: studentEmail,
          },
          {
            var: 'studentPhone',
            value: parsePhoneNumber(`+${studentPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'classDateTime',
            value: classDateTime?.replace(/\n/g, '<br />'),
          },
          {
            var: 'paymentMethod',
            value: paymentMethod,
          },
          {
            var: 'paymentStatus',
            value: paymentStatus,
          },
          {
            var: 'transactionId',
            value: transactionId,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'adminEmail',
            value: adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'timeZone',
            value: timeZone,
          },

          {
            var: 'flowclassCrmLink',
            value: process.env.NEXT_PUBLIC_WEB_BASE_URL,
          },
        ]),
      },
    ]

    const advancePersonalization: Personalization[] = [
      {
        email: emailAddress,
        data: {
          schoolLogo: await this.checkDisplayEmailLogo(institutionId),
          enrollmentForm,
        },
      },
    ]

    const emailSubject = `${
      studentName ?? 'A student'
    } has uploaded payment receipt for ${courseName}`
    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId,
      recipientName: institutionName,
      templateId: 'admin-payment-confirmation',
      personalization,
      advancePersonalization,
      notificationType: NotificationType.STUDENT_PAID,
      institutionId,
      institutionName,
      siteId,
    }
    return await this.sendEmail({
      emailPayload,
      enrollCourse,
    })
  }

  public async sendClassAdminPaymentConfirmedEmail({
    enrollCourse,
    invoice,
    transaction,
  }: SendClassAdminConfirmedEmailParams): Promise<APIResponse | void> {
    const institution = await this.institutionsRepository.findOneById(enrollCourse.institutionId)
    const site = await this.sitesRepository.findOneById(enrollCourse.siteId)
    const timeZone = await this.settingSiteService.getTimeZone(enrollCourse.siteId)
    const contactEmail = institution.email ?? site.email
    const enrollCourseStudentSchedules = await this.studentScheduleService.findAllByEnrollCourseId(
      enrollCourse.id
    )

    const multipleClassMapping = enrollCourse.multipleClassMapping ?? []

    let classDateTime = ''
    if (enrollCourseStudentSchedules && enrollCourseStudentSchedules.length > 0) {
      const studentScheduleWithUserAlias = await this.getStudentScheduleWithUserAlias(
        enrollCourse.institutionId,
        enrollCourseStudentSchedules
      )
      classDateTime = studentScheduleToString(
        studentScheduleWithUserAlias,
        timeZone,
        multipleClassMapping
      )
    }
    const location = multipleClassMapping.map((o) => o.class?.locationRoom?.name ?? '')
    const instructor = multipleClassMapping.map((o) => o.class?.instructor?.firstName ?? '')

    const emailToAdminPaymentConfirmedParams: ClassAdminPaymentConfirmationEmailParams = {
      emailAddress: contactEmail,
      institutionName: institution.name,
      studentName: enrollCourse.preferredName,
      studentEmail: enrollCourse.preferredEmail,
      studentPhone: enrollCourse.preferredPhone,
      courseName: enrollCourse.course.name,
      className: enrollCourse.enrollInto?.map((info) => enrollIntoInfoToString(info)).join('\n'),
      classDateTime,
      location: Array.from(new Set(location)).join(', '),
      instructor: Array.from(new Set(instructor)).join(', '),
      price: `${enrollCourse.currency} ${enrollCourse.paymentAmount}`,
      paymentAmount: `${enrollCourse.currency} ${enrollCourse.paymentAmount}`,
      paymentMethod: this.getPaymentMethodString({
        paymentMethod: invoice.paymentMethod,
        payoutMethod: invoice.payLaterMethod,
        payAmount: invoice.payAmount,
      }),

      paymentStatus: transaction.status,
      transactionId: transaction.id.toString(),
      remark: enrollCourse.course.registrationMes,
      enrolId: invoice.id.toString(),
      adminEmail: contactEmail,
      adminPhone:
        parsePhoneNumber(`+${institution.phone ?? site.phone}`)?.formatInternational() ?? '',
      timeZone,
    }
    await this.sendClassAdminPaymentConfirmation({
      recipientUserId: -1,
      institutionId: enrollCourse.institutionId,
      siteId: enrollCourse.siteId,
      payload: emailToAdminPaymentConfirmedParams,
      enrollCourse,
    })
  }

  public async sendClassAdminPaymentSubmitted({
    recipientUserId,
    institutionId,
    siteId,
    payload,
  }: SendClassAdminPaymentSubmittedParams): Promise<void | APIResponse> {
    const {
      emailAddress,
      institutionName,
      studentEmail,
      studentName,
      studentPhone,
      courseName,
      className,
      classDateTime,
      location,
      price,
      paymentMethod,
      paymentStatus,
      enrolId,
      file,
      filename,
      transactionId,
      paymentReceipt,
      adminEmail,
      adminPhone,
      timeZone,
      instructor,
    } = payload
    const personalization = [
      {
        email: emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'price',
            value: price,
          },
          {
            var: 'enrolId',
            value: enrolId,
          },
          {
            var: 'location',
            value: location,
          },
          {
            var: 'instructor',
            value: instructor,
          },
          {
            var: 'className',
            value: className?.replace(/\n/g, '<br />'),
          },
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'studentEmail',
            value: studentEmail,
          },
          {
            var: 'studentPhone',
            value: parsePhoneNumber(`+${studentPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'classDateTime',
            value: classDateTime?.replace(/\n/g, '<br />'),
          },
          {
            var: 'paymentMethod',
            value: paymentMethod,
          },
          {
            var: 'paymentStatus',
            value: paymentStatus,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'transactionId',
            value: transactionId,
          },
          {
            var: 'adminEmail',
            value: adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'timeZone',
            value: timeZone,
          },

          {
            var: 'flowclassCrmLink',
            value: process.env.NEXT_PUBLIC_WEB_BASE_URL,
          },
        ]),
      },
    ]

    const advancePersonalization: Personalization[] = [
      {
        email: emailAddress,
        data: {
          paymentReceipt,
          schoolLogo: await this.checkDisplayEmailLogo(institutionId),
        },
      },
    ]

    const attachments = [
      {
        filename,
        content: file.toString('base64'),
        disposition: 'attachment',
      },
    ]

    const emailSubject = `${studentName} has submitted a payment receipt for ${courseName}!`
    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId,
      recipientName: institutionName,
      templateId: 'admin-payment-submitted',
      personalization,
      notificationType: NotificationType.CONFIRM_PAYMENT,
      advancePersonalization,
      attachments,
      institutionId,
      institutionName,
      siteId,
    }
    return await this.sendEmail({ emailPayload })
  }

  // THIS EMAIL WILL USE THE USER'S CONTACT EMAIL IF AVAILABLE
  public async sendAssignCouponEmail({
    userId,
    studentName,
    studentEmail,
    institutionName,
    couponCode,
    discountAmountUnit,
    expiredDate,
  }: SendAssignCouponParams): Promise<void | APIResponse> {
    const personalization = [
      {
        email: studentEmail,
        substitutions: [
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'couponCode',
            value: couponCode,
          },
          {
            var: 'discountAmountUnit',
            value: discountAmountUnit,
          },
          {
            var: 'expiredDate',
            value: timeslotFormat(expiredDate),
          },
        ],
      },
    ]

    const emailSubject = `Hello ${studentName}, you have received a coupon from ${institutionName}`
    const emailPayload = {
      emailSubject,
      emailAddress: studentEmail,
      recipientUserId: userId,
      recipientName: studentName,
      templateId: 'assign-coupon',
      personalization,
      notificationType: NotificationType.RECEIVED_COUPON,
      institutionName,
    }
    return await this.sendEmail({ emailPayload })
  }

  public async sendForgetPasswordEmail({
    userId,
    emailAddress,
    resetLink,
  }: SendForgetPasswordParams): Promise<void | APIResponse> {
    const recipients = [new Recipient(emailAddress)]

    const personalization = [
      {
        email: emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'resetPasswordLink',
            value: resetLink,
          },
        ]),
      },
    ]

    const emailSubject = 'You have requested to reset your password'
    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId: userId,
      recipientName: '',
      templateId: 'forgot-password',
      personalization,
      notificationType: NotificationType.FORGET_PASSWORD,
    }
    return await this.sendEmail({ emailPayload })
  }

  // THIS EMAIL WILL USE THE USER'S CONTACT EMAIL IF AVAILABLE
  public async sendStudentLessonReminderEmail({
    data,
    enrollCourse,
    customTemplateId,
  }: StudentLessonReminderDto): Promise<void | APIResponse> {
    const {
      recipientUserId,
      institutionId,
      siteId,
      courseName,
      className,
      studentSchedule,
      timeZone,
      institutionName,
      location,
      adminPhone,
      adminEmail,
      studentEmail,
      enrollCourseId,
      studentName,
      firstLesson,
      studentPhone,
      successPaymentLink,
    } = data

    const ec = await this.enrollCourseRepository.findOneBy({
      id: enrollCourseId,
    })

    const invoice = await this.invoiceRepository.findOneBy({
      id: studentSchedule.invoiceId,
    })

    const hasQrCode = await this.isQRCodeModuleEnabled(ec.courseId)

    const studentScheduleWithUserAlias = await this.getStudentScheduleWithUserAlias(institutionId, [
      studentSchedule,
    ])

    const personalization = [
      {
        email: studentEmail,
        substitutions: [
          {
            var: 'location',
            value: location,
          },
          {
            var: 'timeZone',
            value: timeZone,
          },
          {
            var: 'className',
            value: className,
          },
          {
            var: 'adminEmail',
            value: adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'studentEmail',
            value: studentEmail,
          },
          {
            var: 'studentPhone',
            value: parsePhoneNumber(`+${studentPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'firstLesson',
            value: lessonDateToString(firstLesson, timeZone),
          },
          {
            var: 'classDateTime',
            value: exportStudentSchedule(studentScheduleWithUserAlias.at(0), timeZone),
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'successPaymentLink',
            value: successPaymentLink,
          },
        ],
      },
    ]

    let attachments = []

    if (hasQrCode) {
      const isFirstApplicant = invoice.applicants.at(0) === recipientUserId

      // Push student lesson id by userId of the studentLesson
      const emailStudentLessonIds: Record<number, number[]> = {}

      for (const lesson of studentSchedule?.studentLessons || []) {
        if (!emailStudentLessonIds[lesson.userId]) {
          emailStudentLessonIds[lesson.userId] = []
        }
        emailStudentLessonIds[lesson.userId].push(lesson.id)
      }

      // If isFirstApplicant, send all qrcode as attachment into applicants
      attachments = await this.generateQrCodeAttachments({
        enrollCourse: ec,
        invoice,
        studentLessonIds: emailStudentLessonIds,
        isForFirstApplicant: isFirstApplicant,
        participantId: ec.userId,
      })
    }

    const advancePersonalization: Personalization[] = [
      {
        email: studentEmail,
        data: {
          schoolLogo: await this.checkDisplayEmailLogo(institutionId),
          hasQrCode,
          attachments: attachments.map((d) => d.id),
        },
      },
    ]

    const emailSubject = `Remember to attend ${courseName} at ${institutionName}`

    const emailPayload = {
      emailSubject,
      emailAddress: studentEmail,
      recipientUserId,
      recipientName: studentName,
      templateId: customTemplateId || 'student-course-reminder',
      personalization,
      advancePersonalization,
      notificationType: NotificationType.REMINDER,
      institutionId,
      institutionName,
      siteId,
      attachments,
    }
    return await this.sendEmail({
      emailPayload,
      enrollCourse,
    })
  }

  public async resetPasswordSuccess({
    userId,
    emailAddress,
  }: ResetPasswordParams): Promise<void | APIResponse> {
    const recipients = [new Recipient(emailAddress)]

    const emailSubject = 'You have successfully reset your password!'

    const emailParams = new EmailParams()
      .setFrom(this.defaultSentFrom)
      .setTo(recipients)
      .setReplyTo(this.defaultSentFrom)
      .setSubject(emailSubject)
      .setTemplateId('0r83ql327104zw1j')

    await this.emailTransport.email
      .send(emailParams)
      .then((msg) => {
        if (msg.statusCode === 202) {
          const log = this.notificationRecordRepository.create({
            channel: NotificationChannel.EMAIL,
            recipientUserId: userId,
            recipientUserEmail: emailAddress,
            messageId: msg.headers['x-message-id'],
            subject: emailSubject,
            notificationType: NotificationType.FORGET_PASSWORD,
          })
          this.notificationRecordRepository.save(log)
        }
        this.logger.log(JSON.stringify(msg))
        return msg
      }) // logs response data
      .catch((err) => {
        this.logger.error('sendEmail', JSON.stringify(err.body))
        // throw new ServiceUnavailableException(EmailServiceErrorMessage.DELIVERY_FAILED);
      })
  }

  public async sendVerificationEmail({
    userId,
    emailAddress,
    verificationLink,
    firstName,
    phoneNumber,
  }: VerificationEmailParams): Promise<void | APIResponse> {
    const recipients = [new Recipient(emailAddress)]

    const parsedPhoneNumber = parsePhoneNumber(`+${phoneNumber}`)?.formatInternational() ?? ''

    const personalization = [
      {
        email: emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'verificationLink',
            value: verificationLink,
          },
          {
            var: 'firstName',
            value: firstName,
          },
          {
            var: 'phoneNumber',
            value: parsedPhoneNumber,
          },
        ]),
      },
    ]

    const emailSubject = 'Please verify your email for Flowclass'
    const emailParams = new EmailParams()
      .setFrom(this.defaultSentFrom)
      .setTo(recipients)
      .setReplyTo(this.defaultSentFrom)
      .setSubject(emailSubject)
      .setTemplateId('x2p034785w9lzdrn')
      .setTags([`Phone: ${parsedPhoneNumber}`])
      .setVariables(personalization)

    await this.emailTransport.email
      .send(emailParams)
      .then((msg) => {
        if (msg.statusCode === 202) {
          const log = this.notificationRecordRepository.create({
            channel: NotificationChannel.EMAIL,
            recipientUserId: userId,
            recipientUserEmail: emailAddress,
            messageId: msg.headers['x-message-id'],
            subject: emailSubject,
            notificationType: NotificationType.APPLICATION_EMAIL_VERIFICATION,
          })
          this.notificationRecordRepository.save(log)
        }
        this.logger.log(JSON.stringify(msg))
        return msg
      }) // logs response data
      .catch((err) => {
        this.logger.error('sendEmail', JSON.stringify(err.body))
        // throw new ServiceUnavailableException(EmailServiceErrorMessage.DELIVERY_FAILED);
      })
  }

  // THIS EMAIL WILL USE THE USER'S CONTACT EMAIL IF AVAILABLE
  public async sendStudentApplicationLinkEmail({
    recipientUserId,
    courseId,
    classId,
    periodId,
    classLessonDate,
    timeZone,
    adminEmail,
    adminPhone,
    institutionName,
    studentFirstName,
    location,
    studentEmail,
    applicationLink,
  }: ApplicationLinkEmailDTO): Promise<void | APIResponse> {
    const course = await this.coursesRepository.findOneBy({
      id: courseId,
    })

    if (!course) throw new ApiError(ErrorCode.COURSE_NOT_FOUND)

    const classResult = await this.classRepository.findOneBy({
      id: Number(classId),
    })

    if (!classResult) throw new ApiError(ErrorCode.CLASS_NOT_FOUND)

    if (classResult.type === ClassTypeEnum.REGULAR || classResult.type === ClassTypeEnum.WORKSHOP) {
      const lessonDate = await this.regularPeriodsRepository.findOneBy({
        id: Number(periodId),
      })

      if (!lessonDate) throw new ApiError(ErrorCode.LESSON_NOT_FOUND)
    }

    const personalization = [
      {
        email: studentEmail,
        substitutions: this.convertValuesToString([
          {
            var: 'location',
            value: location,
          },
          {
            var: 'timeZone',
            value: timeZone,
          },
          {
            var: 'className',
            value: classResult.name,
          },
          {
            var: 'adminEmail',
            value: adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(adminPhone)?.formatInternational() ?? '',
          },
          {
            var: 'courseName',
            value: course.name,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'studentName',
            value: studentFirstName,
          },
          {
            var: 'classDateTime',
            value: classLessonDate,
          },
          {
            var: 'applicationLink',
            value: applicationLink,
          },
        ]),
      },
    ]

    const emailSubject = `You have been assigned ${course.name} from ${institutionName}`
    const emailPayload = {
      emailSubject,
      emailAddress: studentEmail,
      recipientUserId: Number(recipientUserId),
      recipientName: studentFirstName,
      templateId: 'student-assigned-course',
      personalization,
      notificationType: NotificationType.ASSIGN_COURSE,
      institutionName,
    }
    return await this.sendEmail({ emailPayload })
  }

  public async sendAdminInvitationEmail(
    recipientUserId: number,
    _institutionId: number,
    _siteId: number,
    { siteDomain, inviterName, userRole, inviteLink, invitedUserEmail }: SendInviteEmailDto
  ): Promise<void | APIResponse> {
    const recipients = [new Recipient(invitedUserEmail)]

    const personalization = [
      {
        email: invitedUserEmail,
        substitutions: this.convertValuesToString([
          {
            var: 'userRole',
            value: userRole,
          },
          {
            var: 'inviteLink',
            value: inviteLink,
          },
          {
            var: 'siteDomain',
            value: siteDomain,
          },
          {
            var: 'inviterName',
            value: inviterName,
          },
        ]),
      },
    ]

    const emailSubject = `You are invited to collaborate on ${siteDomain}`
    const emailPayload = {
      emailSubject,
      emailAddress: invitedUserEmail,
      recipientUserId: Number(recipientUserId),
      recipientName: invitedUserEmail,
      templateId: 'invitation-institution-to-user',
      personalization,
      notificationType: NotificationType.INVITATION,
    }
    return await this.sendEmail({ emailPayload })
  }

  public async sendStudentAddLessonEmail(params: AddLessonEmailDTO): Promise<void | APIResponse> {
    const personalization = [
      {
        email: params.studentEmail,
        substitutions: this.convertValuesToString([
          {
            var: 'location',
            value: params.location,
          },
          {
            var: 'timeZone',
            value: params.timeZone,
          },
          {
            var: 'className',
            value: params.className,
          },
          {
            var: 'adminEmail',
            value: params.adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${params.adminPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'courseName',
            value: params.courseName,
          },
          {
            var: 'institutionName',
            value: params.institutionName,
          },
          {
            var: 'studentName',
            value: params.studentFirstName,
          },
          {
            var: 'extraClassDateTime',
            value: params.extraClassLessonDate,
          },
        ]),
      },
    ]

    const emailSubject = `A new lesson is added to your course ${params.courseName}`

    const emailPayload = {
      emailSubject,
      emailAddress: params.studentEmail,
      recipientUserId: params.recipientUserId,
      recipientName: params.studentFirstName,
      templateId: 'student-new-lesson',
      personalization,
      notificationType: NotificationType.ASSIGN_COURSE,
      institutionName: params.institutionName,
    }
    return await this.sendEmail({ emailPayload })
  }

  public async sendStudentChangeLessonEmail(params: ChangeLessonEmailDTO) {
    const personalization = [
      {
        email: params.studentEmail,
        substitutions: this.convertValuesToString([
          {
            var: 'location',
            value: params.location,
          },
          {
            var: 'instructor',
            value: params.instructor,
          },
          {
            var: 'timeZone',
            value: params.timeZone,
          },
          {
            var: 'className',
            value: params.className,
          },
          {
            var: 'adminEmail',
            value: params.adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${params.adminPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'courseName',
            value: params.courseName,
          },
          {
            var: 'institutionName',
            value: params.institutionName,
          },
          {
            var: 'studentName',
            value: params.studentFirstName,
          },
          {
            var: 'newClassDateTime',
            value: lessonDateToString(params.newClassLessonDate, params.timeZone),
          },
          {
            var: 'originalClassDateTime',
            value: lessonDateToString(params.classLessonDate, params.timeZone),
          },
        ]),
      },
    ]

    const emailSubject = `The status of your change request for ${params.courseName} has been updated`
    const emailPayload = {
      emailSubject,
      emailAddress: params.studentEmail,
      recipientUserId: params.recipientUserId,
      recipientName: params.studentFirstName,
      templateId: 'student-change-lesson',
      institutionName: params.institutionName,
      personalization,
      notificationType: NotificationType.UPDATE_ON_COURSE_STATUS,
    }
    return await this.sendEmail({ emailPayload })
  }

  public async sendStudentPostponeEmail({
    recipientUserId,
    institutionId,
    siteId,
    schoolEmail,
    schoolPhone,
    studentName,
    studentEmail,
    courseName,
    originalDateTime,
    newDateTime,
  }: StudentPostPoneParams): Promise<void | APIResponse> {
    const personalization = [
      {
        email: studentEmail,
        substitutions: this.convertValuesToString([
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'originalDateTime',
            value: originalDateTime,
          },
          {
            var: 'newDateTime',
            value: newDateTime,
          },
          {
            var: 'schoolPhone',
            value: schoolPhone,
          },
          {
            var: 'schoolEmail',
            value: schoolEmail,
          },
        ]),
      },
    ]

    const emailSubject = `The time of ${courseName} has been postponed`

    const emailPayload = {
      emailSubject,
      emailAddress: studentEmail,
      recipientUserId,
      recipientName: studentName,
      templateId: 'student-postpone',
      institutionName: courseName,
      personalization,
      notificationType: NotificationType.LESSON_POSTPONE,
    }
    return await this.sendEmail({ emailPayload })
  }

  async buildStudentUploadPaymentReceiptPayload(
    params: SendEmailFunctionBuildParams
  ): Promise<UploadPaymentReceiptEmailParams> {
    const {
      institution,
      site,
      enrollCourse,
      enrollCourses,
      course,
      invoice,
      multipleClassInfo,
      classDateTime,
      enrollmentForm,
      paymentReceiptUploadLink,
      paymentMethod,
    } = params
    const multipleClassMapping = enrollCourses.map((ec) => ec.multipleClassMapping).flat()
    // Variable multipleClassInfo is only create when student enroll course from web
    // So, if we make this function reusable we need to make an alternative data
    // if multipleClassInfo is undefined
    const classes = multipleClassInfo?.classes || []

    const enrollInto = classes.map((classes) => classes.enrollInto)

    const multipleClassTotalPrice = classes.reduce(
      (price, classes) => price + Number(classes.pricingInfo.paymentAmount),
      0
    )

    const className =
      classes.length <= 0
        ? enrollCourses
            .map((ec) =>
              ec.enrollInto.map((d) => `${ec.name} - ${d.courseName} - ${d.secondLevelName}`)
            )
            .join('\n')
        : enrollInto.map((info) => enrollIntoInfoToString(info))?.join('\n')

    const location = classes.map((o) => o?.location?.name ?? '')
    const instructor = classes.map((o) => o?.instructor?.firstName ?? '')

    const pricingInfo = classes.length > 0 ? classes[0].pricingInfo : null

    const contactEmail = institution.email ?? site.email
    const contactPhone = institution.phone ?? site.phone
    const currency = pricingInfo ? pricingInfo.currency : site.currency
    const timeZone = await this.settingSiteService.getTimeZone(site.id)
    const priceEnrollCourses = enrollCourses.reduce(
      (price, ec) => price + Number(ec.paymentAmount),
      0
    )
    return {
      emailAddress: invoice.userAlias.email,
      institutionName: institution.name,
      courseName: course.name,
      className,
      classDateTime,
      price: `${currency} ${multipleClassTotalPrice || priceEnrollCourses}`,
      paymentAmount: `${currency} ${multipleClassTotalPrice || priceEnrollCourses}`,
      enrolId: invoice.id.toString(),
      paymentReceiptUploadLink,
      studentName: enrollCourse.preferredName,
      enrollmentForm,
      location: Array.from(new Set(location)).join(', '),
      instructor: Array.from(new Set(instructor)).join(', '),
      studentEmail: enrollCourse.preferredEmail,
      studentPhone: enrollCourse.preferredPhone,
      remark: course.registrationMes,
      adminEmail: contactEmail,
      adminPhone: contactPhone,
      paymentMethod,
      paymentStatus: invoice.paymentState,
      transactionId: invoice.id.toString(),
      timeZone,
    }
  }

  public async sendClassStudentUploadPaymentReceiptEmail(
    recipientUserId: number, // <== this should be userAliasId
    params: SendEmailFunctionBuildParams
  ): Promise<APIResponse | void> {
    const payload = await this.buildStudentUploadPaymentReceiptPayload(params)
    const personalization = [
      {
        email: payload.emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'studentName',
            value: payload.studentName,
          },
          {
            var: 'price',
            value: payload.price,
          },
          {
            var: 'enrolId',
            value: payload.enrolId,
          },
          {
            var: 'courseName',
            value: payload.courseName,
          },
          {
            var: 'className',
            value: payload.className?.replace(/\n/g, '<br />'),
          },
          {
            var: 'classDateTime',
            value: payload.classDateTime?.replace(/\n/g, '<br />'),
          },
          {
            var: 'location',
            value: payload.location,
          },
          {
            var: 'instructor',
            value: payload.instructor,
          },
          {
            var: 'studentEmail',
            value: removeEmailPlusPart(payload.studentEmail),
          },
          {
            var: 'studentPhone',
            value: parsePhoneNumber(`+${payload.studentPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'remark',
            value: payload.remark,
          },
          {
            var: 'timeZone',
            value: payload.timeZone,
          },
          {
            var: 'institutionName',
            value: payload.institutionName,
          },
          {
            var: 'uploadReceiptLink',
            value: payload.paymentReceiptUploadLink,
          },
          {
            var: 'adminEmail',
            value: payload.adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${payload.adminPhone}`)?.formatInternational() ?? '',
          },

          {
            var: 'paymentStatus',
            value: payload.paymentStatus,
          },
          {
            var: 'transactionId',
            value: payload.transactionId,
          },
        ]),
      },
    ]
    const advancePersonalization: Personalization[] = [
      {
        email: payload.emailAddress,
        data: {
          schoolLogo: await this.checkDisplayEmailLogo(params.institutionId),
          enrollmentForm: payload.enrollmentForm,
        },
      },
    ]

    const courseEmailSettings = this.getEmailSettingsForCourse(params.course)

    const emailSubject =
      courseEmailSettings?.emailTitle?.trim?.() ||
      `You have applied for ${payload.courseName}. Please upload your payment receipt`

    const templateId = this.hasCustomEmailTemplate(params.course)
      ? courseEmailSettings.emailId
      : 'student-upload-receipt'

    const emailPayload = {
      emailSubject,
      emailAddress: payload.emailAddress,
      recipientUserId,
      recipientName: payload.studentName,
      templateId,
      institutionName: payload.institutionName,
      personalization,
      advancePersonalization,
      notificationType: NotificationType.APPLIED_FOR_COURSE,
      institutionId: params.institutionId,
      siteId: params.site.id,
    }
    console.log('emailPayload', emailPayload)
    return await this.sendEmail({
      emailPayload,
      enrollCourse: params.enrollCourses.at(0),
    })
  }

  public async sendRequestAiCreditMaxEmail({
    institutionId,
    aiCreditDeposit,
  }: SendRequestAiCreditParams): Promise<void | APIResponse> {
    const institution = await this.institutionsRepository.findOneById(institutionId)
    const emailToRequestMoreAiCreditParams = {
      emailAddress: 'info@flowclass.io',
      institutionName: institution.name,
      institutionId: institution.id,
      siteId: institution.siteId,
      aiCreditDeposit,
    }
    await this.sendInstitutionRequestMaxAiCreditEmail(emailToRequestMoreAiCreditParams)
  }

  async sendCourseEmailVerificationEmail(params: SendCourseEmailVerificationParams) {
    const personalization = [
      {
        email: params.emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'courseName',
            value: params.courseName,
          },
          {
            var: 'institutionName',
            value: params.institutionName,
          },
          {
            var: 'applicationLink',
            value: params.applicationLink,
          },
        ]),
      },
    ]

    const emailSubject = `Please continue your application for ${params.courseName}`

    const advancePersonalization: Personalization[] = [
      {
        email: params.emailAddress,
        data: {
          schoolLogo: await this.checkDisplayEmailLogo(params.institutionId),
        },
      },
    ]

    const emailPayload = {
      emailSubject,
      emailAddress: params.emailAddress,
      advancePersonalization,
      recipientUserId: 0,
      recipientName: 'Applicant',
      templateId: 'application-email-verification',
      institutionId: params.institutionId,
      institutionName: params.institutionName,
      personalization,
      notificationType: NotificationType.APPLICATION_EMAIL_VERIFICATION,
    }
    return await this.sendEmail({
      emailPayload,
    })
  }

  async remindEnrollCourseT4({
    emailData,
    enrollCourse,
  }: ReminderEnrollCourseParams<RemindPaymentT4>): Promise<void | APIResponse> {
    const variable = await this._buildEmailData(emailData, true)
    const personalization = [
      {
        email: emailData.studentEmail,
        substitutions: this.convertValuesToString(variable),
      },
    ]

    const emailSubject = `The deadline for payment of ${emailData.courseName} is approaching`

    const emailPayload = {
      emailSubject,
      emailAddress: emailData.studentEmail,
      recipientUserId: emailData.recipientUserId,
      recipientName: emailData.studentName,
      templateId: 'remind-enroll-course-t4',
      institutionName: emailData.courseName,
      personalization,
      notificationType: NotificationType.REMINDER,
    }
    return await this.sendEmail({
      emailPayload,
      enrollCourse,
    })
  }

  async remindEnrollCourseT0({
    emailData,
    enrollCourse,
  }: ReminderEnrollCourseParams<RemindPaymentT0>): Promise<void | APIResponse> {
    const variable = await this._buildEmailData(emailData)
    const personalization = [
      {
        email: emailData.studentEmail,
        substitutions: this.convertValuesToString(variable),
      },
    ]

    const emailSubject = `Remember to complete the payment for ${emailData.courseName}`

    const emailPayload = {
      emailSubject,
      emailAddress: emailData.studentEmail,
      recipientUserId: emailData.recipientUserId,
      recipientName: emailData.studentName,
      institutionName: emailData.courseName,
      templateId: 'remind-enroll-course-t0',
      personalization,
      notificationType: NotificationType.REMINDER,
    }

    return await this.sendEmail({
      emailPayload,
      enrollCourse,
    })
  }

  _buildEmailData(
    emailData: RemindPaymentT4,
    isT4 = false
  ): ({ var: string; value: string } | { var: string; value: number })[] {
    const obj = [
      {
        var: 'price',
        value: emailData.priceWithCurrency,
      },
      {
        var: 'enrolId',
        value: emailData.enrolId,
      },
      {
        var: 'location',
        value: emailData.location,
      },
      {
        var: 'timeZone',
        value: emailData.timeZone,
      },
      {
        var: 'className',
        value: emailData.className,
      },
      {
        var: 'adminEmail',
        value: emailData.adminEmail,
      },
      {
        var: 'adminPhone',
        value: parsePhoneNumber(`+${emailData.adminPhone}`)?.formatInternational() ?? '',
      },
      {
        var: 'courseName',
        value: emailData.courseName,
      },
      {
        var: 'paymentLink',
        value: emailData.paymentLink,
      },
      {
        var: 'studentName',
        value: emailData.studentName,
      },
      {
        var: 'classDateTime',
        value: emailData.classDateTime,
      },
      {
        var: 'paymentStatus',
        value: emailData.paymentStatus,
      },
      {
        var: 'institutionName',
        value: emailData.insName,
      },
    ]

    if (isT4 && emailData.contactUsLink) {
      obj.push({
        var: 'contactUsLink',
        value: emailData.contactUsLink,
      })
    }

    return obj
  }

  getPaymentMethodString({
    paymentMethod,
    payoutMethod,
    payAmount,
  }: GetPaymentMethodParams): string {
    if (paymentMethod === PaymentMethod.PAY_NOW) {
      return 'Online Payment'
    }
    if (paymentMethod === PaymentMethod.PAY_LATER) {
      if (payAmount === 0) {
        return 'No Payment Required'
      }
      if (payoutMethod) {
        return `${payoutMethod?.methodName ?? ''} (Confirmation Required)`
      }
      return 'Confirmation Required'
    }
  }

  private async isQRCodeModuleEnabled(courseId: number): Promise<boolean> {
    const course = await this.coursesRepository.findOneBy({ id: courseId })

    if (!course) {
      return false
    }

    return course?.useQrAttendance ?? false
  }

  private convertValuesToString(
    array: Array<{ var: string; value: any }>
  ): Array<{ var: string; value: string }> {
    return array.map((obj) => ({
      var: obj.var,
      value: obj.value ? obj.value.toString() : '',
    }))
  }

  async saveEmailResponse(
    msg: APIResponse,
    recipientUserId: number,
    emailAddress: string,
    emailSubject: string,
    notificationType: SupportedType | NotificationType,
    institutionId?: number,
    siteId?: number,
    enrollCourse?: EnrollCourse
  ) {
    const failedStatusCodes = [400, 401, 403, 404, 405, 408, 422, 429, 500]
    const sentStatusCodes = [200, 201, 202, 204]
    const classIds = enrollCourse?.multipleClassMapping
      ? enrollCourse.multipleClassMapping?.map((d) => d.classId)
      : (enrollCourse?.studentSchedule || [])?.map((d) => d.classId)
    const classIdsSet = Array.from(new Set(classIds))
    const classes = await this.classRepository.findBy({
      id: In(classIdsSet),
    })

    let status
    if (sentStatusCodes.includes(msg.statusCode)) {
      status = NotificationStatus.SENT
      this.logger.log(JSON.stringify(msg))
    } else if (failedStatusCodes.includes(msg.statusCode)) {
      status = NotificationStatus.FAILED
      this.logger.error('sendEmail', JSON.stringify(msg.body))
    }
    const log = this.notificationRecordRepository.create({
      channel: NotificationChannel.EMAIL,
      recipientUserId,
      institutionId,
      siteId,
      recipientUserEmail: emailAddress,
      messageId: msg.headers?.['x-message-id'],
      subject: emailSubject,
      notificationStatus: status,
      notificationType,
      associatedClass: (classes || []).map((d) =>
        shallow({
          source: d,
          fields: ['id', 'name', 'courseId'],
        })
      ),
    })

    console.log('SAVING EMAIL RESPONSE', log)

    await this.notificationRecordRepository.save(log)
  }

  private async sendEmail({ emailPayload, enrollCourse }: SendEmailParams) {
    const {
      emailSubject,
      emailAddress,
      recipientUserId,
      recipientName,
      templateId,
      notificationType,
      institutionName,
      personalization,
      advancePersonalization,
      institutionId,
      siteId,
      attachments,
    } = emailPayload

    if (!emailAddress) {
      this.logger.warn('Email sending skipped: no recipient address provided')
      return
    }

    this.logger.log(`Email: notificationType ${notificationType}`)
    const recipients = [new Recipient(emailAddress, recipientName)]
    let sentFrom = this.defaultSentFrom

    if (institutionId) {
      try {
        const notiSetting = await this.settingNotificationsService.findOneBy({
          institutionId,
        })

        if (notiSetting && notiSetting.customEmailSender && institutionName) {
          const institution = await this.institutionsRepository.findOneById(institutionId)
          if (institution?.email) {
            sentFrom = new Sender(institution.email, institution.name ?? institutionName)
          } else {
            sentFrom = new Sender(this.defaultSentFrom.email, institutionName)
          }
        }
      } catch (e) {
        if (e instanceof NotFoundException) {
          const institution = await this.institutionsRepository.findOneById(institutionId)
          await this.settingNotificationsService.create({
            institutionId,
            siteId: institution.siteId,
            ...defaultSettingNotifications,
          })
        }
      }
    }

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(emailSubject)
      .setTemplateId(templateId)
      .setVariables(personalization)
      .setPersonalization(advancePersonalization)
      .setAttachments(attachments)

    const studentNotifSetting = await this.studentNotifSettingRepository.findOne({
      where: {
        studentId: recipientUserId,
        institutionId,
        notificationType: notificationType as unknown as SupportedType,
      },
    })

    if (studentNotifSetting && !studentNotifSetting?.email) {
      return this.logger.log(
        `Email: ${studentNotifSetting.notificationType} is not enabled for this user`
      )
    }
    try {
      const msg = await this.emailTransport.email.send(emailParams)

      await this.saveEmailResponse(
        msg,
        recipientUserId,
        emailAddress,
        emailSubject,
        notificationType,
        institutionId,
        siteId,
        enrollCourse
      )
      return msg
    } catch (err) {
      await this.saveEmailResponse(
        err,
        recipientUserId,
        emailAddress,
        emailSubject,
        notificationType,
        institutionId,
        siteId,
        enrollCourse
      )
    }
  }

  private async sendClassStudentRejectPaymentEmail(
    recipientUserId: number,
    institutionId: number,
    siteId: number,
    {
      emailAddress,
      institutionName,
      studentName,
      courseName,
      price,
      paymentMethod,
      paymentStatus,
      enrolId,
      reUploadPaymentUrl,
      transactionId,
      // class info
      className,
      classDateTime,
      location,
      adminEmail,
      adminPhone,
      timeZone,
    }: ClassStudentRejectPaymentEmailParams
  ) {
    const personalization = [
      {
        email: emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'price',
            value: price,
          },
          {
            var: 'enrolId',
            value: enrolId,
          },
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'paymentMethod',
            value: paymentMethod,
          },
          {
            var: 'paymentStatus',
            value: paymentStatus,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'reUploadPaymentUrl',
            value: reUploadPaymentUrl,
          },
          {
            var: 'className',
            value: className?.replace(/\n/g, '<br />'),
          },
          {
            var: 'classDateTime',
            value: classDateTime
              ?.split('\n')
              .map(
                (slot) =>
                  `<div style="color: #333 !important; text-decoration: none !important;">${slot}</div>`
              )
              .join(''),
          },
          {
            var: 'location',
            value: location,
          },
          {
            var: 'adminEmail',
            value: adminEmail,
          },
          {
            var: 'adminPhone',
            value: parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? '',
          },
          {
            var: 'transactionId',
            value: transactionId,
          },
          {
            var: 'timeZone',
            value: timeZone,
          },
        ]),
      },
    ]

    const advancePersonalization: Personalization[] = [
      {
        email: emailAddress,
        data: {
          schoolLogo: await this.checkDisplayEmailLogo(institutionId),
        },
      },
    ]

    const emailSubject = `Your payment receipt for ${courseName} has been rejected`

    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId,
      recipientName: institutionName,
      templateId: 'student-reject-payment',
      personalization,
      advancePersonalization,
      notificationType: NotificationType.REJECT_PAYMENT,
      institutionId,
      institutionName,
      siteId,
    }
    return await this.sendEmail({ emailPayload })
  }

  private async sendInstitutionRequestMaxAiCreditEmail({
    emailAddress,
    institutionName,
    institutionId,
    siteId,
    aiCreditDeposit,
  }: {
    emailAddress: string
    institutionName: string
    institutionId: number
    siteId: number
    aiCreditDeposit: number
  }) {
    const recipients = [new Recipient(emailAddress)]
    const personalization = [
      {
        email: emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'institutionId',
            value: institutionId,
          },
          {
            var: 'siteId',
            value: siteId,
          },
          {
            var: 'aiCreditDeposit',
            value: aiCreditDeposit,
          },
        ]),
      },
    ]
    const sentFrom = await this.getSenderForInstitution(institutionId, institutionName)
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`Institution ${institutionName} request ${aiCreditDeposit} more AI attempts`)
      .setTemplateId('k68zxl2pp6e4j905')
      .setVariables(personalization)

    return await this.emailTransport.email
      .send(emailParams)
      .then((msg) => {
        this.logger.log(JSON.stringify(msg))
        return msg
      }) // logs response data
      .catch((err) => {
        this.logger.error('sendEmail', JSON.stringify(err.body))
      })
  }

  private async checkDisplayEmailLogo(institutionId: number): Promise<string | boolean> {
    const institution = await this.institutionsRepository.findOneById(institutionId)
    if (!institution) throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    // check if display email logo is true
    try {
      const setting = await this.settingNotificationsService.findOneBy({
        institutionId,
      })

      if (!setting) return false
      if (!setting.displayEmailLogo) return false
    } catch (e) {
      const institution = await this.institutionsRepository.findOneById(institutionId)
      await this.settingNotificationsService.create({
        institutionId,
        siteId: institution.siteId,
        ...defaultSettingNotifications,
      })
    }
    // Own branding disabled when subscription is not configured
    return false
  }

  /**
   * Generate QR code data from invoice token and student lesson ID.
   * The returned value is a JSON string of { invoiceToken, studentLessonId }.
   * @param data
   */
  private async generateQRCode(data: string): Promise<string> {
    return QRCode.toDataURL(data)
  }

  async sendQuestionEmail(payload: SendQuestionEmailProps) {
    const {
      emailSubject,
      studentEmail,
      studentName,
      question,
      courseName,
      institutionId,
      className,
      studentPhone,
    } = payload
    const institution = await this.institutionsRepository.findOneById(institutionId)
    const userAdmin = await this.usersRepository.findOne({ where: { email: institution.email } })
    const sentFrom = await this.getSenderForInstitution(institutionId, institution.name)
    const recipients = [new Recipient(studentEmail)]
    const personalization = [
      {
        email: studentEmail,
        substitutions: this.convertValuesToString([
          {
            var: 'question',
            value: question,
          },
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'adminName',
            value: userAdmin.firstName,
          },
          {
            var: 'className',
            value: className,
          },
          {
            var: 'studentEmail',
            value: studentEmail,
          },
          {
            var: 'studentPhone',
            value: studentPhone,
          },
        ]),
      },
    ]
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(emailSubject)
      .setTemplateId('jy7zpl9wvj545vx6')
      .setVariables(personalization)

    return await this.emailTransport.email.send(emailParams)
  }

  async requestTimeChangeEmail(payload: RequestTimeChangeEmailProps) {
    const { emailSubject, studentEmail, studentName, status, institutionId, institutionName } =
      payload
    const sentFrom = await this.getSenderForInstitution(institutionId, institutionName)
    const recipients = [new Recipient(studentEmail)]
    const personalization = [
      {
        email: studentEmail,
        substitutions: this.convertValuesToString([
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'status',
            value: status,
          },
          {
            var: 'adminEmail',
            value: payload.adminEmail,
          },
          {
            var: 'institutionName',
            value: payload.institutionName,
          },
          {
            var: 'courseName',
            value: payload.courseName,
          },
          {
            var: 'newClassDateTime',
            value:
              status === RequestTimeChangeStatus.APPROVED
                ? payload.newClassDateTime
                : payload.originalClassDateTime,
          },
          {
            var: 'originalClassDateTime',
            value: payload.originalClassDateTime,
          },
        ]),
      },
    ]
    const emailParams = new EmailParams()
      .setFrom(this.defaultSentFrom)
      .setTo(recipients)
      .setReplyTo(this.defaultSentFrom)
      .setSubject(emailSubject)
      .setTemplateId('jy7zpl9wpr345vx6')
      .setVariables(personalization)

    return await this.emailTransport.email.send(emailParams)
  }

  async sendClassMaterialsEmail(payload: SendClassMaterialsEmailProps) {
    const {
      emailAddress,
      courseName,
      className,
      institutionId,
      institutionName,
      studentName,
      siteLink,
    } = payload
    const sentFrom = await this.getSenderForInstitution(institutionId, institutionName)
    const recipients = [new Recipient(emailAddress)]
    const personalization = [
      {
        email: emailAddress,
        substitutions: this.convertValuesToString([
          {
            var: 'studentName',
            value: studentName,
          },
          {
            var: 'courseName',
            value: courseName,
          },
          {
            var: 'className',
            value: className,
          },
          {
            var: 'institutionName',
            value: institutionName,
          },
          {
            var: 'siteLink',
            value: siteLink,
          },
        ]),
      },
    ]
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(`New materials uploaded to ${courseName}`)
      .setTemplateId('jy7zpl9xxvpl5vx6')
      .setVariables(personalization)

    return await this.emailTransport.email.send(emailParams)
  }

  /**
   * Helper method to get email settings for a course
   */
  private getEmailSettingsForCourse(
    course: { emailSettings?: EmailSettings } | null | undefined
  ): EmailSettings {
    return course?.emailSettings || {}
  }

  /**
   * Helper method to check if course has custom email template
   */
  private hasCustomEmailTemplate(
    course: { emailSettings?: EmailSettings } | null | undefined
  ): boolean {
    const emailSettings = this.getEmailSettingsForCourse(course)
    return !!emailSettings.emailId
  }
}
