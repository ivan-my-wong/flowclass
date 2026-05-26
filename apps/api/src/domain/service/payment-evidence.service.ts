import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { plainToInstance } from 'class-transformer'
import { isUUID } from 'class-validator'
import { randomUUID } from 'crypto'
import * as path from 'path'
import { EntityNotFoundError, FindOptionsOrder, FindOptionsWhere, In, IsNull, Not } from 'typeorm'
import { Transactional } from 'typeorm-transactional'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import { PromotionType as PromotionTypeDto } from '@/application/admin/invoice-campaign/dto/send-invoice.dto'
import {
  ConfirmDeletePaymentWithoutReceiptDTO,
  ConfirmMultiplePaymentEvidenceResponse,
  ConfirmPaymentWithoutReceiptDTO,
  DeleteMultiplePaymentEvidenceResponse,
  RejectMultiplePaymentEvidenceResponse,
  ResetMultiplePaymentEvidenceResponse,
  SendPaymentActions,
  SendPaymentProofReminderDTO,
} from '@/application/admin/payment-evidence/dto/confirm-state-payment-evidence.dto'
import {
  PaymentEvidencePageDto,
  PaymentEvidencePageOptionDto,
} from '@/application/admin/payment-evidence/dto/payment-evidence-pagination.dto'
import { StudentData } from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { StudentInvoiceResponseDto } from '@/application/student/enroll-courses/dto/create-invoice.dto'
import { StudentCreatePaymentEvidenceDto } from '@/application/student/payment-evidence/dto/create-payment-evidence.dto'
import { StudentPaymentEvidenceDto } from '@/application/student/payment-evidence/dto/payment-evidence.dto'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { ObjectStorageProvider } from '@/config/storage/object-storage.provider'
import { UploadedStorageFile } from '@/config/storage/storage-image-upload-interceptor'
import { EmailService } from '@/domain/external/email.service'
import { StudentScheduleService } from '@/domain/service/student-schedule.service'
import { AuthorizationException } from '@/exceptions/authorization.exception'
import { EnrollCourseErrorMessage } from '@/exceptions/error-message/course'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'
import { InvoiceErrorMessage } from '@/exceptions/error-message/invoice'
import { PaymentEvidenceErrorMessage } from '@/exceptions/error-message/payment-evidence'
import { SiteErrorMessage } from '@/exceptions/error-message/site'
import { UserErrorMessage } from '@/exceptions/error-message/user'
import { WhatsappTemplateErrorMessage } from '@/exceptions/error-message/whatsapp-template'
import { Course } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { CreditSourceType } from '@/models/credit-transactions.entity'
import { ClassAdminPaymentSubmittedEmailParams } from '@/models/custom-types/email-params'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import { PaymentMethod, PromotionType as PromotionTypeEnum } from '@/models/enums/'
import {
  CheckoutStatus,
  EnrollConfirmStatus,
  PaymentEvidenceStatus,
  PaymentStatus,
  PromotionUsedStatus,
} from '@/models/enums/status'
import { Institution } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { Invoice } from '@/models/invoice.entity'
import { InvoiceRepository } from '@/models/invoice.repository'
import { InvoicePromotionUsedRepository } from '@/models/invoice-promotion-used.repository'
import { NotificationStatus } from '@/models/notification-record.entity'
import { PaymentEvidence } from '@/models/payment-evidence.entity'
import { PaymentEvidenceRepository } from '@/models/payment-evidence.repository'
import { RequestTimeChangeRepository } from '@/models/request-time-change.repository'
import { Site } from '@/models/site.entity'
import { SitesRepository } from '@/models/sites.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { Transaction } from '@/models/transaction.entity'
import { TransactionRepository } from '@/models/transaction.repository'
import { User } from '@/models/user.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UsersRepository } from '@/models/users.repository'
import { buildSuccessPaymentLink, buildUploadReceiptLink } from '@/utils/payment-link.utils'
import { replaceContentVariables, shallow } from '@/utils/shallow.utils'
import {
  addressObjectToString,
  enrollIntoInfoToString,
  studentScheduleToString,
} from '@/utils/string.utils'
import { offsetToISO } from '@/utils/time.utils'

import { AuthService } from './auth.service'
import { CouponsService } from './coupons.service'
import { CreditManagementService } from './credit-management.service'
import { CustomMessageService } from './custom-message.service'
import { InvoiceService } from './invoice.service'
import { NotificationRecordService } from './notification-log.service'
import { SettingSiteService } from './setting-site.service'
import { StudentNotifSettingService } from './student-notif-setting.service'
import { UsersService } from './users.service'
import { WhatsappWebService } from './whatsapp-web.service'

@Injectable()
export class PaymentEvidenceService {
  private readonly jwtOption: JwtSignOptions = {}

  constructor(
    private paymentEvidenceRepository: PaymentEvidenceRepository,
    private readonly sitesRepository: SitesRepository,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly couponsService: CouponsService,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly coursesRepository: CoursesRepository,
    private readonly userRepository: UsersRepository,
    private readonly invoiceService: InvoiceService,
    private readonly userAliasesRepository: UserAliasesRepository,
    private readonly creditManagementService: CreditManagementService,
    private readonly transactionRepository: TransactionRepository,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly objectStorageProvider: ObjectStorageProvider,
    private readonly settingSiteService: SettingSiteService,
    private readonly studentScheduleService: StudentScheduleService,
    private readonly studentScheduleRepository: StudentScheduleRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly logger: CloudWatchLoggerProvider,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoicePromotionUsedRepository: InvoicePromotionUsedRepository,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly notificationRecordService: NotificationRecordService,
    private readonly studentNotifSettingService: StudentNotifSettingService,
    private readonly requestTimeChangeRepository: RequestTimeChangeRepository,
    private readonly customMessageService: CustomMessageService,
    private readonly whatsappWebService: WhatsappWebService
  ) {
    this.jwtOption = {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    }
  }

  async findAll(pageOptionsDto: PaymentEvidencePageOptionDto): Promise<PaymentEvidencePageDto> {
    const whereCondition: FindOptionsWhere<PaymentEvidence> = {}
    const orderOption: FindOptionsOrder<PaymentEvidence> = {}

    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }

    if (pageOptionsDto.invoiceId) {
      whereCondition.invoiceId = pageOptionsDto.invoiceId
    }

