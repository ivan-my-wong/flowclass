import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import * as Handlebars from 'handlebars'
import parsePhoneNumber from 'libphonenumber-js'
import { EmailParams, Recipient, Sender } from 'mailersend'
import { Personalization, Variable } from 'mailersend/lib/modules/Email.module'
import { APIResponse } from 'mailersend/lib/services/request.service'
import * as nodemailer from 'nodemailer'
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
import { emailTemplates } from '@/common/constants/email-templates.constants'
import { baseEmailLayout } from '@/common/email-templates/base-layout.template'
import { paymentRejectedTemplate } from '@/common/email-templates/payment-rejected.template'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { S3ClientFactory } from '@/config/s3/s3-factory.provider'
import { SettingNotificationsService } from '@/domain/service/setting-notifications.service'
import { StudentScheduleService } from '@/domain/service/student-schedule.service'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'
import { AutomationFlow } from '@/models/automation-flow.entity'
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
  NotificationRecord,
  NotificationStatus,
  NotificationType,
} from '@/models/notification-record.entity'
import { NotificationRecordRepository } from '@/models/notification-record.repository'
import { SitesRepository } from '@/models/sites.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentNotificationSettingRepository } from '@/models/student-notification-setting.entity'
import { StudentSchedule, StudentScheduleWithUserAlias } from '@/models/student-schedule.entity'
import { SubscriptionPlanRecordsRepository } from '@/models/subscription-plan-records.entity'
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
  private defaultSentFrom
  private readonly nodemailerTransporter: nodemailer.Transporter

  constructor(
    private readonly logger: CloudWatchLoggerProvider,
    private readonly sitesRepository: SitesRepository,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly settingSiteService: SettingSiteService,
    private readonly studentScheduleService: StudentScheduleService,
    private readonly settingNotificationsService: SettingNotificationsService,
    private readonly s3ClientFactory: S3ClientFactory,
    private readonly coursesRepository: CoursesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly classRepository: ClassRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly regularPeriodsRepository: RegularPeriodsRepository,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly notificationRecordRepository: NotificationRecordRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly studentNotifSettingRepository: StudentNotificationSettingRepository,
    private readonly subscriptionPlanRecordsRepository: SubscriptionPlanRecordsRepository,
    private readonly userAliasesRepository: UserAliasesRepository
  ) {
    const fromAddress = 'info@flowclass.io'
    const fromName = 'Flowclass'
    this.defaultSentFrom = new Sender(fromAddress, fromName)

    const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST || 'localhost'
    const smtpPort = parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || '587', 10)
    const smtpSecure =
      process.env.SMTP_SECURE === 'true' || process.env.MAIL_SECURE === 'true' || smtpPort === 465

    const smtpUser =
      process.env.SMTP_USER ||
      process.env.SMTP_USERNAME ||
      process.env.MAIL_USER ||
      process.env.MAIL_USERNAME
    const smtpPass =
      process.env.SMTP_PASS ||
      process.env.SMTP_PASSWORD ||
      process.env.MAIL_PASS ||
      process.env.MAIL_PASSWORD

    const transportConfig: any = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
    }

    if (smtpUser && smtpPass) {
      transportConfig.auth = {
        user: smtpUser,
        pass: smtpPass,
      }
    }

    this.logger.log(
      `[SMTP Init] Initializing SMTP Transport | Host: ${smtpHost} | Port: ${smtpPort} | Secure: ${smtpSecure} | Auth: ${
        smtpUser ? 'Yes' : 'No'
      }`
    )
    this.nodemailerTransporter = nodemailer.createTransport(transportConfig)
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
    automationFlow,
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
      templateId: emailTemplates.CLASS_STUDENT_WAITING_PAYMENT,
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
      automationFlow,
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
      templateId: emailTemplates.UPLOADED_TEACHER_FEEDBACK,
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
    automationFlow,
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

    let course = enrollCourse.course
    if (!course) {
      course = await this.coursesRepository.findOneBy({
        id: enrollCourse.courseId,
        institutionId,
      })
    }

    const courseEmailSettings = this.getEmailSettingsForCourse(course)
    const emailSubject =
      courseEmailSettings?.emailTitle?.trim?.() ||
      `You are now enrolled in ${courseName} by ${institutionName}`

    const hasCustom = this.hasCustomEmailTemplate(course)
    const hasQrCode = await this.isQRCodeModuleEnabled(enrollCourse.courseId)
    const effectiveEmail = userAlias?.email || recipientUser.email || payload.emailAddress

    // If isFirstApplicant, send all qrcode as attachment into applicants
    const isFirstApplicant = invoice.applicants.at(0) === recipientUser.id
    const attachments = await this.generateQrCodeAttachments({
      invoice,
      enrollCourse,
      studentLessonIds,
      isForFirstApplicant: isFirstApplicant,
      participantId: enrollCourse.userId,
    })

    let emailPayload: any

    if (hasCustom) {
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

      emailPayload = {
        emailSubject,
        emailAddress: effectiveEmail,
        recipientUserId: recipientUser.id,
        recipientName: recipientUser.studentName,
        templateId: courseEmailSettings?.emailId || emailTemplates.CLASS_STUDENT_CONFIRMATION,
        personalization,
        advancePersonalization,
        notificationType: NotificationType.ENROLLED_IN_COURSE,
        institutionId,
        institutionName,
        siteId,
        attachments,
      }
    } else {
      const template = Handlebars.compile(baseEmailLayout)
      const schoolLogo = await this.checkDisplayEmailLogo(institutionId)

      const formattedClassName = className?.replace(/\n/g, '<br />')
      const formattedClassDateTime = classDateTime?.replace(/\n/g, '<br />')
      const formattedStudentPhone = recipientUser.phoneNumber
        ? parsePhoneNumber(`+${recipientUser.phoneNumber}`)?.formatInternational() ??
          recipientUser.phoneNumber
        : 'No phone number'
      const formattedAdminPhone = adminPhone
        ? parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? adminPhone
        : ''

      const body = `<p>Hello ${studentName},</p>
<p>We’re from <strong>${institutionName}</strong>. This email is to confirm that we have confirmed your application and you are now enrolled into <strong>${courseName}</strong>.</p>`

      let additionalContent = ''

      if (hasQrCode) {
        additionalContent += `
<div class="info-card" style="border-left: 4px solid #10b981; background: #f0fdf4; margin-bottom: 20px; padding: 16px;">
    <div style="font-weight: 600; color: #166534; font-size: 14px; margin-bottom: 4px;">Attendance QR Code Attached</div>
    <div style="color: #1b4332; font-size: 13px; line-height: 1.5;">Please present the attached QR code for attendance when you arrive at the class.</div>
</div>
`
      }

      additionalContent += `
<div class="section-title">Application Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Application ID</div>
        <div class="info-value" style="font-weight: 600;">${enrolId}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Course Name</div>
        <div class="info-value">${courseName}</div>
    </div>
    ${
      className
        ? `
    <div class="info-row">
        <div class="info-label">Option Name</div>
        <div class="info-value">${formattedClassName}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Date & Time</div>
        <div class="info-value">${formattedClassDateTime}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Time Zone</div>
        <div class="info-value">${timeZone}</div>
    </div>
    ${
      payload.instructor
        ? `
    <div class="info-row">
        <div class="info-label">Instructor</div>
        <div class="info-value">${payload.instructor}</div>
    </div>`
        : ''
    }
    ${
      location
        ? `
    <div class="info-row">
        <div class="info-label">Location</div>
        <div class="info-value">${location}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Your Contact Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Name</div>
        <div class="info-value" style="font-weight: 600;">${studentName}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Phone</div>
        <div class="info-value">${formattedStudentPhone}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value"><a href="mailto:${effectiveEmail}" style="color: #4f46e5; text-decoration: none;">${effectiveEmail}</a></div>
    </div>
</div>

<div class="section-title">Contact Information of ${institutionName}</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Name</div>
        <div class="info-value" style="font-weight: 600;">${institutionName}</div>
    </div>
    ${
      adminPhone
        ? `
    <div class="info-row">
        <div class="info-label">Phone</div>
        <div class="info-value">${formattedAdminPhone}</div>
    </div>`
        : ''
    }
    ${
      adminEmail
        ? `
    <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value"><a href="mailto:${adminEmail}" style="color: #4f46e5; text-decoration: none;">${adminEmail}</a></div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Payment Information</div>
<div class="info-card">
    ${
      transactionId
        ? `
    <div class="info-row">
        <div class="info-label">Payment ID</div>
        <div class="info-value">${transactionId}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Price</div>
        <div class="info-value" style="font-weight: 600;">${price}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Payment Status</div>
        <div class="info-value" style="font-weight: 600; color: #10b981;">${paymentStatus}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Payment Method</div>
        <div class="info-value">${paymentMethod}</div>
    </div>
</div>
`

      if (remark) {
        additionalContent += `
<div class="section-title">Message from ${institutionName}</div>
<div class="info-card">
    <div style="font-size: 14px; color: #475569; line-height: 1.6; white-space: pre-wrap;">${remark}</div>
</div>
`
      }

      const html = template({
        subject: emailSubject,
        title: 'Application Confirmed',
        subtitle: 'ENROLLED',
        subtitleColor: '#10b981',
        headerAccent: 'linear-gradient(90deg, #10b981, #4f46e5)',
        schoolLogo,
        studentName,
        institutionName,
        body,
        additionalContent,
        ctaUrl: successPaymentLink,
        ctaText: 'View Application Page',
        ctaBgColor: '#4f46e5',
        ctaShadowColor: 'rgba(79, 70, 229, 0.2)',
        showFallbackLink: true,
        adminEmail: adminEmail || 'info@flowclass.io',
        currentYear: new Date().getFullYear(),
      })

      emailPayload = {
        emailSubject,
        emailAddress: effectiveEmail,
        recipientUserId: recipientUser.id,
        recipientName: recipientUser.studentName,
        html,
        notificationType: NotificationType.ENROLLED_IN_COURSE,
        institutionId,
        institutionName,
        siteId,
        attachments,
      }
    }

    await this.sendEmail({
      emailPayload,
      automationFlow,
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
      courseName: enrollCourse.course?.name ?? '',
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

    const template = Handlebars.compile(baseEmailLayout)

    const schoolLogo = await this.checkDisplayEmailLogo(institutionId)

    const emailSubject = `A new applicant applied for ${courseName} !`

    const body = `<p>We’re happy to say that a new applicant applied for <strong>${courseName}</strong>!</p>
<p>Please be reminded that they have not yet completed the payment. We will send you another email once the payment is confirmed. Stay tuned!</p>`

    const formattedClassName = className?.replace(/\n/g, '<br />')
    const formattedClassDateTime = classDateTime?.replace(/\n/g, '<br />')
    const formattedStudentPhone = studentPhone
      ? parsePhoneNumber(`+${studentPhone}`)?.formatInternational() ?? ''
      : ''
    const formattedAdminPhone = adminPhone
      ? parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? ''
      : ''

    let additionalContent = `
<div class="section-title">Application Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Application ID</div>
        <div class="info-value" style="font-weight: 600;">${enrolId}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Course Name</div>
        <div class="info-value">${courseName}</div>
    </div>
    ${
      className
        ? `
    <div class="info-row">
        <div class="info-label">Option Name</div>
        <div class="info-value">${formattedClassName}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Date & Time</div>
        <div class="info-value">${formattedClassDateTime}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Time Zone</div>
        <div class="info-value">${timeZone}</div>
    </div>
    ${
      location
        ? `
    <div class="info-row">
        <div class="info-label">Location</div>
        <div class="info-value">${location}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Personal Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Applicant's Name</div>
        <div class="info-value" style="font-weight: 600;">${studentName}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Applicant's Email</div>
        <div class="info-value"><a href="mailto:${studentEmail}" style="color: #4f46e5; text-decoration: none;">${studentEmail}</a></div>
    </div>
    ${
      studentPhone
        ? `
    <div class="info-row">
        <div class="info-label">Applicant's Phone</div>
        <div class="info-value">${formattedStudentPhone}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Payment Information</div>
<div class="info-card">
    ${
      transactionId
        ? `
    <div class="info-row">
        <div class="info-label">Payment ID</div>
        <div class="info-value">${transactionId}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Price</div>
        <div class="info-value" style="font-weight: 600;">${price}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Payment Status</div>
        <div class="info-value">${paymentStatus}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Payment Method</div>
        <div class="info-value">${paymentMethod}</div>
    </div>
</div>
`

    if (enrollmentForm && enrollmentForm.length > 0) {
      additionalContent += `
<div class="section-title">Questions & Answers</div>
<div class="info-card">
`
      for (const instance of enrollmentForm) {
        if (instance.question && instance.answer) {
          additionalContent += `
    <div class="info-row" style="border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 10px;">
        <div class="info-label" style="text-transform: none; color: #475569; font-size: 13px;">${instance.question}</div>
        <div class="info-value" style="font-weight: 600;">${instance.answer}</div>
    </div>
`
        }
      }
      additionalContent += `</div>`
    }

    const html = template({
      subject: emailSubject,
      title: 'New Applicant Applied',
      subtitle: 'Enrollment Request',
      subtitleColor: '#4f46e5',
      headerAccent: 'linear-gradient(90deg, #4f46e5, #3b82f6)',
      schoolLogo,
      studentName: institutionName,
      institutionName,
      body,
      additionalContent,
      ctaUrl: process.env.LINK_FLOWCLASS_CMS,
      ctaText: 'Visit your Flowclass dashboard',
      ctaBgColor: '#3b82f6',
      ctaShadowColor: 'rgba(59, 130, 246, 0.2)',
      showFallbackLink: true,
      adminEmail: 'info@flowclass.io',
      currentYear: new Date().getFullYear(),
    })

    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId: recipientId,
      recipientName: institutionName,
      html,
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
      attachments,
    } = payload

    const template = Handlebars.compile(baseEmailLayout)

    const schoolLogo = await this.checkDisplayEmailLogo(institutionId)

    const emailSubject = `${studentName ?? 'A student'} has finished payment for ${courseName}!`

    const body = `<p><strong>${studentName}</strong> has just paid for <strong>${courseName}</strong>! The payment will be transferred into your Stripe account which is linked to Flowclass.</p>
<p>If the applicant paid by credit card, you can visit the dashboard and click on "Visit Dashboard" to check your balance.</p>`

    const formattedClassName = className?.replace(/\n/g, '<br />')
    const formattedClassDateTime = classDateTime?.replace(/\n/g, '<br />')
    const formattedStudentPhone = studentPhone
      ? parsePhoneNumber(`+${studentPhone}`)?.formatInternational() ?? ''
      : ''
    const formattedAdminPhone = adminPhone
      ? parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? ''
      : ''

    let additionalContent = `
<div class="section-title">Application Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Application ID</div>
        <div class="info-value" style="font-weight: 600;">${enrolId}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Course Name</div>
        <div class="info-value">${courseName}</div>
    </div>
    ${
      className
        ? `
    <div class="info-row">
        <div class="info-label">Option Name</div>
        <div class="info-value">${formattedClassName}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Date & Time</div>
        <div class="info-value">${formattedClassDateTime}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Time Zone</div>
        <div class="info-value">${timeZone}</div>
    </div>
    ${
      instructor
        ? `
    <div class="info-row">
        <div class="info-label">Instructor</div>
        <div class="info-value">${instructor}</div>
    </div>`
        : ''
    }
    ${
      location
        ? `
    <div class="info-row">
        <div class="info-label">Location</div>
        <div class="info-value">${location}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Contact Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">School Name</div>
        <div class="info-value" style="font-weight: 600;">${institutionName}</div>
    </div>
    ${
      adminPhone
        ? `
    <div class="info-row">
        <div class="info-label">Phone</div>
        <div class="info-value">${formattedAdminPhone}</div>
    </div>`
        : ''
    }
    ${
      adminEmail
        ? `
    <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value"><a href="mailto:${adminEmail}" style="color: #10b981; text-decoration: none;">${adminEmail}</a></div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Applicant's Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Student Name</div>
        <div class="info-value" style="font-weight: 600;">${studentName}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Student Email</div>
        <div class="info-value"><a href="mailto:${studentEmail}" style="color: #10b981; text-decoration: none;">${studentEmail}</a></div>
    </div>
    ${
      studentPhone
        ? `
    <div class="info-row">
        <div class="info-label">Student Phone</div>
        <div class="info-value">${formattedStudentPhone}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Payment Information</div>
<div class="info-card">
    ${
      transactionId
        ? `
    <div class="info-row">
        <div class="info-label">Payment ID</div>
        <div class="info-value">${transactionId}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Price</div>
        <div class="info-value" style="font-weight: 600;">${price}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Payment Status</div>
        <div class="info-value" style="font-weight: 600; color: #10b981;">${paymentStatus}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Payment Method</div>
        <div class="info-value">${paymentMethod}</div>
    </div>
</div>
`

    if (remark) {
      additionalContent += `
<div class="section-title">Message Left for Applicant</div>
<div class="info-card">
    <div style="font-size: 14px; color: #475569; line-height: 1.6; white-space: pre-wrap;">${remark}</div>
</div>
`
    }

    const html = template({
      subject: emailSubject,
      title: 'Payment Confirmed',
      subtitle: courseName,
      subtitleColor: '#10b981',
      headerAccent: 'linear-gradient(90deg, #10b981, #059669)',
      schoolLogo,
      studentName: institutionName,
      institutionName,
      body,
      additionalContent,
      ctaUrl: process.env.LINK_FLOWCLASS_CMS,
      ctaText: 'Visit Dashboard',
      ctaBgColor: '#10b981',
      ctaShadowColor: 'rgba(16, 185, 129, 0.2)',
      showFallbackLink: true,
      adminEmail: 'info@flowclass.io',
      currentYear: new Date().getFullYear(),
    })

    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId,
      recipientName: institutionName,
      html,
      notificationType: NotificationType.STUDENT_PAID,
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
      courseName: enrollCourse.course?.name ?? '',
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

    const template = Handlebars.compile(baseEmailLayout)

    const schoolLogo = await this.checkDisplayEmailLogo(institutionId)

    const emailSubject = `${studentName} has uploaded payment proof for ${courseName}`

    const body = `<p><strong>${studentName}</strong> (<strong>${studentEmail}</strong>) has just uploaded a payment receipt for <strong>${courseName}</strong>!</p>
<p>The receipt has been attached to this email. You can also click the button below to check the payment status and review the record.</p>
<p>If the applicant paid by credit card, you can visit <a href="https://${
      process.env.LINK_FLOWCLASS_CMS || 'cms.flowclass.io'
    }/settings/payments" style="color: #ea580c; text-decoration: none; font-weight: 500;">settings/payments</a> and click on "Visit Dashboard" to check your balance.</p>`

    const formattedClassName = className?.replace(/\n/g, '<br />')
    const formattedClassDateTime = classDateTime?.replace(/\n/g, '<br />')
    const formattedStudentPhone = studentPhone
      ? parsePhoneNumber(`+${studentPhone}`)?.formatInternational() ?? ''
      : ''
    const formattedAdminPhone = adminPhone
      ? parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? ''
      : ''

    const additionalContent = `
<div class="section-title">Application Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Application ID</div>
        <div class="info-value" style="font-weight: 600;">${enrolId}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Course Name</div>
        <div class="info-value">${courseName}</div>
    </div>
    ${
      className
        ? `
    <div class="info-row">
        <div class="info-label">Option name</div>
        <div class="info-value">${formattedClassName}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Date & Time</div>
        <div class="info-value">${formattedClassDateTime}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Time Zone</div>
        <div class="info-value">${timeZone}</div>
    </div>
    ${
      instructor
        ? `
    <div class="info-row">
        <div class="info-label">Instructor</div>
        <div class="info-value">${instructor}</div>
    </div>`
        : ''
    }
    ${
      location
        ? `
    <div class="info-row">
        <div class="info-label">Location</div>
        <div class="info-value">${location}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Contact Information of ${institutionName}</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Name</div>
        <div class="info-value" style="font-weight: 600;">${institutionName}</div>
    </div>
    ${
      adminPhone
        ? `
    <div class="info-row">
        <div class="info-label">Phone</div>
        <div class="info-value">${formattedAdminPhone}</div>
    </div>`
        : ''
    }
    ${
      adminEmail
        ? `
    <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value"><a href="mailto:${adminEmail}" style="color: #ea580c; text-decoration: none;">${adminEmail}</a></div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Personal Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Application ID</div>
        <div class="info-value">${enrolId}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Applicant's Name</div>
        <div class="info-value" style="font-weight: 600;">${studentName}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Applicant's Email</div>
        <div class="info-value"><a href="mailto:${studentEmail}" style="color: #ea580c; text-decoration: none;">${studentEmail}</a></div>
    </div>
    ${
      studentPhone
        ? `
    <div class="info-row">
        <div class="info-label">Applicant's Phone</div>
        <div class="info-value">${formattedStudentPhone}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Payment Information</div>
<div class="info-card">
    ${
      transactionId
        ? `
    <div class="info-row">
        <div class="info-label">Payment ID</div>
        <div class="info-value">${transactionId}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Price</div>
        <div class="info-value" style="font-weight: 600;">${price}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Payment Status</div>
        <div class="info-value" style="font-weight: 600; color: #ea580c;">${paymentStatus}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Payment Method</div>
        <div class="info-value">${paymentMethod}</div>
    </div>
</div>
`

    const html = template({
      subject: emailSubject,
      title: 'Payment Proof Uploaded',
      subtitle: courseName,
      subtitleColor: '#ea580c',
      headerAccent: 'linear-gradient(90deg, #f59e0b, #ea580c)',
      schoolLogo,
      studentName: institutionName,
      institutionName,
      body,
      additionalContent,
      ctaUrl: process.env.LINK_FLOWCLASS_CMS,
      ctaText: 'Check the payment record',
      ctaBgColor: '#ea580c',
      ctaShadowColor: 'rgba(234, 88, 12, 0.2)',
      showFallbackLink: true,
      adminEmail: 'info@flowclass.io',
      currentYear: new Date().getFullYear(),
    })

    const attachments = [
      {
        filename,
        content: file.toString('base64'),
        disposition: 'attachment',
      },
    ]

    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId,
      recipientName: institutionName,
      html,
      notificationType: NotificationType.CONFIRM_PAYMENT,
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
    institutionId,
  }: SendAssignCouponParams): Promise<void | APIResponse> {
    const template = Handlebars.compile(baseEmailLayout)

    const schoolLogo = institutionId ? await this.checkDisplayEmailLogo(institutionId) : undefined

    const emailSubject = `Hello ${studentName}, you have received a coupon from ${institutionName}`

    const body = `<p>We are delighted to let you know that <strong>${institutionName}</strong> has assigned you a special discount coupon!</p>
<p>You can apply this coupon code during checkout to save on your next enrollment.</p>`

    const additionalContent = `
<div class="section-title">Coupon Details</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Coupon Code</div>
        <div class="info-value" style="font-size: 18px; font-weight: 700; color: #059669; letter-spacing: 0.05em;">${couponCode}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Discount Value</div>
        <div class="info-value" style="font-weight: 600;">${discountAmountUnit}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Expiration Date</div>
        <div class="info-value">${timeslotFormat(expiredDate)}</div>
    </div>
</div>`

    const html = template({
      subject: emailSubject,
      title: "You've Received a Coupon!",
      subtitle: 'Special Offer',
      subtitleColor: '#10b981',
      headerAccent: 'linear-gradient(90deg, #10b981, #059669)',
      schoolLogo,
      studentName,
      institutionName,
      body,
      additionalContent,
      adminEmail: 'support@flowclass.io',
      currentYear: new Date().getFullYear(),
    })

    const emailPayload = {
      emailSubject,
      emailAddress: studentEmail,
      recipientUserId: userId,
      recipientName: studentName,
      html,
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
    const template = Handlebars.compile(baseEmailLayout)

    const emailSubject = 'You have requested to reset your password'

    const body = `<p>We all forget our password sometimes. Don’t worry, click the button below to reset your password. This link is only valid for the next 24 hours.</p>`

    const html = template({
      subject: emailSubject,
      title: 'Forgot your password?',
      subtitle: 'Password Reset',
      subtitleColor: '#6366f1',
      headerAccent: 'linear-gradient(90deg, #6366f1, #4f46e5)',
      studentName: 'fellow instructor',
      institutionName: 'Flowclass',
      body,
      ctaUrl: resetLink,
      ctaText: 'Reset my password',
      ctaBgColor: '#4f46e5',
      ctaShadowColor: 'rgba(79, 70, 229, 0.2)',
      showFallbackLink: true,
      adminEmail: 'support@flowclass.io',
      currentYear: new Date().getFullYear(),
    })

    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId: userId,
      recipientName: 'fellow instructor',
      html,
      notificationType: NotificationType.FORGET_PASSWORD,
      institutionName: 'Flowclass',
    }
    return await this.sendEmail({ emailPayload })
  }

  // THIS EMAIL WILL USE THE USER'S CONTACT EMAIL IF AVAILABLE
  public async sendStudentLessonReminderEmail({
    data,
    enrollCourse,
    automationFlow,
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
      templateId: customTemplateId || emailTemplates.CLASS_STUDENT_COURSE_REMINDER,
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
      automationFlow,
      enrollCourse,
    })
  }

  public async resetPasswordSuccess({
    userId,
    emailAddress,
  }: ResetPasswordParams): Promise<void | APIResponse> {
    const template = Handlebars.compile(baseEmailLayout)

    const emailSubject = 'You have successfully reset your password!'

    const body = `<p>You have successfully reset your password!</p>
<p>Please use the following button to log back into Flowclass and continue automating your operations.</p>`

    const html = template({
      subject: emailSubject,
      title: 'Password Reset Success',
      headerAccent: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
      studentName: 'fellow educator',
      body,
      ctaUrl: `${process.env.FRONTEND_URL}/login`,
      ctaText: 'Login to Flowclass',
      ctaBgColor: '#3b82f6',
      adminEmail: 'info@flowclass.io',
      institutionName: 'The Flowclass Team',
      currentYear: new Date().getFullYear(),
    })

    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId: userId,
      recipientName: 'fellow educator',
      html,
      notificationType: NotificationType.FORGET_PASSWORD,
    }

    return await this.sendEmail({ emailPayload })
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

    await this.sendMailerSendEmail(emailParams)
      .then((msg) => {
        const log = this.notificationRecordRepository.create({
          channel: NotificationChannel.EMAIL,
          recipientUserId: userId,
          recipientUserEmail: emailAddress,
          messageId: msg.headers?.['x-message-id'],
          subject: emailSubject,
          notificationStatus:
            msg.statusCode === 202 ? NotificationStatus.SENT : NotificationStatus.FAILED,
          notificationType: NotificationType.APPLICATION_EMAIL_VERIFICATION,
        })
        this.notificationRecordRepository.save(log)
        this.logger.log(JSON.stringify(msg))
        return msg
      }) // logs response data
      .catch((err) => {
        this.logger.error('sendEmail', JSON.stringify(err?.body ?? err?.message ?? err))
        const log = this.notificationRecordRepository.create({
          channel: NotificationChannel.EMAIL,
          recipientUserId: userId,
          recipientUserEmail: emailAddress,
          subject: emailSubject,
          notificationStatus: NotificationStatus.FAILED,
          notificationType: NotificationType.APPLICATION_EMAIL_VERIFICATION,
        })
        this.notificationRecordRepository.save(log)
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
      templateId: emailTemplates.CLASS_STUDENT_ASSIGNED_COURSE,
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
      templateId: emailTemplates.ADMIN_INVITATION,
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
      templateId: emailTemplates.CLASS_STUDENT_NEW_LESSON,
      personalization,
      notificationType: NotificationType.ASSIGN_COURSE,
      institutionName: params.institutionName,
    }
    return await this.sendEmail({ emailPayload })
  }

  public async sendStudentChangeLessonEmail(params: ChangeLessonEmailDTO) {
    const template = Handlebars.compile(baseEmailLayout)

    const schoolLogo = await this.checkDisplayEmailLogo(params.institutionId)

    const emailSubject = `The status of your change request for ${params.courseName} has been updated`

    const body = `<p>Your lesson schedule for <strong>${params.courseName}</strong> has been updated by the institution. Please review the updated schedule details below.</p>`

    const additionalContent = `
<div class="section-title">Updated Schedule</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Course Name</div>
        <div class="info-value" style="font-weight: 600;">${params.courseName}</div>
    </div>
    ${
      params.className
        ? `
    <div class="info-row">
        <div class="info-label">Class Name</div>
        <div class="info-value">${params.className}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Original Date & Time</div>
        <div class="info-value" style="text-decoration: line-through; color: #64748b;">${lessonDateToString(
          params.classLessonDate,
          params.timeZone
        )}</div>
    </div>
    <div class="info-row">
        <div class="info-label" style="color: #2563eb;">New Date & Time</div>
        <div class="info-value" style="font-weight: 700; color: #1d4ed8;">${lessonDateToString(
          params.newClassLessonDate,
          params.timeZone
        )}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Time Zone</div>
        <div class="info-value">${params.timeZone}</div>
    </div>
    ${
      params.location
        ? `
    <div class="info-row">
        <div class="info-label">Location</div>
        <div class="info-value">${params.location}</div>
    </div>`
        : ''
    }
    ${
      params.instructor
        ? `
    <div class="info-row">
        <div class="info-label">Instructor</div>
        <div class="info-value">${params.instructor}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Contact Information of ${params.institutionName}</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Institution Name</div>
        <div class="info-value" style="font-weight: 600;">${params.institutionName}</div>
    </div>
    ${
      params.adminPhone
        ? `
    <div class="info-row">
        <div class="info-label">Phone</div>
        <div class="info-value">${
          parsePhoneNumber(`+${params.adminPhone}`)?.formatInternational() ?? ''
        }</div>
    </div>`
        : ''
    }
    ${
      params.adminEmail
        ? `
    <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value"><a href="mailto:${params.adminEmail}" style="color: #2563eb; text-decoration: none;">${params.adminEmail}</a></div>
    </div>`
        : ''
    }
</div>`

    const html = template({
      subject: emailSubject,
      title: 'Lesson Time Updated',
      subtitle: 'Schedule Change',
      subtitleColor: '#3b82f6',
      headerAccent: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
      schoolLogo,
      studentName: params.studentFirstName,
      institutionName: params.institutionName,
      body,
      additionalContent,
      adminEmail: params.adminEmail || 'support@flowclass.io',
      currentYear: new Date().getFullYear(),
    })

    const emailPayload = {
      emailSubject,
      emailAddress: params.studentEmail,
      recipientUserId: params.recipientUserId,
      recipientName: params.studentFirstName,
      html,
      institutionName: params.institutionName,
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
    const template = Handlebars.compile(baseEmailLayout)

    const institution = await this.institutionsRepository.findOneById(institutionId)
    const institutionName = institution?.name || 'our institution'

    const schoolLogo = await this.checkDisplayEmailLogo(institutionId)

    const emailSubject = `Update: ${courseName} lesson has been postponed`

    const body = `<p>We hope this message finds you well! We wanted to let you know about a change to the schedule for your <strong>${courseName}</strong> lesson.</p>
<p>We appreciate your understanding regarding this change and look forward to seeing you in class at the new time.</p>`

    const parsedPhone = schoolPhone
      ? parsePhoneNumber(`+${schoolPhone}`)?.formatInternational() ?? schoolPhone
      : ''

    const additionalContent = `
<div class="section-title">Schedule Changes</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Course Name</div>
        <div class="info-value" style="font-weight: 600;">${courseName}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Original Lesson Time</div>
        <div class="info-value" style="text-decoration: line-through; color: #64748b;">${originalDateTime}</div>
    </div>
    <div class="info-row">
        <div class="info-label" style="color: #e11d48;">New Lesson Time</div>
        <div class="info-value" style="font-weight: 700; color: #be123c;">${newDateTime}</div>
    </div>
</div>

<div class="section-title">Contact Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">School Name</div>
        <div class="info-value" style="font-weight: 600;">${institutionName}</div>
    </div>
    ${
      schoolPhone
        ? `
    <div class="info-row">
        <div class="info-label">Phone</div>
        <div class="info-value">${parsedPhone}</div>
    </div>`
        : ''
    }
    ${
      schoolEmail
        ? `
    <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value"><a href="mailto:${schoolEmail}" style="color: #3b82f6; text-decoration: none;">${schoolEmail}</a></div>
    </div>`
        : ''
    }
</div>`

    const html = template({
      subject: emailSubject,
      title: 'Lesson Postponed',
      subtitle: 'Schedule Update',
      subtitleColor: '#e11d48',
      headerAccent: 'linear-gradient(90deg, #f43f5e, #e11d48)',
      schoolLogo,
      studentName,
      institutionName,
      body,
      additionalContent,
      adminEmail: schoolEmail || 'support@flowclass.io',
      currentYear: new Date().getFullYear(),
    })

    const emailPayload = {
      emailSubject,
      emailAddress: studentEmail,
      recipientUserId,
      recipientName: studentName,
      html,
      notificationType: NotificationType.LESSON_POSTPONE,
      institutionId,
      institutionName,
      siteId,
    }

    return await this.sendEmail({ emailPayload })
  }

  public async linkSocialConfirmationEmail({
    emailAddress,
    userName,
    displayName,
    phone,
  }: {
    emailAddress: string
    userName: string
    displayName: string
    phone: string
  }): Promise<void | APIResponse> {
    // this.mailgunClient.messages
    //   .create('flowclass.io', {
    //     from: 'Flowclass <>no-reply@flowclass.io',
    //     to: emailAddress,
    //     // cc: 'admin@flowsophic.com;',
    //     subject: 'Your Flowclass account has been linked.',
    //     template: 'link_social_confirmation',
    //     'v:userName': userName,
    //     'v:displayName': displayName,
    //     'v:phone': phone,
    //   })
    //   .then((msg) => {
    //     this.logger.log(msg.toString());
    //     return msg;
    //   }) // logs response data
    //   .catch((err) => {
    //     this.logger.error('sendEmail', err.stack);
    //     throw new ServiceUnavailableException(EmailServiceErrorMessage.DELIVERY_FAILED);
    //   });
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
    params: SendEmailFunctionBuildParams,
    automationFlow?: AutomationFlow
  ): Promise<APIResponse | void> {
    const payload = await this.buildStudentUploadPaymentReceiptPayload(params)
    const courseEmailSettings = this.getEmailSettingsForCourse(params.course)

    const emailSubject =
      courseEmailSettings?.emailTitle?.trim?.() ||
      `You have applied for ${payload.courseName}. Please upload your payment receipt`

    const hasCustom = this.hasCustomEmailTemplate(params.course)
    let emailPayload: any

    if (hasCustom) {
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

      emailPayload = {
        emailSubject,
        emailAddress: payload.emailAddress,
        recipientUserId,
        recipientName: payload.studentName,
        templateId: courseEmailSettings.emailId,
        institutionName: payload.institutionName,
        personalization,
        advancePersonalization,
        notificationType: NotificationType.APPLIED_FOR_COURSE,
        institutionId: params.institutionId,
        siteId: params.site.id,
      }
    } else {
      const template = Handlebars.compile(baseEmailLayout)

      const schoolLogo = await this.checkDisplayEmailLogo(params.institutionId)

      const formattedClassName = payload.className?.replace(/\n/g, '<br />')
      const formattedClassDateTime = payload.classDateTime?.replace(/\n/g, '<br />')
      const formattedStudentPhone = payload.studentPhone
        ? parsePhoneNumber(`+${payload.studentPhone}`)?.formatInternational() ?? ''
        : ''
      const formattedAdminPhone = payload.adminPhone
        ? parsePhoneNumber(`+${payload.adminPhone}`)?.formatInternational() ?? ''
        : ''

      let additionalContent = `
<div class="section-title">Application Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Application ID</div>
        <div class="info-value" style="font-weight: 600;">${payload.enrolId}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Course Name</div>
        <div class="info-value">${payload.courseName}</div>
    </div>
    ${
      payload.className
        ? `
    <div class="info-row">
        <div class="info-label">Option Name</div>
        <div class="info-value">${formattedClassName}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Date & Time</div>
        <div class="info-value">${formattedClassDateTime}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Time Zone</div>
        <div class="info-value">${payload.timeZone}</div>
    </div>
    ${
      payload.instructor
        ? `
    <div class="info-row">
        <div class="info-label">Instructor</div>
        <div class="info-value">${payload.instructor}</div>
    </div>`
        : ''
    }
    ${
      payload.location
        ? `
    <div class="info-row">
        <div class="info-label">Location</div>
        <div class="info-value">${payload.location}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Contact Information of ${payload.institutionName}</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Name</div>
        <div class="info-value" style="font-weight: 600;">${payload.institutionName}</div>
    </div>
    ${
      payload.adminPhone
        ? `
    <div class="info-row">
        <div class="info-label">Phone</div>
        <div class="info-value">${formattedAdminPhone}</div>
    </div>`
        : ''
    }
    ${
      payload.adminEmail
        ? `
    <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value"><a href="mailto:${payload.adminEmail}" style="color: #4f46e5; text-decoration: none;">${payload.adminEmail}</a></div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Personal Information</div>
<div class="info-card">
    <div class="info-row">
        <div class="info-label">Applicant's Name</div>
        <div class="info-value" style="font-weight: 600;">${payload.studentName}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Applicant's Email</div>
        <div class="info-value"><a href="mailto:${
          payload.studentEmail
        }" style="color: #4f46e5; text-decoration: none;">${payload.studentEmail}</a></div>
    </div>
    ${
      payload.studentPhone
        ? `
    <div class="info-row">
        <div class="info-label">Applicant's Phone</div>
        <div class="info-value">${formattedStudentPhone}</div>
    </div>`
        : ''
    }
</div>

<div class="section-title">Payment Information</div>
<div class="info-card">
    ${
      payload.transactionId
        ? `
    <div class="info-row">
        <div class="info-label">Payment ID</div>
        <div class="info-value">${payload.transactionId}</div>
    </div>`
        : ''
    }
    <div class="info-row">
        <div class="info-label">Price</div>
        <div class="info-value" style="font-weight: 600;">${payload.price}</div>
    </div>
    <div class="info-row">
        <div class="info-label">Payment Status</div>
        <div class="info-value">${payload.paymentStatus}</div>
    </div>
</div>
`

      if (payload.enrollmentForm && payload.enrollmentForm.length > 0) {
        additionalContent += `
<div class="section-title">Questions & Answers</div>
<div class="info-card">
`
        for (const instance of payload.enrollmentForm) {
          if (instance.question && instance.answer) {
            additionalContent += `
    <div class="info-row" style="border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 10px;">
        <div class="info-label" style="text-transform: none; color: #475569; font-size: 13px;">${instance.question}</div>
        <div class="info-value" style="font-weight: 600;">${instance.answer}</div>
    </div>
`
          }
        }
        additionalContent += `</div>`
      }

      const html = template({
        subject: emailSubject,
        title: 'One more step to complete the application',
        subtitle: 'Payment Receipt Required',
        subtitleColor: '#e11d48',
        headerAccent: 'linear-gradient(90deg, #4f46e5, #f59e0b)',
        schoolLogo,
        studentName: payload.studentName,
        institutionName: payload.institutionName,
        body: `<p>Your application has been sent to <strong>${payload.institutionName}</strong>. This email functions as an invoice.</p>
<p>You can choose the preferred payment method and complete the payment by visiting the page below:</p>`,
        additionalContent:
          additionalContent +
          `<p style="margin-top: 24px; font-size: 14px; color: #64748b; line-height: 1.6;">If you have already completed the payment, please ignore this email. Thank you for applying.</p>`,
        ctaUrl: payload.paymentReceiptUploadLink,
        ctaText: 'Visit Payment Page',
        ctaBgColor: '#2563eb',
        ctaShadowColor: 'rgba(37, 99, 235, 0.2)',
        showFallbackLink: true,
        adminEmail: payload.adminEmail || 'info@flowclass.io',
        currentYear: new Date().getFullYear(),
      })

      emailPayload = {
        emailSubject,
        emailAddress: payload.emailAddress,
        recipientUserId,
        recipientName: payload.studentName,
        html,
        institutionName: payload.institutionName,
        notificationType: NotificationType.APPLIED_FOR_COURSE,
        institutionId: params.institutionId,
        siteId: params.site.id,
      }
    }
    return await this.sendEmail({
      emailPayload,
      automationFlow,
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
      templateId: emailTemplates.APPLICATION_EMAIL_VERIFICATION,
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
    automationFlow,
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
      templateId: emailTemplates.REMIND_ENROLL_COURSE_T4,
      institutionName: emailData.courseName,
      personalization,
      notificationType: NotificationType.REMINDER,
    }
    return await this.sendEmail({
      emailPayload,
      automationFlow,
      enrollCourse,
    })
  }

  async remindEnrollCourseT0({
    emailData,
    enrollCourse,
    automationFlow,
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
      templateId: emailTemplates.REMIND_ENROLL_COURSE_T0,
      personalization,
      notificationType: NotificationType.REMINDER,
    }

    return await this.sendEmail({
      emailPayload,
      automationFlow,
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
    msg: any,
    recipientUserId: number,
    emailAddress: string,
    emailSubject: string,
    notificationType: SupportedType | NotificationType,
    institutionId?: number,
    siteId?: number,
    automationFlow?: AutomationFlow,
    enrollCourse?: EnrollCourse
  ) {
    const sentStatusCodes = [200, 201, 202, 204]
    const classIds = enrollCourse?.multipleClassMapping
      ? enrollCourse.multipleClassMapping?.map((d) => d.classId)
      : (enrollCourse?.studentSchedule || [])?.map((d) => d.classId)
    const classIdsSet = Array.from(new Set(classIds?.filter(Boolean) || []))
    const classes =
      classIdsSet.length > 0
        ? await this.classRepository.findBy({
            id: In(classIdsSet),
          })
        : []

    let status = NotificationStatus.FAILED
    if (msg?.statusCode && sentStatusCodes.includes(msg.statusCode)) {
      status = NotificationStatus.SENT
      this.logger.log(JSON.stringify(msg))
    } else {
      status = NotificationStatus.FAILED
      this.logger.error('sendEmail', JSON.stringify(msg?.body ?? msg?.message ?? msg))
    }
    const log = this.notificationRecordRepository.create({
      channel: NotificationChannel.EMAIL,
      recipientUserId,
      institutionId,
      siteId,
      recipientUserEmail: emailAddress,
      messageId:
        msg?.headers?.['x-message-id'] || msg?.headers?.get?.('x-message-id') || msg?.messageId,
      subject: emailSubject,
      message:
        status === NotificationStatus.FAILED
          ? msg?.message || (typeof msg?.body === 'string' ? msg.body : JSON.stringify(msg?.body ?? msg))
          : undefined,
      notificationStatus: status,
      sentAt: status === NotificationStatus.SENT ? new Date() : undefined,
      notificationType,
      automationFlowId: automationFlow?.id,
      associatedClass: (classes || []).map((d) =>
        shallow({
          source: d,
          fields: ['id', 'name', 'courseId'],
        })
      ),
    })
    await this.notificationRecordRepository.save(log)
  }

  public async sendMailerSendEmail(emailParams: EmailParams, htmlContent?: string) {
    const from = (emailParams as any).from
    const to = (emailParams as any).to as any[]
    const subject = (emailParams as any).subject
    const templateId = (emailParams as any).template_id
    const toEmails = to ? to.map((r) => r.email).join(', ') : ''

    const channelName = 'Custom SMTP Service'
    this.logger.log(
      `[Email Dispatch] Initiating send via ${channelName} | To: "${toEmails}" | Subject: "${subject}" | TemplateId: "${
        templateId || 'N/A'
      }"`
    )

    const replyTo = (emailParams as any).reply_to
    const attachments = (emailParams as any).attachments as any[]

    const smtpFromEmail =
      process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_USER ||
      process.env.MAIL_FROM ||
      (from?.email || 'info@flowclass.io')
    const senderDisplayName = from?.name || process.env.SMTP_FROM_NAME || 'Flowclass'
    const replyToEmail = replyTo?.email || from?.email || smtpFromEmail
    const replyToName = replyTo?.name || from?.name || senderDisplayName

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${senderDisplayName}" <${smtpFromEmail}>`,
      to: to
        ? to.map((r) => (r.name ? `"${r.name}" <${r.email}>` : r.email)).join(', ')
        : undefined,
      replyTo: `"${replyToName}" <${replyToEmail}>`,
      subject,
      attachments: attachments
        ? attachments.map((att) => ({
            filename: att.filename,
            content: Buffer.from(att.content, 'base64'),
            contentType: att.contentType,
          }))
        : undefined,
    }

    const html = htmlContent || (emailParams as any).html
    if (html) {
      mailOptions.html = html
    } else {
      const personalization = (emailParams as any).variables || (emailParams as any).personalization
      mailOptions.html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4f46e5;">[SMTP Template Email]</h2>
          <p><strong>To:</strong> ${
            to ? to.map((r) => `${r.name || ''} (&lt;${r.email}&gt;)`).join(', ') : ''
          }</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Template ID:</strong> <code>${templateId}</code></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3>Personalization / Variables:</h3>
          <pre style="background: #f4f4f5; padding: 15px; border-radius: 6px; overflow-x: auto;">${JSON.stringify(
            personalization,
            null,
            2
          )}</pre>
        </div>
      `
    }

    try {
      const info = await this.nodemailerTransporter.sendMail(mailOptions)
      this.logger.log(
        `[Email Success] Sent via SMTP | MessageId: "${info.messageId}" | Response: "${info.response}"`
      )
      return {
        statusCode: 202,
        headers: {
          get: (headerName: string) => {
            if (headerName.toLowerCase() === 'x-message-id') return info.messageId
            return null
          },
        },
        body: 'Sent via custom SMTP transporter',
      } as any
    } catch (err) {
      this.logger.error(`[Email Error] Failed to send via SMTP | Error: ${err.message}`, err.stack)
      throw err
    }
  }

  private async sendEmail({ emailPayload, enrollCourse, automationFlow }: SendEmailParams) {
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
      html,
    } = emailPayload

    if (!emailAddress) {
      this.logger.warn('Email sending skipped: no recipient address provided')
      const log = this.notificationRecordRepository.create({
        channel: NotificationChannel.EMAIL,
        recipientUserId,
        institutionId,
        siteId,
        recipientUserEmail: '',
        subject: emailSubject,
        message: 'Email sending skipped: no recipient email address provided',
        notificationStatus: NotificationStatus.FAILED,
        notificationType,
        automationFlowId: automationFlow?.id,
      })
      await this.notificationRecordRepository.save(log)
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
          // The reason is that the user must first have the domain verified in our MailerSend before we can use the domain as the sender
          sentFrom = new Sender('no-reply@flowclass.io', institutionName)
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
      .setAttachments(attachments)

    if (html) {
      emailParams.setHtml(html)
    } else {
      if (templateId) {
        emailParams.setTemplateId(templateId)
      }
      if (personalization) {
        emailParams.setVariables(personalization)
      }
      if (advancePersonalization) {
        emailParams.setPersonalization(advancePersonalization)
      }
    }

    const studentNotifSetting = await this.studentNotifSettingRepository.findOne({
      where: {
        studentId: recipientUserId,
        institutionId,
        notificationType: notificationType as SupportedType,
      },
    })

    if (studentNotifSetting && !studentNotifSetting?.email) {
      this.logger.log(`Email: ${studentNotifSetting.notificationType} is not enabled for this user`)
      const log = this.notificationRecordRepository.create({
        channel: NotificationChannel.EMAIL,
        recipientUserId,
        institutionId,
        siteId,
        recipientUserEmail: emailAddress,
        subject: emailSubject,
        message: `Email notification is disabled for this user (${studentNotifSetting.notificationType})`,
        notificationStatus: NotificationStatus.FAILED,
        notificationType,
        automationFlowId: automationFlow?.id,
      })
      await this.notificationRecordRepository.save(log)
      return
    }
    try {
      const msg = await this.sendMailerSendEmail(emailParams)

      await this.saveEmailResponse(
        msg,
        recipientUserId,
        emailAddress,
        emailSubject,
        notificationType,
        institutionId,
        siteId,
        automationFlow,
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
        automationFlow,
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
    const template = Handlebars.compile(paymentRejectedTemplate)

    const formattedClassName = className?.replace(/\n/g, '<br />')
    const formattedClassDateTime = classDateTime
      ?.split('\n')
      .map(
        (slot) =>
          `<div style="color: #333 !important; text-decoration: none !important;">${slot}</div>`
      )
      .join('')
    const formattedAdminPhone = parsePhoneNumber(`+${adminPhone}`)?.formatInternational() ?? ''

    const schoolLogo = await this.checkDisplayEmailLogo(institutionId)

    const html = template({
      price,
      enrolId,
      courseName,
      studentName,
      paymentMethod,
      paymentStatus,
      institutionName,
      reUploadPaymentUrl,
      className: formattedClassName,
      classDateTime: formattedClassDateTime,
      location,
      adminEmail,
      adminPhone: formattedAdminPhone,
      transactionId,
      timeZone,
      schoolLogo,
      currentYear: new Date().getFullYear(),
    })

    const emailSubject = `Your payment receipt for ${courseName} has been rejected`

    const emailPayload = {
      emailSubject,
      emailAddress,
      recipientUserId,
      recipientName: institutionName,
      html,
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
    const emailParams = new EmailParams()
      .setFrom(this.defaultSentFrom)
      .setTo(recipients)
      .setReplyTo(this.defaultSentFrom)
      .setSubject(`Institution ${institutionName} request ${aiCreditDeposit} more AI attempts`)
      .setTemplateId('k68zxl2pp6e4j905')
      .setVariables(personalization)

    return await this.sendMailerSendEmail(emailParams)
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
    // check if tier is free
    const subscriptionPlanRecords = await this.subscriptionPlanRecordsRepository.findOneBy({
      siteId: institution.siteId,
    })

    if (!subscriptionPlanRecords) return false
    const plan = await this.subscriptionPlanRecordsRepository.findOneWithExpiryDate(
      institution.siteId
    )
    let isFeatureEnable = false

    if (plan) {
      isFeatureEnable = plan.featureEnable?.OWN_BRANDING ?? false
    }

    if (isFeatureEnable) {
      return this.s3ClientFactory.getS3ObjectUrl(institution.logo)
    }

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
      .setFrom(this.defaultSentFrom)
      .setTo(recipients)
      .setReplyTo(this.defaultSentFrom)
      .setSubject(emailSubject)
      .setTemplateId('jy7zpl9wvj545vx6')
      .setVariables(personalization)

    return await this.sendMailerSendEmail(emailParams)
  }

  async requestTimeChangeEmail(payload: RequestTimeChangeEmailProps) {
    const { emailSubject, studentEmail, studentName, status } = payload
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

    return await this.sendMailerSendEmail(emailParams)
  }

  async sendClassMaterialsEmail(payload: SendClassMaterialsEmailProps) {
    const { emailAddress, courseName, className, institutionName, studentName, siteLink } = payload
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
      .setFrom(this.defaultSentFrom)
      .setTo(recipients)
      .setReplyTo(this.defaultSentFrom)
      .setSubject(`New materials uploaded to ${courseName}`)
      .setTemplateId('jy7zpl9xxvpl5vx6')
      .setVariables(personalization)

    return await this.sendMailerSendEmail(emailParams)
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

  public async resendNotificationRecord(record: NotificationRecord): Promise<NotificationRecord> {
    const recipientEmail =
      record.recipientUserEmail || record.user?.email
    if (!recipientEmail) {
      record.notificationStatus = NotificationStatus.FAILED
      record.message = 'No recipient email address available to resend.'
      await this.notificationRecordRepository.save(record)
      return record
    }

    const institutionId = record.institutionId
    const institutionName = record.institution?.name || ''
    let sentFrom = this.defaultSentFrom

    if (institutionId) {
      try {
        const notiSetting = await this.settingNotificationsService.findOneBy({
          institutionId,
        })
        if (notiSetting && notiSetting.customEmailSender && institutionName) {
          sentFrom = new Sender('no-reply@flowclass.io', institutionName)
        }
      } catch (e) {
        // ignore
      }
    }

    const emailSubject = record.subject || `Notification from ${institutionName || 'Flowclass'}`
    const userName = record.user?.firstName
      ? `${record.user.firstName} ${record.user.lastName || ''}`.trim()
      : ''
    const recipientName = userName || institutionName || 'Valued User'

    const recipients = [new Recipient(recipientEmail, recipientName)]

    // Build HTML email layout
    const template = Handlebars.compile(baseEmailLayout)
    const schoolLogo = institutionId ? await this.checkDisplayEmailLogo(institutionId) : undefined

    const html = template({
      subject: emailSubject,
      title: emailSubject,
      subtitle: institutionName,
      schoolLogo,
      body: `<p>This is a notification regarding: <strong>${emailSubject}</strong></p>`,
      ctaUrl: process.env.LINK_FLOWCLASS_CMS || 'https://app.flowclass.io',
      ctaText: 'View Details',
      ctaBgColor: '#3b82f6',
      showFallbackLink: true,
      adminEmail: 'info@flowclass.io',
      currentYear: new Date().getFullYear(),
    })

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(emailSubject)
      .setHtml(html)

    try {
      const msg = await this.sendMailerSendEmail(emailParams, html)
      const sentStatusCodes = [200, 201, 202, 204]
      if (msg?.statusCode && sentStatusCodes.includes(msg.statusCode)) {
        record.notificationStatus = NotificationStatus.SENT
        record.sentAt = new Date()
        record.messageId =
          msg?.headers?.['x-message-id'] || msg?.headers?.get?.('x-message-id') || msg?.messageId
        record.message = null // clear error
      } else {
        record.notificationStatus = NotificationStatus.FAILED
        record.message =
          msg?.message || (typeof msg?.body === 'string' ? msg.body : JSON.stringify(msg?.body ?? msg))
      }
    } catch (err: any) {
      record.notificationStatus = NotificationStatus.FAILED
      record.message =
        err?.message || (typeof err?.body === 'string' ? err.body : JSON.stringify(err?.body ?? err))
    }

    await this.notificationRecordRepository.save(record)
    return record
  }
}
