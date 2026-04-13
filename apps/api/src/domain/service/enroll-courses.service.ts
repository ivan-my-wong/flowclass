/* eslint-disable simple-import-sort/imports */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { randomUUID } from 'crypto'
import { utcToZonedTime } from 'date-fns-tz'
import * as dayjs from 'dayjs'
import Stripe from 'stripe'
import { Between, FindOptionsOrder, FindOptionsWhere, ILike, In, Repository } from 'typeorm'
import { Transactional } from 'typeorm-transactional'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import {
  EnrollCourseOptionDto,
  EnrollCoursePageDto,
} from '@/application/admin/enroll-courses/dto/enroll-course-pagination.dto'
import {
  EnrolledClassCountDTO,
  EnrollmentRecordDTO,
} from '@/application/admin/enroll-courses/dto/enrollmentRecord.dto'
import { PromotionType as PromotionTypeDto } from '@/application/admin/invoice-campaign/dto/send-invoice.dto'
import { CreateRecordLogDto } from '@/application/admin/record-log/dto/create-record-log.dto'
import { CreateProductDto } from '@/application/admin/stripe-connect/dto/create-product.dto'
import { StudentConfirmStateEnrollCourseDto } from '@/application/student/enroll-courses/dto/confirm-state-enroll-course.dto'
import {
  MetaRef,
  PayNowResponse,
  StudentClassInfo,
  StudentConfirmEnrollDto,
  StudentCreateEnrollCourseDto,
  StudentData,
  StudentEnrollCoursePricingInfo,
  StudentEnrollCourseResponse,
  StudentMetaRefExtended,
  StudentMultipleClassInfo,
  StudentPeriodLessonDto,
} from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import {
  StudentApplicantsAdditionalFeeDto,
  StudentEnrollCourseOptionDto,
  StudentEnrollCoursePageDto,
} from '@/application/student/enroll-courses/dto/enroll-course-pagination.dto'
import {
  StudentReCreateStripeClientSecretDto,
  StudentUpdateEnrollCourseMetaDto,
  UpdateInvoicePaymentDto,
} from '@/application/student/enroll-courses/dto/update-enroll-course.dto'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { EmailService } from '@/domain/external/email.service'
import { ClassLessonService } from '@/domain/service/class-lesson.service'
import { TrialLessonService } from '@/domain/service/trial-lesson.service'
import { AuthorizationException } from '@/exceptions/authorization.exception'
import { CourseErrorMessage, EnrollCourseErrorMessage } from '@/exceptions/error-message/course'
import { InvoiceErrorMessage } from '@/exceptions/error-message/invoice'
import { PromotionErrorMessage } from '@/exceptions/error-message/promotion'
import { StripeErrorMessage } from '@/exceptions/error-message/stripe'
import { UserErrorMessage } from '@/exceptions/error-message/user'
import { ClassLesson } from '@/models/class-lessons.entity'
import { ClassPriceOption } from '@/models/class-price-options.entity'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { Coupon } from '@/models/coupons.entity'
import { Course, CustomField } from '@/models/courses.entity'
import {
  ClassAdminNewRegistrationEmailParams,
  EnrolledCourseReminderDto,
} from '@/models/custom-types/email-params'
import {
  EnrollmentForm,
  ReminderDataType,
  StudentEnrollCourseAlias,
} from '@/models/custom-types/enroll-course'
import { LessonString } from '@/models/custom-types/lesson-string'
import { CreatePaymentLinkReturnType, StripeClientSecretType } from '@/models/custom-types/stripe'
import { EnrollClassMapping, EnrollCourse, EnrollIntoInfo } from '@/models/enroll-courses.entity'
import {
  EnrollClassMappingRepository,
  EnrollCourseRepository,
} from '@/models/enroll-courses.repository'
import {
  AdditionalFeeConditions,
  ClassTypeEnum,
  PaymentMethod,
  PriceType,
  PromotionType as PromotionTypeEnum,
  RecordLogType,
  STRIPE_CURRENCY,
  StripeCheckoutSessionType,
  WeekDayEnum,
} from '@/models/enums/'
import {
  CheckoutStatus,
  EnrollConfirmStatus,
  EnrollCourseSteps,
  PaymentStatus,
  PromotionUsedStatus,
} from '@/models/enums/status'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { Invoice } from '@/models/invoice.entity'
import { InvoicePromotionUsedRepository } from '@/models/invoice-promotion-used.repository'
import { InvoiceRepository } from '@/models/invoice.repository'
import { LocationRoom } from '@/models/location-room.entity'
import { RecordLog } from '@/models/record-log.entity'
import { RepeatFormatsRepository } from '@/models/repeat-formats.entity'
import { StudentForm } from '@/models/student-form.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentNotificationSettingRepository } from '@/models/student-notification-setting.entity'
import { StudentScheduleType } from '@/models/student-schedule.entity'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { TransactionRepository } from '@/models/transaction.repository'
import { ClassTrialLesson } from '@/models/trial-lesson.entity'
import { ClassTrialLessonRepository } from '@/models/trial-lesson.repository'
import { UserAlias } from '@/models/user-aliases.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UserRole } from '@/models/user-role.entity'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { User } from '@/models/user.entity'
import { UsersRepository } from '@/models/users.repository'
import { SSEService } from '@/modules/sse/sse.service'
import { calculateClassPrice } from '@/utils/courses.utils'
import { buildSuccessPaymentLink, buildUploadReceiptLink } from '@/utils/payment-link.utils'
import { replaceContentVariables, shallow } from '@/utils/shallow.utils'
import {
  addressObjectToString,
  enrollIntoInfoToString,
  lessonObjectToString,
  studentLessonArrayToString,
  transformEmail,
  transformPhone,
} from '@/utils/string.utils'
import { calculateBillingEndDate, calculateBillingNextDate, sortASC } from '@/utils/time.utils'
import { isIsoDate } from '@/utils/validate/validate.utils'

import {
  CreateCheckoutSessionParams,
  StripeConnectService,
} from '../external/stripe-connect.service'

import { CreditSourceType } from '@/models/credit-transactions.entity'
import { AuthService } from './auth.service'
import { BundleDiscountsService } from './bundle-discounts.service'
import { ClassPriceOptionService } from './class-price-option.service'
import { CouponsService } from './coupons.service'
import { RecurringSchedulesService } from './course-recurring-schedules.service'
import { CoursesService } from './courses.service'
import { CreditManagementService } from './credit-management.service'
import { CustomMessageService } from './custom-message.service'
import { InvoiceService } from './invoice.service'
import { NotificationRecordService } from './notification-log.service'
import { PaymentService } from './payment.service'
import { RegularPeriodsService } from './regular-periods.service'
import { SettingSiteService } from './setting-site.service'
import { UsersService } from './users.service'
import { WhatsappWebService } from './whatsapp-web.service'

/**
 * Service responsible for handling enrollment of courses.
 * @class EnrollCoursesService
 */
/**
 * Handles the enrollment flow for creating a new enrollment record.
 * This function is triggered when a user initiates the enrollment process.
 * It performs various validations, retrieves related data, checks seat availability,
 * validates the schedule, calculates the price, and creates the enrollment record.
 *
 * @param createEnrollCourseDto - The DTO containing the enrollment details.
 * @param currentUser - The current user initiating the enrollment.
 * @param course - The course for which the user is enrolling.
 * @returns A promise that resolves to an StudentEnrollCourseResponse or PayNowResponse object,
 *          representing the enrollment record or payment link, respectively.
 * @throws BadRequestException if the class is full or there is a duplicate enrollment record.
 */
@Injectable()
export class EnrollCoursesService {
  private readonly jwtOption: JwtSignOptions = {}

  constructor(
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly enrollClassMappingRepository: EnrollClassMappingRepository,
    private readonly invoicePromotionUsedRepository: InvoicePromotionUsedRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly classLessonService: ClassLessonService,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly classRepository: ClassRepository,
    private readonly regularPeriodsService: RegularPeriodsService,
    private readonly couponsService: CouponsService,
    private readonly stripeConnectService: StripeConnectService,
    private readonly invoiceService: InvoiceService,
    private readonly settingSiteService: SettingSiteService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly institutionRepository: InstitutionsRepository,
    private readonly coursesService: CoursesService,
    private readonly jwtService: JwtService,
    private readonly paymentService: PaymentService,
    private readonly bundleDiscountsService: BundleDiscountsService,
    private readonly recurringSchedulesService: RecurringSchedulesService,
    private readonly studentScheduleRepository: StudentScheduleRepository,
    private readonly repeatFormatsRepository: RepeatFormatsRepository,
    private readonly userRepository: UsersRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly userAliasesRepository: UserAliasesRepository,
    private readonly userRoleRepository: UserRolesRepository,
    private readonly logger: CloudWatchLoggerProvider,
    private readonly trialLessonService: TrialLessonService,
    private readonly sseService: SSEService,
    @InjectRepository(RecordLog)
    private readonly recordLogRepository: Repository<RecordLog>,
    @InjectRepository(StudentForm)
    private readonly studentFormRepository: Repository<StudentForm>,
    private readonly customMessageService: CustomMessageService,
    private readonly whatsappWebService: WhatsappWebService,
    private readonly notificationRecordService: NotificationRecordService,
    private readonly studentNotificationSettingRepository: StudentNotificationSettingRepository,
    private readonly classTrialLessonRepository: ClassTrialLessonRepository,
    private readonly classPriceOptionService: ClassPriceOptionService,
    private readonly creditManagementService: CreditManagementService
  ) {
    this.jwtOption = {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    }
  }

  async addNewScheduleToEnrollment(
    // ID means enroll ID
    id: number,
    updateEnrollCourseDto: StudentUpdateEnrollCourseMetaDto,
    students: User[],
    course: Course,
    recurringScheduleId?: number,
    addRecordLog = true
  ): Promise<{ enrollCourseInstance: EnrollCourse; invoice: Invoice }> {
    // Make sure first item of students is first applicant
    const dto = new StudentConfirmEnrollDto()
    dto.price = updateEnrollCourseDto.meta.lessonPrice
    dto.lessonCount = updateEnrollCourseDto.meta.lessonCount
    dto.numOfApplicant = students.length
    const firstApplicant = students[0]
    const enrollCourseRecord = await this.enrollCourseRepository.findOne({
      where: { id },
      relations: {
        studentSchedule: {
          class: {
            locationRoom: true,
            instructor: true,
          },
          recurringSchedule: true,
        },
      },
    })

    if (!enrollCourseRecord) {
      throw new NotFoundException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }

    const enrollCourseInstance = plainToInstance(EnrollCourse, {
      ...enrollCourseRecord,
      ...shallow({
        source: updateEnrollCourseDto,
        fields: Object.keys(updateEnrollCourseDto).filter((key) => key !== 'enrollInto'),
      }),
      enrollInto: [updateEnrollCourseDto.enrollInto],
    })
    // update the invoice associated with the enroll record
    const pricingInfo = await this.paymentService.calculateDiscountedPrice({
      dto,
      meta: updateEnrollCourseDto.meta,
      priceType: updateEnrollCourseDto?.meta?.pickedClass?.priceType ?? PriceType.PER_LESSON,
    })
    if (pricingInfo.paymentAmount) {
      enrollCourseInstance.paymentAmount = pricingInfo.paymentAmount
    }

    const token = this.jwtService.sign(
      {
        email: firstApplicant.email,
      },
      this.jwtOption
    )

    const invoice = await this.invoiceService.createInvoice({
      enrollCourseInstances: [enrollCourseInstance],
      paymentMethod:
        (updateEnrollCourseDto.paymentMethod as PaymentMethod) ?? PaymentMethod.PAY_LATER,
      token,
      clientSecretId: 'pay_later',
      course,
      currentUser: firstApplicant,
      pricingInfo,
    })

    // Set invoice_id on enroll course instance (only if invoiceId is null to prevent overwriting)
    if (!enrollCourseInstance.invoiceId) {
      enrollCourseInstance.invoiceId = invoice.id
    }

    let paymentLink: Stripe.Response<Stripe.PaymentLink>
    if (invoice.paymentMethod === PaymentMethod.PAY_NOW) {
      const stripePaymentLink = await this.stripeConnectService.getPaymentLink(
        invoice.paymentLinkId
      )

      if (stripePaymentLink && invoice.originalFee === pricingInfo.paymentAmount) {
        invoice.paymentLinkId = stripePaymentLink.id
      } else {
        const createProductDto: CreateProductDto = {
          name: course.name,
          unitAmount: pricingInfo.paymentAmount,
          currency: pricingInfo.currency,
        }
        const product = await this.stripeConnectService.createProduct(course, createProductDto)

        paymentLink = await this.stripeConnectService.createPaymentLink(
          course,
          firstApplicant,
          product.default_price.id,
          StripeCheckoutSessionType.ENROLL_COURSE,
          enrollCourseInstance.enrollInto?.map((info) => enrollIntoInfoToString(info)).join('\n'),
          updateEnrollCourseDto.redirectUrl.toString()
        )

        invoice.paymentLinkId = paymentLink.id
      }
    }
    await this.invoiceRepository.save(invoice)

    await this.enrollCourseRepository.save(enrollCourseInstance)

    // Get the last item in the array
    const lastStudentSchedule = enrollCourseInstance.studentSchedule.pop()
    const scheduleDto = await this.getStudentSchedule(
      course,
      updateEnrollCourseDto.meta,
      enrollCourseInstance.id,
      invoice.id
    )
    scheduleDto.recurringScheduleId = recurringScheduleId

    await this.studentScheduleRepository.save(scheduleDto)

    const userAlias = await this.userAliasesRepository.findBy({
      userId: firstApplicant.id,
      institutionId: enrollCourseInstance.institutionId,
    })

    const studentAliases: StudentEnrollCourseAlias[] = students.map((student) => {
      const userAliasObject = userAlias.find((alias) => alias.userId === student.id)

      return {
        studentAccount: student,
        userAliasId: userAliasObject ? userAliasObject.id : null,
        name: student.fullName,
        phone: student.phone,
        email: student.email,
        token: invoice.proofToken,
        createdPassword: student.password,
      }
    })

    if (lastStudentSchedule.class?.type === ClassTypeEnum.RECURRING) {
      await this.recurringSchedulesService.removeStudentLessonsByClassId(
        lastStudentSchedule.classId,
        firstApplicant.id
      )

      const enrolledClassLessonDates = await this.classLessonService.createLessonToClassLessonTable(
        {
          siteId: enrollCourseInstance.siteId,
          lessonSchedules: await this.recurringSchedulesService.getSingleClassRecurringLessons(
            updateEnrollCourseDto.meta.pickedFirstDate,
            recurringScheduleId,
            updateEnrollCourseDto.meta.lessonCount,
            invoice.siteId,
            course.institutionId
          ),
          classId: lastStudentSchedule.classId,
          courseId: course.id,
          institutionId: enrollCourseInstance.institutionId,
        }
      )
      const classTrialLesson = await this.classTrialLessonRepository.findOne({
        where: {
          classId: lastStudentSchedule.classId,
          trialLesson: {
            enabled: true,
          },
        },
        relations: {
          trialLesson: true,
        },
      })
      await this.createStudentLessonsFromClassLessons(
        scheduleDto,
        enrolledClassLessonDates,
        students.map((d) => ({
          id: d.id,
          studentName: d.fullName,
          email: d.email,
          phoneNumber: d.phone,
          createAnAccount: false,
        })),
        studentAliases,
        enrollCourseInstance,
        lastStudentSchedule.classId,
        classTrialLesson
      )
      const index = enrolledClassLessonDates.length - 1
      if (addRecordLog)
        this.recordLogRepository.save(
          this.recordLogRepository.create({
            type: RecordLogType.ADDING_CLASS,
            institutionId: enrollCourseInstance.institutionId,
            detail: {
              classId: lastStudentSchedule.classId,
              className: enrollCourseInstance.enrollInto
                ?.map((info) => enrollIntoInfoToString(info))
                .join('\n'),
              courseName: course.name,
              educatorFirstName: firstApplicant.firstName,
              educatorLastName: firstApplicant.lastName,
              educatorId: firstApplicant.id,
              studentFirstName: firstApplicant.firstName,
              studentLastName: firstApplicant.lastName,
              firstLessonDate: enrolledClassLessonDates[0].changeStartTime
                ? enrolledClassLessonDates[0].changeStartTime
                : enrolledClassLessonDates[0].startTime,
              lastLessonDate: enrolledClassLessonDates[index].changeStartTime
                ? enrolledClassLessonDates[index].changeStartTime
                : enrolledClassLessonDates[index].startTime,
            },
            userId: firstApplicant.id,
          } as CreateRecordLogDto)
        )
    }

    const institution = await this.institutionRepository.findOne({
      where: { id: enrollCourseInstance.institutionId },
      relations: { site: true },
    })
    invoice.course = course
    await this.invoiceRepository.save(invoice)
    return { enrollCourseInstance, invoice }
  }

