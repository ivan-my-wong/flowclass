/* eslint-disable simple-import-sort/imports */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import * as dayjs from 'dayjs'
import * as _ from 'lodash'
import {
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
  IsNull,
  Repository,
} from 'typeorm'

import {
  InvoicesOptionDto,
  InvoicesPageDto,
} from '@/application/admin/enroll-courses/dto/invoices-option.dto'
import { StudentEnrollCoursePricingInfo } from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import {
  PartialUser,
  StudentCreateInvoiceDTO,
  StudentCreateNewScheduleInInvoiceProps,
  StudentInvoiceResponseDto,
} from '@/application/student/enroll-courses/dto/create-invoice.dto'
import { ClassLessonService } from '@/domain/service/class-lesson.service'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { InvoiceErrorMessage } from '@/exceptions/error-message/invoice'
import { Coupon } from '@/models/coupons.entity'
import { RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import { Course } from '@/models/courses.entity'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import { PaymentMethod, RecordLogType } from '@/models/enums/'
import { EnrollConfirmStatus, PaymentStatus } from '@/models/enums/status'
import { Invoice } from '@/models/invoice.entity'
import { InvoiceRepository } from '@/models/invoice.repository'
import { PayoutMethod } from '@/models/payout-method.entity'
import { RecordLog } from '@/models/record-log.entity'
import { TransactionRepository } from '@/models/transaction.repository'
import { UserAlias } from '@/models/user-aliases.entity'
import { User } from '@/models/user.entity'
import { UsersRepository } from '@/models/users.repository'
import { DivitOrder } from '@/modules/divit/entities/divit-order.entity'

import {
  DashboardParams,
  LessonDetailParams,
} from '@/application/admin/invoices/dto/statistics.dto'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { ClassRepository } from '@/models/classes.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { UserAliasesRepository } from '@/models/user-aliases.repository'

@Injectable()
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly usersRepository: UsersRepository,
    private readonly classLessonService: ClassLessonService,
    private readonly classLessonRepository: ClassLessonRepository,
    private readonly classRepository: ClassRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly studentScheduleRepository: StudentScheduleRepository,
    private readonly regularPeriodsRepository: RegularPeriodsRepository,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly userAliasRepository: UserAliasesRepository,
    @InjectRepository(RecordLog)
    private recordLogRepository: Repository<RecordLog>
  ) {}

  /**
   * Create invoice as enroll was made
   */

  async createInvoice({
    enrollCourseInstances,
    paymentMethod,
    token,
    clientSecretId,
    currentUser,
    course,
    pricingInfo,
    userAlias,
  }: {
    enrollCourseInstances: EnrollCourse[]
    paymentMethod: PaymentMethod
    token: string
    clientSecretId: string
    currentUser: User
    course: Course
    pricingInfo: StudentEnrollCoursePricingInfo
    userAlias?: UserAlias
  }): Promise<Invoice> {
    // create invoice and save to db
    const createInvoiceDTO = await this.generateInvoiceFromEnrollment(
      currentUser,
      userAlias,
      paymentMethod,
      token,
      pricingInfo,
      course
    )

    const newInvoiceCreate = this.invoiceRepository.create({
      ...createInvoiceDTO,
      userAliasId: userAlias?.id,
      siteId: course.siteId,
      // enrollId: enrollCourseInstance.id,
      institutionId: course.institutionId,
      paymentState: createInvoiceDTO.paymentState,
      paymentMethod: createInvoiceDTO.paymentMethod,
      paymentLinkId: clientSecretId ?? 'pay_later',
      userId: currentUser.id,
      applicants: [currentUser.id],
    })
    if (newInvoiceCreate.paymentState === PaymentStatus.PAID) {
      enrollCourseInstances.forEach((enrollCourseInstance) => {
        enrollCourseInstance.confirmState = EnrollConfirmStatus.ACCEPTED
      })
    }
    newInvoiceCreate.enrollCourses = enrollCourseInstances
    const savedInvoice = await this.invoiceRepository.save(newInvoiceCreate)

    // Set invoice_id on all enroll courses (only if invoiceId is null to prevent overwriting)
    // Only update enroll courses that have IDs (already saved)
    const enrollCoursesToUpdate = enrollCourseInstances.filter((ec) => ec.id && !ec.invoiceId)
    if (enrollCoursesToUpdate.length > 0) {
      await this.enrollCourseRepository.update(
        { id: In(enrollCoursesToUpdate.map((ec) => ec.id)), invoiceId: IsNull() },
        { invoiceId: savedInvoice.id }
      )
    }

    // Set invoiceId on enroll course instances that don't have IDs yet (will be saved later)
    // Only set if invoiceId is null to prevent overwriting
    enrollCourseInstances.forEach((enrollCourseInstance) => {
      if (!enrollCourseInstance.invoiceId) {
        enrollCourseInstance.invoiceId = savedInvoice.id
      }
    })

    return savedInvoice
  }

  async updateInvoice({
    id,
    proofToken,
    userAlias,
    paymentMethod,
    currentUser,
    course,
    pricingInfo,
    payLaterMethod,
  }: {
    id: number
    proofToken: string
    userAlias: UserAlias
    paymentMethod: PaymentMethod
    currentUser?: User
    course: Course
    pricingInfo: StudentEnrollCoursePricingInfo
    coupon?: Coupon
    payLaterMethod?: PayoutMethod
  }): Promise<Partial<Invoice>> {
    const previousInvoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: {
        enrollCourses: true,
      },
    })
    if (!previousInvoice) {
      throw new BadRequestException('CANNOT_FIND_INVOICE')
    }

    const createInvoiceDTO = await this.generateInvoiceFromEnrollment(
      currentUser,
      userAlias,
      paymentMethod,
      proofToken,
      pricingInfo,
      course,
      payLaterMethod?.payoutMethodDetails?.receiptRequired,
      previousInvoice
    )

    if (previousInvoice.paymentState === PaymentStatus.PAID) {
      createInvoiceDTO.paymentState = PaymentStatus.PAID
    }

    if (previousInvoice.usedBalance > 0) {
      createInvoiceDTO.payAmount = previousInvoice.payAmount
    }

    createInvoiceDTO.amountPaid = createInvoiceDTO.payAmount ?? 0

    const updateInvoice = await this.invoiceRepository.update(
      { id: previousInvoice.id },
      {
        ...createInvoiceDTO,
        numOfApplicant: previousInvoice.numOfApplicant,
      }
    )

    if (updateInvoice.raw && updateInvoice.raw[0]) {
      return plainToInstance(Invoice, updateInvoice.raw[0])
    }

    if (createInvoiceDTO.paymentState === PaymentStatus.PAID) {
      for (const enrollCourse of previousInvoice.enrollCourses) {
        enrollCourse.confirmState = EnrollConfirmStatus.ACCEPTED
        await this.enrollCourseRepository.save(enrollCourse)
      }
    }

    return {
      ...previousInvoice,
      ...createInvoiceDTO,
    }
  }

  async generateInvoiceFromEnrollment(
    user: User,
    userAlias: UserAlias,
    paymentMethod: PaymentMethod,
    token: string,
    pricingInfo: StudentEnrollCoursePricingInfo,
    course?: Course,
    receiptRequired = true,
    previousInvoice?: Invoice
  ): Promise<StudentCreateInvoiceDTO> {
    const { feePerLesson, additionalFee, currency, originalFee, numOfApplicant } = pricingInfo

    const baseDataMapping: Partial<StudentCreateInvoiceDTO> = {
      courseId: course.id,
      userId: user.id,

      payBy: userAlias.name,
      payById: user.id,
      proofToken: token,

      // Should not update the invoice right away before the payment is confirmed by credit card
      // paymentMethod,
      currency: previousInvoice?.currency ?? currency,
      numOfApplicant: numOfApplicant ?? 1,
    }

    if (!previousInvoice) {
      baseDataMapping.paymentMethod = paymentMethod
    }

    let createInvoiceDTO: StudentCreateInvoiceDTO

    const hasPresetPayAmount = Boolean(
      previousInvoice?.usedBalance && previousInvoice.usedBalance > 0
    )

    if (pricingInfo.paymentAmount > 0) {
      const dataMapping = {
        ...baseDataMapping,
        feePerLesson,

        additionalFee,

        currency,
        originalFee,
        numOfLesson: pricingInfo.numberOfLesson,
        payAmount: hasPresetPayAmount ? previousInvoice.payAmount : pricingInfo.paymentAmount,
        amountPaid: 0,
        discountAmount: pricingInfo.totalDiscount,
        discounts: pricingInfo.discountInfo,
        paymentState: PaymentStatus.PENDING,
      }

      createInvoiceDTO = plainToInstance(StudentCreateInvoiceDTO, dataMapping)

      // pay now success always mean approved = true
      if (previousInvoice && previousInvoice.paymentMethod === PaymentMethod.PAY_NOW) {
        createInvoiceDTO.reviewed = true
        createInvoiceDTO.approvedBy = 'Stripe' // Alipay | Paypal | Visa
      }

      // FLOW-1470: Set invoice to be Submitted if no receipt required
      if (!receiptRequired) {
        createInvoiceDTO.paymentState = PaymentStatus.SUBMITTED
      }
    } else if (pricingInfo.totalDiscount > 0) {
      const dataMapping = {
        ...baseDataMapping,
        feePerLesson: 0,
        payAmount: 0,
        amountPaid: 0,
        discountAmount: pricingInfo.totalDiscount,
        discounts: pricingInfo.discountInfo,
        paymentState: PaymentStatus.PAID,
      }

      createInvoiceDTO = plainToInstance(StudentCreateInvoiceDTO, dataMapping)
    } else {
      const dataMapping = {
        ...baseDataMapping,
        discountAmount: 0,
        additionalFee: 0,
        originalFee: 0,

        feePerLesson: 0,
        payAmount: 0,
        amountPaid: 0,
        discounts: '',
        paymentState: PaymentStatus.PAID,
      }
      createInvoiceDTO = plainToInstance(StudentCreateInvoiceDTO, dataMapping)
    }

    return createInvoiceDTO
  }

  async injectApplicantsToInvoice(invoice: Invoice): Promise<StudentInvoiceResponseDto> {
    const applicants = invoice?.applicants || []
    const { ...otherInvoiceField } = invoice
    if (invoice.parentInvoice && invoice.parentInvoice.studentSchedules) {
      otherInvoiceField.studentSchedules = invoice.parentInvoice.studentSchedules
    }
    let invoiceWithApplicants: Record<string, any> = {
      ...otherInvoiceField,
      applicants: [],
    }
    if (applicants && applicants.length > 0) {
      const applicantUsers: PartialUser[] = []
      await Promise.all(
        applicants.map(async (applicant) => {
          applicantUsers.push(
            await this.usersRepository.findOne({
              where: { id: applicant },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            })
          )
        })
      )
      invoiceWithApplicants = {
        ...invoiceWithApplicants,
        applicants: applicantUsers,
      }
    }
    return invoiceWithApplicants as StudentInvoiceResponseDto
  }

  // async findByProofToken(token: string): Promise<StudentInvoiceResponseDto> {
  async findByProofToken(token: string): Promise<any> {
    // try {
    //   await this.jwtService.verify(token, { ...this.jwtOption });
    // } catch (error) {
    //   if (error.name === 'TokenExpiredError') {
    //     throw AuthorizationException.tokenExpiredException();
    //   }
    //   throw AuthorizationException.tokenInvalidException(error.message);
    // }
    if (!token) throw new BadRequestException('CANNOT_FIND_TOKEN')
    const found = await this.invoiceRepository.findOne({
      where: {
        proofToken: token,
      },
      relations: {
        enrollCourses: true,
        studentSchedules: {
          class: {
            instructor: true,
            locationRoom: true,
          },
          firstStudentLesson: true,
          studentLessons: true,
        },
        course: {
          classes: true,
        },
        invoicePromotionsUsed: true,
      },
      select: {
        studentSchedules: {
          id: true,
          type: true,
          classId: true,
          enrollCourseId: true,
          invoiceId: true,
          periodId: true,
          recurringScheduleId: true,
          firstStudentLessonId: true,
          firstStudentLesson: {
            id: true,
            studentScheduleId: true,
            classId: true,
            userId: true,
            classLessonId: true,
            startTime: true,
            endTime: true,
            changeStartTime: true,
            changeEndTime: true,
          },
          studentLessons: true,
          class: {
            id: true,
            name: true,
            instructor: {
              id: true,
              firstName: true,
            },
            locationRoom: {
              id: true,
              name: true,
            },
          },
        },
      },
    })
    if (!found) {
      throw new BadRequestException('CANNOT_FIND_INVOICE')
    }
    // Get the user object from the invoice
    const invoiceWithApplicants = await this.injectApplicantsToInvoice(found)

    const invoiceWIthApplicantsFilterOutInstructorAndLocationRoom = {
      ...invoiceWithApplicants,
      studentSchedules: invoiceWithApplicants.studentSchedules.map((studentSchedule) => ({
        ...studentSchedule,
        class: {
          ...studentSchedule.class,
          instructor: {
            id: studentSchedule.class.instructor?.id,
            firstName: studentSchedule.class.instructor?.firstName,
          },
          locationRoom: {
            id: studentSchedule.class.locationRoom?.id,
            name: studentSchedule.class.locationRoom?.name,
          },
        },
      })),
    }
    return invoiceWIthApplicantsFilterOutInstructorAndLocationRoom
  }

  async findInvoicesByProofToken(token: string): Promise<StudentInvoiceResponseDto[]> {
    const studentScheduleSelect = {
      id: true,
      type: true,
      classId: true,
      enrollCourseId: true,
      invoiceId: true,
      periodId: true,
      recurringScheduleId: true,
      firstStudentLessonId: true,
      firstStudentLesson: {
        id: true,
        studentScheduleId: true,
        classId: true,
        userId: true,
        classLessonId: true,
        startTime: true,
        endTime: true,
        changeStartTime: true,
        changeEndTime: true,
      },
      studentLessons: true,
      class: {
        id: true,
        name: true,
        instructor: {
          id: true,
          firstName: true,
        },
        locationRoom: {
          id: true,
          name: true,
        },
      },
    }
    const studentScheduleRelations = {
      class: {
        instructor: true,
        locationRoom: true,
      },
      firstStudentLesson: true,
      studentLessons: true,
    }
    const invoices = await this.invoiceRepository.find({
      where: {
        proofToken: token,
      },
      relations: {
        enrollCourses: {
          course: true,
          multipleClassMapping: true,
        },
        parentInvoice: {
          childInvoices: true,
          studentSchedules: studentScheduleRelations,
        },
        studentSchedules: studentScheduleRelations,
        course: {
          classes: true,
        },
        invoicePromotionsUsed: true,
        paymentEvidence: true,
      },
      select: {
        course: {
          id: true,
          name: true,
        },
        adminDiscounts: true,
        currency: true,
        enrollCourses: {
          id: true,
          enrollInto: true,
          billingEndDate: true,
          billingStartDate: true,
          course: {
            id: true,
            name: true,
          },
          email: true,
          name: true,
          phone: true,
          registrationForm: true,
          paymentAmount: true,
          multipleClassMapping: true,
        },
        payAmount: true,
        paymentState: true,
        updatedAt: true,
        id: true,
        proofToken: true,
        studentSchedules: studentScheduleSelect,
        usedBalance: true,
        creditTransactionsId: true,
        discountDetails: true,
        documentCampaignId: true,
      },
    })
    if (!invoices || invoices.length === 0) {
      throw new BadRequestException('CANNOT_FIND_INVOICE')
    }
    return await Promise.all(invoices.map((invoice) => this.injectApplicantsToInvoice(invoice)))
  }

  async findInvoiceWithIdAndProofToken(
    id: number,
    proofToken: string
  ): Promise<StudentInvoiceResponseDto> {
    const found = await this.invoiceRepository.findOne({
      where: {
        id,
        proofToken,
      },
      relations: {
        userAlias: true,
        user: true,
        enrollCourses: {
          multipleClassMapping: {
            class: true,
          },
          student: true,
          studentSchedule: {
            studentLessons: true,
          },
          course: true,
        },
        studentSchedules: {
          class: true,
          firstStudentLesson: true,
        },
        course: true,
        invoicePromotionsUsed: true,
      },
    })
    if (!found) {
      throw new BadRequestException('CANNOT_FIND_INVOICE')
    }

    // Get the user object from the invoice
    return this.injectApplicantsToInvoice(found)
  }

  async findInvoiceWithIdOrToken(
    id: number,
    proofToken: string
  ): Promise<StudentInvoiceResponseDto> {
    const found = await this.invoiceRepository.findOne({
      where: [
        {
          proofToken,
        },
        {
          id,
        },
      ],
      relations: {
        enrollCourses: true,
        studentSchedules: {
          class: true,
          firstStudentLesson: true,
        },
        course: true,
        invoicePromotionsUsed: true,
      },
    })

    if (!found) {
      throw new BadRequestException('CANNOT_FIND_INVOICE')
    }

    // Get the user object from the invoice
    return this.injectApplicantsToInvoice(found)
  }

  async findByEnrollId(enrollId: number) {
    const found = await this.invoiceRepository.findAll({
      where: {
        enrollCourses: {
          id: enrollId,
        },
      },
      relations: {
        enrollCourses: true,
        studentSchedules: {
          class: true,
          firstStudentLesson: true,
        },
        course: true,
        invoicePromotionsUsed: true,
      },
    })
    if (!found) {
      throw new NotFoundException('CANNOT_FIND_INVOICE')
    }

    return found
  }

  async updatePaymentState(
    invoiceId: number,
    state: PaymentStatus
    // approvedBy: string,
    // approverId: number,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneById(invoiceId)

    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }
    invoice.paymentState = state
    if (state === PaymentStatus.PAID) {
      invoice.amountPaid = invoice.payAmount ?? 0
    }
    // invoice.approvedBy = approvedBy;
    // invoice.approverId = approverId;
    return await this.invoiceRepository.save(invoice)
  }

  getRepository(): InvoiceRepository {
    return this.invoiceRepository
  }

  async findInstitutionInvoices(pageOptionsDto: InvoicesOptionDto): Promise<InvoicesPageDto> {
    const { isInitialRequest, ...rest } = pageOptionsDto

    let whereCondition: FindOptionsWhere<Invoice> = {
      siteId: rest.siteId,
      institutionId: rest.institutionId,
      // courseId: rest.courseId,
      // Only data within not deleted course will send to user
      invoiceParentId: IsNull(),
      deletedAt: IsNull(),
      course: {
        deletedAt: IsNull(),
      },
    }
    if (rest.courseId) {
      whereCondition.courseId = rest.courseId
    }

    if (rest.paymentState) {
      whereCondition.paymentState = rest.paymentState
    }
    if (rest.startDate && rest.endDate) {
      if (dayjs(rest.startDate).isAfter(rest.endDate)) {
        throw new BadRequestException('Start date must be before end date')
      }
      whereCondition.updatedAt = Between(rest.startDate, rest.endDate)
    }

    const orderOption: FindOptionsOrder<EnrollCourse> = {}
    if (rest.orderBy) {
      orderOption[rest.orderBy] = rest.order
    }

    if (rest.invoiceId) {
      whereCondition = { id: rest.invoiceId }
    }

    const relations: FindOptionsRelations<Invoice> = {
      // enrollCourse: true,
      studentSchedules: {
        // class: true,
        studentLessons: true,
      },
      userAlias: {
        user: true,
      },
      paymentEvidence: true,
      enrollCourses: {
        course: true,
      },
      childInvoices: true,
      invoicePromotionsUsed: true,
    }

    const select: FindOptionsSelect<Invoice> = {
      id: true,
      siteId: true,
      institutionId: true,
      createdAt: true,
      updatedAt: true,
      paymentState: true,
      paymentMethod: true,
      payAmount: true,
      additionalFee: true,
      discountAmount: true,
      feePerLesson: true,
      proofToken: true,
      userAliasId: true,
      courseId: true,
      enrollCourses: {
        id: true,
        name: true,
        phone: true,
        email: true,
        currency: true,
        confirmState: true,
        paymentAmount: true,

        registrationForm: true,
        enrollInto: true,

        course: {
          path: true,
        },
      },
      splitItems: true,
      paymentDate: true, // show payment date

      payLaterMethod: {
        id: true,
        methodName: true,
      },

      studentSchedules: {
        id: true,
        classId: true,
        enrollCourseId: true,
        studentLessons: {
          id: true,
          startTime: true,
          endTime: true,
          changeStartTime: true,
          changeEndTime: true,
        },
      },
      paymentEvidence: {
        id: true,
        status: true,
      },
      invoicePromotionsUsed: true,
      userAlias: {
        id: true,
        userId: true,
        name: true,
        email: true,
        isStudentParent: true,
        user: {
          id: true,
          phone: true,
        },
      },
      remark: true,
      documentCampaignId: true,
    }
    // If current request is initial request and there is no data, we will delete the createdAt filter
    // This is to avoid the case that the user not show the data when there is no data at the first time

    if (isInitialRequest) {
      const countData = await this.invoiceRepository.getCount(
        whereCondition,
        orderOption,
        relations,
        select
      )
      if (countData <= 0) {
        delete whereCondition.updatedAt
      }
    }

    const additionalFilterFn = async (entities: Invoice[]) => {
      return entities.filter((entity) => {
        const enrollCourse = entity?.enrollCourses?.[0] || ({} as EnrollCourse)
        if (rest.search) {
          const search = rest.search.toLowerCase()
          return (
            enrollCourse?.preferredName?.toLowerCase()?.includes(search) ||
            enrollCourse?.preferredPhone?.toLowerCase()?.includes(search) ||
            enrollCourse?.preferredEmail?.toLowerCase()?.includes(search)
          )
        }
        return true
      })
    }

    const pageDto = await this.invoiceRepository.paginationWithTransform(
      rest,
      Invoice,
      whereCondition,
      orderOption,
      relations,
      select,
      true,
      additionalFilterFn
    )

    const divitInvoiceIds = pageDto.content
      .filter((invoice) => invoice.paymentMethod === 'PAY_NOW_DIVIT')
      .map((invoice) => invoice.id)

    if (divitInvoiceIds.length > 0) {
      const divitOrders = await this.invoiceRepository.manager.find(DivitOrder, {
        where: { invoiceId: In(divitInvoiceIds) },
      })
      const divitOrdersMap = _.keyBy(divitOrders, 'invoiceId')
      pageDto.content.forEach((invoice) => {
        if (invoice.paymentMethod === 'PAY_NOW_DIVIT') {
          invoice.divitOrder = divitOrdersMap[invoice.id] || null
        }
      })
    }

    return pageDto
  }

  async findSingleInvoiceByInvoiceId(invoiceId: number): Promise<Invoice> {
    const relations: FindOptionsRelations<Invoice> = {
      // enrollCourse: true,
      studentSchedules: {
        class: true,
        firstStudentLesson: true,
        studentLessons: true,
      },
      paymentEvidence: true,
      userAlias: true,
      enrollCourses: {
        course: true,
        // Each enrollCourse can carry its own userAlias on combined invoices
        // (one invoice ↔ many students). Loading it lets the frontend edit
        // each student's contact info independently of the buyer's alias.
        userAlias: true,
      },
      // course: true,
      childInvoices: true,
      invoicePromotionsUsed: true,
    }

    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: invoiceId,
      },
      relations,
    })

    if (!invoice) {
      throw new NotFoundException('CANNOT_FIND_INVOICE')
    }

    if (invoice.paymentMethod === 'PAY_NOW_DIVIT') {
      invoice.divitOrder = await this.invoiceRepository.manager.findOne(DivitOrder, {
        where: { invoiceId: invoice.id },
      })
    }

    return invoice
  }

  async handleUpdateLessson(data: StudentCreateNewScheduleInInvoiceProps) {
    const period = await this.regularPeriodsRepository.findOneById(data.periodId)
    if (!period) {
      throw new NotFoundException(ErrorCode.PERIOD_NOT_FOUND)
    }
    const dataLessonUpdate = {
      ...data,
      periodId: period.id,
      ..._.pick(period, ['unit', 'every']),
    }
    const { newStartTime, newEndTime } = await this.classLessonService.handleUpdateTeacherLesson(
      dataLessonUpdate
    )

    await this.classLessonService.handleUpdateStuLesson({
      ...dataLessonUpdate,
      newStartTime,
      newEndTime,
    })
  }

  async findInvoiceStatisticsByDateRange({
    startDate,
    endDate,
    institutionId,
    siteId,
  }: {
    startDate?: Date
    endDate?: Date
    institutionId: number
    siteId: number
  }): Promise<Invoice[]> {
    // if there is only start date, set end date to current date
    let dayjsEndDate = endDate
    if (endDate) {
      dayjsEndDate = dayjs(endDate).endOf('day').toDate()
    }

    const invoices = await this.invoiceRepository.find({
      where: {
        institutionId,
        siteId,
        updatedAt: Between(startDate, dayjsEndDate),
      },
      relations: {
        enrollCourses: true,
      },
      order: {
        updatedAt: 'DESC',
      },
    })

    return invoices
  }

  async updatePaymentAmount(invoiceId: number, paymentAmount: number): Promise<Invoice> {
    if (paymentAmount < 0 || !Number.isFinite(paymentAmount)) {
      throw new BadRequestException('Payment amount must be a positive number')
    }

    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: invoiceId,
      },
      relations: {
        enrollCourses: true,
      },
    })

    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    // Check if invoice transcation Id is uuid

    const transaction = await this.transactionRepository.findOneBy({
      invoiceId: invoice.id,
    })

    if (transaction) {
      transaction.amountTotal = paymentAmount
      transaction.amountSubtotal = paymentAmount
      await this.transactionRepository.save(transaction)
    }

    const enrollCourse = invoice.enrollCourses.at(0)

    if (enrollCourse) {
      enrollCourse.paymentAmount = paymentAmount
      await this.enrollCourseRepository.save(enrollCourse)
    }

    invoice.payAmount = paymentAmount
    invoice.feePerLesson = paymentAmount

    const newInvoice = await this.invoiceRepository.save(invoice)

    await this.recordLogRepository.save({
      type: RecordLogType.UPDATE_PAYMENT_AMOUNT,
      institutionId: newInvoice.institutionId,
      detail: {
        invoiceId: newInvoice.id,
        transactionId: newInvoice.transactionId,
        enrollId: enrollCourse?.id,
        paymentAmount: newInvoice.payAmount,
        paymentAmountBefore: invoice.payAmount,
      },
      userId: newInvoice.userId,
    })

    return newInvoice
  }

  async updateAmountPaid(invoiceId: number, amountPaid: number): Promise<Invoice> {
    if (amountPaid < 0 || !Number.isFinite(amountPaid)) {
      throw new BadRequestException('Amount paid must be a non-negative number')
    }

    const invoice = await this.invoiceRepository.findOneById(invoiceId)

    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    invoice.amountPaid = amountPaid
    return await this.invoiceRepository.save(invoice)
  }

  async updatePaymentDate(
    invoiceId: number,
    payload: { paymentDate?: string; createdAt?: string; updatedAt?: string }
  ): Promise<Invoice> {
    const hasPaymentDate = payload.paymentDate !== undefined
    const hasCreatedAt = payload.createdAt != null && payload.createdAt !== ''
    const hasUpdatedAt = payload.updatedAt != null && payload.updatedAt !== ''

    const parsedDate = dayjs(payload.paymentDate)
    if (!parsedDate.isValid()) {
      throw new BadRequestException('Invalid payment date format. Expected YYYY-MM-DD.')
    }

    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['enrollCourses'],
    })

    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    const oldPaymentDate = invoice.paymentDate

    invoice.paymentDate = parsedDate.toDate()

    const updatedInvoice = await this.invoiceRepository.save(invoice)

    await this.recordLogRepository.save({
      type: RecordLogType.UPDATE_PAYMENT_DATE,
      institutionId: invoice.institutionId,
      detail: {
        invoiceId: updatedInvoice.id,
        transactionId: updatedInvoice.transactionId,
        paymentDate: updatedInvoice.paymentDate,
        paymentDateBefore: oldPaymentDate,
      },
      userId: invoice.userId,
    })

    return updatedInvoice
  }

  /**
   * Get student-level enrollment/dropout stats with filters.
   */
  async getStudentStatisticsByStudent(params: {
    startDate: Date
    endDate: Date
    institutionId: number
    siteId: number
    studentName?: string
    classId?: number
    teacherId?: number
  }) {
    const { startDate, endDate, institutionId, siteId, studentName, classId, teacherId } = params

    const qb = this.studentScheduleRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.enrollCourses', 'ec')
      .innerJoin('ec.student', 'stu')
      .innerJoin('ss.class', 'ce')
      .innerJoin('ce.course', 'c')
      .leftJoin('ce.instructor', 'ins')
      .select([
        'stu.id AS student_id',
        "stu.first_name || ' ' || stu.last_name AS student_name",
        'stu.phone AS phone',
        'stu.email AS email',
      ])
    // .where('ss.institution_id = :institutionId', { institutionId })
    // .andWhere('ss.site_id = :siteId', { siteId });

    if (studentName)
      qb.andWhere("LOWER(stu.first_name || ' ' || stu.last_name) LIKE LOWER(:studentName)", {
        studentName: `%${studentName}%`,
      })
    if (classId) qb.andWhere('ce.id = :classId', { classId })
    if (teacherId) qb.andWhere('ins.id = :teacherId', { teacherId })

    // Subquery: # of courses currently active (enrolled during period)
    const currentCoursesSub = this.studentScheduleRepository
      .createQueryBuilder('ss2')
      .innerJoin('ss2.enrollCourses', 'ec2')
      .select('COUNT(*)')
      .where('ec2.user_id = stu.id')
      .andWhere('ec2.billing_start_date <= :endDate', { endDate })
      .andWhere('(ec2.billing_end_date IS NULL OR ec2.billing_end_date >= :startDate)', {
        startDate,
      })

    // Subquery: # of courses started within period
    const newCoursesSub = this.studentScheduleRepository
      .createQueryBuilder('ss3')
      .innerJoin('ss3.enrollCourses', 'ec3')
      .select('COUNT(*)')
      .where('ec3.user_id = stu.id')
      .andWhere('ec3.billing_start_date >= :startDate', { startDate })
      .andWhere('ec3.billing_start_date < :endDate', { endDate })

    // Subquery: # of courses DROPPED — enrolled before period, but no attendance DURING period
    const droppedCoursesSub = this.studentScheduleRepository
      .createQueryBuilder('ss4')
      .innerJoin('ss4.enrollCourses', 'ec4')
      .select('COUNT(*)')
      .where('ec4.user_id = stu.id')
      .andWhere('ec4.billing_start_date < :startDate', { startDate })
      .andWhere('(ec4.billing_end_date IS NULL OR ec4.billing_end_date >= :startDate)')
      .andWhere(
        `NOT EXISTS (
         SELECT 1
         FROM student_lesson sl2
         INNER JOIN class_lessons cl2 ON sl2.class_lesson_id = cl2.id
         WHERE sl2.student_schedule_id = ss4.id
           AND cl2.start_time >= :startDate
           AND cl2.start_time < :endDate
       )`
      )

    qb.addSelect(`(${currentCoursesSub.getQuery()})`, 'current_courses')
      .addSelect(`(${newCoursesSub.getQuery()})`, 'new_courses')
      .addSelect(`(${droppedCoursesSub.getQuery()})`, 'dropped_courses')
      .setParameters({ startDate, endDate, institutionId, siteId })
      .groupBy('stu.id, stu.first_name, stu.last_name, stu.phone, stu.email')

    const results = await qb.getRawMany()

    const studentData = results.map((r) => {
      const current = parseInt(r.current_courses, 10) || 0
      const dropped = parseInt(r.dropped_courses, 10) || 0
      return {
        studentId: parseInt(r.student_id, 10),
        studentName: r.student_name,
        phone: r.phone,
        email: r.email,
        numberOfCourses: current,
        newCourses: parseInt(r.new_courses, 10) || 0,
        coursesDroppedOut: dropped,
        totallyDroppedOut: current === 0 && dropped > 0 ? 'Yes' : 'No',
      }
    })

    const activeStudents = studentData.filter((s) => s.numberOfCourses > 0).length
    const studentsWithNewCourse = studentData.filter((s) => s.newCourses > 0).length
    const studentsWithDropout = studentData.filter((s) => s.coursesDroppedOut > 0).length
    const totallyDroppedStudents = studentData.filter((s) => s.totallyDroppedOut === 'Yes').length

    return {
      summary: {
        activeStudents,
        studentsWithNewCourse,
        studentsWithDropout,
        totallyDroppedStudents,
      },
      students: studentData,
    }
  }

  /**
   * Get course enrollment history for a specific student.
   */
  async getStudentCourseDetails(
    studentId: number,
    { startDate }: { startDate: Date; endDate: Date; institutionId: number; siteId: number }
  ) {
    // Current courses: enrolled during period
    const currentCourses = await this.studentScheduleRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.class', 'ce')
      .innerJoin('ce.course', 'c')
      .leftJoin('ce.instructor', 'ins')
      .leftJoin('ss.studentLessons', 'sl')
      .leftJoin('sl.classLesson', 'cl')
      .select([
        'c.name AS course_name',
        'ce.name AS class_name',
        "COALESCE(ins.first_name || ' ' || ins.last_name, '-') AS instructor",
        // 'ss.start_date AS date_enrolled',
        'MAX(cl.start_time) AS last_attendance',
      ])
      .where('ss.user_id = :studentId', { studentId })
      // .andWhere('ss.institution_id = :institutionId', { institutionId })
      // .andWhere('ss.site_id = :siteId', { siteId })
      // .andWhere('ss.start_date <= :endDate', { endDate })
      // .andWhere('(ss.end_date IS NULL OR ss.end_date >= :startDate)', { startDate })
      .groupBy('c.name, ce.name, ins.first_name, ins.last_name')
      .getRawMany()

    // Dropped courses: enrolled BEFORE period, ended or inactive DURING period
    const droppedCourses = await this.studentScheduleRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.class', 'ce')
      .innerJoin('ce.course', 'c')
      .leftJoin('ce.instructor', 'ins')
      .select([
        'c.name AS course_name',
        'ce.name AS class_name',
        "COALESCE(ins.first_name || ' ' || ins.last_name, '-') AS instructor",
        // 'ss.start_date AS date_enrolled',
        'MAX(prev_cl.start_time) AS last_attendance',
      ])
      .leftJoin(
        (qb) =>
          qb
            .from('student_lesson', 'sl_prev')
            .innerJoin('class_lesson', 'cl_prev', 'sl_prev.class_lesson_id = cl_prev.id')
            .where('cl_prev.start_time < :startDate', { startDate }),
        'prev_sl',
        'prev_sl.student_schedule_id = ss.id'
      )
      .leftJoin('prev_sl.classLesson', 'prev_cl')
      .where('ss.user_id = :studentId', { studentId })
      // .andWhere('ss.institution_id = :institutionId', { institutionId })
      // .andWhere('ss.site_id = :siteId', { siteId })
      // .andWhere('ss.start_date < :startDate', { startDate })
      // .andWhere('(ss.end_date IS NULL OR ss.end_date >= :startDate)')
      .andWhere(
        `NOT EXISTS (
         SELECT 1
         FROM student_lesson sl2
         INNER JOIN class_lessons cl2 ON sl2.class_lesson_id = cl2.id
         WHERE sl2.student_schedule_id = ss.id
           AND cl2.start_time >= :startDate
           AND cl2.start_time < :endDate
       )`
      )
      .groupBy('c.name, ce.name, ins.first_name, ins.last_name')
      .getRawMany()

    return {
      currentCourses: currentCourses.map((c) => ({
        courseName: c.course_name,
        class: c.class_name,
        instructor: c.instructor,
        dateEnrolled: c.date_enrolled,
        lastAttendance: c.last_attendance,
      })),
      droppedCourses: droppedCourses.map((d) => ({
        courseName: d.course_name,
        class: d.class_name,
        instructor: d.instructor,
        dateEnrolled: d.date_enrolled,
        lastAttendance: d.last_attendance,
      })),
    }
  }

  /**
   * Get Dropout Students List for a Class - FIXED
   */
  async getDropoutStudents(params: {
    classId: number
    startDate: Date
    endDate: Date
    institutionId: number
    siteId: number
  }) {
    const { classId, startDate, endDate, institutionId, siteId } = params

    const qb = this.studentScheduleRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.enrollCourses', 'ec')
      .innerJoin('ec.student', 'stu')
      .innerJoin('ss.class', 'ce')
      .select([
        'stu.id AS student_id',
        "COALESCE(stu.first_name, '') || ' ' || COALESCE(stu.last_name, '') AS name",
        'stu.phone AS phone',
        'stu.email AS email',
      ])
      .addSelect(
        `(SELECT MAX(cl_last.start_time)
        FROM student_lesson sl_last
        INNER JOIN class_lessons cl_last ON sl_last.class_lesson_id = cl_last.id
        WHERE sl_last.student_schedule_id = ss.id
          AND sl_last.deleted_at IS NULL
          AND cl_last.deleted_at IS NULL
          AND cl_last.start_time < :endDate
      )`,
        'last_attendance'
      )
      .where('ce.id = :classId', { classId })
      .andWhere('ec.institutionId = :institutionId', { institutionId })
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('ec.deleted_at IS NULL')
      // Had lessons BEFORE period
      .andWhere(
        `EXISTS (
        SELECT 1
        FROM student_lesson sl_before
        INNER JOIN class_lessons cl_before ON sl_before.class_lesson_id = cl_before.id
        WHERE sl_before.student_schedule_id = ss.id
          AND cl_before.start_time < :startDate
          AND sl_before.deleted_at IS NULL
          AND cl_before.deleted_at IS NULL
      )`
      )
      // NO lessons during period
      .andWhere(
        `NOT EXISTS (
        SELECT 1
        FROM student_lesson sl_current
        INNER JOIN class_lessons cl_current ON sl_current.class_lesson_id = cl_current.id
        WHERE sl_current.student_schedule_id = ss.id
          AND cl_current.start_time >= :startDate
          AND cl_current.start_time < :endDate
          AND sl_current.deleted_at IS NULL
          AND cl_current.deleted_at IS NULL
      )`
      )
      .setParameters({ classId, startDate, endDate, institutionId, siteId })
      .groupBy('stu.id, stu.first_name, stu.last_name, stu.phone, stu.email, ss.id')

    const results = await qb.getRawMany()

    return {
      students: results.map((r) => ({
        name: r.name,
        phone: r.phone,
        email: r.email,
        lastAttendance: r.last_attendance || null,
      })),
    }
  }

  /**
   * Main orchestrator for dashboard statistics.
   * Delegates to revenue or student stat handlers based on `type`.
   */
  async getDashboardStatistics(params: DashboardParams) {
    const { type, filter, startDate, endDate } = params

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date')
    }

    const qb = this.createBaseQueryBuilder(params)

    switch (type) {
      case 'revenue':
        return this.getRevenueStatistics(qb, filter, params)
      case 'student':
        return this.getStudentStatistics(qb, filter, params)
      default:
        throw new BadRequestException('Invalid type. Use "revenue" or "student".')
    }
  }

  /**
   * Builds the base invoice query builder for attended, paid lessons within date range.
   */
  private createBaseQueryBuilder(params: DashboardParams) {
    const { startDate, endDate, institutionId, siteId, status } = params

    let qb = this.invoiceRepository
      .createQueryBuilder('i')
      .innerJoin('i.studentSchedules', 'ss')
      .innerJoin('ss.studentLessons', 'sl')
      .innerJoin('sl.classLesson', 'cl')
      .where('cl.start_time >= :startDate', { startDate })
      .andWhere('cl.start_time < :endDate', { endDate })
      // .andWhere('sl.attendance = :present', { present: 'ATTENDED' })
      .andWhere('i.payment_state = :paid', { paid: PaymentStatus.PAID })
      .andWhere('i.num_of_lesson > 0')
      .andWhere('i.institutionId = :institutionId', { institutionId })
      .andWhere('i.siteId = :siteId', { siteId })

    if (status) {
      qb = qb.andWhere('i.payment_state = :statusFilter', { statusFilter: status })
    }

    return qb
  }

  /**
   * Creates a reusable subquery counting attended lessons per invoice in period.
   */
  private createInvoiceAttendanceSubquery(startDate: Date, endDate: Date, institutionId: number) {
    return (
      this.studentLessonRepository
        .createQueryBuilder('sl_sub')
        .innerJoin('sl_sub.studentSchedule', 'ss_sub')
        .innerJoin('ss_sub.invoice', 'i_sub')
        .innerJoin('sl_sub.classLesson', 'cl_sub')
        .select(['i_sub.id AS invoice_id', 'COUNT(cl_sub.id) AS attended_in_period'])
        .where('cl_sub.start_time >= :startDate', { startDate })
        .andWhere('cl_sub.start_time < :endDate', { endDate })
        // .andWhere('sl_sub.attendance = :present', { present: 'ATTENDED' })
        .andWhere('i_sub.institutionId = :institutionId', { institutionId })
        // FIX 3: Tambahkan filter payment_state
        .andWhere('i_sub.payment_state = :paid', { paid: PaymentStatus.PAID })
        .andWhere('i_sub.num_of_lesson > 0')
        .groupBy('i_sub.id')
    )
  }

  /**
   * Routes revenue statistics by filter type.
   */
  private async getRevenueStatistics(qb: any, filter: string, params: DashboardParams) {
    const { startDate, endDate, institutionId, siteId, courseId, classId, instructorId } = params

    switch (filter) {
      case 'overview':
        return this.getRevenueOverview(qb, {
          startDate,
          endDate,
          institutionId,
          siteId,
          courseId,
          classId,
          instructorId,
        })
      case 'by-course':
        return this.getRevenueByCourse(qb, startDate, endDate, institutionId, classId, instructorId)
      case 'by-class':
        return this.getRevenueByClass(qb, startDate, endDate, institutionId, courseId, instructorId)
      case 'by-instructor':
        return this.getRevenueByInstructor(qb, startDate, endDate, institutionId, courseId, classId)
      default:
        throw new BadRequestException(
          'Invalid filter for revenue. Use: overview, by-course, by-class, by-instructor'
        )
    }
  }

  /**
   * Routes student statistics by filter type.
   */
  private async getStudentStatistics(qb: any, filter: string, params: DashboardParams) {
    const { startDate, endDate, institutionId, courseId, classId, instructorId } = params

    switch (filter) {
      case 'overview':
        return this.getStudentOverview(
          startDate,
          endDate,
          institutionId,
          courseId,
          classId,
          instructorId
        )
      case 'by-student':
        return this.getStudentByStudent(
          qb,
          startDate,
          endDate,
          institutionId,
          courseId,
          classId,
          instructorId
        )
      case 'by-instructor':
        return this.getStudentByInstructor(qb, startDate, endDate, institutionId, courseId, classId)
      default:
        throw new BadRequestException(
          'Invalid filter for student. Use: overview, by-student, by-instructor'
        )
    }
  }

  /**
   * Student overview: active, new, dropout counts and rate.
   * Uses direct student schedule queries — not invoice-based.
   */
  private async getStudentOverview(
    startDate: Date,
    endDate: Date,
    institutionId: number,
    courseId?: number,
    classId?: number,
    instructorId?: number
  ) {
    const studentRepo = this.studentScheduleRepository

    // Helper function untuk apply filters
    const applyFilters = (qb: any) => {
      if (courseId) {
        qb = qb
          .innerJoin('ss.class', 'ce_filter')
          .innerJoin('ce_filter.course', 'c_filter')
          .andWhere('c_filter.id = :courseId', { courseId })
      }
      if (classId) {
        qb = qb
          .innerJoin('ss.class', 'ce_filter2')
          .andWhere('ce_filter2.id = :classId', { classId })
      }
      if (instructorId) {
        qb = qb
          .innerJoin('ss.class', 'ce_filter3')
          .innerJoin('ce_filter3.instructor', 'ins_filter')
          .andWhere('ins_filter.id = :instructorId', { instructorId })
      }
      return qb
    }

    // ========================================
    // ACTIVE STUDENTS
    // Definition: Students yang attend at least 1 lesson dalam period
    // ========================================
    let activeStudentsQuery = studentRepo
      .createQueryBuilder('ss')
      .innerJoin('ss.enrollCourses', 'ec')
      .innerJoin('ec.student', 'stu')
      .innerJoin('ss.studentLessons', 'sl')
      .innerJoin('sl.classLesson', 'cl')
      .select('COUNT(DISTINCT stu.id)', 'count')
      .where('cl.start_time >= :startDate', { startDate })
      .andWhere('cl.start_time < :endDate', { endDate })
      // REMOVED attendance filter - count all students regardless of attendance
      // .andWhere('sl.attendance = :present', { present: 'ATTENDED' })
      .andWhere('ec.institutionId = :institutionId', { institutionId })
      .andWhere('sl.deleted_at IS NULL')
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('ec.deleted_at IS NULL')

    activeStudentsQuery = applyFilters(activeStudentsQuery)

    // ========================================
    // NEW STUDENTS
    // Definition: First lesson EVER is within this period
    // ========================================
    let newStudentsQuery = studentRepo
      .createQueryBuilder('ss')
      .innerJoin('ss.enrollCourses', 'ec')
      .innerJoin('ec.student', 'stu')
      .innerJoin('ss.studentLessons', 'sl')
      .innerJoin('sl.classLesson', 'cl')
      .select('COUNT(DISTINCT stu.id)', 'count')
      .where('ec.institutionId = :institutionId', { institutionId })
      .andWhere('sl.deleted_at IS NULL')
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('ec.deleted_at IS NULL')
      // First lesson ever must be in this period
      .andWhere(
        `(SELECT MIN(cl_first.start_time)
       FROM student_lesson sl_first
       JOIN class_lessons cl_first ON sl_first.class_lesson_id = cl_first.id
       WHERE sl_first.user_id = stu.id
         AND sl_first.deleted_at IS NULL
         AND cl_first.deleted_at IS NULL
      ) BETWEEN :startDate AND :endDate`,
        { startDate, endDate }
      )

    newStudentsQuery = applyFilters(newStudentsQuery)

    // ========================================
    // DROPOUT STUDENTS - FIXED LOGIC
    // Definition:
    // - Enrolled/had lessons BEFORE period start
    // - NO lessons in current period
    // - NOT a new student
    // ========================================
    let dropoutStudentsQuery = studentRepo
      .createQueryBuilder('ss')
      .innerJoin('ss.enrollCourses', 'ec')
      .innerJoin('ec.student', 'stu')
      .select('COUNT(DISTINCT stu.id)', 'count')
      .where('ec.institutionId = :institutionId', { institutionId })
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('ec.deleted_at IS NULL')
      // Student had lessons BEFORE this period
      .andWhere(
        `EXISTS (
        SELECT 1
        FROM student_lesson sl_before
        JOIN class_lessons cl_before ON sl_before.class_lesson_id = cl_before.id
        WHERE sl_before.user_id = stu.id
          AND cl_before.start_time < :startDate
          AND sl_before.deleted_at IS NULL
          AND cl_before.deleted_at IS NULL
      )`
      )
      // Student has NO lessons in current period
      .andWhere(
        `NOT EXISTS (
        SELECT 1
        FROM student_lesson sl_current
        JOIN class_lessons cl_current ON sl_current.class_lesson_id = cl_current.id
        WHERE sl_current.user_id = stu.id
          AND cl_current.start_time >= :startDate
          AND cl_current.start_time < :endDate
          AND sl_current.deleted_at IS NULL
          AND cl_current.deleted_at IS NULL
      )`
      )

    dropoutStudentsQuery = applyFilters(dropoutStudentsQuery)

    // Execute all queries
    const [activeResult, newResult, dropoutResult] = await Promise.all([
      activeStudentsQuery
        .setParameters({ startDate, endDate, institutionId, courseId, classId, instructorId })
        .getRawOne(),
      newStudentsQuery
        .setParameters({ startDate, endDate, institutionId, courseId, classId, instructorId })
        .getRawOne(),
      dropoutStudentsQuery
        .setParameters({ startDate, endDate, institutionId, courseId, classId, instructorId })
        .getRawOne(),
    ])

    const activeStudents = parseInt(activeResult.count, 10) || 0
    const newStudentsThisMonth = parseInt(newResult.count, 10) || 0
    const totalDropouts = parseInt(dropoutResult.count, 10) || 0

    // FIX: Dropout rate as percentage (0-100)
    // Base = students who were active before OR during period
    const totalStudentsBase = activeStudents + totalDropouts
    const dropoutRate =
      totalStudentsBase > 0 ? parseFloat(((totalDropouts / totalStudentsBase) * 100).toFixed(2)) : 0

    // Get class-level stats
    const classStats = await this.getClassDropoutStatsFixed(
      startDate,
      endDate,
      institutionId,
      courseId,
      classId,
      instructorId
    )

    console.log('=== STUDENT OVERVIEW ===')
    console.log('Active Students:', activeStudents)
    console.log('New Students:', newStudentsThisMonth)
    console.log('Total Dropouts:', totalDropouts)
    console.log('Dropout Rate:', dropoutRate + '%')
    console.log('========================')

    return {
      summary: {
        activeStudents,
        newStudentsThisMonth,
        totalDropouts,
        dropoutRate, // Now as percentage (0-100)
      },
      classes: classStats,
    }
  }

  /**
   * Class-level Dropout Stats - FIXED
   */
  private async getClassDropoutStatsFixed(
    startDate: Date,
    endDate: Date,
    institutionId: number,
    courseId?: number,
    classId?: number,
    instructorId?: number
  ) {
    // Build base query untuk classes
    let qb = this.classRepository
      .createQueryBuilder('ce')
      .innerJoin('ce.course', 'c')
      .leftJoin('ce.instructor', 'ins')
      .select([
        'ce.id AS class_id',
        'c.name AS course_name',
        'ce.name AS class_name',
        "COALESCE(ins.first_name || ' ' || ins.last_name, '-') AS teacher_name",
      ])
      .where('ce.institution_id = :institutionId', { institutionId })

    // Apply filters
    if (courseId) qb = qb.andWhere('c.id = :courseId', { courseId })
    if (classId) qb = qb.andWhere('ce.id = :classId', { classId })
    if (instructorId) qb = qb.andWhere('ins.id = :instructorId', { instructorId })

    // ========================================
    // TOTAL STUDENTS per class
    // Students who have ANY lesson in this class (current or past)
    // ========================================
    const totalStudentsSub = this.studentScheduleRepository
      .createQueryBuilder('ss_total')
      .innerJoin('ss_total.enrollCourses', 'ec_total')
      .innerJoin('ec_total.student', 'stu_total')
      .innerJoin('ss_total.studentLessons', 'sl_total')
      .innerJoin('sl_total.classLesson', 'cl_total')
      .select('COUNT(DISTINCT stu_total.id)')
      .where('ss_total.class_id = ce.id')
      .andWhere('cl_total.start_time >= :startDate')
      .andWhere('cl_total.start_time < :endDate')
      .andWhere('ec_total.institutionId = :institutionId')
      .andWhere('ss_total.deleted_at IS NULL')
      .andWhere('sl_total.deleted_at IS NULL')
      .andWhere('ec_total.deleted_at IS NULL')

    // ========================================
    // NEW STUDENTS per class
    // First lesson in THIS class is within period
    // ========================================
    const newStudentsSub = this.studentScheduleRepository
      .createQueryBuilder('ss_new')
      .select('COUNT(DISTINCT stu_new.id)')
      .innerJoin('ss_new.enrollCourses', 'ec_new')
      .innerJoin('ec_new.student', 'stu_new')
      .innerJoin('ss_new.studentLessons', 'sl_new')
      .innerJoin('sl_new.classLesson', 'cl_new')
      .where('ss_new.class_id = ce.id')
      .andWhere('ec_new.institutionId = :institutionId')
      .andWhere('ss_new.deleted_at IS NULL')
      .andWhere('sl_new.deleted_at IS NULL')
      .andWhere('ec_new.deleted_at IS NULL')
      .andWhere(
        `(SELECT MIN(cl_first.start_time)
       FROM student_lesson sl_first
       INNER JOIN class_lessons cl_first ON sl_first.class_lesson_id = cl_first.id
       INNER JOIN student_schedule ss_first ON sl_first.student_schedule_id = ss_first.id
       WHERE ss_first.class_id = ce.id
         AND sl_first.user_id = stu_new.id
         AND sl_first.deleted_at IS NULL
         AND ss_first.deleted_at IS NULL
         AND cl_first.deleted_at IS NULL
      ) BETWEEN :startDate AND :endDate`
      )

    // ========================================
    // DROPOUT STUDENTS per class - FIXED
    // Had lessons in this class BEFORE period, but NONE during period
    // ========================================
    const dropoutStudentsSub = this.studentScheduleRepository
      .createQueryBuilder('ss_dropout')
      .innerJoin('ss_dropout.enrollCourses', 'ec_dropout')
      .innerJoin('ec_dropout.student', 'stu_dropout')
      .select('COUNT(DISTINCT stu_dropout.id)')
      .where('ss_dropout.class_id = ce.id')
      .andWhere('ec_dropout.institutionId = :institutionId')
      .andWhere('ss_dropout.deleted_at IS NULL')
      .andWhere('ec_dropout.deleted_at IS NULL')
      // Had lessons BEFORE period
      .andWhere(
        `EXISTS (
        SELECT 1
        FROM student_lesson sl_before
        INNER JOIN class_lessons cl_before ON sl_before.class_lesson_id = cl_before.id
        WHERE sl_before.student_schedule_id = ss_dropout.id
          AND cl_before.start_time < :startDate
          AND sl_before.deleted_at IS NULL
          AND cl_before.deleted_at IS NULL
      )`
      )
      // NO lessons during period
      .andWhere(
        `NOT EXISTS (
        SELECT 1
        FROM student_lesson sl_current
        INNER JOIN class_lessons cl_current ON sl_current.class_lesson_id = cl_current.id
        WHERE sl_current.student_schedule_id = ss_dropout.id
          AND cl_current.start_time >= :startDate
          AND cl_current.start_time < :endDate
          AND sl_current.deleted_at IS NULL
          AND cl_current.deleted_at IS NULL
      )`
      )

    qb.addSelect(`(${totalStudentsSub.getQuery()})`, 'total_students')
      .addSelect(`(${newStudentsSub.getQuery()})`, 'new_students')
      .addSelect(`(${dropoutStudentsSub.getQuery()})`, 'dropouts')
      .setParameters({ startDate, endDate, institutionId, courseId, classId, instructorId })
      .groupBy('ce.id, c.name, ce.name, ins.first_name, ins.last_name')

    const results = await qb.getRawMany()

    return results.map((r) => {
      const total = parseInt(r.total_students, 10) || 0
      const dropouts = parseInt(r.dropouts, 10) || 0

      // FIX: Format as percentage (0-100), not decimal (0-1)
      const dropoutRate = total > 0 ? parseFloat(((dropouts / total) * 100).toFixed(2)) : 0

      return {
        classId: parseInt(r.class_id, 10),
        courseName: r.course_name,
        className: r.class_name,
        teacherName: r.teacher_name,
        totalStudents: total,
        newStudents: parseInt(r.new_students, 10) || 0,
        dropouts,
        dropoutRate, // Now 0-100 instead of 0-1
      }
    })
  }

  /**
   * Student stats grouped by instructor (students taught, revenue generated).
   */
  private async getStudentByInstructor(
    qb: any,
    startDate: Date,
    endDate: Date,
    institutionId: number,
    courseId?: number,
    classId?: number
  ) {
    const invoiceAttendanceSub = this.createInvoiceAttendanceSubquery(
      startDate,
      endDate,
      institutionId
    )

    let queryBuilder = qb
      .innerJoin('cl.instructor', 'ins')
      .innerJoin(`(${invoiceAttendanceSub.getQuery()})`, 'rev', 'rev.invoice_id = i.id')
      .select([
        'ins.id AS id',
        "ins.first_name || ' ' || ins.last_name AS name",
        'ROUND(SUM(i.pay_amount * rev.attended_in_period / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS total_revenue',
        'COUNT(DISTINCT cl.id) AS lessons',
        'COUNT(DISTINCT sl.user_id) AS students',
      ])

    // Apply optional filters
    if (courseId) {
      queryBuilder = queryBuilder
        .innerJoin('cl.course', 'c')
        .andWhere('c.id = :courseId', { courseId })
    }
    if (classId) {
      queryBuilder = queryBuilder
        .innerJoin('cl.class', 'ce')
        .andWhere('ce.id = :classId', { classId })
    }

    const results = await queryBuilder
      .groupBy('ins.id, ins.first_name, ins.last_name')
      .orderBy('total_revenue', 'DESC')
      .setParameters({ startDate, endDate, present: 'ATTENDED', institutionId })
      .getRawMany()

    return results.map((r) => ({
      id: parseInt(r.id, 10),
      name: r.name,
      totalRevenue: parseFloat(r.total_revenue) || 0,
      lessons: parseInt(r.lessons, 10) || 0,
      students: parseInt(r.students, 10) || 0,
    }))
  }

  /**
   * ========================================================================
   * FINAL CORRECTED VERSION - 100% Match dengan Requirement
   * ========================================================================
   *
   * Perubahan utama dari kode original:
   * 1. Revenue = (pay_amount + used_balance) / num_of_lesson (bukan hanya pay_amount)
   * 2. Join path: class_lessons → student_lesson → student_schedule → invoices
   * 3. Filter: attendance = ATTENDED + payment_state = PAID
   * 4. Removed kompleks nested subquery, gunakan direct join
   */

  /**
   * 1. LESSON LIST - Main Dashboard Table
   * Menampilkan daftar lesson dengan total revenue per lesson
   */
  async getLessonList(params: {
    startDate: Date
    endDate: Date
    institutionId: number
    siteId: number
    page?: number
    limit?: number
    courseId?: number
    classId?: number
    instructorId?: number
    studentName?: string
    lessonId?: number
    lessonName?: string
  }) {
    const {
      startDate,
      endDate,
      institutionId,
      page = 1,
      limit = 20,
      courseId,
      classId,
      instructorId,
      studentName,
      lessonId,
      lessonName,
    } = params

    // Base query - dimulai dari class_lessons
    const qb = this.classLessonRepository
      .createQueryBuilder('cl')
      .leftJoin('cl.course', 'c')
      .leftJoin('cl.class', 'ce')
      .leftJoin('cl.instructor', 'teacher')
      .select([
        'cl.id AS id',
        'cl.start_time AS date',
        'cl.start_time AS time',
        'c.name AS course',
        'ce.name AS class',
        "'Lesson ' || cl.id AS lesson",
        "COALESCE(teacher.first_name || ' ' || teacher.last_name, '-') AS teachers",
        "'COMPLETED' AS status",
      ])
      .where('cl.institution_id = :institutionId', { institutionId })
      .andWhere('cl.start_time >= :startDate', { startDate })
      .andWhere('cl.start_time < :endDate', { endDate })

    // Apply basic filters
    if (courseId) qb.andWhere('c.id = :courseId', { courseId })
    if (classId) qb.andWhere('ce.id = :classId', { classId })
    if (instructorId) qb.andWhere('teacher.id = :instructorId', { instructorId })
    if (lessonId) qb.andWhere('cl.id = :lessonId', { lessonId })
    if (lessonName) {
      qb.andWhere("LOWER(c.name || ' Lesson ' || cl.id) LIKE LOWER(:lessonName)", {
        lessonName: `%${lessonName}%`,
      })
    }

    // CRITICAL FIX: Revenue Calculation
    // Formula: SUM((pay_amount + used_balance) / num_of_lesson)
    // untuk setiap student yang ATTENDED dengan invoice PAID
    qb.addSelect(
      `COALESCE(
      (SELECT ROUND(SUM(
        (i.pay_amount + COALESCE(i.used_balance, 0)) / NULLIF(i.num_of_lesson, 0)
      )::numeric, 2)
      FROM student_lesson sl
      INNER JOIN student_schedule ss ON sl.student_schedule_id = ss.id
      INNER JOIN invoices i ON ss.invoice_id = i.id
      WHERE sl.class_lesson_id = cl.id
        AND sl.attendance = 'ATTENDED'
        AND i.payment_state = :paid
        AND i.num_of_lesson > 0
        AND sl.deleted_at IS NULL
        AND ss.deleted_at IS NULL
        AND i.deleted_at IS NULL
      ), 0
    )`,
      'total_revenue'
    ).setParameter('paid', PaymentStatus.PAID)

    // Student count - hanya yang ATTENDED
    qb.addSelect(
      `(SELECT COUNT(DISTINCT sl.user_id)
     FROM student_lesson sl
     WHERE sl.class_lesson_id = cl.id
       AND sl.attendance = 'ATTENDED'
       AND sl.deleted_at IS NULL
    )`,
      'students'
    )

    // Filter by student name
    if (studentName) {
      qb.andWhere(
        `EXISTS (
        SELECT 1 
        FROM student_lesson sl
        INNER JOIN users stu ON sl.user_id = stu.id
        WHERE sl.class_lesson_id = cl.id
          AND LOWER(stu.first_name || ' ' || stu.last_name) LIKE LOWER(:studentName)
          AND sl.deleted_at IS NULL
      )`,
        { studentName: `%${studentName}%` }
      )
    }

    qb.groupBy(
      'cl.id, cl.start_time, c.name, ce.name, teacher.first_name, teacher.last_name'
    ).orderBy('cl.start_time', 'DESC')

    const total = await qb.getCount()
    const results = await qb
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany()

    return {
      data: results.map((r) => ({
        id: parseInt(r.id, 10),
        date: r.date,
        time: r.time,
        course: r.course,
        class: r.class,
        lesson: r.lesson,
        teachers: r.teachers,
        students: parseInt(r.students, 10) || 0,
        status: r.status || 'COMPLETED',
        totalRevenue: parseFloat(r.total_revenue) || 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * 2. LESSON DETAIL - Expandable Row dengan Student Payment Breakdown
   */
  async getLessonDetail({ lessonId, institutionId, siteId }: LessonDetailParams) {
    // Fetch lesson metadata
    const lessonInfo = await this.classLessonRepository
      .createQueryBuilder('cl')
      .leftJoin('cl.course', 'c')
      .leftJoin('cl.class', 'ce')
      .leftJoin('cl.instructor', 'teacher')
      .select([
        'cl.id AS id',
        'cl.start_time AS date',
        'cl.start_time AS time',
        'c.name AS course',
        'ce.name AS class',
        "'Lesson ' || cl.id AS lesson",
        "COALESCE(teacher.first_name || ' ' || teacher.last_name, '-') AS teachers",
        "'COMPLETED' AS status",
      ])
      .where('cl.id = :lessonId', { lessonId })
      .andWhere('cl.institution_id = :institutionId', { institutionId })
      .getRawOne()

    if (!lessonInfo) {
      throw new BadRequestException('Lesson not found')
    }

    // CRITICAL FIX: Per-student payment breakdown
    const studentPayments = await this.studentLessonRepository
      .createQueryBuilder('sl')
      .innerJoin('sl.user', 'stu')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .select([
        'stu.id AS student_id',
        "COALESCE(stu.first_name, '') || ' ' || COALESCE(stu.last_name, '') AS name",
        'stu.phone AS phone',
        // Total Lesson Value = (pay_amount + used_balance) / num_of_lesson
        'ROUND(((i.pay_amount + COALESCE(i.used_balance, 0)) / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS total_lesson_value',
        // Credit Applied = used_balance / num_of_lesson
        'ROUND((COALESCE(i.used_balance, 0) / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS credit_applied',
        // Net Payment (cash only) = pay_amount / num_of_lesson
        'ROUND((i.pay_amount / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS net_payment',
        'i.payment_state AS payment_status',
        'sl.attendance AS attendance_status',
      ])
      .where('sl.class_lesson_id = :lessonId', { lessonId })
      .andWhere('i.institution_id = :institutionId', { institutionId })
      .andWhere('i.site_id = :siteId', { siteId })
      .andWhere('sl.deleted_at IS NULL')
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('i.deleted_at IS NULL')
      .orderBy('stu.last_name', 'ASC')
      .addOrderBy('stu.first_name', 'ASC')
      .getRawMany()

    const totalStudents = studentPayments.length

    // Revenue = sum of total_lesson_value untuk PAID + ATTENDED
    const totalRevenue = studentPayments
      .filter((p) => p.payment_status === PaymentStatus.PAID && p.attendance_status === 'ATTENDED')
      .reduce((sum, p) => sum + (parseFloat(p.total_lesson_value) || 0), 0)

    return {
      lesson: {
        ...lessonInfo,
        students: totalStudents,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      studentPayments: studentPayments.map((p) => ({
        studentId: parseInt(p.student_id, 10),
        name: p.name,
        phone: p.phone,
        totalLessonValue: parseFloat(p.total_lesson_value) || 0,
        creditApplied: parseFloat(p.credit_applied) || 0,
        netPayment: parseFloat(p.net_payment) || 0,
        paymentStatus: p.payment_status,
        attendanceStatus: p.attendance_status,
      })),
    }
  }

  /**
   * 3. REVENUE OVERVIEW - Summary Cards
   */
  private async getRevenueOverview(
    _qb: any,
    params: {
      startDate: Date
      endDate: Date
      institutionId: number
      siteId: number
      courseId?: number
      classId?: number
      instructorId?: number
    }
  ) {
    const { startDate, endDate, institutionId, siteId, courseId, classId, instructorId } = params

    // Revenue query dengan join yang benar
    let revenueQb = this.studentLessonRepository
      .createQueryBuilder('sl')
      .innerJoin('sl.classLesson', 'cl')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .select([
        'COALESCE(ROUND(SUM((i.pay_amount + COALESCE(i.used_balance, 0)) / NULLIF(i.num_of_lesson, 0))::numeric, 2), 0) AS total_revenue',
      ])
      .where('cl.start_time >= :startDate', { startDate })
      .andWhere('cl.start_time < :endDate', { endDate })
      .andWhere('cl.institution_id = :institutionId', { institutionId })
      // .andWhere('sl.attendance = :present', { present: 'ATTENDED' })
      .andWhere('i.payment_state = :paid', { paid: PaymentStatus.PAID })
      .andWhere('i.site_id = :siteId', { siteId })
      .andWhere('i.num_of_lesson > 0')
      .andWhere('sl.deleted_at IS NULL')
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('i.deleted_at IS NULL')

    // Apply filters untuk revenue
    if (courseId) {
      revenueQb = revenueQb.andWhere('cl.course_id = :courseId', { courseId })
    }
    if (classId) {
      revenueQb = revenueQb.andWhere('cl.class_id = :classId', { classId })
    }
    if (instructorId) {
      revenueQb = revenueQb.andWhere('cl.instructor_id = :instructorId', { instructorId })
    }

    // Lesson stats query
    let lessonQb = this.classLessonRepository
      .createQueryBuilder('cl')
      .leftJoin('cl.studentLessons', 'sl')
      .select([
        'COUNT(DISTINCT cl.id) AS completed_lessons',
        'COUNT(DISTINCT sl.user_id) FILTER (WHERE sl.deleted_at IS NULL) AS active_students',
      ])
      .where('cl.start_time >= :startDate', { startDate })
      .andWhere('cl.start_time < :endDate', { endDate })
      .andWhere('cl.institution_id = :institutionId', { institutionId })
      .andWhere('cl.deleted_at IS NULL')
      .setParameter('present', 'ATTENDED')

    if (courseId) {
      lessonQb = lessonQb.andWhere('cl.course_id = :courseId', { courseId })
    }
    if (classId) {
      lessonQb = lessonQb.andWhere('cl.class_id = :classId', { classId })
    }
    if (instructorId) {
      lessonQb = lessonQb.andWhere('cl.instructor_id = :instructorId', { instructorId })
    }

    const [revenueResult, lessonResult] = await Promise.all([
      revenueQb.getRawOne(),
      lessonQb.getRawOne(),
    ])

    return {
      totalRevenue: parseFloat(revenueResult.total_revenue) || 0,
      completedLessons: parseInt(lessonResult.completed_lessons, 10) || 0,
      activeStudents: parseInt(lessonResult.active_students, 10) || 0,
    }
  }

  /**
   * 4. REVENUE BY COURSE
   */
  private async getRevenueByCourse(
    _qb: any,
    startDate: Date,
    endDate: Date,
    institutionId: number,
    classId?: number,
    instructorId?: number
  ) {
    let queryBuilder = this.studentLessonRepository
      .createQueryBuilder('sl')
      .innerJoin('sl.classLesson', 'cl')
      .innerJoin('cl.course', 'c')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .select([
        'c.id AS id',
        'c.name AS name',
        'ROUND(SUM((i.pay_amount + COALESCE(i.used_balance, 0)) / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS total_revenue',
        'COUNT(DISTINCT cl.id) AS lessons',
        'COUNT(DISTINCT sl.user_id) AS students',
      ])
      .where('cl.start_time >= :startDate', { startDate })
      .andWhere('cl.start_time < :endDate', { endDate })
      .andWhere('cl.institution_id = :institutionId', { institutionId })
      // .andWhere('sl.attendance = :present', { present: 'ATTENDED' })
      .andWhere('i.payment_state = :paid', { paid: PaymentStatus.PAID })
      .andWhere('i.num_of_lesson > 0')
      .andWhere('sl.deleted_at IS NULL')
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('i.deleted_at IS NULL')

    if (classId) {
      queryBuilder = queryBuilder.andWhere('cl.class_id = :classId', { classId })
    }
    if (instructorId) {
      queryBuilder = queryBuilder.andWhere('cl.instructor_id = :instructorId', { instructorId })
    }

    const results = await queryBuilder
      .groupBy('c.id, c.name')
      .orderBy('total_revenue', 'DESC')
      .getRawMany()

    return results.map((r) => ({
      id: parseInt(r.id, 10),
      name: r.name,
      totalRevenue: parseFloat(r.total_revenue) || 0,
      lessons: parseInt(r.lessons, 10) || 0,
      students: parseInt(r.students, 10) || 0,
    }))
  }

  /**
   * 5. REVENUE BY CLASS
   */
  private async getRevenueByClass(
    _qb: any,
    startDate: Date,
    endDate: Date,
    institutionId: number,
    courseId?: number,
    instructorId?: number
  ) {
    let queryBuilder = this.studentLessonRepository
      .createQueryBuilder('sl')
      .innerJoin('sl.classLesson', 'cl')
      .innerJoin('cl.class', 'ce')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .select([
        'ce.id AS id',
        'ce.name AS name',
        'ROUND(SUM((i.pay_amount + COALESCE(i.used_balance, 0)) / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS total_revenue',
        'COUNT(DISTINCT cl.id) AS lessons',
        'COUNT(DISTINCT sl.user_id) AS students',
      ])
      .where('cl.start_time >= :startDate', { startDate })
      .andWhere('cl.start_time < :endDate', { endDate })
      .andWhere('cl.institution_id = :institutionId', { institutionId })
      // .andWhere('sl.attendance = :present', { present: 'ATTENDED' })
      .andWhere('i.payment_state = :paid', { paid: PaymentStatus.PAID })
      .andWhere('i.num_of_lesson > 0')
      .andWhere('sl.deleted_at IS NULL')
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('i.deleted_at IS NULL')

    if (courseId) {
      queryBuilder = queryBuilder.andWhere('cl.course_id = :courseId', { courseId })
    }
    if (instructorId) {
      queryBuilder = queryBuilder.andWhere('cl.instructor_id = :instructorId', { instructorId })
    }

    const results = await queryBuilder
      .groupBy('ce.id, ce.name')
      .orderBy('total_revenue', 'DESC')
      .getRawMany()

    return results.map((r) => ({
      id: parseInt(r.id, 10),
      name: r.name,
      totalRevenue: parseFloat(r.total_revenue) || 0,
      lessons: parseInt(r.lessons, 10) || 0,
      students: parseInt(r.students, 10) || 0,
    }))
  }

  /**
   * 6. REVENUE BY INSTRUCTOR
   */
  private async getRevenueByInstructor(
    _qb: any,
    startDate: Date,
    endDate: Date,
    institutionId: number,
    courseId?: number,
    classId?: number
  ) {
    let queryBuilder = this.studentLessonRepository
      .createQueryBuilder('sl')
      .innerJoin('sl.classLesson', 'cl')
      .innerJoin('cl.instructor', 'ins')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .select([
        'ins.id AS id',
        "ins.first_name || ' ' || ins.last_name AS name",
        'ROUND(SUM((i.pay_amount + COALESCE(i.used_balance, 0)) / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS total_revenue',
        'COUNT(DISTINCT cl.id) AS lessons',
        'COUNT(DISTINCT sl.user_id) AS students',
      ])
      .where('cl.start_time >= :startDate', { startDate })
      .andWhere('cl.start_time < :endDate', { endDate })
      .andWhere('cl.institution_id = :institutionId', { institutionId })
      // .andWhere('sl.attendance = :present', { present: 'ATTENDED' })
      .andWhere('i.payment_state = :paid', { paid: PaymentStatus.PAID })
      .andWhere('i.num_of_lesson > 0')
      .andWhere('sl.deleted_at IS NULL')
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('i.deleted_at IS NULL')

    if (courseId) {
      queryBuilder = queryBuilder.andWhere('cl.course_id = :courseId', { courseId })
    }
    if (classId) {
      queryBuilder = queryBuilder.andWhere('cl.class_id = :classId', { classId })
    }

    const results = await queryBuilder
      .groupBy('ins.id, ins.first_name, ins.last_name')
      .orderBy('total_revenue', 'DESC')
      .getRawMany()

    return results.map((r) => ({
      id: parseInt(r.id, 10),
      name: r.name,
      totalRevenue: parseFloat(r.total_revenue) || 0,
      lessons: parseInt(r.lessons, 10) || 0,
      students: parseInt(r.students, 10) || 0,
    }))
  }

  /**
   * 7. REVENUE BY STUDENT
   */
  private async getStudentByStudent(
    _qb: any,
    startDate: Date,
    endDate: Date,
    institutionId: number,
    courseId?: number,
    classId?: number,
    instructorId?: number
  ) {
    let queryBuilder = this.studentLessonRepository
      .createQueryBuilder('sl')
      .innerJoin('sl.classLesson', 'cl')
      .innerJoin('sl.user', 'stu')
      .innerJoin('cl.course', 'c')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .select([
        'stu.id AS id',
        "stu.first_name || ' ' || stu.last_name AS name",
        'ROUND(SUM((i.pay_amount + COALESCE(i.used_balance, 0)) / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS total_revenue',
        'COUNT(DISTINCT cl.id) AS lessons',
        'COUNT(DISTINCT c.id) AS courses',
      ])
      .where('cl.start_time >= :startDate', { startDate })
      .andWhere('cl.start_time < :endDate', { endDate })
      .andWhere('cl.institution_id = :institutionId', { institutionId })
      // .andWhere('sl.attendance = :present', { present: 'ATTENDED' })
      .andWhere('i.payment_state = :paid', { paid: PaymentStatus.PAID })
      .andWhere('i.num_of_lesson > 0')
      .andWhere('sl.deleted_at IS NULL')
      .andWhere('ss.deleted_at IS NULL')
      .andWhere('i.deleted_at IS NULL')

    if (courseId) {
      queryBuilder = queryBuilder.andWhere('cl.course_id = :courseId', { courseId })
    }
    if (classId) {
      queryBuilder = queryBuilder.andWhere('cl.class_id = :classId', { classId })
    }
    if (instructorId) {
      queryBuilder = queryBuilder.andWhere('cl.instructor_id = :instructorId', { instructorId })
    }

    const results = await queryBuilder
      .groupBy('stu.id, stu.first_name, stu.last_name')
      .orderBy('total_revenue', 'DESC')
      .getRawMany()

    return results.map((r) => ({
      id: parseInt(r.id, 10),
      name: r.name,
      totalRevenue: parseFloat(r.total_revenue) || 0,
      lessons: parseInt(r.lessons, 10) || 0,
      courses: parseInt(r.courses, 10) || 0,
    }))
  }

  async updateRemark(invoiceId: number, remark: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneById(invoiceId)

    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    const previousRemark = invoice.remark
    invoice.remark = remark

    const updatedInvoice = await this.invoiceRepository.save(invoice)

    await this.recordLogRepository.save({
      type: RecordLogType.UPDATE_INVOICE_REMARK,
      institutionId: invoice.institutionId,
      detail: {
        invoiceId: updatedInvoice.id,
        remark: updatedInvoice.remark,
        previousRemark,
      },
      userId: invoice.userId,
    })

    return updatedInvoice
  }

  async deleteRemark(invoiceId: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneById(invoiceId)

    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    const previousRemark = invoice.remark
    invoice.remark = null

    const updatedInvoice = await this.invoiceRepository.save(invoice)

    await this.recordLogRepository.save({
      type: RecordLogType.DELETE_INVOICE_REMARK,
      institutionId: invoice.institutionId,
      detail: {
        invoiceId: updatedInvoice.id,
        previousRemark,
      },
      userId: invoice.userId,
    })

    return updatedInvoice
  }

  async updatePayLaterMethod(invoiceId: number, payLaterMethod?: PayoutMethod): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneById(invoiceId)

    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    invoice.payLaterMethod = payLaterMethod

    return this.invoiceRepository.save(invoice)
  }
}