    return this.paymentEvidenceRepository.paginationWithTransform(
      pageOptionsDto,
      StudentPaymentEvidenceDto,
      whereCondition,
      orderOption
    )
  }

  async create(
    createPaymentEvidenceDto: StudentCreatePaymentEvidenceDto,
    file: Express.Multer.File,
    currentUser: User,
    currentSite: Site,
    currentInstitution: Institution
  ): Promise<StudentPaymentEvidenceDto> {
    const enrollId = parseInt(createPaymentEvidenceDto.enrollId, 10)
    const enrollCourseInstance = await this.enrollCourseRepository.findOneBy({
      id: enrollId,
      siteId: currentSite.id,
      institutionId: currentInstitution.id,
    })
    if (!enrollCourseInstance) {
      throw new BadRequestException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }

    const name = path.parse(file.filename).name
    const ext = path.parse(file.originalname).ext.replace('.', '')
    const image = `${process.env.API_BASE_URL}/media/get/${name}/${ext}`
    const paymentEvidenceInstance = this.paymentEvidenceRepository.create({
      siteId: currentSite.id,
      institutionId: currentInstitution.id,
      userId: currentUser.id,
      enrollCourseId: enrollId,
      image,
      status: PaymentEvidenceStatus.PROCESSING,
    })
    const paymentEvidence = await this.paymentEvidenceRepository.save(paymentEvidenceInstance)

    return plainToInstance(StudentPaymentEvidenceDto, paymentEvidence)
  }

  async createByToken(
    createPaymentEvidenceDto: StudentCreatePaymentEvidenceDto,
    file: UploadedStorageFile,
    siteId: number,
    institutionId: number,
    token: string
  ): Promise<StudentPaymentEvidenceDto> {
    const currentSite = await this.sitesRepository.findOneById(siteId)

    if (!currentSite) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }

    const timeZone = await this.settingSiteService.getTimeZone(siteId)

    const currentInstitution = await this.institutionsRepository.findOneById(institutionId)
    if (!currentInstitution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    const enrollId = parseInt(createPaymentEvidenceDto.enrollId, 10)

    const enrollCourseInstance = await this.enrollCourseRepository.findOneBy({
      id: enrollId,
      siteId,
      institutionId,
    })
    if (!enrollCourseInstance) {
      throw new BadRequestException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }

    const payLaterUpdateDto = {
      payLaterMethod: JSON.parse(createPaymentEvidenceDto.payLaterMethod),
    }
    const updatedEnrollCourseData = {
      ...enrollCourseInstance,
      ...payLaterUpdateDto,
    }

    const updatedEnrollCourseInstance = plainToInstance(EnrollCourse, updatedEnrollCourseData)

    const updated = await this.enrollCourseRepository.save(updatedEnrollCourseInstance)
    const enrolledCourseInfo = await this.coursesRepository.findOneById(updated.courseId, {
      withDeleted: true,
    })

    const enrollCourseStudentSchedules = await this.studentScheduleService.findAllByEnrollCourseId(
      updated.id
    )

    // Fetch enrollCourse with multipleClassMapping to get class names
    const enrollCourseWithMapping = await this.enrollCourseRepository.findOneById(updated.id, {
      relations: { multipleClassMapping: { class: true } },
    })

    let classDateTime = ''
    if (enrollCourseStudentSchedules && enrollCourseStudentSchedules.length > 0) {
      const studentScheduleWithUserAlias = await this.emailService.getStudentScheduleWithUserAlias(
        institutionId,
        enrollCourseStudentSchedules
      )
      classDateTime = studentScheduleToString(
        studentScheduleWithUserAlias,
        timeZone,
        enrollCourseWithMapping?.multipleClassMapping ?? []
      )
    }

    // // compare token
    // if (token !== updated.token) {
    //   throw new BadRequestException(EnrollCourseErrorMessage.ENROLL_COURSE_TOKEN_NOT_MATCH);
    // }

    try {
      await this.jwtService.verify(token, { ...this.jwtOption })
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw AuthorizationException.tokenExpiredException()
      }
      throw AuthorizationException.tokenInvalidException(error.message)
    }

    // keep one for later reference
    // const name = path.parse(file.filename).name;
    // const ext = path.parse(file.originalname).ext.replace('.', '');
    // const image = `${process.env.API_HOST_NAME}/media/get/${name}/${ext}`;

    const invoice = await this.invoiceRepository.findOne({
      where: { id: parseInt(createPaymentEvidenceDto.invoiceId, 10) },
      order: { id: 'DESC' },
    })

    // Return error if no invoice found
    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    const paymentAmount = invoice.payAmount
    const currency = invoice.currency

    // check if a record with the same enrollCourseId and userId exists
    let paymentEvidenceInstance = await this.paymentEvidenceRepository.findOne({
      where: {
        // enrollCourseId: enrollId,
        invoiceId: invoice.id,
        userId: enrollCourseInstance.userId,
      },
    })

    const fileKey = file?.key ?? null

    if (paymentEvidenceInstance) {
      // update image and status
      if (fileKey) paymentEvidenceInstance.image = fileKey
      paymentEvidenceInstance.status = PaymentEvidenceStatus.PROCESSING
    } else {
      paymentEvidenceInstance = this.paymentEvidenceRepository.create({
        siteId,
        institutionId,
        userId: enrollCourseInstance.userId,
        enrollCourseId: enrollId,
        invoiceId: invoice.id,
        image: fileKey,
        status: PaymentEvidenceStatus.PROCESSING,
      })
    }

    const paymentEvidence = await this.paymentEvidenceRepository.save(paymentEvidenceInstance)

    await this.invoiceRepository.save({
      ...invoice,
      paymentState: PaymentStatus.SUBMITTED,
    })

    const imageBuffer = fileKey ? await this.objectStorageProvider.getObjectBuffer(fileKey) : null

    const imageObjectAccessUrl = fileKey
      ? await this.objectStorageProvider.getObjectAccessUrl(fileKey)
      : null

    const multipleClassMapping = enrollCourseInstance.multipleClassMapping ?? []
    const location = multipleClassMapping.map((o) => o.class?.locationRoom?.name ?? '')
    const instructor = multipleClassMapping.map((o) => o.class?.instructor?.firstName ?? '')

    const emailToAdminPaymentSubmittedParams: ClassAdminPaymentSubmittedEmailParams = {
      emailAddress: currentInstitution.email ?? currentSite.email,
      institutionName: currentInstitution.name,
      studentName: enrollCourseInstance.name,
      studentEmail: enrollCourseInstance.email,
      studentPhone: enrollCourseInstance.phone,
      courseName: enrolledCourseInfo.name,
      className: enrollCourseInstance.enrollInto
        ?.map((info) => enrollIntoInfoToString(info))
        .join('\n'),
      classDateTime,
      location: Array.from(new Set(location)).join(', '),
      instructor: Array.from(new Set(instructor)).join(', '),
      price: `${currency} ${paymentAmount}`,
      paymentAmount: `${currency} ${paymentAmount}`,
      paymentMethod: invoice.paymentMethod,
      paymentStatus: PaymentEvidenceStatus.PROCESSING,
      enrolId: enrollCourseInstance.id.toString(),
      filename: fileKey,
      file: imageBuffer,
      transactionId: paymentEvidence.id.toString(),
      paymentReceipt: imageObjectAccessUrl,
      adminEmail: currentInstitution.email ?? currentSite.email,
      adminPhone: currentInstitution.phone ?? currentSite.phone,
      timeZone,
    }

    this.emailService.sendClassAdminPaymentSubmitted({
      recipientUserId: -1,
      institutionId: enrollCourseInstance.institutionId,
      siteId: enrollCourseInstance.siteId,
      payload: emailToAdminPaymentSubmittedParams,
    })

    return plainToInstance(StudentPaymentEvidenceDto, paymentEvidence)
  }

  @Transactional()
  async confirmMultiplePayments(
    confirmMultiplePaymentEvidenceResponse: ConfirmMultiplePaymentEvidenceResponse,
    user: User
  ): Promise<StudentPaymentEvidenceDto[]> {
    const { ids, siteId, institutionId, invoices } = confirmMultiplePaymentEvidenceResponse
    const confirmedPaymentEvidences: StudentPaymentEvidenceDto[] = []

    // All payment evidences that has receipt will be put into ids array.
    // if there is no payment evidence in ids array, it must be that the user is confirming payment without receipt.
    for (const id of ids || []) {
      const paymentEvidence = await this.confirmPayment(id, siteId, institutionId, user)
      confirmedPaymentEvidences.push(paymentEvidence)
    }

    // Confirm Payment with Invoices is invoice that no required receipt
    for (const data of invoices || []) {
      await this.confirmPaymentWithoutReceipt(siteId, institutionId, data, user)
    }
    return confirmedPaymentEvidences
  }

  /**
   * Confirm a payment
   * @param id The ID of the payment evidence
   * @param siteId The ID of the site
   * @param institutionId The ID of the institution
   * @param user The user who is confirming the payment
   */
  async confirmPayment(
    id: number,
    siteId: number,
    institutionId: number,
    user: User
  ): Promise<StudentPaymentEvidenceDto> {
    const paymentEvidenceInstance = await this.paymentEvidenceRepository.findOne({
      where: { id, siteId, institutionId },
      relations: {
        enrollCourse: true,
        invoice: {
          enrollCourses: {
            multipleClassMapping: true,
            course: true,
            studentSchedule: {
              studentLessons: true,
            },
          },
          userAlias: true,
          user: true,
        },
      },
    })
    if (!paymentEvidenceInstance) {
      throw new NotFoundException(PaymentEvidenceErrorMessage.PAYMENT_EVIDENCE_NOT_FOUND)
    }
    // check if confirmed already
    if (paymentEvidenceInstance.status === PaymentEvidenceStatus.ACCEPTED) {
      throw new BadRequestException(PaymentEvidenceErrorMessage.PAYMENT_EVIDENCE_ALREADY_ACCEPTED)
    }
    // update status of evident
    paymentEvidenceInstance.status = PaymentEvidenceStatus.ACCEPTED

    paymentEvidenceInstance.approverId = user.id
    await this.paymentEvidenceRepository.save(paymentEvidenceInstance)
    const paymentEvidence = await this.paymentEvidenceRepository.findOne({
      where: { id: paymentEvidenceInstance.id },
      relations: {
        enrollCourse: true,
        invoice: {
          enrollCourses: {
            multipleClassMapping: true,
            course: true,
            studentSchedule: {
              studentLessons: true,
            },
          },
          userAlias: true,
          user: true,
        },
      },
    })
    await this.createTransactionAfterConfirm(
      siteId,
      institutionId,
      paymentEvidence.enrollCourseId,
      paymentEvidence.invoice,
      user,
      paymentEvidence.id.toString()
    )

    return plainToInstance(StudentPaymentEvidenceDto, paymentEvidence)
  }

  /**
   * Confirm a payment without requiring a receipt
   * @param siteId The ID of the site
   * @param institutionId The ID of the institution
   * @param data The data containing the enroll course ID and proof token
   * @param user The user who is confirming the payment
   */
  async confirmPaymentWithoutReceipt(
    siteId: number,
    institutionId: number,
    data: ConfirmPaymentWithoutReceiptDTO,
    user: User
  ): Promise<Transaction> {
    // Get the invoice by the proof token
    // Query should be match invoiceId and proofToken since the proofToken possibly duplicated once multiple enrolls
    const invoice = await this.invoiceService.findInvoiceWithIdAndProofToken(
      data.invoiceId,
      data.proofToken
    )

    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    const firstEnrollCourse = invoice.enrollCourses.at(0)

    // Get the enroll course by the enroll course ID
    const enrollCourse = await this.enrollCourseRepository.findOneById(firstEnrollCourse.id, {
      relations: {
        student: true,
        course: true,
      },
    })

    if (!enrollCourse) {
      throw new NotFoundException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }

    const invoiceWithNumberApplicants = {
      ...invoice,
      applicants: invoice.applicants.map((applicant) => applicant?.id).filter(Boolean),
    }

    return this.createTransactionAfterConfirm(
      siteId,
      institutionId,
      enrollCourse.id,
      invoiceWithNumberApplicants,
      user
    )
  }

  /**
   * Create a transaction after confirming the payment
   * @param siteId The ID of the site
   * @param institutionId The ID of the institution
   * @param enrollCourseId The ID of the enroll course
   * @param invoice The invoice
   * @param user The user who is confirming the payment
   * @param authorizationCode The authorization code
   * @returns The created transaction
   */
  async createTransactionAfterConfirm(
    siteId: number,
    institutionId: number,
    enrollCourseId: number,
    invoice: Invoice,
    user: User,
    authorizationCode?: string
  ): Promise<Transaction> {
    // Get the enroll course
    const enrollCourse = await this.enrollCourseRepository.findOneBy({
      id: enrollCourseId,
    })
    if (!enrollCourse) {
      throw new NotFoundException(
        EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND + ': can not find enroll course'
      )
    }

    // Get the course info
    const course = await this.coursesRepository.findOneById(enrollCourse.courseId, {
      withDeleted: true,
    })
    enrollCourse.course = course

    // Get the invoice
    if (!invoice) {
      throw new NotFoundException(
        InvoiceErrorMessage.INVOICE_NOT_FOUND + ': can not find invoice relate to this enroll'
      )
    }

    // Create the transaction
    const transaction = this.transactionRepository.create({
      siteId,
      institutionId,
      courseId: enrollCourse.courseId,
      invoiceId: invoice.id,
      status: CheckoutStatus.COMPLETED,
      paymentLinkId: 'pay_later',
      amountSubtotal: invoice.payAmount,
      amountTotal: invoice.payAmount,
      paymentMethod: PaymentMethod.PAY_LATER,
      customer: {
        name: enrollCourse.preferredName,
        phone: enrollCourse.preferredPhone,
        email: enrollCourse.preferredEmail,
      },
      description: enrollCourse.enrollInto?.map((info) => enrollIntoInfoToString(info)).join('\n'),
      authorizationCode,
      transactionId: randomUUID(),
      approverId: user.id,
      approverName: `${user.firstName} ${user.lastName ?? ''}`,
    })

    // Save the transaction
    const newTransaction = await this.transactionRepository.save(transaction)

    // Update the invoice's payment state
    await this.updateInvoiceAfterAction(
      invoice,
      PaymentStatus.PAID,
      user,
      true,
      newTransaction.transactionId
    )

    // Update the enroll course's confirm state
    enrollCourse.confirmState = EnrollConfirmStatus.ACCEPTED
    await this.enrollCourseRepository.save(enrollCourse)

    const applicants: User[] = await this.userRepository.find({
      where: { id: In(invoice.applicants) },
    })
    const applicantsData: StudentData[] = applicants.map((applicant) => ({
      id: applicant.id,
      studentName: applicant.firstName + ' ' + applicant.lastName,
      email: applicant.email,
      phoneNumber: applicant.phone,
    }))

    // Send email to the student
    await this.emailService.sendClassStudentPaymentConfirmedEmail({
      invoice,
      transaction,
      applicants: applicantsData,
    })

    for (const student of applicants) {
      await this.sendWhatsappPaymentReminder(
        institutionId,
        enrollCourse,
        invoice,
        student,
        'approved'
      )
    }

    // Update the promotion used (if it has coupon)
    await this.applyTheCoupon(siteId, transaction, invoice, course, enrollCourse, user)

    return newTransaction
  }

  async sendWhatsappPaymentReminder(
    institutionId: number,
    enrollCourse: EnrollCourse,
    invoice: Invoice,
    student: User,
    action: 'approved' | 'rejected'
  ) {
    const institution = await this.institutionsRepository.findOneById(institutionId)
    const site = await this.sitesRepository.findOneById(enrollCourse.siteId)
    institution.site = site
    const className = enrollCourse.enrollInto.map((info) => info.secondLevelName).join(', ')
    const courseName = enrollCourse.enrollInto.map((info) => info.courseName).join(', ')

    const successPaymentLink = buildSuccessPaymentLink({
      institution,
      invoice,
      enrollCourse,
      site,
    })

    const reUploadPaymentUrl = buildUploadReceiptLink({
      institution,
      invoice,
      customDomain: site.customDomain,
      siteUrl: site.url,
      coursePath: invoice.course?.path,
    })

    const whatsappReminderDto = {
      recipientUserId: student.id,
      institutionId,
      institutionName: institution?.name,
      siteId: invoice.siteId,
      contactPhone: institution?.phone,
      studentPhone: enrollCourse.preferredPhone,
      studentName: enrollCourse.preferredName,
      studentEmail: enrollCourse.preferredEmail,
      adminPhone: institution?.phone,
      adminEmail: institution?.email,
      adminName: institution?.name,
      className,
      courseName: courseName || '',
      paymentAmount: `${invoice.currency} ${invoice.payAmount}`,
      paymentStatus: invoice.paymentState,
      paymentMethod: invoice.paymentMethod,
      uploadPaymentUrl: reUploadPaymentUrl,
      successPaymentLink,
    }

    const user = await this.usersService.getUserOwnerOfInstitution(institutionId)
    if (!user) return
    const studentNotificationSetting = await this.studentNotifSettingService.getByStudentAndType(
      student.id,
      institutionId,
      action === 'approved'
        ? SupportedType.STUDENT_NOTIF_AFTER_PAYMENT_APPROVED
        : SupportedType.STUDENT_NOTIF_AFTER_PAYMENT_REJECTED
    )
    if (studentNotificationSetting && !studentNotificationSetting?.whatsapp) return
    const accessToken = await this.authService.createToken(user, this.authService.jwtAdminOption)
    const notificationType =
      action === 'approved'
        ? SupportedType.STUDENT_NOTIF_AFTER_PAYMENT_APPROVED
        : SupportedType.STUDENT_NOTIF_AFTER_PAYMENT_REJECTED

    const customMessage = await this.customMessageService.getCustomMessageByType(
      institutionId,
      notificationType
    )

    if (customMessage) {
      const content = replaceContentVariables(customMessage.content, whatsappReminderDto)
      await this.whatsappWebService.sendWhatsappMessage(
        {
          content,
          institutionId: institution.id,
          phone: whatsappReminderDto.studentPhone,
        },
        {
          invoiceMetadata: {
            invoiceId: invoice?.id,
          },
          recipientUserId: student?.id,
          recipientUserPhone: student?.phone,
          institutionId: institution.id,
          siteId: institution.siteId,
        }
      )
    } else {
      await this.notificationRecordService.saveNotificationLog({
        messageContent: JSON.stringify(whatsappReminderDto),
        notificationStatus: NotificationStatus.FAILED,
        recipientUserId: student.id,
        recipientUserPhone: student.phone,
        institutionId: institution.id,
        siteId: institution.siteId,
      })
    }
  }

  /**
   * Apply the coupon to the transaction after confirmation.
   *
   * @param siteId - The site ID.
   * @param transaction - The transaction.
   * @param invoice - The invoice.
   * @param course - The course.
   * @param enrollCourse - The enroll course.
   * @param user - The user.
   */
  async applyTheCoupon(
    siteId: number,
    transaction: Transaction,
    invoice: Invoice,
    course: Course,
    enrollCourse: EnrollCourse,
    user: User
  ) {
    const invoicePromoUsed = await this.invoicePromotionUsedRepository.findOneBy({
      invoiceId: invoice.id,
      promotionType: PromotionTypeEnum.COUPON_DISCOUNT,
    })

    if (invoicePromoUsed && invoicePromoUsed.usedStatus !== PromotionUsedStatus.CONFIRMED) {
      await this.invoicePromotionUsedRepository.save({
        ...invoicePromoUsed,
        usedStatus: PromotionUsedStatus.CONFIRMED,
      })
    }

    try {
      // Get the time zone from the setting
      const timeZone = await this.settingSiteService.getTimeZone(siteId)

      // Send the Google Analytics measurement
      await this.sendGoogleAnalyticsMeasurement(
        enrollCourse,
        transaction,
        invoice,
        user,
        invoicePromoUsed?.promotionId,
        timeZone
      )
    } catch (err) {
      // Log the error
      this.logger.error(UserErrorMessage.WEB_ANALYTICS_CANNOT_BE_SENT, err.stack)
    }
  }

  /**
   * Send the Google Analytics measurement for the purchase event
   * @param enrollCourse The enroll course object
   * @param transaction The transaction object
   * @param invoice The invoice object
   * @param user The user object
   * @param promotionUsed The promotion used object
   * @param timeZone The time zone of the institution
   */
  async sendGoogleAnalyticsMeasurement(
    enrollCourse: EnrollCourse,
    transaction: Transaction,
    invoice: Invoice,
    user: User,
    couponId?: number,
    timeZone?: string
  ): Promise<void> {
    // GA measurement removed in open-source build
  }

  @Transactional()
  async rejectMultiplePayments(
    rejectMultiplePaymentEvidenceResponse: RejectMultiplePaymentEvidenceResponse,
    user: User
  ) {
    const { ids, siteId, institutionId, invoices } = rejectMultiplePaymentEvidenceResponse
    const rejectedPaymentEvidences: StudentPaymentEvidenceDto[] = []
    for (const id of ids || []) {
      const paymentEvidence = await this.rejectPayment(id, siteId, institutionId, user)
      rejectedPaymentEvidences.push(paymentEvidence)
    }

    for (const invoice of invoices || []) {
      await this.rejectPaymentWithoutReceipt(siteId, institutionId, invoice, user)
    }

    return rejectedPaymentEvidences
  }

  async rejectPayment(id, siteId, institutionId, user: User): Promise<StudentPaymentEvidenceDto> {
    const paymentEvidenceInstance = await this.paymentEvidenceRepository.findOne({
      where: {
        id,
        siteId,
        institutionId,
      },
      relations: {
        enrollCourse: {
          student: true,
        },
        invoice: {
          enrollCourses: {
            student: true,
            course: true,
          },
        },
      },
    })
    if (!paymentEvidenceInstance) {
      throw new NotFoundException(PaymentEvidenceErrorMessage.PAYMENT_EVIDENCE_NOT_FOUND)
    }
    // check if confirmed already
    if (paymentEvidenceInstance.status === PaymentEvidenceStatus.REJECTED) {
      throw new BadRequestException(PaymentEvidenceErrorMessage.PAYMENT_EVIDENCE_ALREADY_REJECTED)
    }
    // update status of evident
    paymentEvidenceInstance.status = PaymentEvidenceStatus.REJECTED
    paymentEvidenceInstance.approverId = user.id
    const paymentEvidence = await this.paymentEvidenceRepository.save(paymentEvidenceInstance)
    await this.createTransactionAfterReject(
      siteId,
      institutionId,
      paymentEvidenceInstance.invoice,
      user,
      paymentEvidenceInstance?.id.toString()
    )

    return plainToInstance(StudentPaymentEvidenceDto, paymentEvidence)
  }

  /**
   * Reject a payment evidence without requiring a receipt
   * @param siteId The ID of the site
   * @param institutionId The ID of the institution
   * @param data The data containing the enroll course ID and proof token
   * @param user The user who is rejecting the payment evidence
   */
  async rejectPaymentWithoutReceipt(
    siteId: number,
    institutionId: number,
    data: ConfirmPaymentWithoutReceiptDTO,
    user: User
  ): Promise<void> {
    // Get the invoice by the proof token
    // Query should be match invoiceId and proofToken since the proofToken possibly duplicated once multiple enrolls
    const invoice = await this.invoiceService.findInvoiceWithIdAndProofToken(
      data.invoiceId,
      data.proofToken
    )
    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }
    const invoiceWithNumberApplicants = {
      ...invoice,
      applicants: invoice.applicants.map((applicant) => applicant.id),
    }

    // Reject the payment evidence
    await this.createTransactionAfterReject(
      siteId,
      institutionId,
      invoiceWithNumberApplicants,
      user,
      // because we don't have payment evidence id, we set authorization code using invoice proof token
      invoice.proofToken
    )
  }

  async createTransactionAfterReject(
    siteId: number,
    institutionId: number,
    invoice: Invoice,
    user: User,
    authorizationCode?: string
  ): Promise<Transaction> {
    const firstEnrollCourse = invoice.enrollCourses.at(0)
    if (!firstEnrollCourse) {
      throw new NotFoundException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }
    invoice.paymentState = PaymentStatus.REJECTED
    invoice.amountPaid = 0

    //get course info
    const course =
      firstEnrollCourse.course ||
      (await this.coursesRepository.findOneById(firstEnrollCourse.courseId, {
        withDeleted: true,
      }))
    firstEnrollCourse.course = course
    // update enrollment's payment state
    await this.enrollCourseRepository.save(firstEnrollCourse)

    await this.invoiceRepository.save(invoice)

    const student =
      firstEnrollCourse.student || (await this.userRepository.findOneById(firstEnrollCourse.userId))
    // create transaction
    const transaction = await this.transactionRepository.create({
      siteId,
      institutionId,
      courseId: firstEnrollCourse.courseId,
      invoiceId: invoice.id,
      status: CheckoutStatus.FAILED,
      paymentLinkId: 'pay_later',
      amountSubtotal: invoice.payAmount,
      amountTotal: invoice.payAmount,
      paymentMethod: PaymentMethod.PAY_LATER,
      customer: {
        name: `${student.firstName} ${student.lastName}`,
        phone: student.phone,
        email: student.email,
      },
      description: invoice.enrollCourses
        .flatMap((ec) => ec.enrollInto?.map((info) => enrollIntoInfoToString(info)))
        .join('\n'),
      authorizationCode,
      transactionId: randomUUID(),
      approverId: user.id,
      approverName: `${user.firstName} ${user.lastName ?? ''}`,
    })

    const newTransaction = await this.transactionRepository.save(transaction)

    // await this.updateInvoiceAfterAction(invoice, PaymentStatus.PENDING, user, false)
    await this.emailService.sendClassStudentPaymentRejectEmail({
      enrollCourse: firstEnrollCourse,
      invoice,
      transaction,
    })

    await this.sendWhatsappPaymentReminder(
      institutionId,
      firstEnrollCourse,
      invoice,
      student,
      'rejected'
    )

    return newTransaction
  }

  @Transactional()
  async resetMultiplePayments(
    resetMultiplePaymentEvidenceResponse: ResetMultiplePaymentEvidenceResponse,
    user: User
  ) {
    const { ids, siteId, institutionId, invoices } = resetMultiplePaymentEvidenceResponse
    const resetPaymentEvidences: StudentPaymentEvidenceDto[] = []
    for (const id of ids || []) {
      const paymentEvidence = await this.resetPayment(id, siteId, institutionId, user)
      resetPaymentEvidences.push(paymentEvidence)
    }

    for (const invoice of invoices || []) {
      await this.resetPaymentWithoutReceipt(invoice, user)
    }

    return resetPaymentEvidences
  }

  async resetPayment(id, siteId, institutionId, user: User): Promise<StudentPaymentEvidenceDto> {
    const paymentEvidenceInstance = await this.paymentEvidenceRepository.findOne({
      where: {
        id,
        siteId,
        institutionId,
      },
      relations: {
        enrollCourse: true,
        invoice: true,
      },
    })
    if (!paymentEvidenceInstance) {
      throw new NotFoundException(PaymentEvidenceErrorMessage.PAYMENT_EVIDENCE_NOT_FOUND)
    }
    // check if confirmed already
    if (paymentEvidenceInstance.status === PaymentEvidenceStatus.PROCESSING) {
      throw new BadRequestException(PaymentEvidenceErrorMessage.PAYMENT_EVIDENCE_ALREADY_PROCESSING)
    }
    // update status of evident
    paymentEvidenceInstance.status = PaymentEvidenceStatus.PROCESSING
    paymentEvidenceInstance.approverId = null
    const paymentEvidence = await this.paymentEvidenceRepository.save(paymentEvidenceInstance)
    // fulfill the payment if evidence is accept

    await this.updateTransactionAfterReset(
      user,
      paymentEvidence.invoice,
      paymentEvidence.id.toString()
    )

    return plainToInstance(StudentPaymentEvidenceDto, paymentEvidence)
  }

  /**
   * Reset payment without receipt
   * @param siteId
   * @param institutionId
   * @param data
   * @param user
   */
  async resetPaymentWithoutReceipt(
    data: ConfirmPaymentWithoutReceiptDTO,
    user: User
  ): Promise<void> {
    // Find invoice by proof token
    const invoice = await this.invoiceService.findInvoiceWithIdOrToken(
      data.invoiceId,
      data.proofToken
    )
    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    const invoiceWithNumberApplicants = {
      ...invoice,
      applicants: invoice.applicants.map((applicant) => applicant.id),
    }

    await this.updateTransactionAfterReset(user, invoiceWithNumberApplicants)

    // Update invoice
    await this.updateInvoiceAfterAction(
      invoiceWithNumberApplicants,
      PaymentStatus.PENDING,
      user,
      false,
      invoice.proofToken
    )
  }

  async deletePaymentEvidence(deletePaymentDto: DeleteMultiplePaymentEvidenceResponse, user: User) {
    const { ids, siteId, institutionId, invoices } = deletePaymentDto
    for (const id of ids || []) {
      await this.deletePayment(id, siteId, institutionId, user)
    }

    for (const invoice of invoices || []) {
      await this.deletePaymentWithoutReceipt(invoice, user)
    }
  }

  async deletePayment(id, siteId, institutionId, user?: User) {
    const paymentEvidenceInstance = await this.paymentEvidenceRepository.findOne({
      where: {
        id,
        siteId,
        institutionId,
      },
      relations: {
        enrollCourse: true,
        invoice: true,
      },
    })
    if (paymentEvidenceInstance) {
      await this.paymentEvidenceRepository.softDelete(paymentEvidenceInstance.id)
    }
  }

  async deleteEnrollCourseWithoutInvoice(enrollCourseId: number) {
    const enrollCourse = await this.enrollCourseRepository.findOneById(enrollCourseId, {
      relations: {
        studentSchedule: {
          studentLessons: true,
        },
      },
    })
    if (!enrollCourse) {
      throw new NotFoundException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }
    const studentSchedules = enrollCourse.studentSchedule
    const studentLessons = studentSchedules.flatMap(
      (studentSchedule) => studentSchedule.studentLessons
    )
    await Promise.all(
      studentLessons.map((lessonLesson) => {
        return this.studentLessonRepository.softDelete(lessonLesson.id)
      })
    )
    await Promise.all(
      studentSchedules.map((studentSchedule) =>
        this.studentScheduleRepository.softDelete(studentSchedule.id)
      )
    )
    await this.paymentEvidenceRepository.softDelete({
      enrollCourseId,
    })
    if (!enrollCourse.invoice) {
      await this.enrollCourseRepository.softDelete(enrollCourse.id)
    }
  }

  async deletePaymentWithoutReceipt(
    data: ConfirmDeletePaymentWithoutReceiptDTO,
    user: User
  ): Promise<void> {
    // Find invoice by proof token
    try {
      const invoice = await this.invoiceService.findInvoiceWithIdOrToken(
        data.invoiceId,
        data.proofToken
      )
      await this.deletePaymentWithInvoice(invoice)
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(error.message)
      }
    }
  }

  async deletePaymentWithInvoice(invoice: StudentInvoiceResponseDto) {
    const { id: invoiceId, enrollCourses } = invoice

    // Check for each enroll course individually if it will have any remaining invoices
    // after deleting this invoice. Only delete enroll courses that will have 0 invoices.
    const enrollCourseIdsToDelete: number[] = []
    for (const enrollCourse of enrollCourses) {
      // Count invoices for this specific enroll course, excluding the current invoice being deleted
      const remainingInvoiceCount = await this.invoiceRepository.count({
        where: {
          enrollCourses: { id: enrollCourse.id },
          deletedAt: IsNull(),
          id: Not(invoiceId), // Exclude the current invoice being deleted
        },
      })

      // If this enroll course will have no invoices after deletion, mark it for deletion
      if (remainingInvoiceCount === 0) {
        enrollCourseIdsToDelete.push(enrollCourse.id)
      }
    }

    const studentSchedules = await this.studentScheduleRepository.find({
      where: {
        invoiceId,
      },
      relations: {
        studentLessons: true,
      },
    })
    const studentLessons = studentSchedules.flatMap(
      (studentSchedule) => studentSchedule.studentLessons
    )
    // Delete all student lesson

    for (const lesson of studentLessons) {
      await this.studentLessonRepository.softDelete({
        id: lesson.id,
      })
    }
    // Delete student schedules
    await this.studentScheduleRepository.softDelete({
      invoiceId,
    })

    // Remove invoices
    await this.paymentEvidenceRepository.softDelete({
      invoiceId,
    })
    await this.invoiceRepository.softDelete({
      id: invoiceId,
    })

    await this.requestTimeChangeRepository.softDelete({
      studentLessonId: In(studentLessons.map((lesson) => lesson.id)),
    })

    // Delete promotion records for this invoice
    await this.invoicePromotionUsedRepository.softDelete({
      invoiceId: invoice.id,
    })
    try {
      // Only delete enroll courses that will have no remaining invoices
      if (enrollCourseIdsToDelete.length > 0) {
        await this.enrollCourseRepository.softDelete({
          id: In(enrollCourseIdsToDelete),
        })
      }
    } catch (error) {
      // If error is instanceof EntityNotFoundError The enroll course already deleted, so do not doing anything
      if (!(error instanceof EntityNotFoundError)) {
        throw new InternalServerErrorException(error.message)
      }
    }
  }

  /**
   * Update transaction after resetting payment without receipt
   * @param enrollCourseId Enrollment course ID
   * @param user User who made the payment
   * @param invoice Invoice object
   * @param transaction Transaction object
   * @returns Updated transaction object
   */
  async updateTransactionAfterReset(
    user: User,
    invoice: Invoice,
    authorizationCode?: string
  ): Promise<Transaction> {
    if (invoice.enrollCourses && invoice.enrollCourses.length > 0) {
      for (const enrollCourse of invoice.enrollCourses) {
        enrollCourse.confirmState = EnrollConfirmStatus.PENDING
        await this.enrollCourseRepository.save(enrollCourse)
      }
    }
    const transaction = await this.transactionRepository.findOne({
      where: {
        authorizationCode,
      },
    })
    if (!transaction) {
      throw new NotFoundException(
        InvoiceErrorMessage.INVOICE_NOT_FOUND + ': can not find invoice relate to this enroll'
      )
    }
    // Update transaction status to PROCESSING
    transaction.status = CheckoutStatus.PROCESSING
    // Remove approver info
    transaction.approverId = null
    transaction.approverName = null

    const saved = await this.transactionRepository.save(transaction)

    if (!invoice) {
      throw new NotFoundException(
        InvoiceErrorMessage.INVOICE_NOT_FOUND + ': can not find invoice relate to this enroll'
      )
    }
    // Update invoice after payment action (e.g. approve payment, reject payment, or reset payment.)
    await this.updateInvoiceAfterAction(invoice, PaymentStatus.PENDING, user, false)

    return saved
  }

  /**
   * Update invoice after payment action (e.g. approve payment, reject payment, or reset payment.)
   * @param invoice Invoice object
   * @param status Payment status
   * @param user User who made the payment
   * @param reviewed Whether the payment is reviewed or not
   * @param transactionId Transaction ID
   * @returns Updated invoice object
   */
  async updateInvoiceAfterAction(
    invoice: Invoice,
    status: PaymentStatus,
    user: User,
    reviewed = false,
    transactionId?: string
  ): Promise<Invoice> {
    // update invoice's payment state
    const invoiceRepository = this.invoiceService.getRepository()
    invoice.paymentState = status
    if (status === PaymentStatus.PAID) {
      invoice.amountPaid = invoice.payAmount ?? 0
    }
    invoice.reviewed = reviewed
    invoice.approvedBy = `${user.firstName} ${user.lastName}`
    invoice.approverId = user.id
    if (transactionId) {
      invoice.transactionId = transactionId
    }
    // Add credit for referral discount
    const referralDiscount = (invoice.adminDiscounts ?? []).find(
      (discount) => discount.type === PromotionTypeDto.REFERRAL
    )
    if (referralDiscount) {
      let targetUserAliasId: number
      if (referralDiscount.parentId) {
        targetUserAliasId = referralDiscount.parentId
      } else if (referralDiscount.studentId) {
        targetUserAliasId = referralDiscount.studentId
      } else if (invoice.isCombined && invoice.userAliasId) {
        targetUserAliasId = invoice.userAliasId
      }
      if (targetUserAliasId) {
        const recipient = await this.userAliasesRepository.findOneBy({
          id: targetUserAliasId,
        })
        if (recipient) {
          await this.creditManagementService.addCredit(invoice.institutionId, {
            institutionId: invoice.institutionId,
            amount: referralDiscount.parentCredit,
            userAliasId: recipient.id,
            sourceType: CreditSourceType.REFERRAL,
            description: `Referral discount for invoice ${invoice.id}`,
          })
        }
      }
    }
    // if current invoice is child invoice, update the parent invoice if all of its child invoices are paid
    // If this is a child invoice, recompute parent state based on all children (including current)
    if (invoice.invoiceParentId) {
      const allChildren = await invoiceRepository.find({
        where: { invoiceParentId: invoice.invoiceParentId },
      })
      const isAllPaid = allChildren.every((child) =>
        child.id === invoice.id
          ? status === PaymentStatus.PAID
          : child.paymentState === PaymentStatus.PAID
      )
      const isAnyPaid = allChildren.some((child) =>
        child.id === invoice.id
          ? status === PaymentStatus.PAID
          : child.paymentState === PaymentStatus.PAID
      )
      const parentInvoice = await invoiceRepository.findOneBy({ id: invoice.invoiceParentId })
      if (parentInvoice) {
        if (isAllPaid) {
          parentInvoice.paymentState = PaymentStatus.PAID
          parentInvoice.amountPaid = parentInvoice.payAmount ?? 0
        } else if (isAnyPaid) {
          parentInvoice.paymentState = PaymentStatus.PARTIALLY_PAID
        } else {
          parentInvoice.paymentState = PaymentStatus.PENDING
        }
        await invoiceRepository.save(parentInvoice)
      }
    }

    // Save the updated invoice
    return await invoiceRepository.save(invoice)
  }

  collectInvoicesByIds(invoiceIds: number[]) {
    return this.invoiceRepository.find({
      where: {
        id: In(invoiceIds),
      },
      relations: {
        course: true,
        enrollCourses: {
          course: true,
          studentSchedule: {
            studentLessons: true,
          },
          multipleClassMapping: {
            class: {
              locationRoom: true,
              instructor: true,
            },
          },
        },
        site: true,
        institution: true,
        userAlias: {
          parentUserAlias: true,
        },
        user: true,
      },
    })
  }

  async sendWaPaymentReminder(payload: SendPaymentProofReminderDTO) {
    const customMessage = await this.customMessageService.getCustomMessageByType(
      payload.institutionId,
      SupportedType.STUDENT_NOTIF_AFTER_ENROLLMENT_SUBMITTED
    )
    if (!customMessage) {
      throw new NotFoundException(WhatsappTemplateErrorMessage.TEMPLATE_NOT_FOUND)
    }
    const invoices = await this.collectInvoicesByIds(payload.invoices.map((d) => d.invoiceId))

    const site = await this.sitesRepository.findOneById(invoices[0].siteId)

    for (const invoice of invoices) {
      const jobData = await this.buildSendingUploadReceiptMassage(invoice, site)
      const enrollCourse = invoice.enrollCourses.at(0)
      const { user, userAlias } = await this.useStudentOrParentUserAlias(payload, invoice)
      jobData['studentEmail'] = userAlias?.email ?? enrollCourse.preferredEmail
      jobData['studentName'] = enrollCourse.preferredName
      jobData['studentPhone'] = user?.phone ?? enrollCourse.preferredPhone

      const contentToBeReplaced =
        payload.content && payload.content !== '' ? payload.content : customMessage.content || ''

      const content = replaceContentVariables(contentToBeReplaced, jobData)

      await this.whatsappWebService.sendWhatsappMessage(
        {
          content,
          institutionId: payload.institutionId,
          phone: jobData['studentPhone'],
        },
        {
          invoiceMetadata: {
            invoiceId: invoice?.id,
          },
          recipientUserId: user?.id ?? enrollCourse?.userId,
          recipientUserPhone: jobData['studentPhone'],
          institutionId: payload.institutionId,
          siteId: invoice.siteId,
        }
      )
    }
  }

  async useStudentOrParentUserAlias(payload: SendPaymentProofReminderDTO, invoice: Invoice) {
    const isSendToParent = payload.invoices.find((d) => d.invoiceId === invoice.id)?.isSendToParent
    if (isSendToParent && invoice.userAlias?.parentUserAlias) {
      const parentUser = await this.userRepository.findOneById(
        invoice.userAlias.parentUserAlias.userId
      )
      return {
        user: parentUser,
        userAlias: invoice.userAlias.parentUserAlias,
      }
    }
    return {
      user: await this.userRepository.findOneById(invoice.userId),
      userAlias: invoice.userAlias,
    }
  }

  async sendMailPaymentReminder(payload: SendPaymentProofReminderDTO) {
    const invoices = await this.collectInvoicesByIds(payload.invoices.map((d) => d.invoiceId))
    for (const invoice of invoices) {
      // const transaction = invoice.transactionId
      //   ? await this.transactionRepository.findOneById(invoice.transactionId)
      //   : null
      await this.emailService.sendClassStudentUploadReceiptEmail(invoice.enrollCourses, invoice)
    }
  }

  async sendWhatsappSuccessPaymentReminder(payload: SendPaymentProofReminderDTO) {
    const customMessage = await this.customMessageService.getCustomMessageByType(
      payload.institutionId,
      SupportedType.STUDENT_NOTIF_AFTER_PAYMENT_APPROVED
    )
    if (!customMessage) {
      throw new NotFoundException(WhatsappTemplateErrorMessage.TEMPLATE_NOT_FOUND)
    }
    const invoices = await this.collectInvoicesByIds(payload.invoices.map((d) => d.invoiceId))
    const institution = await this.institutionsRepository.findOneById(payload.institutionId, {
      relations: {
        site: true,
      },
    })
    if (!institution) {
      throw new NotFoundException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }
    const timeZone = await this.settingSiteService.getTimeZone(institution.siteId)
    const site = await this.sitesRepository.findOneById(institution.siteId)
    for (const invoice of invoices) {
      const applicants = await this.userRepository.find({
        where: {
          id: In(invoice.applicants),
        },
      })

      const applicantsData: StudentData[] = applicants.map((applicant) => ({
        id: applicant.id,
        studentName: applicant.firstName + ' ' + applicant.lastName,
        email: applicant.email,
        phoneNumber: applicant.phone,
      }))

      const enrollCourses = invoice.enrollCourses

      const enrollCourseStudentSchedules = enrollCourses.flatMap((ec) => ec.studentSchedule)

      const multipleClassMapping = enrollCourses.flatMap((ec) => ec.multipleClassMapping ?? [])

      let classDateTime = ''
      if (enrollCourseStudentSchedules && enrollCourseStudentSchedules.length > 0) {
        const studentScheduleWithUserAlias =
          await this.emailService.getStudentScheduleWithUserAlias(
            payload.institutionId,
            enrollCourseStudentSchedules
          )
        classDateTime = studentScheduleToString(
          studentScheduleWithUserAlias,
          timeZone,
          multipleClassMapping
        )
      }
      const successPaymentLink = buildSuccessPaymentLink({
        institution,
        invoice,
        enrollCourse: enrollCourses.at(0),
        site,
      })

      const contactEmail = institution.email ?? site.email
      const contactPhone = institution.phone ?? site.phone
      const classNames = multipleClassMapping.map((mapping) => mapping.class?.name).join('\n')

      const classLocations = multipleClassMapping
        .map((mapping) => mapping.class?.locationRoom?.address)
        .join('\n')

      const classInstructors = multipleClassMapping
        .map(
          (mapping) =>
            mapping.class?.instructor?.firstName + ' ' + mapping.class?.instructor?.lastName
        )
        .join('\n')
      const { user, userAlias } = await this.useStudentOrParentUserAlias(payload, invoice)
      const jobData = {
        emailAddress: userAlias.email ?? enrollCourses.at(0)?.preferredEmail,
        studentName: enrollCourses.at(0)?.preferredName,
        studentPhone: user?.phone ?? enrollCourses.at(0)?.preferredPhone,
        institutionName: institution.name,
        adminEmail: contactEmail,
        adminPhone: contactPhone,
        courseName: invoice.course.name,
        className: classNames,
        classDateTime,
        location: classLocations,
        instructor: classInstructors,
        enrolId: enrollCourses.at(0)?.id.toString(),
        timeZone,
        paymentAmount: invoice.payAmount,
        paymentMethod: invoice.paymentMethod,
        paymentStatus: invoice.paymentState,
        successPaymentLink,
      }

      const listApplicants =
        (applicantsData?.length || 0) > 1 ? applicantsData : applicantsData.slice(0, 1)

      listApplicants.forEach(async (applicant, index) => {
        const notifSetting = await this.studentNotifSettingService.getByStudentAndType(
          applicant.id,
          payload.institutionId,
          SupportedType.STUDENT_NOTIF_AFTER_PAYMENT_APPROVED
        )
        if (notifSetting && !notifSetting.whatsapp) return

        if (index === 0) {
          jobData.studentPhone = user.phone
          jobData.studentName = user.firstName + ' ' + user.lastName
        } else {
          jobData.studentName = applicant.studentName
          jobData.studentPhone = applicant.phoneNumber
        }

        const content = replaceContentVariables(customMessage.content, jobData)

        await this.whatsappWebService.sendWhatsappMessage(
          {
            content,
            institutionId: payload.institutionId,
            phone: jobData.studentPhone,
          },
          {
            invoiceMetadata: {
              invoiceId: invoice?.id,
            },
            recipientUserId: user?.id ?? applicant.id,
            recipientUserPhone: user?.phone ?? applicant.phoneNumber,
            institutionId: payload.institutionId,
            siteId: invoice.siteId,
          }
        )
      })
    }
  }

  async sendSuccessPaymentReminder(payload: SendPaymentProofReminderDTO) {
    const invoices = await this.collectInvoicesByIds(payload.invoices.map((d) => d.invoiceId))

    const emailPromises = invoices.map(async (invoice) => {
      try {
        // First check if the transaction ID is a valid uuid

        const [transaction, user] = await Promise.all([
          invoice.transactionId && isUUID(invoice.transactionId)
            ? this.transactionRepository.findOneBy({
                transactionId: invoice.transactionId,
              })
            : Promise.resolve(null),
          this.userRepository.findOneBy({
            id: invoice.userId,
          }),
        ])

        if (!user) {
          return {
            invoiceId: invoice.id,
            status: 'failed',
            error: `User with id ${invoice.userId} not found`,
          }
        }

        const applicantsData: StudentData[] = [
          {
            id: user.id,
            studentName: user.firstName + ' ' + user.lastName,
            email: user.email,
            phoneNumber: user.phone,
          },
        ]
        const { user: userTemp, userAlias } = await this.useStudentOrParentUserAlias(
          payload,
          invoice
        )
        const userAliasEmail = userAlias?.email
        const firstEnrollCourse = invoice.enrollCourses.at(0)
        const invoiceEmail = firstEnrollCourse?.preferredEmail

        if (
          !!userAliasEmail &&
          !!invoiceEmail &&
          userAliasEmail !== '' &&
          invoiceEmail !== '' &&
          invoiceEmail !== userAliasEmail
        ) {
          const enrollCourseWithChangedEmail = firstEnrollCourse
          enrollCourseWithChangedEmail.preferredEmail = userAliasEmail
          applicantsData[0].email = userAliasEmail
        }

        await this.emailService.sendClassStudentPaymentConfirmedEmail({
          invoice,
          transaction,
          applicants: applicantsData,
        })

        return {
          invoiceId: invoice.id,
          userId: userTemp?.id ?? user.id,
          email: userAliasEmail,
          status: 'success',
        }
      } catch (error) {
        console.error(`Failed to send payment confirmation email for invoice ${invoice.id}:`, error)
        return {
          invoiceId: invoice.id,
          status: 'failed',
          error: error.message,
        }
      }
    })

    const results = await Promise.allSettled(emailPromises)

    let successful = 0
    let failed = 0

    const details = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.status === 'success') {
          successful++
        } else {
          failed++
        }
        return result.value
      } else {
        failed++
        return {
          invoiceId: invoices[index].id,
          status: 'failed',
          error: result.reason?.message || 'Unknown error',
        }
      }
    })

    const summary = {
      total: invoices.length,
      successful,
      failed,
      details,
    }

    console.log('Payment confirmation emails summary:', {
      total: summary.total,
      successful: summary.successful,
      failed: summary.failed,
    })

    return summary
  }

  async sendQrCode(payload: SendPaymentProofReminderDTO) {
    const invoices = await this.collectInvoicesByIds(payload.invoices.map((d) => d.invoiceId))
    for (const invoice of invoices) {
      // const applicants = await this.userRepository.find({
      //   where: {
      //     id: In(invoice.applicants),
      //   },
      // })
      const user = await this.userRepository.findOneBy({
        id: invoice.userId,
      })

      if (!user) {
        console.warn(`User with id ${invoice.userId} not found for invoice ${invoice.id}`)
        continue
      }
      const applicantsData: StudentData[] = [
        {
          id: user.id,
          studentName: user.firstName + ' ' + user.lastName,
          email: user.email,
          phoneNumber: user.phone,
        },
      ]
      const { userAlias } = await this.useStudentOrParentUserAlias(payload, invoice)
      await this.emailService.sendClassStudentPaymentConfirmedEmail({
        userAlias,
        invoice,
        applicants: applicantsData,
      })
    }
  }

  async buildSendingUploadReceiptMassage(invoice: Invoice, site: Site): Promise<any> {
    const institution = invoice.institution
    const course = invoice.course

    const invoiceWithClasses = await this.invoiceRepository.findOne({
      where: {
        id: invoice.id,
      },
      select: {
        studentSchedules: {
          id: true,
          class: {
            id: true,
            name: true,
          },
          studentLessons: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      relations: {
        studentSchedules: {
          class: true,
          studentLessons: true,
        },
      },
    })

    const classNames = invoiceWithClasses?.studentSchedules?.map((d) => d.class?.name).join(', ')
    const classDateTime = invoiceWithClasses?.studentSchedules?.map((d) =>
      d.studentLessons.map((d) => d.startTime + ' - ' + d.endTime).join('\n')
    )

    const uploadPaymentUrl = buildUploadReceiptLink({
      institution,
      invoice,
      customDomain: site.customDomain,
      siteUrl: site.url,
      coursePath: invoice.course?.path,
    })

    const location = addressObjectToString(institution.address)
    const price = `${invoice.currency} ${invoice.payAmount}`
    const timeZoneOffset = await this.settingSiteService.getTimeZoneOffset(invoice.siteId)
    const timeZone = offsetToISO(timeZoneOffset * 60)
    return {
      ...invoice,
      priceWithCurrency: price,
      location,
      uploadPaymentUrl,
      paymentAmount: invoice.payAmount,
      timeZone,
      courseName: course.name,
      className: classNames,
      classDateTime,
      paymentStatus: invoice.paymentState,
      institutionName: institution.name,
      recipientUserId: invoice.userId,
      adminName: institution.name,
      adminEmail: institution.email,
      adminPhone: institution.phone,
      contentVariables: {},
      associatedClass: invoice?.studentSchedules?.map((d) =>
        shallow({
          source: d.class,
          fields: ['id', 'name'],
        })
      ),
    }
  }

  async sendPaymentProofReminder(payload: SendPaymentProofReminderDTO, user: User) {
    switch (payload.action) {
      case SendPaymentActions.SEND_MAIL_REMINDER:
        return this.sendMailPaymentReminder(payload)
      case SendPaymentActions.SEND_WA_REMINDER:
        return this.sendWaPaymentReminder(payload)
      case SendPaymentActions.SEND_SUCCESS_PAYMENT:
        return this.sendSuccessPaymentReminder(payload)
      case SendPaymentActions.SEND_WA_SUCCESS_PAYMENT:
        return this.sendWhatsappSuccessPaymentReminder(payload)
      case SendPaymentActions.SEND_QR_CODE:
        return this.sendQrCode(payload)
      default:
        throw new BadRequestException(PaymentEvidenceErrorMessage.INVALID_SEND_ACTION)
    }
  }
}