  async reCreateClientSecret(
    reCreateClientSecretDto: StudentReCreateStripeClientSecretDto,
    course: Course
  ): Promise<StripeClientSecretType> {
    const invoice = await this.invoiceRepository.findOneById(reCreateClientSecretDto.invoiceId, {
      relations: { enrollCourses: true },
    })
    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }
    const stripeConnect = await this.stripeConnectService.findOneBy({
      institutionId: reCreateClientSecretDto.institutionId,
    })
    if (!stripeConnect) throw new NotFoundException(StripeErrorMessage.STRIPE_CONNECT_NOT_FOUND)
    if (!stripeConnect.enabled)
      throw new NotFoundException(StripeErrorMessage.STRIPE_CONNECT_DISABLED)
    let stripeSession: { id?: any; clientSecret: any; status?: any }

    if (invoice.paymentLinkId && invoice.paymentLinkId !== 'pay_later') {
      stripeSession = await this.stripeConnectService.retrieveSession(
        reCreateClientSecretDto.institutionId,
        invoice.paymentLinkId
      )

      if (stripeSession?.status === 'complete') {
        throw new NotFoundException(StripeErrorMessage.PAYMENT_SESSION_ALREADY_COMPLETED)
      }
    }

    // Some time invoice.originalFee is string we need to convert it to number
    const originalFee =
      typeof invoice.originalFee === 'string'
        ? parseFloat(invoice.originalFee)
        : invoice.originalFee

    if (
      stripeSession &&
      stripeSession.clientSecret &&
      originalFee === reCreateClientSecretDto.paymentAmount
    ) {
      invoice.paymentLinkId = stripeSession.clientSecret.id

      const pricing = await this.stripeConnectService.retrieveSessionLineItems(
        stripeConnect.stripeAccountId,
        invoice.paymentLinkId
      )

      if (pricing && pricing.data && pricing.data.length > 0) {
        const total = pricing.data[0].amount_total

        if (total === reCreateClientSecretDto.paymentAmount) {
          await this.invoiceRepository.save(invoice)
          return stripeSession.clientSecret
        }
      }
    }

    const { enrollCourses } = invoice
    const createProductDto: CreateProductDto = {
      name: course.name,
      unitAmount: reCreateClientSecretDto.paymentAmount,
      currency: invoice.currency as STRIPE_CURRENCY,
    }
    const product = await this.stripeConnectService.createProduct(course, createProductDto)
    const firstEnrollCourse = enrollCourses.at(0)
    const sessionData: CreateCheckoutSessionParams = {
      course,
      priceId: product.default_price.id,
      returnUrl: reCreateClientSecretDto.redirectUrl,
      customerEmail: firstEnrollCourse.preferredEmail,
      token: invoice.proofToken,
      type: StripeCheckoutSessionType.ENROLL_COURSE,
      enrollInto: enrollCourses
        .flatMap((enrollCourse) =>
          enrollCourse.enrollInto?.map((info) => enrollIntoInfoToString(info))
        )
        .join('\n'),
    }
    stripeSession = await this.stripeConnectService.createCheckoutSession(sessionData)

    if (stripeSession.id) {
      invoice.paymentLinkId = stripeSession.id
    } else if (stripeSession.clientSecret.id) {
      invoice.paymentLinkId = stripeSession.clientSecret.id
    }

    await this.invoiceRepository.save(invoice)

    return stripeSession.clientSecret
  }

  async updatePayment(
    updateEnrollCourseDto: UpdateInvoicePaymentDto
    // course: Course
  ): Promise<Invoice> {
    const findInvoice = await this.invoiceRepository.findOne({
      where: {
        id: updateEnrollCourseDto.invoiceId,
      },
      relations: {
        enrollCourses: {
          multipleClassMapping: true,
          course: true,
          studentSchedule: true,
        },
        userAlias: true,
        user: true,
      },
    })
    if (!findInvoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }
    const { userAlias, user } = findInvoice
    const numOfApplicant = findInvoice.numOfApplicant

    const invoiceInstance = plainToInstance(Invoice, findInvoice)

    const redirectUrl = new URL(updateEnrollCourseDto.redirectUrl)
    const params = new URLSearchParams(redirectUrl.search)

    params.set('token', invoiceInstance.proofToken)
    params.set('email', userAlias?.email)
    redirectUrl.search = params.toString()

    const dto = new StudentConfirmEnrollDto()
    Object.assign(dto, updateEnrollCourseDto)
    const enrollCourseStudentSchedules = invoiceInstance.enrollCourses.flatMap(
      (enrollCourse) => enrollCourse.studentSchedule
    )
    // re-assign price and quantity
    dto.siteId = invoiceInstance.siteId
    dto.institutionId = invoiceInstance.institutionId
    // const numOfClasses = Array.isArray(enrollCourseInstance.studentSchedule)
    //   ? enrollCourseInstance.studentSchedule.length
    //   : 1;
    const numOfClasses = enrollCourseStudentSchedules.length

    // update the invoice associated with the enroll record

    // Will need to re-calculate the price if the user applied a discount
    dto.numOfClasses = numOfClasses
    dto.lessonCount = invoiceInstance.numOfLesson

    dto.price = invoiceInstance.originalFee / numOfApplicant
    dto.numOfApplicant = numOfApplicant

    // do the price calculation
    const pricingInfo = await this.paymentService.calculateDiscountedPrice({
      dto,
      meta: updateEnrollCourseDto?.selectedClassMeta[0],
      enrolToken: invoiceInstance.proofToken,
    })
    pricingInfo.additionalFee = +invoiceInstance.additionalFee
    pricingInfo.paymentAmount += +invoiceInstance.additionalFee

    for (const enrollCourseInstance of findInvoice.enrollCourses) {
      const previousPaymentAmount = parseFloat(enrollCourseInstance.paymentAmount.toString())
      if (
        !invoiceInstance.isCombined &&
        pricingInfo.totalDiscount > 0 &&
        pricingInfo.paymentAmount >= 0 &&
        pricingInfo.paymentAmount < previousPaymentAmount
      ) {
        enrollCourseInstance.paymentAmount = pricingInfo.paymentAmount
        await this.enrollCourseRepository.save(enrollCourseInstance)
      }
    }

    let studentAccount = await this.usersService.findUserByStudentPrimaryIdentifier({
      email: userAlias.email,
      phone: user.phone,
      firstName: userAlias.name,
      institutionId: invoiceInstance.institutionId,
    })

    if (!studentAccount?.user && invoiceInstance.user) {
      studentAccount = {
        ...studentAccount,
        user: invoiceInstance.user,
      }
    }

    if (!studentAccount?.user) {
      throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND)
    }

    let coupon: Coupon

    if (dto.coupon && dto.coupon !== '') {
      coupon = await this.couponsService.findOneBy({ code: dto.coupon })
    }
    const payLaterMethod = updateEnrollCourseDto.payLaterMethod
    // This function will process the case when price is === 0

    const course = findInvoice.enrollCourses[0].course
    const invoice = await this.invoiceService.updateInvoice({
      id: findInvoice.id,
      proofToken: findInvoice.proofToken,
      userAlias,
      paymentMethod: updateEnrollCourseDto.paymentMethod,
      currentUser: studentAccount?.user,
      course,
      pricingInfo,
      coupon,
      payLaterMethod,
    })

    invoice.numOfApplicant = numOfApplicant

    // let paymentLink: Stripe.Response<Stripe.PaymentLink>;
    if (updateEnrollCourseDto.paymentMethod == PaymentMethod.PAY_LATER) {
      invoice.paymentMethod = PaymentMethod.PAY_LATER
      invoice.payLaterMethod = updateEnrollCourseDto.payLaterMethod

      const transaction = this.transactionRepository.create({
        siteId: invoiceInstance.siteId,
        institutionId: invoiceInstance.institutionId,
        courseId: invoiceInstance.courseId,
        invoiceId: findInvoice.id,
        status: CheckoutStatus.COMPLETED,
        paymentLinkId: 'pay_later',
        amountSubtotal: pricingInfo.paymentAmount,
        amountTotal: pricingInfo.paymentAmount,
        paymentMethod: PaymentMethod.PAY_LATER,
        customer: {
          name: userAlias.name,
          phone: user.phone,
          email: userAlias.email,
        },
        description: invoiceInstance.enrollCourses
          .flatMap((enrollCourse) => enrollCourse.enrollInto)
          ?.map((info) => enrollIntoInfoToString(info))
          .join('\n'),
        authorizationCode: ``,
        transactionId: randomUUID(),
        approverId: studentAccount?.user?.id,
        approverName: `${studentAccount?.user?.firstName} ${studentAccount?.user?.lastName}`,
      })

      await this.transactionRepository.save(transaction)
      await this.invoiceRepository.save(invoice)
    }

    // const paymentMethodString = this.emailService.getPaymentMethodString({
    //   paymentMethod: invoice.paymentMethod,
    //   payoutMethod: invoice.payLaterMethod,
    //   payAmount: invoice.payAmount,
    // })

    // Send confirmation email if price is reduced to 0
    if (pricingInfo.totalDiscount > 0) {
      /**
       * Check if the coupon is valid
       */
      if (coupon) {
        await this.couponsService.updatePromotionHistory({
          coupon,
          course,
          enrollId: invoice.enrollCourses[0].id,
          invoiceId: invoice.id,
          student: studentAccount?.user,
          status: PromotionUsedStatus.CONFIRMED,
        })
      }

      if (Number(pricingInfo.paymentAmount) === 0) {
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
        const referralDiscount = invoice.adminDiscounts.find(
          (discount) => discount.type === PromotionTypeDto.REFERRAL
        )
        if (referralDiscount && referralDiscount.parentCredit > 0) {
          const parent = await this.userAliasesRepository.findOneBy({
            id: invoice.isCombined ? invoice.invoiceParentId : referralDiscount.studentId,
          })
          if (parent) {
            await this.creditManagementService.addCredit(invoice.institutionId, {
              institutionId: invoice.institutionId,
              amount: referralDiscount.parentCredit,
              userAliasId: parent.id,
              sourceType: CreditSourceType.REFERRAL,
              description: `Referral discount for invoice ${invoice.id}`,
            })
          }
        }
        await this.emailService.sendClassStudentPaymentConfirmedEmail({
          invoice,
          applicants: applicantsData,
        })
      }
    }
    return invoiceInstance
  }

  async updateEnrollmentStatus(enrollmentId: number): Promise<EnrollCourse> {
    const enrollCourseRecord = await this.enrollCourseRepository.findOneBy({
      id: enrollmentId,
    })
    if (!enrollCourseRecord) {
      throw new BadRequestException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }
    const enrollCourseInstance = plainToInstance(EnrollCourse, {
      ...enrollCourseRecord,
      confirmState: EnrollConfirmStatus.STOPPED,
    })
    return await this.enrollCourseRepository.save(enrollCourseInstance)
  }

  async checkAvailableSeats(selectedClassMeta: MetaRef[]) {
    // STEP 3: CHECK AVAILABLE SEAT
    // This is very flawed. It will check ALL past registrants of that class instead of just the current class
    for (const meta of selectedClassMeta) {
      const quota = (await this.classRepository.findOneBy({ id: meta.classId }))?.quota ?? 9999999

      // Merge seat checking logic for all lesson types
      const getLessonDateRanges = () => {
        if (meta.pickedLessons?.length > 0) {
          // pickedLessons: array of objects with startTime and endTime
          return meta.pickedLessons.map((lesson) => ({
            start: lesson.startTime,
            end: lesson.endTime,
          }))
        } else if (meta.individualPickedLessonsString?.length > 0) {
          const lessonStrings = meta.individualPickedLessonsString.map((lesson) => {
            return new LessonString(lesson.toString())
          })

          // individualPickedLessonsString: array of LessonString objects
          return lessonStrings.map((lesson) => ({
            start: lesson.getStartDate(),
            end: lesson.getEndDate(),
          }))
        } else if (meta.pickedFirstDate) {
          // pickedFirstDate: single date string
          const lessonString = new LessonString(meta.pickedFirstDate)
          return [
            {
              start: lessonString.getStartDate(),
              end: lessonString.getEndDate(),
            },
          ]
        }
        return []
      }

      const lessonDateRanges = getLessonDateRanges()
      if (lessonDateRanges.length > 0) {
        for (const { start, end } of lessonDateRanges) {
          const applied = await this.studentLessonRepository.getStudentLessonsCountOfLesson(
            meta.classId,
            start,
            end
          )
          if (quota - applied <= 0) {
            throw new BadRequestException(EnrollCourseErrorMessage.CLASS_QUOTA_IS_FULL)
          }
        }
      } else {
        const appliedStudentCount = await this.coursesService.countAppliedStudentCount(
          meta.classId,
          meta.type,
          quota
        )
        if (appliedStudentCount.length > 0) {
          const hasRemainingQuota = appliedStudentCount.every((item) => {
            return item.remainingQuota > 0
          })
          if (!hasRemainingQuota) {
            throw new BadRequestException(EnrollCourseErrorMessage.CLASS_QUOTA_IS_FULL)
          }
        }
      }
    }
  }

  async createStudentsFromEnrollCourse(
    createEnrollCourseDto: StudentCreateEnrollCourseDto,
    currentUser: User,
    existingUserAlias?: UserAlias
  ): Promise<StudentEnrollCourseAlias[]> {
    // listStudentAccount will look like {name, email, phone, createAccount}
    const listStudentAccount = await Promise.allSettled(
      createEnrollCourseDto.studentData
        // .filter((student, index) => index === 0 || student?.createAnAccount)
        .map((student, index) => {
          if (index === 0 && existingUserAlias) {
            const token = this.jwtService.sign(
              { email: existingUserAlias.user.email },
              this.jwtOption
            )
            return Promise.resolve({
              token,
              studentAccount: existingUserAlias.user,
              userAliasId: existingUserAlias.id,
              email: existingUserAlias.user.email,
              phone: existingUserAlias.user.phone,
              name: student.studentName,
              createdPassword: undefined,
              userAlias: existingUserAlias,
            } as StudentEnrollCourseAlias)
          }

          // Create a jwt token for student to confirm enrollment
          return this.usersService.createStudentAccount(
            {
              firstName: student.studentName,
              lastName: '',
              phone: student.phoneNumber,
              email: student.email || undefined,
              password: randomUUID(),
            },
            createEnrollCourseDto.institutionId,
            createEnrollCourseDto.siteId
          )
        })
    )
    const successfulAccounts: StudentEnrollCourseAlias[] = listStudentAccount
      .filter((result) => result.status === 'fulfilled')
      // eslint-disable-next-line no-undef
      .map((result) => (result as PromiseFulfilledResult<StudentEnrollCourseAlias>).value)

    const failedAccounts = listStudentAccount
      .filter((result) => result.status === 'rejected')
      // eslint-disable-next-line no-undef
      .map((result: PromiseRejectedResult) => result.reason)

    if (failedAccounts.length) {
      console.error('Some student accounts failed to create', failedAccounts)
    }
    // select the first student data to be used as invoice data.
    return successfulAccounts
  }

  async validateDuplicateEnrollment(
    courseId: number,
    institutionId: number,
    applicants: { email: string; phone: string }[]
  ): Promise<void> {
    const applicantEmails = applicants.map((d) => transformEmail(d.email)).filter(Boolean)
    const applicantPhones = applicants.map((d) => transformPhone(d.phone)).filter(Boolean)

    if (applicantEmails.length === 0 && applicantPhones.length === 0) {
      return
    }
    const existingEnrollment = await this.enrollCourseRepository.findOne({
      where: [
        applicantEmails.length > 0 && {
          courseId,
          institutionId,
          studentSchedule: {
            studentLessons: {
              user: {
                email: In(applicantEmails),
              },
            },
          },
        },
        applicantPhones.length > 0 && {
          courseId,
          institutionId,
          studentSchedule: {
            studentLessons: {
              user: {
                phone: In(applicantPhones),
              },
            },
          },
        },
      ].filter(Boolean),
      relations: {
        studentSchedule: {
          studentLessons: {
            user: true,
          },
        },
      },
    })

    if (existingEnrollment) {
      throw new BadRequestException(EnrollCourseErrorMessage.DUPLICATE_ENROLLMENT)
    }
  }

  async buildEnrollMultipleClassInfo(
    createEnrollCourseDto: StudentCreateEnrollCourseDto,
    selectedClassMeta: MetaRef[],
    course: Course,
    isCustomised: boolean,
    applicants: StudentApplicantsAdditionalFeeDto[]
  ): Promise<StudentMultipleClassInfo> {
    if (course.blockDuplicateEmailEnrollment) {
      await this.validateDuplicateEnrollment(
        createEnrollCourseDto.courseId,
        createEnrollCourseDto.institutionId,
        applicants.map((applicant) => ({
          email: applicant.email,
          phone: applicant.phone,
        }))
      )
    }

    const multipleClassInfo = new StudentMultipleClassInfo()
    const applicantCount = createEnrollCourseDto.numOfApplicant ?? 1

    for (const meta of selectedClassMeta) {
      const classInfo = new StudentClassInfo()
      classInfo.meta = meta
      const dto = new StudentConfirmEnrollDto()
      Object.assign(dto, createEnrollCourseDto)

      // re-assign price and quantity
      dto.numOfClasses = selectedClassMeta.length
      dto.numOfApplicant = applicantCount

      const pickedClass = await this.classRepository.findOne({
        where: {
          id: meta.classId,
        },
        relations: {
          regularPeriods: true,
          recurringSchedules: true,
          recurringFormat: true,
          studentSchedules: true,
          locationRoom: true,
          instructor: true,
          priceOptions: true,
        },
      })
      if (!pickedClass) {
        throw new NotFoundException(CourseErrorMessage.CLASS_NOT_FOUND)
      }
      const priceOption = await this.selectPriceOptions(meta, pickedClass)
      // Set total lesson first, and let it be overridden if it's a regular or workshop class
      const resultLessonCalculation = await this.calculateTotalLesson(
        pickedClass,
        priceOption,
        meta
      )
      const { totalLesson } = resultLessonCalculation
      let numberOfSelectedLessons = resultLessonCalculation.numberOfSelectedLessons
      dto.lessonCount = resultLessonCalculation.lessonCount

      // Trial Lesson
      const resultTrialLesson = await this.calculateTrialLesson(
        pickedClass,
        numberOfSelectedLessons,
        totalLesson,
        priceOption,
        createEnrollCourseDto.classTrialLesson,
        meta,
        dto.lessonCount
      )
      const { price, isPossibleTrialLesson } = resultTrialLesson
      dto.lessonCount = resultTrialLesson.lessonCount
      numberOfSelectedLessons = resultTrialLesson.numberOfSelectedLessons
      meta.lessonPrice = resultTrialLesson.lessonPrice

      // This part is to handle the price calculation for the customised class
      if (isCustomised) {
        // Is Customised means the price is already calculated from the frontend
        dto.price = meta.lessonPrice
        classInfo.pricingInfo = await this.calculateCustomizedPrice(
          createEnrollCourseDto.siteId,
          createEnrollCourseDto.courseId,
          pickedClass.id,
          meta,
          createEnrollCourseDto.classTrialLesson,
          isPossibleTrialLesson !== undefined,
          dto.lessonCount,
          applicantCount
        )
      } else {
        dto.price = price
        classInfo.pricingInfo = await this.calculateClassPriceInfo(
          pickedClass,
          course,
          price,
          meta,
          dto,
          applicants,
          applicantCount,
          isPossibleTrialLesson !== undefined,
          createEnrollCourseDto.classTrialLesson
        )
      }

      if (pickedClass.type === ClassTypeEnum.SUBSCRIPTION) {
        classInfo.meta.billingFormatId = pickedClass.recurringFormat.id

        let startDate: Date
        if (createEnrollCourseDto.billingStartDate) {
          startDate = new Date(createEnrollCourseDto.billingStartDate)
        } else {
          startDate = new Date()
        }

        classInfo.meta.billingStartDate = startDate.toISOString()

        const calculatedBillingNextDate = calculateBillingNextDate(
          startDate,
          pickedClass.recurringFormat
        )

        const calculatedBillingEndDate = calculateBillingEndDate(
          startDate,
          pickedClass.recurringFormat
        )

        if (isCustomised) {
          classInfo.meta.billingStartDate =
            createEnrollCourseDto.billingStartDate ?? startDate.toISOString()
          classInfo.meta.billingNextDate =
            createEnrollCourseDto.billingNextDate ?? calculatedBillingNextDate.toISOString()
          classInfo.meta.billingEndDate =
            createEnrollCourseDto.billingEndDate ?? calculatedBillingEndDate.toISOString()
        } else {
          classInfo.meta.billingStartDate = startDate.toISOString()
          classInfo.meta.billingNextDate = calculatedBillingNextDate.toISOString()
          classInfo.meta.billingEndDate = calculatedBillingEndDate.toISOString()
        }
      }

      classInfo.pricingInfo.priceOptionId = priceOption.id || null
      // do the price calculation

      // assemble info about target of enrollment (human-readable)

      classInfo.enrollInto = this.getEnrollIntoInfo(course, meta, classInfo.pricingInfo)
      classInfo.location = pickedClass.locationRoom
      classInfo.instructor = pickedClass.instructor
      // Create an account for the student for easier tracking
      // classInfo.studentSchedule = studentSchedule;
      multipleClassInfo.classes.push(classInfo)
    }
    return multipleClassInfo
  }

  async calculateClassPriceInfo(
    pickedClass: ClassEntity,
    course: Course,
    price: number,
    meta: MetaRef,
    dto: StudentConfirmEnrollDto,
    applicants: StudentApplicantsAdditionalFeeDto[],
    applicantCount: number,
    isTrialLesson: boolean,
    classTrialLesson: ClassTrialLesson | null
  ) {
    if (Number(meta.lessonPrice) !== Number(price)) {
      throw new BadRequestException(EnrollCourseErrorMessage.PRICE_NOT_MATCH)
    }
    const pricingInfo = await this.paymentService.calculateDiscountedPrice({
      dto,
      meta,
      priceType: pickedClass.priceType,
    })

    const pricingInfoWithAdditionalFee = await this.calculateAdditionalFee({
      pricingInfo,
      applicants,
      course,
      isNewEnrollCourse: true,
    })
    return {
      ...pricingInfoWithAdditionalFee,
      priceType: pickedClass.priceType,
      discountInfo: isTrialLesson
        ? [pricingInfoWithAdditionalFee.discountInfo, PromotionTypeEnum.TRIAL_LESSON]
            .filter(Boolean)
            .join(',')
        : pricingInfoWithAdditionalFee.discountInfo,
      numOfApplicant: applicantCount,
      classTrialLesson,
    }
  }

  async calculateCustomizedPrice(
    siteId: number,
    courseId: number,
    classId: number,
    meta: MetaRef,
    classTrialLesson,
    isTrialLesson: boolean,
    lessonCount: number,
    applicantCount: number
  ) {
    const siteSettings = await this.settingSiteService.findOneBy({
      siteId,
    })

    return {
      courseId,
      classId,
      numberOfLesson: lessonCount,
      feePerLesson: meta.lessonPrice / lessonCount,
      originalFee: meta.lessonPrice,
      discountInfo: isTrialLesson ? PromotionTypeEnum.TRIAL_LESSON : '',
      couponDiscount: 0,
      additionalFee: 0,
      directDiscount: 0,
      bundleDiscount: 0,
      recurringDiscount: 0,
      totalDiscount: 0,
      paymentAmount: +meta.lessonPrice,
      numOfApplicant: applicantCount,
      currency: siteSettings.currency as STRIPE_CURRENCY, // Assuming HKD as default currency
      classTrialLesson,
      priceOptionId: meta.priceOptionId,
    }
  }

  async calculateTrialLesson(
    pickedClass: ClassEntity,
    selectedLessonCount: number,
    totalLesson,
    priceOption: ClassPriceOption,
    classTrialLesson: ClassTrialLesson,
    meta: MetaRef,
    lessonCount: number
  ) {
    const isPossibleTrialLesson =
      [ClassTypeEnum.REGULAR, ClassTypeEnum.RECURRING].includes(meta.type) && classTrialLesson
    totalLesson = isPossibleTrialLesson ? 1 : totalLesson

    const numberOfSelectedLessons = isPossibleTrialLesson ? 1 : selectedLessonCount

    const price = isPossibleTrialLesson
      ? +classTrialLesson.price
      : calculateClassPrice(pickedClass, numberOfSelectedLessons, totalLesson, priceOption)
    return {
      lessonCount: isPossibleTrialLesson ? 1 : lessonCount,
      numberOfSelectedLessons,
      price,
      isPossibleTrialLesson,
      lessonPrice: isPossibleTrialLesson ? price : meta.lessonPrice,
    }
  }

  calculateTotalAppointmentLesson(
    pickedClass: ClassEntity,
    priceOption: ClassPriceOption,
    meta: MetaRef
  ) {
    const isMultiplePriceOption =
      priceOption && pickedClass.priceType === PriceType.MULTIPLE_OPTIONS
    if (isMultiplePriceOption) {
      return {
        totalLesson: priceOption.numberOfLessons,
        lessonCount: priceOption.numberOfLessons,
      }
    }
    const isPerLesson = priceOption && pickedClass.priceType === PriceType.PER_LESSON
    const totalLesson = isPerLesson ? priceOption.numberOfLessons : 1
    const pickedCount = Array.isArray(meta.pickedLessons) ? meta.pickedLessons.length : 1

    return {
      totalLesson,
      lessonCount: pickedCount,
    }
  }

  calculateTotalRegularV2Lesson(meta: MetaRef) {
    const totalLesson = meta.selectedRegularSchedulePreviewV2?.reduce(
      (acc, curr) => acc + curr.lessons.length,
      0
    )

    return {
      lessonCount: meta.individualPickedLessonsString?.length ?? totalLesson,
      totalLesson,
    }
  }

  async calculateTotalLesson(
    pickedClass: ClassEntity,
    priceOption: ClassPriceOption,
    meta: MetaRef
  ) {
    const dto = {
      totalLesson: 1,
      numberOfSelectedLessons: 1,
      lessonCount: 1,
    }

    if ([ClassTypeEnum.REGULAR, ClassTypeEnum.WORKSHOP].includes(meta.type)) {
      const { totalLesson: totLesson, lessonCount } = await this.calculateTotalRegularLesson(meta)
      dto.totalLesson = totLesson
      dto.numberOfSelectedLessons = lessonCount
      dto.lessonCount = lessonCount
    } else if (pickedClass.type === ClassTypeEnum.RECURRING) {
      const lessonCount = this.calculateTotalRecurringLesson(pickedClass, priceOption, meta)
      dto.totalLesson = lessonCount
      dto.numberOfSelectedLessons = lessonCount
      dto.lessonCount = lessonCount
    } else if (pickedClass.type === ClassTypeEnum.REGULAR_V2) {
      const { totalLesson: totLesson, lessonCount } = await this.calculateTotalRegularV2Lesson(meta)
      dto.totalLesson = totLesson
      dto.numberOfSelectedLessons = lessonCount
      dto.lessonCount = lessonCount
    } else if (pickedClass.type === ClassTypeEnum.SUBSCRIPTION) {
      dto.totalLesson = 1
      dto.numberOfSelectedLessons = 1
      dto.lessonCount = 1
    } else if (pickedClass.type === ClassTypeEnum.APPOINTMENT) {
      const { totalLesson, lessonCount } = this.calculateTotalAppointmentLesson(
        pickedClass,
        priceOption,
        meta
      )
      dto.totalLesson = totalLesson
      dto.numberOfSelectedLessons = lessonCount
      dto.lessonCount = lessonCount
    }
    return dto
  }

  calculateTotalRecurringLesson(
    pickedClass: ClassEntity,
    priceOption: ClassPriceOption,
    meta: MetaRef
  ) {
    const pickedClassRecurringFormatTimes = pickedClass.recurringFormat?.times || 1
    if (priceOption && Array.isArray(meta.pickedLessons) && meta.pickedLessons.length > 0) {
      return meta.pickedLessons.length
    }
    // Otherwise, use priceOption's numberOfLessons if available
    if (priceOption?.numberOfLessons) {
      return priceOption.numberOfLessons
    }
    // Fall back to recurring format times
    return pickedClassRecurringFormatTimes
  }

  async calculateTotalRegularLesson(meta: MetaRef) {
    const periodId = meta.periodId

    const selectedPeriod = await this.regularPeriodsService.findOneWithRelations({
      id: periodId,
    })

    if (!selectedPeriod) {
      throw new NotFoundException(CourseErrorMessage.PERIOD_NOT_FOUND)
    }
    return {
      totalLesson: selectedPeriod.lessons.length,
      lessonCount: meta.pickedLessons?.length,
    }
  }

  async selectPriceOptions(
    meta: MetaRef,
    pickedClass: ClassEntity
  ): Promise<ClassPriceOption | null> {
    let priceOption: ClassPriceOption | null = null
    if (!meta.priceOptionId) {
      if (
        pickedClass.priceType !== PriceType.MULTIPLE_OPTIONS &&
        pickedClass.priceOptions?.length > 0
      ) {
        priceOption = pickedClass.priceOptions[0]
        meta.priceOptionId = priceOption.id
      } else {
        throw new BadRequestException(`Price option must be selected`)
      }
    } else {
      try {
        priceOption = await this.classPriceOptionService.getById(meta.priceOptionId)
        if (priceOption.classId !== pickedClass.id) {
          throw new BadRequestException(`Price option does not belong to the selected class`)
        }
      } catch (error) {
        console.error(error)
        throw new BadRequestException(`Invalid price option selected`)
      }
    }
    return priceOption
  }

  async createStudentForms(
    createEnrollCourseDto: StudentCreateEnrollCourseDto,
    successfulAccounts: StudentEnrollCourseAlias[],
    firstStudent: User,
    course: Course
  ): Promise<void> {
    const registrationForm = createEnrollCourseDto.registrationForm

    if (registrationForm) {
      const forms = await Promise.all(
        Object.values(registrationForm).map(async (item: any) => {
          const dataIndex = item?.['id']?.split('.')[1] || 0
          const actualFieldId = item?.['id']?.split('.')[2]
          const studentData = createEnrollCourseDto.studentData[dataIndex]

          const student = successfulAccounts.find((o) => {
            return (
              o.email === studentData.email ||
              o.phone === studentData.phoneNumber ||
              o.name === studentData.studentName
            )
          })
          const userId = student?.studentAccount?.id || firstStudent.id
          let form = await this.studentFormRepository.findOneBy({
            institutionId: createEnrollCourseDto.institutionId,
            userId,
            userAliasId: student.userAliasId,
            formFieldId: item.id,
          })

          const formFieldId = item['id']
          const formFieldQuestion = item['question']
          const formFieldType = item['type']
          const formFieldValue = item['value']
          const formFieldIsDefault = item['isDefault']
          const formFieldOrder = item['order']
          const formFieldColumnMapping = item['columnMapping']

          if (form) {
            const hasValue = Boolean(formFieldValue)
            // Only update the form if the value is not empty, otherwise leave it as is
            if (hasValue) {
              form.formFieldId = formFieldId || form.formFieldId
              form.formFieldQuestion = formFieldQuestion || form.formFieldQuestion
              form.formFieldType = formFieldType || form.formFieldType
              form.formFieldValue = formFieldValue || form.formFieldValue
              form.formFieldIsDefault = formFieldIsDefault || form.formFieldIsDefault
              form.formFieldOrder = formFieldOrder || form.formFieldOrder
              form.formFieldColumnMapping = formFieldColumnMapping || form.formFieldColumnMapping
              form.metadata = {
                ...form.metadata,
                ...item,
              }
            }
          } else {
            form = this.studentFormRepository.create({
              institutionId: createEnrollCourseDto.institutionId,
              userId,
              userAliasId: student.userAliasId,
              formId: course.formId,
              fieldId: actualFieldId,
              metadata: item,
              formFieldId,
              formFieldQuestion,
              formFieldType,
              formFieldValue,
              formFieldIsDefault,
              formFieldOrder,
              formFieldColumnMapping,
            })
          }
          return form
        })
      )

      await this.studentFormRepository.save(forms)
    }
  }

  async createEnrollCourseInstance(
    createEnrollCourseDto: StudentCreateEnrollCourseDto,
    firstStudent: StudentEnrollCourseAlias,
    multipleClassInfo: StudentMultipleClassInfo,
    userAlias: UserAlias
  ) {
    // Here calculates the final price of the multiple classes
    const multipleClassTotalPrice = multipleClassInfo.classes.reduce(
      (price, classes) => price + Number(classes.pricingInfo.paymentAmount),
      0
    )

    const enrollInto = multipleClassInfo.classes.map((classes) => classes.enrollInto)
    const enrollCourseInstance = plainToInstance(EnrollCourse, {
      ...createEnrollCourseDto,
      ...{
        userId: userAlias.userId,
        enrollInto,
        registrationForm: createEnrollCourseDto.registrationForm,
        token: firstStudent.token,
      },
    })

    // manually map data for studen name, email and phone
    const studentName = createEnrollCourseDto.studentData[0]?.studentName || firstStudent.name
    const studentEmail = createEnrollCourseDto.studentData[0]?.email || firstStudent.email
    const studentPhone = createEnrollCourseDto.studentData[0]?.phoneNumber || firstStudent.phone
    const user = userAlias.user

    // Use the data that is entered by the student
    enrollCourseInstance.name = studentName
    enrollCourseInstance.phone = studentPhone
    enrollCourseInstance.email = studentEmail
    enrollCourseInstance.userId = user.id
    enrollCourseInstance.userAliasId = userAlias.id

    const meta0 = multipleClassInfo.classes[0]?.meta

    if (meta0.billingStartDate) {
      enrollCourseInstance.billingStartDate = new Date(meta0.billingStartDate)
    }
    if (meta0.billingEndDate) {
      enrollCourseInstance.billingEndDate = new Date(meta0.billingEndDate)
    }
    if (meta0.billingNextDate) {
      enrollCourseInstance.billingNextDate = new Date(meta0.billingNextDate)
    }

    if (meta0.billingFormatId) {
      enrollCourseInstance.billingFormatId = meta0.billingFormatId
    }

    enrollCourseInstance.currency = multipleClassInfo.classes[0].pricingInfo.currency
    enrollCourseInstance.paymentAmount = multipleClassTotalPrice
    // This is for skipping the payment process if the total price is 0

    if (multipleClassTotalPrice > 0) {
      enrollCourseInstance.confirmState = EnrollConfirmStatus.PENDING
    } else {
      enrollCourseInstance.confirmState = EnrollConfirmStatus.ACCEPTED
    }
    return enrollCourseInstance
  }

  async buildStripePaymentLink(
    createEnrollCourseDto: StudentCreateEnrollCourseDto,
    firstStudent: StudentEnrollCourseAlias,
    enrollCourseInstance: EnrollCourse,
    multipleClassInfo: StudentMultipleClassInfo,
    course: Course
  ): Promise<CreatePaymentLinkReturnType> {
    const { enrollInto, paymentAmount } = enrollCourseInstance
    // check if url has query string
    const redirectUrl = new URL(createEnrollCourseDto.redirectUrl)
    const params = new URLSearchParams(redirectUrl.search)
    params.set('token', firstStudent.token)
    params.set('email', firstStudent.email)
    redirectUrl.search = params.toString()

    if (createEnrollCourseDto.paymentMethod == PaymentMethod.PAY_NOW && paymentAmount > 0) {
      const createProductDto: CreateProductDto = {
        name: enrollInto.map((into) => into.courseName).join('\n'),
        unitAmount: paymentAmount,
        currency: multipleClassInfo.classes[0].pricingInfo.currency,
      }

      const product = await this.stripeConnectService.createProduct(course, createProductDto)
      const paymentLink = await this.stripeConnectService.createPaymentLink(
        course,
        firstStudent.studentAccount,
        product.default_price.id,
        StripeCheckoutSessionType.ENROLL_COURSE,
        enrollInto
          .map((into) => into.courseName)
          .join('\n')
          .slice(0, 450),
        redirectUrl.toString()
      )
      const sessionData: CreateCheckoutSessionParams = {
        course,
        priceId: product.default_price.id,
        returnUrl: createEnrollCourseDto.redirectUrl,
        customerEmail: firstStudent.email,
        token: firstStudent.token,
        type: StripeCheckoutSessionType.ENROLL_COURSE,
        enrollInto: enrollCourseInstance.enrollInto
          ?.map((info) => enrollIntoInfoToString(info))
          .join('\n')
          .slice(0, 450),
      }
      const clientSecret = await this.stripeConnectService.createCheckoutSession(sessionData)
      // enrollCourseInstance.paymentLinkId = paymentLink.id;
      return {
        clientSecret: clientSecret.clientSecret,
        paymentLink,
        redirectUrl,
      }
    }
    return {
      clientSecret: null,
      paymentLink: null,
      redirectUrl,
    }
  }

  async createInvoiceOfEnrollCourse(
    numOfApplicant: number,
    paymentMethod: PaymentMethod,
    multipleClassInfo: StudentMultipleClassInfo,
    enrollCourses: EnrollCourse[],
    successfulAccounts: StudentEnrollCourseAlias[],
    parentData?: StudentEnrollCourseAlias,
    clientSecret?: StripeClientSecretType
  ) {
    const firstStudent = successfulAccounts[0]
    const combinedPricingInfo = this.paymentService.combinePricingInfoArrayToPricingInfo(
      multipleClassInfo.classes.map((classes) => classes.pricingInfo)
    )

    // create invoice
    const invoice = await this.invoiceService.createInvoice({
      enrollCourseInstances: enrollCourses,
      paymentMethod,
      token: firstStudent.token,
      clientSecretId: clientSecret?.id,
      currentUser: parentData?.studentAccount ?? firstStudent.studentAccount,
      course: enrollCourses.at(0).course,
      pricingInfo: combinedPricingInfo,
      userAlias: parentData?.userAlias ?? firstStudent.userAlias,
    })

    // Set invoice_id on all enroll courses (only if invoiceId is null to prevent overwriting)
    enrollCourses.forEach((enrollCourse) => {
      if (!enrollCourse.invoiceId) {
        enrollCourse.invoiceId = invoice.id
      }
    })
    // Save enroll courses with invoice_id
    await this.enrollCourseRepository.save(enrollCourses)

    await this.invoiceRepository.update(
      { id: invoice.id },
      {
        applicants: successfulAccounts.map((account) => account.studentAccount.id),
        numOfApplicant: numOfApplicant ?? 1,
      }
    )
    invoice.course = enrollCourses.at(0).course
    invoice.userAliasId = parentData?.userAliasId ?? firstStudent.userAliasId
    invoice.userAlias = parentData?.userAlias ?? firstStudent.userAlias
    invoice.user = parentData?.studentAccount ?? firstStudent.studentAccount
    return invoice
  }

  async createRecurringSchedule(
    meta: MetaRef,
    pickedClass: ClassEntity,
    siteId: number,
    institutionId: number,
    scheduleDto: StudentScheduleType
  ) {
    let numberOfLessons: number

    if (meta.priceOptionId && pickedClass.priceType === PriceType.MULTIPLE_OPTIONS) {
      const priceOption = await this.classPriceOptionService.getById(meta.priceOptionId)
      numberOfLessons = priceOption.numberOfLessons
    } else {
      numberOfLessons = pickedClass.recurringFormat.times
    }

    const scheduleToBeSaved = await this.recurringSchedulesService.getSingleClassRecurringLessons(
      meta.pickedFirstDate,
      meta.pickedRecurringSchedule.id,
      numberOfLessons,
      siteId,
      institutionId
    )
    scheduleDto.recurringScheduleId = meta.pickedRecurringSchedule.id
    scheduleDto.recurringSchedule = meta.pickedRecurringSchedule
    return scheduleToBeSaved
  }

  async createStudentLessons(
    scheduleDto: StudentScheduleType,
    listStudentData: StudentData[],
    recurringSchedules: string[] | LessonString[],
    successfulAccounts: StudentEnrollCourseAlias[],
    enrollCourse: EnrollCourse,
    classId: number,
    classTrialLesson?: ClassTrialLesson,
    locationRoom?: LocationRoom,
    instructor?: User
  ) {
    const enrolledClassLessonDates = await this.classLessonService.createLessonToClassLessonTable({
      siteId: enrollCourse.siteId,
      lessonSchedules: recurringSchedules,
      classId,
      courseId: enrollCourse.courseId,
      institutionId: enrollCourse.institutionId,
      location: locationRoom,
      instructor,
    })
    return this.createStudentLessonsFromClassLessons(
      scheduleDto,
      enrolledClassLessonDates,
      listStudentData,
      successfulAccounts,
      enrollCourse,
      classId,
      classTrialLesson
    )
  }

  async createStudentLessonsFromClassLessons(
    scheduleDto: StudentScheduleType,
    enrolledClassLessonDates: ClassLesson[],
    listStudentData: StudentData[],
    successfulAccounts: StudentEnrollCourseAlias[],
    enrollCourse: EnrollCourse,
    classId: number,
    classTrialLesson?: ClassTrialLesson
  ): Promise<StudentLesson[][]> {
    const studentScheduleList: StudentLesson[][] = []
    const firstStudent = successfulAccounts[0]
    for (const studentData of listStudentData) {
      const { studentAccount } = studentData
      const studentSchedule = await this.studentScheduleRepository.save(
        this.studentScheduleRepository.create({
          ...scheduleDto,
          enrollCourseId: enrollCourse.id,
        })
      )
      let sortedClassLessons = enrolledClassLessonDates.sort(
        (a) => dayjs(a.startTime).unix() - dayjs(a.endTime).unix()
      )
      if (classTrialLesson) {
        sortedClassLessons = sortedClassLessons.slice(0, 1)
      }
      const studentLessonResult = await this.classLessonService.connectClassLessonToStudentLesson({
        classLessons: sortedClassLessons,
        studentId: studentAccount?.id || firstStudent.studentAccount.id,
        enrollCourseId: enrollCourse.id,
        studentScheduleId: studentSchedule.id,
      })
      // const sortedStudentLessons = studentLessonResult.sort(
      //   (a) => dayjs(a.startTime).unix() - dayjs(a.endTime).unix()
      // )
      if (studentLessonResult.length > 0) {
        studentSchedule.firstStudentLessonId = studentLessonResult[0].id
        await this.studentScheduleRepository.save(studentSchedule)
      }
      studentScheduleList.push(studentLessonResult)
    }
    return studentScheduleList
  }

  async createStudentScheduleFromEnrollClass(
    createEnrollCourseDto: StudentCreateEnrollCourseDto,
    selectedClassMeta: MetaRef[],
    enrollCourse: EnrollCourse,
    invoice: Invoice,
    successfulAccounts: StudentEnrollCourseAlias[],
    classTrialLesson?: ClassTrialLesson
  ): Promise<StudentLesson[][]> {
    // CREATE STUDENT SCHEDULE AND SYNC WITH STUDENT LESSON
    const studentScheduleList: StudentLesson[][] = []
    const { course } = enrollCourse
    const filteredClassMeta = selectedClassMeta.filter(
      (meta) => meta.userAliasId === enrollCourse.userAliasId
    )
    for (const meta of filteredClassMeta) {
      const mapping = new EnrollClassMapping()
      mapping.classId = meta.classId
      mapping.enrollCourseId = enrollCourse.id
      mapping.lessonPrice = meta.lessonPrice

      await this.enrollClassMappingRepository.save(mapping)

      // CREATE STUDENT SCHEDULE
      const scheduleDto = await this.getStudentSchedule(course, meta, enrollCourse.id, invoice?.id)
      const pickedClass = await this.classRepository.findOne({
        where: { id: meta.classId },
        relations: {
          recurringFormat: true,
          regularPeriods: true,
          classLessons: true,
          recurringSchedules: true,
          locationRoom: true,
          instructor: true,
        },
      })

      let scheduleToBeSaved: LessonString[] | string[]

      if (meta.type === ClassTypeEnum.RECURRING) {
        if (meta.individualPickedLessonsString && meta.individualPickedLessonsString.length > 0) {
          scheduleToBeSaved = meta.individualPickedLessonsString
        } else {
          scheduleToBeSaved = await this.createRecurringSchedule(
            meta,
            pickedClass,
            enrollCourse.siteId,
            createEnrollCourseDto.institutionId,
            scheduleDto
          )
        }
      } else if (
        [ClassTypeEnum.REGULAR, ClassTypeEnum.WORKSHOP, ClassTypeEnum.APPOINTMENT].includes(
          meta.type
        )
      ) {
        scheduleToBeSaved = lessonObjectToString(meta.pickedLessons)
      } else if (meta.type === ClassTypeEnum.REGULAR_V2) {
        scheduleToBeSaved = meta.individualPickedLessonsString
      }

      if (meta.type !== ClassTypeEnum.SUBSCRIPTION) {
        const scheduleLessonResults = await this.createStudentLessons(
          scheduleDto,
          createEnrollCourseDto.studentData,
          scheduleToBeSaved,
          successfulAccounts,
          enrollCourse,
          meta.classId,
          classTrialLesson,
          pickedClass.locationRoom,
          pickedClass.instructor
        )
        studentScheduleList.push(...scheduleLessonResults)
      } else {
        await Promise.all(
          createEnrollCourseDto.studentData.map(async () => {
            await this.studentScheduleRepository.save(
              this.studentScheduleRepository.create({
                type: meta.type,
                classId: meta.classId,
                enrollCourseId: enrollCourse.id,
                invoiceId: invoice?.id,
              })
            )
          })
        )
      }
    }
    return studentScheduleList
  }

  generateFinalResponse(
    multipleClassInfo: StudentMultipleClassInfo,
    clientSecret: StripeClientSecretType,
    paymentMethod: PaymentMethod,
    enrollCourse: EnrollCourse,
    invoice: Invoice,
    numOfApplicant: number,
    studentSchedule: StudentLesson[][]
  ) {
    return multipleClassInfo.classes.map((classes) => {
      // decrease coupon quota, save course_promotion_used
      // currently promotion is only about coupon, so if there is no coupon used
      // we skip saving promotion history

      // response
      const response: any =
        paymentMethod == PaymentMethod.PAY_NOW
          ? plainToInstance(PayNowResponse, clientSecret)
          : plainToInstance(StudentEnrollCourseResponse, enrollCourse)

      response.currency = classes.pricingInfo.currency
      response.originalFee = classes.pricingInfo.originalFee
      response.numberOfLesson = classes.pricingInfo.numberOfLesson
      response.feePerLesson = classes.pricingInfo.feePerLesson
      response.paymentAmount = classes.pricingInfo.paymentAmount
      response.discounted = classes.pricingInfo.totalDiscount
      response.pickedFirstDate = classes.meta.pickedFirstDate
      response.studentSchedule = studentSchedule

      response.clientSecret = clientSecret
      response.invoice = invoice
      response.numOfApplicant = numOfApplicant
      return response
    })
  }

  async prepareReminderData(
    institutionId: number,
    enrollCourses: EnrollCourse[],
    studentScheduleList: StudentLesson[][]
  ): Promise<ReminderDataType> {
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
      relations: {
        site: true,
      },
    })
    const site = institution.site
    const timeZone = await this.settingSiteService.getTimeZone(site.id)

    const contactEmail = institution.email ?? site.email
    const contactPhone = institution.phone ?? site.phone

    const classDateTime = studentScheduleList
      .map((stu) => studentLessonArrayToString(stu, timeZone))
      .join('\n')

    let enrollmentForm: EnrollmentForm[] = []
    for (const enrollCourse of enrollCourses) {
      enrollmentForm = enrollmentForm.concat(
        enrollCourse.registrationForm !== null
          ? await this.mapEnrollmentFormKeysToCustomFieldKeys(enrollCourse, timeZone)
          : []
      )
    }

    return {
      contactEmail,
      contactPhone,
      classDateTime,
      enrollmentForm,
      institution,
      site,
      timeZone,
    }
  }

  async getOrCreateUserAlias(
    firstStudent: StudentData,
    createEnrollCourseDto: StudentCreateEnrollCourseDto
  ) {
    // If userAliasId is explicitly provided in the selectedClassMeta, use that userAlias
    const userAliasId = createEnrollCourseDto.selectedClassMeta?.[0]?.userAliasId
    if (userAliasId) {
      const userAlias = await this.userAliasesRepository.findOne({
        where: {
          id: userAliasId,
          institutionId: createEnrollCourseDto.institutionId,
        },
        relations: {
          user: true,
        },
      })

      if (userAlias) {
        return userAlias
      }
      // If the provided userAliasId doesn't exist, fall through to create/find logic below
    }

    const normalizedStudentName = firstStudent.studentName?.trim()
    const normalizedPhone = transformPhone(firstStudent.phoneNumber)
    const normalizedEmail = transformEmail(firstStudent.email)

    const registeredUser = await this.usersService.createStudentAccount(
      {
        firstName: normalizedStudentName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: randomUUID(),
      },
      createEnrollCourseDto.institutionId,
      createEnrollCourseDto.siteId
    )

    let userAlias = await this.userAliasesRepository.findOne({
      where: {
        userId: registeredUser.id,
        institutionId: createEnrollCourseDto.institutionId,
        name: ILike(normalizedStudentName),
      },
      relations: {
        user: true,
      },
    })

    if (!userAlias) {
      userAlias = await this.userAliasesRepository.findOne({
        where: {
          userId: registeredUser.id,
          institutionId: createEnrollCourseDto.institutionId,
          email: ILike(normalizedEmail),
        },
        relations: {
          user: true,
        },
      })
    }

    return userAlias
  }

  async findAndCreateUserRoleStudent(
    userId: number,
    institutionId: number,
    siteId: number
  ): Promise<UserRole> {
    console.log(
      `[DEBUG] findAndCreateUserRoleStudent called with: userId=${userId}, institutionId=${institutionId}, siteId=${siteId}`
    )
    if (!userId || !institutionId || !siteId) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    const userRole = await this.userRoleRepository.findOne({
      where: {
        userId,
        institutionId,
        siteId,
        isStudent: true,
      },
    })
    if (!userRole) {
      const newUserRole = this.userRoleRepository.create({
        userId,
        institutionId,
        siteId,
        isStudent: true,
      })
      return this.userRoleRepository.save(newUserRole)
    }
    return userRole
  }

  async validateCoursesToEnroll(courseIds: number[]): Promise<Course[]> {
    const courses = []
    for (const courseId of courseIds) {
      const course = await this.coursesService.findOneWithRelations(courseId)
      if (!course) {
        throw new NotFoundException(CourseErrorMessage.COURSE_NOT_FOUND)
      }
      courses.push(course)
    }
    return courses
  }

  async enrollMultipleClasses(currentUser: User, payload: StudentCreateEnrollCourseDto[]) {
    const courses = await this.validateCoursesToEnroll(payload.map((item) => item.courseId))

    return Promise.all(
      courses.map((course) => {
        const createEnrollCourseDto = payload.find((item) => item.courseId === course.id)
        createEnrollCourseDto.siteId = course.siteId
        createEnrollCourseDto.institutionId = course.institutionId

        return this.enrollNewClasses({
          createEnrollCourseDto,
          currentUser,
          course,
          isCustomised: createEnrollCourseDto.classTrialLesson ? false : true,
          isSendEmail: true,
        })
      })
    )
  }

  async enrollNewClasses({
    createEnrollCourseDto,
    currentUser,
    course,
    isCustomised,
    isSendEmail,
  }: {
    createEnrollCourseDto: StudentCreateEnrollCourseDto
    currentUser: User
    course: Course
    isCustomised?: boolean
    isSendEmail?: boolean
  }) {
    const jobId = randomUUID()

    this.emitEnrollSseEvent({
      jobId,
      status: EnrollCourseSteps.STARTED,
    })

    const firstStudent = createEnrollCourseDto.studentData[0]
    // const userAlias = await this.getOrCreateUserAlias(firstStudent, createEnrollCourseDto)
    const currentNewUser: User =
      (await this.usersService.findUserByStudentPrimaryIdentifierWithDeleted({
        email: firstStudent.email,
        phone: firstStudent.phoneNumber,
        firstName: firstStudent.studentName,
        institutionId: createEnrollCourseDto.institutionId,
      })) || currentUser

    // transform email and phone in registration form
    if (createEnrollCourseDto?.registrationForm) {
      createEnrollCourseDto.registrationForm = createEnrollCourseDto.registrationForm.map((o) => {
        const isEmail = o.columnMapping === 'email'
        if (isEmail) {
          return { ...o, value: transformEmail(o.value) }
        }

        const isPhone = o.columnMapping === 'phone'
        if (isPhone) {
          return { ...o, value: transformPhone(o.value) }
        }

        return o
      })
    }

    // transform email and phone in student data
    if (createEnrollCourseDto?.studentData?.length) {
      createEnrollCourseDto.studentData = createEnrollCourseDto.studentData.map((o) => {
        return { ...o, email: transformEmail(o.email), phoneNumber: transformPhone(o.phoneNumber) }
      })
    }

    this.enrollClasses({
      jobId,
      createEnrollCourseDto,
      currentUser: currentNewUser,
      course,
      isCustomised,
      isSendEmail,
    })

    return {
      // ...shallow({ source: job, fields: Object.keys(job).filter((key) => key !== 'data') }),
      id: jobId,
    }
  }

  async enrollClasses({
    jobId,
    createEnrollCourseDto,
    currentUser,
    course,
    isCustomised,
    isSendEmail,
  }: {
    jobId?: string
    createEnrollCourseDto: StudentCreateEnrollCourseDto
    currentUser: User
    course: Course
    // This flag is for bypassing the price checking by using the lessonPrice from the frontend
    isCustomised?: boolean
    // This flag is for bypassing the notification email
    isSendEmail?: boolean
    documentCampaignId?: number
  }): Promise<{
    finalResponse: StudentEnrollCourseResponse[]
    invoice: Invoice
  }> {
    try {
      // STEP 1: Find the course by courseId
      if (!course) {
        course = await this.coursesService.findOne(createEnrollCourseDto.courseId)
      }
      const studentUserAlias = await this.getOrCreateUserAlias(
        createEnrollCourseDto.studentData[0],
        createEnrollCourseDto
      )
      // STEP 2: VALIDATE COURSE FOR ENROLLMENT
      const selectedClassMeta = createEnrollCourseDto.selectedClassMeta.map((d) => ({
        ...d,
        userAliasId: studentUserAlias.id,
      }))
      selectedClassMeta
      if (createEnrollCourseDto.classTrialLessonId) {
        const { isValid, classTrialLesson } = await this.trialLessonService.validateTrialLesson({
          institutionId: createEnrollCourseDto.institutionId,
          siteId: createEnrollCourseDto.siteId,
          courseId: createEnrollCourseDto.courseId,
          classIds: createEnrollCourseDto.selectedClassMeta.map((d) => d.classId),
          applicants: createEnrollCourseDto.studentData.map((d) => ({
            email: d.email,
            phone: d.phoneNumber,
          })),
        })
        if (!isValid) {
          throw new BadRequestException(PromotionErrorMessage.TRIAL_LESSON_NOT_FOUND)
        }
        createEnrollCourseDto.classTrialLesson = classTrialLesson
      }
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.VALIDATING_COURSE,
      })
      this.validateCourseForEnroll(course)

      if (course.blockDuplicateEmailEnrollment) {
        await this.validateDuplicateEnrollment(
          createEnrollCourseDto.courseId,
          createEnrollCourseDto.institutionId,
          createEnrollCourseDto.studentData.map((d) => ({
            email: d.email,
            phone: d.phoneNumber,
          }))
        )
      }

      // retrieve relate data and store in meta object
      for (const meta of selectedClassMeta) {
        await this.retrieveRelateData(course, meta)
      }

      // STEP 3: CHECK AVAILABLE SEAT
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.CHECKING_SEAT_AVAILABILITY,
      })
      await this.checkAvailableSeats(selectedClassMeta)

      // STEP 4: Check available schedule
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.CHECKING_SCHEDULE_AVAILABILITY,
      })
      await this.validateSchedule(selectedClassMeta, isCustomised)
      // prepare for calculate price

      // STEP 5: Create students from given studentData
      // select the first student data to be used as invoice data.
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.CREATING_STUDENT,
      })

      const firstStudent = createEnrollCourseDto.studentData[0]
      const userAlias = await this.getOrCreateUserAlias(firstStudent, createEnrollCourseDto)

      if (!userAlias) {
        throw new BadRequestException('User alias not found for current user')
      }

      createEnrollCourseDto.studentData[0] = firstStudent
      const successfulAccounts = await this.createStudentsFromEnrollCourse(
        createEnrollCourseDto,
        currentUser,
        userAlias
      )
      const firstStudentAccount = successfulAccounts[0]

      // STEP 6: Create multiple class info
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.CREATING_MULTIPLE_CLASS_INFORMATION,
      })
      const multipleClassInfo = await this.buildEnrollMultipleClassInfo(
        createEnrollCourseDto,
        selectedClassMeta,
        course,
        isCustomised,
        createEnrollCourseDto.studentData.map(
          (student) =>
            ({
              email: student.email,
              phone: student.phoneNumber,
            } as StudentApplicantsAdditionalFeeDto)
        )
      )

      const multipleClassTotalPrice = multipleClassInfo.classes.reduce(
        (price, classes) => price + Number(classes.pricingInfo.paymentAmount),
        0
      )

      const enrollInto = multipleClassInfo.classes.map((classes) => classes.enrollInto)

      // STEP 7: validate registration form and Create student form from given registration form
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.CREATING_APPLICATION_FORM,
      })
      await this.createStudentForms(
        createEnrollCourseDto,
        successfulAccounts,
        firstStudentAccount.studentAccount,
        course
      )

      // STEP 8: Create Enroll Course Instance
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.ENROLLING_COURSE,
      })
      const enrollCourseInstance = await this.createEnrollCourseInstance(
        createEnrollCourseDto,
        firstStudentAccount,
        multipleClassInfo,
        userAlias
      )

      // STEP 9: Prepare payment
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.PREPARING_PAYMENT,
      })
      const { clientSecret, paymentLink } = await this.buildStripePaymentLink(
        createEnrollCourseDto,
        firstStudentAccount,
        enrollCourseInstance,
        multipleClassInfo,
        course
      )

      multipleClassInfo.paymentLink = paymentLink
      // Save enroll course instance
      const enrollCourse = await this.enrollCourseRepository.save(enrollCourseInstance)
      enrollCourseInstance.id = enrollCourse.id
      enrollCourse.course = course
      // STEP 10: Create Invoice
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.CREATING_INVOICE,
      })
      const invoice = await this.createInvoiceOfEnrollCourse(
        createEnrollCourseDto.numOfApplicant,
        createEnrollCourseDto.paymentMethod,
        multipleClassInfo,
        [enrollCourse],
        successfulAccounts,
        successfulAccounts[0],
        clientSecret
      )

      // CREATE STUDENT SCHEDULE AND SYNC WITH STUDENT LESSON
      // STEP 11: Create student schedule
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.CREATING_STUDENT_SCHEDULE,
      })
      const studentScheduleList = await this.createStudentScheduleFromEnrollClass(
        createEnrollCourseDto,
        selectedClassMeta,
        enrollCourse,
        invoice,
        successfulAccounts,
        createEnrollCourseDto.classTrialLesson
      )

      multipleClassInfo.enrollCourse = enrollCourse

      // Get the admin's contact info
      // STEP 12: Sending reminder to student and instructor or admin
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.SENDING_REMINDER,
      })
      const {
        contactEmail,
        contactPhone,
        classDateTime,
        enrollmentForm,
        institution,
        site,
        timeZone,
      } = await this.prepareReminderData(course.institutionId, [enrollCourse], studentScheduleList)

      // has registered for payment!

      if (!isCustomised || (isCustomised && isSendEmail)) {
        const hasAddress = multipleClassInfo.classes.some((c) => c.location)
        const address = multipleClassInfo.classes
          .filter((c) => c.location)
          .map((c) => c.location?.address)
          .join(', ')

        const siteAdminUser = await this.usersService.getUserOwnerOfInstitution(institution.id)

        const classAdminPaymentConfirmation: ClassAdminNewRegistrationEmailParams = {
          emailAddress: contactEmail,
          studentEmail: enrollCourse.preferredEmail,
          studentName: enrollCourse.preferredName,
          studentPhone: enrollCourse.preferredPhone,
          institutionName: institution.name,
          courseName: course.name,
          className: enrollInto.map((info) => enrollIntoInfoToString(info))?.join('\n'),
          classDateTime,
          location: hasAddress ? address : addressObjectToString(institution.address),
          price: `${multipleClassInfo.classes[0].pricingInfo.currency} ${multipleClassTotalPrice}`,
          paymentAmount: `${multipleClassInfo.classes[0].pricingInfo.currency} ${multipleClassTotalPrice}`,
          paymentMethod: createEnrollCourseDto.paymentMethod,
          paymentStatus: invoice.paymentState,
          transactionId: invoice.id.toString(),
          remark: course.registrationMes,
          enrolId: enrollCourse.id.toString(),
          enrollmentForm,
          adminEmail: contactEmail,
          adminPhone: contactPhone,
          contactPhone,
          recipientId: siteAdminUser?.id,
          institutionId: enrollCourse.institutionId,
          siteId: enrollCourse.siteId,
          timeZone,
        }

        if (isCustomised && createEnrollCourseDto.paymentStatus !== null) {
          classAdminPaymentConfirmation.paymentStatus = createEnrollCourseDto.paymentStatus
        }

        institution.site = site

        const paymentReceiptUploadLink = buildUploadReceiptLink({
          institution,
          invoice,
          customDomain: site.customDomain,
          siteUrl: site.url,
          coursePath: invoice.course?.path,
        })

        const accessToken = await this.authService.createToken(
          siteAdminUser,
          this.authService.jwtAdminOption
        )

        await this.sendEnrolledCourseStudentReminder({
          userAlias,
          enrollCourses: [enrollCourse],
          invoice,
          createEnrollCourseDto,
          successfulAccounts,
          enrollmentForm,
          institution,
          site,
          multipleClassInfo,
          isSendEmail,
          classDateTime,
          paymentReceiptUploadLink,
          paymentLink: paymentLink?.url,
          course,
          token: accessToken,
          classAdminPaymentConfirmation,
          contactPhone,
          studentPhone: enrollCourse.preferredPhone,
        })
      }

      const finalResponse = this.generateFinalResponse(
        multipleClassInfo,
        clientSecret,
        createEnrollCourseDto.paymentMethod,
        enrollCourse,
        invoice,
        createEnrollCourseDto.numOfApplicant,
        studentScheduleList
      )
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.DONE,
        data: finalResponse,
      })
      return { finalResponse, invoice }
    } catch (error) {
      console.log('error', error)
      this.emitEnrollSseEvent({
        jobId,
        status: EnrollCourseSteps.FAILED,
        error: (error as any).message,
      })
      const isCustomisedEnrollment = isCustomised || (error as any).message.includes('customised')
      if (isCustomisedEnrollment) {
        // Re throw the error
        throw error
      }
    }
  }

  async assignClientToService(
    createEnrollCourseDto: StudentCreateEnrollCourseDto,
    course: Course,
    user: User
  ): Promise<EnrollCourse> {
    // 1. Create or retrieve a user alias for the student
    const alias = await this.getOrCreateUserAlias(
      createEnrollCourseDto.studentData[0],
      createEnrollCourseDto
    )

    // Ensure student data is populated with fallback values from alias
    createEnrollCourseDto.studentData[0] = createEnrollCourseDto.studentData[0] || {
      id: alias.user.id,
      studentName: alias.name,
      email: alias.refUser.email,
      phoneNumber: alias.refUser.phone,
    }

    // 2. Create student account(s) if necessary
    const accounts = await this.createStudentsFromEnrollCourse(createEnrollCourseDto, user)

    // 3. Build minimal class assignment info (without payment processing)
    const applicants = createEnrollCourseDto.studentData.map((s) => ({
      email: s.email,
      phone: s.phoneNumber,
    }))

    const multipleClassInfo = await this.buildEnrollMultipleClassInfo(
      createEnrollCourseDto,
      createEnrollCourseDto.selectedClassMeta,
      course,
      true, // isCustomised
      applicants
    )

    // 4. Create enrollment course instance
    const enrollInstance = await this.createEnrollCourseInstance(
      createEnrollCourseDto,
      accounts[0],
      multipleClassInfo,
      alias
    )

    // 5. Save enrollment to the database
    const savedEnroll = await this.enrollCourseRepository.save(enrollInstance)

    // 6. Generate student schedules (without invoice)
    await this.createStudentScheduleFromEnrollClass(
      createEnrollCourseDto,
      createEnrollCourseDto.selectedClassMeta,
      savedEnroll,
      undefined, // no invoice
      accounts,
      createEnrollCourseDto.classTrialLesson
    )
    return savedEnroll
  }

  async sendApplicationSubmittedReminder(dto: EnrolledCourseReminderDto) {
    const {
      institution,
      classAdminPaymentConfirmation,
      site,
      enrollCourses,
      multipleClassInfo,
      invoice,
      contactPhone,
      studentPhone,
      paymentReceiptUploadLink,
    } = dto

    const firstStudent = dto.successfulAccounts[0]

    const studentNotificationSetting =
      await this.studentNotificationSettingRepository.getByStudentAndType(
        firstStudent.studentAccount.id,
        institution.id,
        SupportedType.STUDENT_NOTIF_AFTER_ENROLLMENT_SUBMITTED
      )

    const customMessage = await this.customMessageService.getCustomMessageByType(
      institution.id,
      SupportedType.STUDENT_NOTIF_AFTER_ENROLLMENT_SUBMITTED
    )

    if (customMessage && (!studentNotificationSetting || studentNotificationSetting?.whatsapp)) {
      classAdminPaymentConfirmation.uploadPaymentUrl = buildUploadReceiptLink({
        institution,
        invoice,
        customDomain: site.customDomain,
        siteUrl: site.url,
        coursePath: invoice.course?.path,
      })

      const content = replaceContentVariables(customMessage.content, classAdminPaymentConfirmation)

      await this.whatsappWebService.sendWhatsappMessage(
        {
          content,
          institutionId: institution.id,
          phone: studentPhone,
        },
        {
          invoiceMetadata: {
            invoiceId: invoice?.id,
          },
          recipientUserId: firstStudent?.studentAccount?.id,
          recipientUserPhone: firstStudent?.phone,
          institutionId: institution.id,
          siteId: institution.siteId,
        }
      )
    }

    const customMessageAdmin = await this.customMessageService.getCustomMessageByType(
      institution.id,
      SupportedType.ADMIN_NOTIF_AFTER_ENROLLMENT_SUBMITTED
    )

    if (customMessageAdmin) {
      const content = replaceContentVariables(
        customMessageAdmin.content,
        classAdminPaymentConfirmation
      )

      await this.whatsappWebService.sendWhatsappMessage(
        {
          content,
          institutionId: institution.id,
          phone: contactPhone,
        },
        {
          invoiceMetadata: {
            invoiceId: invoice?.id,
          },
          recipientUserId: invoice.userId,
          recipientUserPhone: contactPhone,
          institutionId: institution.id,
          siteId: institution.siteId,
        }
      )
    }

    if (dto.isSendEmail) {
      await this.emailService.sendClassAdminNewRegistration({
        payload: classAdminPaymentConfirmation,
        enrollCourse: enrollCourses.at(0),
      })

      await this.emailService.sendClassStudentUploadPaymentReceiptEmail(
        firstStudent.studentAccount.id,
        {
          institution,
          institutionId: institution?.id,
          site: dto.site,
          multipleClassInfo,
          enrollCourse: enrollCourses.at(0),
          enrollCourses: invoice.enrollCourses,
          invoice,
          paymentMethod: dto.createEnrollCourseDto.paymentMethod,
          classDateTime: dto.classDateTime,
          paymentReceiptUploadLink,
          course: dto.course,
          enrollmentForm: dto.enrollmentForm,
        }
      )
    }
  }

  async sendNotificationAfterPaymentApproved(dto: EnrolledCourseReminderDto) {
    console.log('dto', dto)
    const {
      enrollCourses,
      invoice,
      createEnrollCourseDto,
      successfulAccounts,
      enrollmentForm,
      classAdminPaymentConfirmation,
      institution,
      studentPhone,
      userAlias,
    } = dto
    if (!classAdminPaymentConfirmation) return

    const updatedInvoice = await this.invoiceRepository.findOne({
      where: {
        id: invoice.id,
      },
      relations: {
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
    })

    await this.emailService.sendClassStudentPaymentConfirmedEmail({
      userAlias,
      invoice: updatedInvoice,
      applicants: createEnrollCourseDto.studentData
        .map((o) => {
          if (!o.id) {
            const details = successfulAccounts.find(
              (a) =>
                a.phone &&
                o.phoneNumber &&
                a.phone.replace(/\D/g, '') === o.phoneNumber.replace(/\D/g, '')
            )
            o.id = details?.studentAccount?.id
          }
          return o
        })
        .filter((applicant) => applicant.id),
      enrollmentForm,
    })

    const customMessage = await this.customMessageService.getCustomMessageByType(
      institution.id,
      SupportedType.STUDENT_NOTIF_AFTER_PAYMENT_APPROVED
    )
    if (customMessage) {
      const institutionEntity = await this.institutionRepository.findOne({
        where: { id: dto.institution.id },
        relations: { site: true },
      })

      classAdminPaymentConfirmation.successPaymentLink = buildSuccessPaymentLink({
        institution: institutionEntity,
        invoice: updatedInvoice,
        enrollCourse: enrollCourses.at(0),
        site: institutionEntity.site,
      })
      const message = replaceContentVariables(customMessage.content, classAdminPaymentConfirmation)
      const firstStudent = dto.successfulAccounts[0]
      await this.whatsappWebService.sendWhatsappMessage(
        {
          content: message,
          institutionId: institution.id,
          phone: studentPhone,
        },
        {
          invoiceMetadata: {
            invoiceId: dto.invoice?.id,
          },
          recipientUserId: firstStudent?.studentAccount?.id,
          recipientUserPhone: firstStudent?.phone,
          institutionId: institution.id,
          siteId: institution.siteId,
        }
      )
    }
  }

  emitEnrollSseEvent(params: {
    jobId: string
    status: EnrollCourseSteps
    data?: any
    error?: string
  }) {
    const { jobId, data, error, status } = params
    if (jobId) {
      this.sseService.emitEvent(jobId, {
        status,
        data,
        error,
      })
    }
  }

  async sendEnrolledCourseStudentReminder(dto: EnrolledCourseReminderDto) {
    const firstStudent = dto.invoice.userAlias
    const userAlias = await this.userAliasesRepository.findOne({
      where: { id: firstStudent.id },
      relations: {
        parentUserAlias: {
          user: true,
        },
        user: true,
      },
    })
    const parentUserAlias = dto.isSendToParent ? userAlias?.parentUserAlias : userAlias

    if (Number(dto.invoice.payAmount) === 0) {
      await this.sendNotificationAfterPaymentApproved(dto)
    } else if (dto.createEnrollCourseDto.paymentMethod === PaymentMethod.PAY_LATER) {
      await this.sendApplicationSubmittedReminder(dto)
    } else if (dto.isSendEmail) {
      await this.emailService.sendClassStudentWaitingPayment({
        recipientUserId: parentUserAlias.userId,
        firstStudentAccount: dto.successfulAccounts[0],
        parentUserAlias,
        params: {
          ...dto,
          course: dto.enrollCourses.at(0)?.course,
          institutionId: dto.institution?.id,
          paymentMethod: dto.createEnrollCourseDto.paymentMethod,
        },
      })
    }
  }

  /**
   * Create enrollment from, save to DB, update stripe price, trigger create invoice
   * @param createEnrollCourseDto
   * @param currentUser
   * @param course
   * @returns
   */
  @Transactional()
  async create(
    createEnrollCourseDto: StudentCreateEnrollCourseDto,
    currentUser: User,
    course: Course
  ): Promise<
    StudentEnrollCourseResponse | PayNowResponse | StudentEnrollCourseResponse[] | PayNowResponse[]
  > {
    const { finalResponse } = await this.enrollClasses({
      createEnrollCourseDto,
      currentUser,
      course,
    })
    return finalResponse
  }

  findAll(pageOptionsDto: EnrollCourseOptionDto): Promise<EnrollCoursePageDto> {
    const whereCondition: FindOptionsWhere<EnrollCourse> = {
      siteId: pageOptionsDto.siteId,
      institutionId: pageOptionsDto.institutionId,
      courseId: pageOptionsDto.courseId,
    }
    if (pageOptionsDto.confirmState) {
      whereCondition.confirmState = pageOptionsDto.confirmState
    }
    const orderOption: FindOptionsOrder<EnrollCourse> = {}
    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }
    return this.enrollCourseRepository.paginationWithTransform(
      pageOptionsDto,
      StudentEnrollCourseResponse,
      whereCondition,
      orderOption,
      { studentSchedule: true }
    )
  }

  async getUserHistoricalFormData(
    userId: number,
    userAliasId: number,
    institutionId: number
  ): Promise<Record<string, any>> {
    // get user historical form data
    const enrollRecords = await this.enrollCourseRepository.find({
      where: [{ userId, institutionId, userAliasId }],
      select: ['registrationForm'],
      order: { updatedAt: 'DESC' },
    })

    // extract and deduplicate field data (latest first)
    const fieldsMap = new Map()

    enrollRecords.forEach((record) => {
      if (record.registrationForm) {
        record.registrationForm.forEach((field) => {
          if (field.id && field.value && !fieldsMap.has(field.id)) {
            fieldsMap.set(field.id, field)
          }
        })
      }
    })

    // convert to object format, keep compatible with existing studentEnrollment method
    const result = {}
    fieldsMap.forEach((field, fieldId) => {
      result[fieldId] = field
    })

    return result
  }

  async findOne(
    enrollmentRecordDto: EnrollmentRecordDTO,
    institutionId?: number
  ): Promise<EnrollCourse> {
    const user = await this.usersService.findUserByStudentPrimaryIdentifier({
      institutionId,
      email: enrollmentRecordDto.email,
      phone: enrollmentRecordDto.phone,
      firstName: enrollmentRecordDto.fullName,
    })

    if (!user) {
      throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND)
    }

    const enroll = await this.enrollCourseRepository.findOne({
      where: { userId: user.user.id, institutionId },
      order: { updatedAt: 'DESC' },
    })

    if (!enroll) {
      throw new NotFoundException(EnrollCourseErrorMessage.NO_ENROLL_COURSE_HISTORY)
    }

    return plainToInstance(EnrollCourse, enroll)
  }

  async findStudentLessons(enrollId: number): Promise<StudentLesson[]> {
    const studentLessons = await this.studentLessonRepository.findAll({
      where: { enrollCourseId: enrollId },
    })
    return studentLessons
  }
  /**
   * Retrieves student lessons by parsing and validating a comma-separated list of enrollment IDs.
   * @param enrollIds A comma-separated string of positive numeric enrollment IDs
   * @returns Promise resolving to an array of StudentLesson entities
   * @throws {BadRequestException} When no valid IDs are provided after sanitization
   */
  async findStudentLessonsWithEnrollIds(enrollIds: string): Promise<StudentLesson[]> {
    // Validate and sanitize the input
    const parsedIds = enrollIds
      .split(',')
      .map((id) => id.trim())
      .map((id) => Number(id))
      .filter((id) => !isNaN(id) && id > 0)

    if (parsedIds.length === 0) {
      throw new BadRequestException(
        'Invalid or empty enrollIds provided. Must be a comma-separated list of positive numbers.'
      )
    }

    return this.studentLessonRepository.findAll({
      where: { enrollCourseId: In(parsedIds) },
    })
  }

  studentCoursesEnrolled(
    pageOptionsDto: StudentEnrollCourseOptionDto,
    currentUser: User
  ): Promise<StudentEnrollCoursePageDto> {
    try {
      const whereCondition: FindOptionsWhere<EnrollCourse> = {
        userId: currentUser.id,
      }

      if (pageOptionsDto.siteId) {
        whereCondition.siteId = pageOptionsDto.siteId
      }

      if (pageOptionsDto.institutionId) {
        whereCondition.institutionId = pageOptionsDto.institutionId
      }

      const orderOption: FindOptionsOrder<EnrollCourse> = {}
      if (pageOptionsDto.orderBy) {
        orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
      }
      return this.enrollCourseRepository.paginationWithTransform(
        pageOptionsDto,
        StudentEnrollCourseResponse,
        whereCondition,
        orderOption,
        { course: true }
      )
    } catch (error) {
      console.log(error)
    }
  }

  async enrollCourseDetail(token: string): Promise<StudentEnrollCourseResponse> {
    try {
      await this.jwtService.verify(token, { ...this.jwtOption })
    } catch (error) {
      if ((error as any).name === 'TokenExpiredError') {
        throw AuthorizationException.tokenExpiredException()
      }
      throw AuthorizationException.tokenInvalidException((error as any).message)
    }

    const invoice = await this.invoiceRepository.findOne({
      where: {
        proofToken: token,
      },
      relations: {
        enrollCourses: { course: true, studentSchedule: true },
      },
    })
    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }
    const found = invoice.enrollCourses.at(0)
    if (!found) {
      throw new NotFoundException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }

    // const studentForm = await this.studentFormRepository.findOneBy({ userId: found.userId });
    // if(studentForm){
    //   found.registrationForm = studentForm
    // }

    return plainToInstance(StudentEnrollCourseResponse, found)
  }

  async findPromotion(enrolId: number): Promise<any> {
    const enrollCourse = await this.enrollCourseRepository.findOneBy({ id: enrolId })
    if (!enrollCourse) {
      throw new NotFoundException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }
    const found = await this.invoicePromotionUsedRepository.findOneBy({
      invoiceId: enrollCourse.invoiceId,
      promotionType: PromotionTypeEnum.COUPON_DISCOUNT,
    })
    return found ?? null
  }

  async beforePayment(dto: StudentConfirmEnrollDto, course: Course) {
    await this.retrieveRelateData(course, dto.meta)

    const pricingInfo = await this.paymentService.calculateDiscountedPrice({
      dto,
      meta: dto.meta,
    })

    return pricingInfo
  }

  @Transactional()
  async confirmState(
    confirmStateEnrollCourseDto: StudentConfirmStateEnrollCourseDto,
    user: User
  ): Promise<StudentEnrollCourseResponse> {
    const enrollCourseInstance = await this.enrollCourseRepository.findOneBy({
      id: confirmStateEnrollCourseDto.id,
      siteId: confirmStateEnrollCourseDto.siteId,
      institutionId: confirmStateEnrollCourseDto.institutionId,
    })
    if (!enrollCourseInstance) {
      throw new NotFoundException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }
    if (
      confirmStateEnrollCourseDto.confirmState == EnrollConfirmStatus.REJECTED &&
      enrollCourseInstance.confirmState == EnrollConfirmStatus.ACCEPTED
    ) {
      await this.stripeConnectService.createRefund(enrollCourseInstance)
    }
    enrollCourseInstance.confirmState = confirmStateEnrollCourseDto.confirmState
    const enrollCourse = await this.enrollCourseRepository.save(enrollCourseInstance)
    return plainToInstance(StudentEnrollCourseResponse, enrollCourse)
  }

  validateCourseForEnroll(course: Course) {
    // check course is published
    if (!course.published) {
      throw new BadRequestException(EnrollCourseErrorMessage.COURSE_NOT_AVAILABLE)
    }
    // check course is allow for online booking
    if (!course.onlineBooking) {
      throw new BadRequestException(
        EnrollCourseErrorMessage.COURSE_NOT_AVAILABLE_FOR_ONLINE_BOOKING
      )
    }
    // check course still in recruitment time
    if (course.recruitStart && course.recruitEnd) {
      const now = new Date()
      const recruitEnd = new Date(course.recruitEnd)
      const recruitStart = new Date(course.recruitStart)
      if (now.getTime() < recruitStart.getTime()) {
        throw new BadRequestException(
          `${
            EnrollCourseErrorMessage.COURSE_RECRUITMENT_NOT_STARTED
          }: ${recruitStart.toISOString()}`
        )
      }
      if (now.getTime() > recruitEnd.getTime()) {
        throw new BadRequestException(EnrollCourseErrorMessage.COURSE_RECRUITMENT_TIME_ENDED)
      }
    }
    return true
  }

  /**
   * Validate first Date submit by student
   * @param _class
   * @param meta
   * @returns
   */
  async checkFirstDate(meta: MetaRef, isCustomised: boolean) {
    const firstLesson = new LessonString(meta.pickedFirstDate)
    const isFutureTime = firstLesson.isInTheFuture()
    if (!isFutureTime && !isCustomised && isCustomised !== undefined) {
      return {
        valid: false,
        message: `Date picked is in the past: ${firstLesson}`,
      }
    }
    const pickedPeriod = await this.regularPeriodsService.findOneWithRelations({
      id: meta.periodId,
    })
    if (!pickedPeriod) {
      return {
        valid: false,
        message: `Picked period was not found: periodId = ${meta.periodId}`,
      }
    }
    if (!pickedPeriod.lessons) {
      return {
        valid: false,
        message: `Lesson for period with periodId = ${meta.periodId} is null`,
      }
    }
    sortASC(lessonObjectToString(pickedPeriod.lessons))
    const periodLessonStr = lessonObjectToString(pickedPeriod.lessons).map((o) => o.toString())
    const index = periodLessonStr.indexOf(firstLesson.toString())
    const count = lessonObjectToString(pickedPeriod.lessons).length - index
    const lessons = lessonObjectToString(pickedPeriod.lessons).filter((_, _index) => {
      return _index >= index
    })
    return { valid: true, message: '', count, lessons }
  }

  async validateSchedule(selectedMetaClassRef: MetaRef[], isCustomised: boolean): Promise<boolean> {
    // Check for picked schedule is valid, and also count number of valid lesson (lessonCount)
    // and store into meta, for Workshop lessonCount always = 1, and price per lesson = session's total price
    // validate for REGULAR

    return selectedMetaClassRef
      .map(async (meta) => {
        switch (meta.type) {
          case ClassTypeEnum.REGULAR: {
            await this.validateScheduleRegular(meta, isCustomised)
            break
          }

          case ClassTypeEnum.RECURRING: {
            await this.validateScheduleRecurring(meta, isCustomised)
            break
          }
        }
        if (
          meta.pickedLessons?.length === 0 &&
          (meta.type === ClassTypeEnum.REGULAR || meta.type === ClassTypeEnum.WORKSHOP)
        ) {
          throw new BadRequestException(EnrollCourseErrorMessage.NO_LESSON_PICKED)
        }
        return true
      })
      .every((condition) => condition)
  }

  async validateScheduleRegular(meta: StudentMetaRefExtended, isCustomised: boolean) {
    let lessonCount = 0
    // validate picked start date
    const checkResult = await this.checkFirstDate(meta, isCustomised)
    if (!checkResult.valid) {
      throw new BadRequestException(checkResult.message)
    }
    lessonCount = checkResult.count

    const numberBundlePeriod = 1

    // get current period and all after it
    const seriesOfPeriods = await this.regularPeriodsService.getManyPeriods(
      meta.periodId,
      numberBundlePeriod
    )
    if (
      !(seriesOfPeriods instanceof Array) ||
      seriesOfPeriods.length === 0 ||
      seriesOfPeriods.length < numberBundlePeriod
    ) {
      throw new BadRequestException(
        `Can not found ${numberBundlePeriod} periods for this class: found ${seriesOfPeriods.length}`
      )
    }
    const startPeriod = new StudentPeriodLessonDto()
    startPeriod.id = seriesOfPeriods[0].id
    startPeriod.lessons = lessonObjectToString(seriesOfPeriods[0].lessons)

    meta.periodName = seriesOfPeriods[0].name
    let count = 0
    for (let i = 1; i < seriesOfPeriods.length; i++) {
      const p = seriesOfPeriods[i]

      count = count + (p.lessons?.length | 0)
    }
    lessonCount = lessonCount + count
    meta.lessonCount = lessonCount
  }

  async validateScheduleRecurring(meta: StudentMetaRefExtended, isCustomised: boolean) {
    // validate picked start date
    if (!meta.pickedFirstDate) {
      return {
        valid: false,
        message: 'No date is picked.',
      }
    }
    const firstLesson = new LessonString(meta.pickedFirstDate)
    const isFutureTime = firstLesson.isInTheFuture()
    if (!isFutureTime && !isCustomised && isCustomised !== undefined) {
      return {
        valid: false,
        message: `Date picked is in the past: ${firstLesson}`,
      }
    }
    const pickedLessonDate = await this.recurringSchedulesService.findOneBy({
      id: meta.pickedRecurringSchedule?.id,
    })

    if (!pickedLessonDate) {
      return {
        valid: false,
        message: `Picked lesson date was not found: pickedRecurringScheduleId = ${pickedLessonDate.id}`,
      }
    }

    const recurringFormat = await this.repeatFormatsRepository.findOneBy({
      id: meta.pickedClass.recurringFormat?.id,
    })

    meta.lessonCount = recurringFormat.times
  }

  async validateRegistrationForm(form: any, course: Course) {
    const formTemplate: { fields: CustomField[] } = { fields: [] }
    formTemplate.fields = course.customFields
    if (!formTemplate.fields) {
      // for later use
      // return { valid: false, message: 'Template for custom fields is null' };
      return { valid: true, message: '' }
    }
    const keys = Object.keys(form)

    for (let i = 0; i < formTemplate.fields.length; i++) {
      const fieldTemplate = formTemplate.fields[i]
      if (fieldTemplate.validation.includes('required') && keys.indexOf(fieldTemplate.id) === -1) {
        return {
          valid: false,
          message: `Missing ${fieldTemplate.id} in registrationForm.`,
        }
      }
      const customFieldObject = CustomField.fromJSON(fieldTemplate)

      const result = customFieldObject.validateCustomField(form[fieldTemplate.id])

      if (!result.valid) {
        return result
      }
    }
    return { valid: true, message: '' }
  }

  async getStudentLessonsByEnrollId(enrollCourseId: number): Promise<StudentLesson[]> {
    const studentLessons = await this.studentLessonRepository.findAll({
      where: { enrollCourseId },
    })
    return studentLessons
  }

  async getStudentSchedule(
    course: Course,
    meta: StudentMetaRefExtended,
    enrollCourseId: number,
    invoiceId?: number | null
  ): Promise<StudentScheduleType> {
    const studentSchedule: StudentScheduleType = {
      type: meta.pickedClass.type as ClassTypeEnum,
      enrollCourseId,
      invoiceId: invoiceId ?? undefined,
    }
    studentSchedule.classId = meta.classId
    if (meta.pickedFirstDate)
      studentSchedule.firstStudentLessonString = new LessonString(meta.pickedFirstDate)
    if (
      meta.pickedClass.type === ClassTypeEnum.REGULAR ||
      meta.pickedClass.type === ClassTypeEnum.WORKSHOP
    ) {
      studentSchedule.periodId = meta.periodId

      // studentSchedule.firstClassPeriod = meta.pickedClass.schedule[0].period.lessons;
      // const regularPeriods = meta.pickedClass.regularPeriods
      const regularPeriod = await this.regularPeriodsService.findOneWithRelations({
        id: studentSchedule.periodId,
      })
      const interimPeriod = regularPeriod
      if (!interimPeriod?.lessons) return
      studentSchedule.studentLessonsString = lessonObjectToString(interimPeriod.lessons)
    } else if ([ClassTypeEnum.RECURRING].includes(meta.pickedClass.type)) {
      // First check if the class has picked individual lessons
      if (meta.individualPickedLessonsString && meta.individualPickedLessonsString.length > 0) {
        studentSchedule.studentLessonsString = meta.individualPickedLessonsString
      } else {
        const lessonStrings = await this.recurringSchedulesService.getSingleClassRecurringLessons(
          meta.pickedFirstDate,
          meta.pickedRecurringSchedule.id,
          meta.lessonCount,
          meta.pickedClass.siteId,
          course.institutionId
        )
        studentSchedule.studentLessonsString = lessonStrings.map(
          (lesson) => new LessonString(lesson)
        )
      }
      // studentSchedule.firstSchedule = meta.pickedLessons
    }
    return studentSchedule
  }

  getEnrollIntoInfo(
    course: Course,
    meta: StudentMetaRefExtended,
    pricingInfo?: StudentEnrollCoursePricingInfo
  ): EnrollIntoInfo {
    // assemble info about number of lessons that student pick (human readable)
    // for APPOINTMENT: number of submit lessons might different from number of lesson
    // define in bundle, then meta.lessonCount != pricingInfo.numberOfLesson
    // in here we take actual number of lessons that student submit (meta.lessonCount)
    const actualLessonCount = meta.lessonCount

    // assemble info about target of enrollment (human readable)
    const price =
      pricingInfo?.priceType === PriceType.PER_CLASS ? pricingInfo.originalFee : meta.lessonPrice
    const enrollInto: EnrollIntoInfo = {
      type: ClassTypeEnum.WORKSHOP,
      courseName: course.name,
      secondLevelName: '',
      lessonCount: 0,
    }

    enrollInto.type = meta.pickedClass.type as ClassTypeEnum
    enrollInto.courseName = course.name
    enrollInto.secondLevelName = meta.pickedClass.name
    enrollInto.lessonCount = actualLessonCount
    enrollInto.priceType = pricingInfo?.priceType
    enrollInto.price = price
    // pricingInfo?.priceType === PriceType.PER_CLASS ? price : price / actualLessonCount
    if ((meta.pickedClass.type as ClassTypeEnum) === ClassTypeEnum.REGULAR) {
      enrollInto.thirdLevelName = meta.periodName
    } else if ((meta.pickedClass.type as ClassTypeEnum) === ClassTypeEnum.RECURRING) {
      if (meta.pickedRecurringSchedule) {
        const weekdays = Object.values(WeekDayEnum)
        enrollInto.thirdLevelName = weekdays[meta.pickedRecurringSchedule.weekDay]
      }
    }
    return enrollInto
  }

  async retrieveRelateData(course: Course, meta: MetaRef): Promise<StudentMetaRefExtended> {
    const timeZoneOffset = await this.settingSiteService.getTimeZoneOffset(course.siteId)
    const metaExtended: StudentMetaRefExtended = meta
    if (timeZoneOffset) {
      metaExtended.timeZoneOffset = timeZoneOffset * 60 // convert to minute
    } else {
      metaExtended.timeZoneOffset = 0
    }
    // get bundle info
    if (meta.bundleId) {
      metaExtended.bundle = await this.bundleDiscountsService.findById(meta.bundleId)
    }

    const _class = await this.classRepository.findOneBy({ id: meta.classId })
    if (!_class) {
      throw new NotFoundException(CourseErrorMessage.CLASS_NOT_FOUND)
    }
    metaExtended.pickedClass = _class
    metaExtended.courseId = course.id
    metaExtended.userAliasId = meta.userAliasId
    return metaExtended
  }

  /**
   * Note this is just an mocking function
   * @param id of bundle
   * @returns number of lessons define by this bundle
   */
  getBundleLesson(id?: number) {
    if (!id) return -1
    return id
  }

  async calculateAdditionalFee({
    pricingInfo,
    applicants,
    course,
    isNewEnrollCourse = false,
  }: {
    pricingInfo: StudentEnrollCoursePricingInfo
    applicants: StudentApplicantsAdditionalFeeDto[]
    course: Course
    isNewEnrollCourse?: boolean
  }): Promise<StudentEnrollCoursePricingInfo> {
    const thisPricingInfo = { ...pricingInfo }
    const additionalFee = await this.paymentService.getAllAdditionalFee({
      applicants,
      siteId: course.siteId,
      institutionId: course.institutionId,
      courseId: course.id,
    })
    if (
      isNewEnrollCourse &&
      additionalFee &&
      Number(additionalFee[AdditionalFeeConditions.NEW_STUDENT]) > 0
    ) {
      const tempDiscountInfo = thisPricingInfo.discountInfo?.split(',')
      thisPricingInfo.discountInfo = [
        ...tempDiscountInfo,
        AdditionalFeeConditions.NEW_STUDENT,
      ].join(',')
      if ('newStudentCount' in additionalFee)
        thisPricingInfo.numOfNewStudent = Number(additionalFee['newStudentCount'])
      thisPricingInfo.additionalFee = Number(additionalFee[AdditionalFeeConditions.NEW_STUDENT])
      thisPricingInfo.paymentAmount += Number(additionalFee[AdditionalFeeConditions.NEW_STUDENT])
    }
    return thisPricingInfo
  }

  async mapEnrollmentFormKeysToCustomFieldKeys(enrollCourse: EnrollCourse, timeZone: string) {
    const course = await this.coursesService.findOne(enrollCourse.courseId)
    const customFields = course.customFields
    const registrationForm = enrollCourse.registrationForm

    if (!registrationForm) {
      return []
    }

    if (Array.isArray(registrationForm)) {
      const data = registrationForm.map((valObj) => {
        let answer = ''
        if (valObj.value !== null && valObj.value !== undefined) {
          if (typeof valObj.value === 'boolean') {
            answer = valObj.value ? 'Yes' : 'No'
          }

          if (isIsoDate(valObj.value)) {
            // Format the below to YYYY-MM-DD HH:MM:SS

            const zonedDate = utcToZonedTime(valObj.value.toString(), timeZone)

            answer = dayjs(zonedDate).format('YYYY-MM-DD')
          } else {
            answer = valObj.value?.toString() ?? ''
          }
        }

        if (valObj?.question && answer) {
          return { question: valObj.question, answer }
        }
        if (customFields && customFields !== null && customFields.length > 0) {
          const question =
            customFields.find((field) => field.id === valObj.id.toString())?.description ??
            valObj.id?.toString()
          return { question, answer }
        }

        return { question: valObj.question, answer: '' }
      })
      return data
    }

    const registrationFormData = Object.entries(registrationForm)
    return registrationFormData.map(([key, value]) => {
      if (isIsoDate(value)) {
        const zonedDate = utcToZonedTime(value.toString(), timeZone)
        return { question: key, answer: zonedDate.toLocaleString() }
      }
      return { question: key, answer: value.toString() }
    })
  }

  async getTotalSchoolRevenue(
    institutionId: number,
    courseId: number,
    startDate: string,
    endDate: string
  ) {
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('i')
      .innerJoin('enroll_courses_invoices', 'eci', 'eci.invoices_id = i.id')
      .innerJoinAndSelect(
        EnrollCourse,
        'enroll_courses',
        'enroll_courses.id = eci.enroll_courses_id'
      )
      .where(`enroll_courses.institution_id = ${institutionId}`)
      .andWhere('i.payment_state = :payment_state', {
        payment_state: PaymentStatus.PAID,
      })
      .andWhere('enroll_courses.confirm_state = :confirm_state', {
        confirm_state: EnrollConfirmStatus.ACCEPTED,
      })
      .select('SUM(enroll_courses.payment_amount)', 'totalAmount')
      .addSelect('DATE(enroll_courses.createdAt)', 'date')
      .groupBy('DATE(enroll_courses.createdAt)')

    if (courseId) {
      queryBuilder.andWhere(`enroll_courses.course_id = ${courseId}`)
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('enroll_courses.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
    }

    const revenue = await queryBuilder.getRawMany()
    return revenue
  }

  async getEnrolledClassCount(
    institutionId: number,
    userId?: number
  ): Promise<EnrolledClassCountDTO[]> {
    const classes = await this.classRepository.find({
      where: {
        institutionId,
        instructorId: userId ?? undefined,
      },
    })
    const studentLessons = await this.studentLessonRepository.find({
      where: {
        classId: In(classes.map((classItem) => classItem.id)),
        enrollCourse: {
          confirmState: EnrollConfirmStatus.ACCEPTED,
        },
      },
      relations: {
        enrollCourse: true,
      },
    })
    return classes.map((classItem) => {
      return {
        classId: classItem.id,
        classQuota: studentLessons.filter((studentLesson) => studentLesson.classId === classItem.id)
          .length,
      } as EnrolledClassCountDTO
    })
  }

  async getEnrolledClassesByUserAlias(
    institutionId: number,
    userAliasId: number,
    date: string
  ): Promise<EnrollCourse[]> {
    return this.enrollCourseRepository.find({
      where: {
        institutionId,
        userAliasId,
        createdAt: Between(dayjs(date).toDate(), new Date()),
      },
      relations: {
        multipleClassMapping: true,
        studentSchedule: {
          studentLessons: true,
        },
      },
    })
  }
}
