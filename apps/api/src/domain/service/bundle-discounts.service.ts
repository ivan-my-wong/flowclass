import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import * as dayjs from 'dayjs'
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  QueryFailedError,
} from 'typeorm'

import { PromotionType } from '@/application/admin/invoice-campaign/dto/send-invoice.dto'
import {
  BundleDiscountAvailabilityResponse,
  BundleDiscountsObject,
  BundleDiscountsPageOptionDto,
  CheckAvailabilityBundleDiscountDto,
  ClassDetailsDto,
  ClassType,
  CourseValidationSummary,
  CreateBundleDiscountDto,
  InvoiceWithClassValidationDto,
  PricingOptionDto,
  UpdateBundleDiscountDto,
} from '@/application/admin/promotions/dto/bundle-discounts.dto'
import { PromotionErrorMessage } from '@/exceptions/error-message/promotion'
import { BundleDiscount } from '@/models/bundle-discounts.entity'
import { BundleDiscountsRepository } from '@/models/bundle-discounts.repository'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { ClassTypeEnum, FeeModeType } from '@/models/enums/'
import { Invoice } from '@/models/invoice.entity'
import { InvoiceRepository } from '@/models/invoice.repository'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { BaseService } from '@/modules/base/base.service'

import { CoursesService } from './courses.service'

// Constant for invoice date range calculation - starting from first of current month
// This constant is stored here for easy modification later
// Currently set to 'firstOfCurrentMonth' - can be changed to other values like 'firstOfLastMonth', etc.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const INVOICE_DATE_RANGE_START = dayjs().startOf('month').toDate()

@Injectable()
export class BundleDiscountsService extends BaseService<BundleDiscount> {
  private readonly logger = new Logger(BundleDiscountsService.name)

  constructor(
    private courseService: CoursesService,
    @InjectRepository(BundleDiscountsRepository)
    private bundleDiscountsRepository: BundleDiscountsRepository,
    private invoiceRepository: InvoiceRepository,
    private classRepository: ClassRepository,
    private userAliasesRepository: UserAliasesRepository
  ) {
    super(bundleDiscountsRepository)
  }

  /**
   * Get the start date for invoice queries - first of current month
   * This constant is stored here for easy modification later
   */
  private getInvoiceQueryStartDate(): Date {
    return dayjs().startOf('month').toDate()
  }

  async findAll(dto: BundleDiscountsPageOptionDto) {
    const whereCondition: FindOptionsWhere<BundleDiscount> = {}
    if (dto.institutionId) whereCondition.institutionId = dto.institutionId
    if (dto.siteId) whereCondition.siteId = dto.siteId

    const orderOption: FindOptionsOrder<BundleDiscount> = {}
    if (dto.orderBy) {
      const allowedFields = ['id', 'name', 'isActive', 'startDate']
      if (allowedFields.includes(dto.orderBy)) {
        orderOption[dto.orderBy] = dto.order
      }
    }

    try {
      return await this.bundleDiscountsRepository.pagination(dto, whereCondition, orderOption, null)
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(`Invalid orderBy field or query error: ${error.message}`)
      }
      throw error
    }
  }

  async findById(id: number): Promise<BundleDiscount> {
    try {
      const bundle = await this.bundleDiscountsRepository.findOneBy({ id })
      if (!bundle) {
        throw new BadRequestException(PromotionErrorMessage.BUNDLE_DISCOUNT_NOT_FOUND)
      }
      return bundle
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(`Invalid bundle ID or query error: ${error.message}`)
      }
      throw error
    }
  }

  async findByCourseId(courseId: number): Promise<BundleDiscount> {
    try {
      const bundles = await this.bundleDiscountsRepository.find({
        where: { isActive: true },
      })

      const match = bundles.find((bundle) => {
        if (bundle.isAllItems) return true
        return bundle.applicableItemIds?.includes(courseId)
      })

      if (!match) {
        throw new BadRequestException(PromotionErrorMessage.BUNDLE_DISCOUNT_NOT_FOUND)
      }

      return match
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(`Invalid courseId or query error: ${error.message}`)
      }
      throw error
    }
  }

  async create({
    dto,
    siteId,
    institutionId,
  }: {
    dto: CreateBundleDiscountDto
    siteId: number
    institutionId: number
  }): Promise<BundleDiscount> {
    try {
      const existing = await this.bundleDiscountsRepository.findOne({
        where: {
          name: dto.name,
          siteId,
          institutionId,
        },
      })

      if (existing) {
        throw new BadRequestException(`Bundle name "${dto.name}" already exists for this site.`)
      }

      if (dto.applicableItemIds?.length) {
        // 1. Ambil semua kelas berdasarkan applicableItemIds
        const classEntities = await this.classRepository.find({
          where: { id: In(dto.applicableItemIds), siteId, institutionId },
          select: ['id', 'courseId'],
        })

        const foundClassIds = classEntities.map((cls) => cls.id)
        const notFound = dto.applicableItemIds.filter((id) => !foundClassIds.includes(id))
        if (notFound.length) {
          throw new BadRequestException(`Invalid classId(s): ${notFound.join(', ')}`)
        }

        // 2. Pastikan courseId dari setiap class ada di tabel courses
        const courseIds = [...new Set(classEntities.map((cls) => cls.courseId))]
        const validCourses = await this.courseService.getCoursesByIds(
          courseIds,
          siteId,
          institutionId
        )

        if (validCourses.length !== courseIds.length) {
          const validIds = validCourses.map((c) => c.id)
          const invalidCourseIds = courseIds.filter((id) => !validIds.includes(id))

          const invalidClasses = classEntities.filter((cls) =>
            invalidCourseIds.includes(cls.courseId)
          )
          const classIds = invalidClasses.map((cls) => cls.id)

          throw new BadRequestException(
            `Invalid courseId(s) for classId(s): ${classIds.join(', ')}`
          )
        }
      }

      const newBundle: CreateBundleDiscountDto = {
        siteId,
        institutionId,
        ...dto,
      }

      return await this.bundleDiscountsRepository.save({ ...newBundle, bundleTable: [] })
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(`Failed to create bundle: ${error.message}`)
      }
      throw error
    }
  }

  async update(
    id: number,
    updateBundleDto: UpdateBundleDiscountDto
  ): Promise<BundleDiscountsObject> {
    try {
      const bundle = await this.bundleDiscountsRepository.findOneBy({ id })
      if (!bundle) {
        throw new BadRequestException(PromotionErrorMessage.BUNDLE_DISCOUNT_NOT_FOUND)
      }

      // Check for duplicate name in same site + institution, excluding current record
      if (updateBundleDto.name) {
        const duplicate = await this.bundleDiscountsRepository.findOne({
          where: {
            name: updateBundleDto.name,
            siteId: bundle.siteId,
            institutionId: bundle.institutionId,
            id: Not(id),
          },
        })

        if (duplicate) {
          throw new BadRequestException(
            `Another bundle with name "${updateBundleDto.name}" already exists.`
          )
        }
      }

      const bundleUpdated = await this.bundleDiscountsRepository.save({
        ...bundle,
        ...updateBundleDto,
      })

      return plainToInstance(BundleDiscountsObject, bundleUpdated)
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(`Failed to update bundle: ${error.message}`)
      }
      throw error
    }
  }

  async remove(id: number): Promise<BundleDiscountsObject> {
    try {
      const bundle = await this.bundleDiscountsRepository.findOneBy({ id })
      if (!bundle) {
        throw new BadRequestException(PromotionErrorMessage.BUNDLE_DISCOUNT_NOT_FOUND)
      }
      const bundleRemoved = await this.bundleDiscountsRepository.softRemove(bundle)
      return plainToInstance(BundleDiscountsObject, bundleRemoved)
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(`Failed to delete bundle: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Enhanced retroactive bundle discount application with complete class validation
   */
  async applyBundleDiscountsToInvoiceRetroactive(
    invoiceId: number,
    siteId: number,
    institutionId: number
  ): Promise<Invoice | null> {
    try {
      this.logger.log('Starting retroactive bundle discount application', {
        invoiceId,
        siteId,
        institutionId,
      })

      const invoice = await this.findInvoice(invoiceId, siteId, institutionId)
      if (!invoice) throw new BadRequestException('Invoice not found.')

      const { startOfMonth, endOfMonth } = this.getInvoiceMonthRange(invoice.createdAt)

      const monthlyInvoices = await this.getMonthlyInvoices(
        invoice.userId,
        siteId,
        institutionId,
        startOfMonth,
        endOfMonth
      )
      if (!monthlyInvoices.length) return invoice

      this.logger.log(`Found ${monthlyInvoices.length} monthly invoices for validation`)

      // Validate which invoices represent complete classes
      const validatedInvoices = await this.validateCompleteClasses(
        monthlyInvoices,
        siteId,
        institutionId
      )

      // NEW: Group by courses and validate course completion
      const courseValidationSummary = this.groupInvoicesByCourse(validatedInvoices)

      this.logger.debug(
        `Course validation summary: ${Object.keys(courseValidationSummary).length} unique courses`,
        {
          courseSummary: Object.entries(courseValidationSummary).map(([courseId, summary]) => ({
            courseId: Number(courseId),
            totalInvoices: summary.totalInvoices,
            hasCompleteClass: summary.hasCompleteClass,
            completeClassCount: summary.completeClassCount,
          })),
        }
      )

      this.logger.log(
        `${validatedInvoices.filter((inv) => inv.isCompleteClass).length} complete classes found`
      )

      const bundles = await this.getEligibleBundles(startOfMonth, endOfMonth)
      if (!bundles.length) return invoice

      const latest = this.findLatestInvoice(monthlyInvoices)
      if (!latest) return invoice

      const classMap = await this.getClassMapByCourseIds(
        monthlyInvoices.map((i) => i.courseId),
        siteId,
        institutionId
      )

      // Only use complete classes for bundle calculation
      // const completeClassInvoices = validatedInvoices.filter((inv) => inv.isCompleteClass)

      // const { totalNewDiscount } = this.calculateDiscountsWithCompleteClasses(
      //   bundles,
      //   completeClassInvoices,
      //   latest,
      //   classMap
      // )

      const { totalNewDiscount, appliedDetails } = this.calculateDiscountsWithCourseBasedCounting(
        bundles,
        courseValidationSummary,
        latest,
        classMap
      )

      latest.adminDiscounts = appliedDetails

      if (totalNewDiscount > 0) {
        this.logger.log(`Applying ${totalNewDiscount} total discount to invoice ${latest.id}`)
        latest.discountAmount += totalNewDiscount
        latest.payAmount = Math.max(0, latest.payAmount - totalNewDiscount)
        return await this.invoiceRepository.save(latest)
      }

      return latest
    } catch (error) {
      this.logger.error('❌ Failed to apply bundle discount:', error)
      throw new BadRequestException('Failed to apply bundle discount: ' + error.message)
    }
  }

  /**
   * NEW: Group invoices by course and determine course completion status
   */
  private groupInvoicesByCourse(
    validatedInvoices: InvoiceWithClassValidationDto[]
  ): Record<number, CourseValidationSummary> {
    const courseGroups: Record<number, CourseValidationSummary> = {}

    for (const invoice of validatedInvoices) {
      const courseId = invoice.courseId ?? invoice.classDetails?.courseId
      if (typeof courseId !== 'number') continue

      if (!courseGroups[courseId]) {
        courseGroups[courseId] = {
          courseId,
          invoices: [],
          hasCompleteClass: false,
          totalInvoices: 0,
          completeClassCount: 0,
        }
      }

      courseGroups[courseId].invoices.push(invoice)
      courseGroups[courseId].totalInvoices += 1

      if (invoice.isCompleteClass) {
        courseGroups[courseId].completeClassCount += 1
        courseGroups[courseId].hasCompleteClass = true
      }
    }

    // Log course completion summary
    Object.entries(courseGroups).forEach(([courseId, summary]) => {
      this.logger.debug(
        `Course ${courseId}: ${summary.completeClassCount}/${summary.totalInvoices} complete classes`
      )
    })

    return courseGroups
  }

  /**
   * NEW: Enhanced discount calculation based on course completion
   * Rule: A course counts toward bundle only if it has at least one complete class
   */
  private calculateDiscountsWithCourseBasedCounting(
    bundles: BundleDiscount[],
    courseValidationSummary: Record<number, CourseValidationSummary>,
    latest: Invoice,
    classMap: Record<number, number[]>
  ) {
    let totalNewDiscount = 0
    const appliedDetails = [...(latest.adminDiscounts ?? [])]

    // Get courses that have at least one complete class
    const eligibleCourses = Object.values(courseValidationSummary).filter(
      (course) => course.hasCompleteClass
    )

    this.logger.log(
      `Calculating discounts for ${bundles.length} bundles with ${eligibleCourses.length} eligible courses (with complete classes)`
    )

    for (const bundle of bundles) {
      // Filter courses that match bundle criteria AND have complete classes
      const applicableCourses = eligibleCourses.filter((course) => {
        if (bundle.isAllItems) return true
        const classIds = classMap[course.courseId] ?? []
        const targetClassIds = bundle.applicableItemIds ?? []
        return targetClassIds.length > 0 && classIds.some((id) => targetClassIds.includes(id))
      })

      this.logger.debug(
        `Bundle ${bundle.id}: ${applicableCourses.length} applicable courses with complete classes (min required: ${bundle.minQty})`
      )

      // Check if bundle minimum quantity is met with course count
      if (applicableCourses.length < bundle.minQty) {
        this.logger.debug(
          `Bundle ${bundle.id} minimum not met: ${applicableCourses.length} courses < ${bundle.minQty} required`
        )
        continue
      }

      // Check if bundle was already applied
      const isAlreadyApplied = appliedDetails.some((d) => d.id === bundle.id)
      if (isAlreadyApplied) {
        this.logger.debug(`Bundle ${bundle.id} already applied`)
        continue
      }

      // Calculate discount based on all invoices from applicable courses
      const eligibleInvoices = applicableCourses.flatMap((course) => course.invoices)
      const total = eligibleInvoices.reduce((sum, invoice) => sum + Number(invoice.payAmount), 0)
      let discount = 0

      if (bundle.discountType === 'percentage') {
        discount = Math.floor((total * bundle.amount) / 100)
      } else {
        discount = bundle.amount
      }

      totalNewDiscount += discount

      this.logger.log(
        `Bundle ${bundle.id} applied: ${discount} on ${total} | courses=${applicableCourses.length} invoices=${eligibleInvoices.length}`
      )

      this.logger.debug('Bundle application details', {
        bundleId: bundle.id,
        coursesCount: applicableCourses.length,
        invoicesCount: eligibleInvoices.length,
        courseIds: applicableCourses.map((c) => c.courseId),
        discountAmount: discount,
        totalAmount: total,
      })

      const nextOrder = appliedDetails.length
        ? ((appliedDetails[appliedDetails.length - 1] as any)?.order ?? appliedDetails.length - 1) +
          1
        : 0

      appliedDetails.push({
        id: bundle.id,
        type: PromotionType.BUNDLE,
        name: bundle.name ?? `Bundle #${bundle.id}`,
        discountType: bundle.discountType,
        amount: discount,
        feeType: FeeModeType.DEDUCT_FEE,
        classesIds: Array.from(
          new Set(
            eligibleInvoices
              .map((inv) => inv.classId)
              .filter((v): v is number => typeof v === 'number')
          )
        ),

        order: nextOrder,
      })
    }

    return { totalNewDiscount, appliedDetails }
  }

  /**
   * Validates which invoices represent complete class enrollments
   */
  private async validateCompleteClasses(
    invoices: Invoice[],
    siteId: number,
    institutionId: number
  ): Promise<InvoiceWithClassValidationDto[]> {
    const validatedInvoices: InvoiceWithClassValidationDto[] = []

    for (const invoice of invoices) {
      try {
        // Get class details through enrollId relationship
        const classDetails = await this.getClassDetailsFromInvoice(invoice, siteId, institutionId)

        if (!classDetails) {
          this.logger.warn(`Class details not found for invoice ${invoice.id}`)
          for (const enrollCourse of invoice.enrollCourses) {
            validatedInvoices.push({
              ...invoice,
              classId: enrollCourse.id,
              isCompleteClass: false,
              classDetails: null,
            })
          }
          continue
        }

        const isComplete = await this.isCompleteClass(invoice, classDetails)

        validatedInvoices.push({
          ...invoice,
          classId: classDetails.id,
          isCompleteClass: isComplete,
          classDetails,
        })

        // this.logger.debug(
        //   `Invoice ${invoice.id} - Class ${classDetails.id} (${classDetails.type}): ${isComplete ? 'Complete' : 'Incomplete'
        //   }`
        // )
      } catch (error) {
        this.logger.error(`Error validating invoice ${invoice.id}:`, error)
        for (const enrollCourse of invoice.enrollCourses) {
          validatedInvoices.push({
            ...invoice,
            classId: enrollCourse.id,
            isCompleteClass: false,
            classDetails: null,
          })
        }
      }
    }

    return validatedInvoices
  }

  /**
   * Get detailed class information from invoice
   * Adapts to your actual invoice-class relationship
   */
  private async getClassDetailsFromInvoice(
    invoice: Invoice,
    siteId: number,
    institutionId: number
  ): Promise<ClassDetailsDto | null> {
    try {
      // First, try to find class through enrollId or courseId
      let classEntity = null

      if (invoice.enrollCourses.length > 0) {
        // Try to find class through enrollment relationship
        classEntity = await this.classRepository
          .createQueryBuilder('class')
          .leftJoinAndSelect('class.priceOptions', 'priceOptions')
          .leftJoin('class.enrollCourses', 'enrollCourse') // Adjust relation name if needed
          .where('enrollCourse.id IN(:...enrollIds)', {
            enrollIds: invoice.enrollCourses.map((enrollCourse) => enrollCourse.id),
          })
          .andWhere('class.siteId = :siteId', { siteId })
          .andWhere('class.institutionId = :institutionId', { institutionId })
          .getOne()
      }
      const courseIds = invoice.enrollCourses.map((enrollCourse) => enrollCourse.courseId)
      if (!classEntity && courseIds.length > 0) {
        // Fallback: find active class for this course
        classEntity = await this.classRepository.findOne({
          where: {
            courseId: In(courseIds),
            siteId,
            institutionId,
          },
          relations: ['priceOptions'],
        })
      }

      if (!classEntity) return null

      // Map ClassTypeEnum to ClassType
      let classType: ClassType

      switch (classEntity.type) {
        case ClassTypeEnum.REGULAR_V2:
          classType = ClassType.REGULAR_V2
          break
        case ClassTypeEnum.RECURRING:
          classType = ClassType.RECURRING
          break
        case ClassTypeEnum.APPOINTMENT:
          classType = ClassType.APPOINTMENT
          break
        default:
          this.logger.warn(`Unknown class type: ${classEntity.type}`)
          return null
      }

      // Calculate total lessons in the current period for Regular v2 classes
      let totalLessonsInPeriod = 0
      if (classType === ClassType.REGULAR_V2) {
        totalLessonsInPeriod = await this.calculateLessonsInCurrentPeriod(classEntity)
      }

      // Map priceOptions to PricingOptionDto using actual ClassPriceOption fields
      const pricingOptions: PricingOptionDto[] = (classEntity.priceOptions || []).map((option) => ({
        id: option.id,
        numberOfLessons: option.numberOfLessons || 1,
        price: option.price || 0,
        name: option.name || `Option ${option.id}`,
        description: option.description || undefined,
      }))

      return {
        id: classEntity.id,
        courseId: classEntity.courseId,
        type: classType,
        totalLessonsInPeriod,
        pricingOptions,
        startDate: classEntity.createdAt,
        endDate: classEntity.deletedAt || undefined,
      }
    } catch (error) {
      this.logger.error(`Error getting class details for invoice ${invoice.id}:`, error)
      return null
    }
  }

  /**
   * Calculate total lessons available in current period for Regular v2 classes
   */
  private async calculateLessonsInCurrentPeriod(classEntity: ClassEntity): Promise<number> {
    try {
      const now = new Date()
      const currentMonth = dayjs(now).startOf('month')
      const endOfMonth = dayjs(now).endOf('month')

      // For Regular v2 classes, try to count lessons/schedules in the current period
      // Based on your ClassEntity relations

      try {
        // Option 1: Count through classLessons if available
        const lessonsInPeriod = await this.classRepository
          .createQueryBuilder('class')
          .leftJoin('class.classLessons', 'lesson')
          .where('class.id = :classId', { classId: classEntity.id })
          .andWhere('COALESCE(lesson.changeStartTime, lesson.startTime) BETWEEN :start AND :end', {
            start: currentMonth.toDate(),
            end: endOfMonth.toDate(),
          })
          .getCount()

        if (lessonsInPeriod > 0) return lessonsInPeriod
      } catch (queryError) {
        // Fallback: estimate based on class type and current month
        this.logger.warn('Could not calculate lessons in period, using fallback estimation', {
          classId: classEntity.id,
          error: queryError.message,
        })

        // Simple estimation: assume weekly classes, so ~4 lessons per month
        const weeksInMonth = Math.ceil(endOfMonth.diff(currentMonth, 'week', true))
        return Math.max(1, Math.min(weeksInMonth, 5)) // Between 1-5 lessons
      }
    } catch (error) {
      this.logger.error('Error calculating lessons in current period:', error)
      return 0
    }
  }

  /**
   * Determine if a class enrollment is complete based on class type
   */
  private async isCompleteClass(invoice: Invoice, classDetails: ClassDetailsDto): Promise<boolean> {
    switch (classDetails.type) {
      case ClassType.REGULAR_V2:
        return this.validateRegularV2Completion(invoice, classDetails)

      case ClassType.RECURRING:
      case ClassType.APPOINTMENT:
        return this.validateRecurringAppointmentCompletion(invoice, classDetails)

      default:
        this.logger.warn(`Unknown class type: ${classDetails.type}`)
        return false
    }
  }

  /**
   * Validate Regular v2 class completion
   * Rule: Must enroll in ALL lessons in the selected current period
   */
  private validateRegularV2Completion(invoice: Invoice, classDetails: ClassDetailsDto): boolean {
    try {
      // Get the number of lessons the student enrolled in from the invoice
      const enrolledLessons = invoice.numOfLesson || 1
      const totalLessonsInPeriod = classDetails.totalLessonsInPeriod || 0

      this.logger.debug(
        `Regular v2 validation - Enrolled: ${enrolledLessons}, Total in period: ${totalLessonsInPeriod}`
      )

      // Must enroll in all lessons available in the period
      return enrolledLessons === totalLessonsInPeriod && totalLessonsInPeriod > 0
    } catch (error) {
      this.logger.error('Error validating Regular v2 completion:', error)
      return false
    }
  }

  /**
   * Validate Recurring/Appointment class completion
   * Rule: Must reach at least the lowest numberOfLessons in pricing options
   */
  private validateRecurringAppointmentCompletion(
    invoice: Invoice,
    classDetails: ClassDetailsDto
  ): boolean {
    try {
      const enrolledLessons = invoice.numOfLesson || 1
      const pricingOptions = classDetails.pricingOptions || []

      if (!pricingOptions.length) {
        this.logger.warn(`No pricing options found for class ${classDetails.id}`)
        return false
      }

      // Find the minimum numberOfLessons from all pricing options
      const minRequiredLessons = Math.min(...pricingOptions.map((option) => option.numberOfLessons))

      this.logger.debug(
        `Recurring/Appointment validation - Enrolled: ${enrolledLessons}, Min required: ${minRequiredLessons}`
      )

      // Must enroll in at least the minimum required lessons
      return enrolledLessons >= minRequiredLessons && minRequiredLessons > 0
    } catch (error) {
      this.logger.error('Error validating Recurring/Appointment completion:', error)
      return false
    }
  }

  /**
   * Enhanced discount calculation that only considers complete classes
   */
  private calculateDiscountsWithCompleteClasses(
    bundles: BundleDiscount[],
    completeClassInvoices: InvoiceWithClassValidationDto[],
    latest: Invoice,
    classMap: Record<number, number[]>
  ) {
    let totalNewDiscount = 0
    const appliedDetails = latest.adminDiscounts ?? []

    this.logger.log(
      `Calculating discounts for ${bundles.length} bundles with ${completeClassInvoices.length} complete classes`
    )

    for (const bundle of bundles) {
      // Filter for invoices that represent complete classes and match bundle criteria
      const eligibleInvoices = completeClassInvoices.filter((inv) => {
        if (!inv.isCompleteClass) return false

        const classIds = classMap[inv.courseId] ?? []
        return (
          bundle.isAllItems ||
          classIds.some((classId) => bundle.applicableItemIds?.includes(classId))
        )
      })

      // Count unique courses instead of invoices/classes
      const uniqueCourseIds = new Set(
        eligibleInvoices
          .map((inv) => inv.courseId)
          .filter((id): id is number => id !== null && id !== undefined)
      )

      this.logger.debug(
        `Bundle ${bundle.id}: ${uniqueCourseIds.size} unique courses (${eligibleInvoices.length} complete classes) (min required: ${bundle.minQty})`
      )

      // Check if bundle minimum quantity is met with unique courses
      if (uniqueCourseIds.size < bundle.minQty) {
        this.logger.debug(
          `Bundle ${bundle.id} minimum not met: ${uniqueCourseIds.size} unique courses < ${bundle.minQty} required`
        )
        continue
      }

      // Check if bundle was already applied
      const isAlreadyApplied = appliedDetails.some((d) => d.id === bundle.id)
      if (isAlreadyApplied) {
        this.logger.debug(`Bundle ${bundle.id} already applied`)
        continue
      }

      // Calculate discount based on complete classes only
      const total = eligibleInvoices.reduce((sum, i) => sum + Number(i.payAmount), 0)
      let discount = 0

      if (bundle.discountType === 'percentage') {
        discount = Math.floor((total * bundle.amount) / 100)
      } else {
        discount = bundle.amount
      }

      totalNewDiscount += discount

      this.logger.log(
        `Bundle ${bundle.id} applied: ${discount} discount on ${total} total from ${uniqueCourseIds.size} unique courses (${eligibleInvoices.length} complete classes)`
      )

      appliedDetails.push({
        id: bundle.id,
        type: PromotionType.BUNDLE,
        name: bundle.name ?? `Bundle #${bundle.id}`,
        discountType: bundle.discountType,
        amount: discount,
        classesIds: eligibleInvoices.flatMap((inv) => classMap[inv.courseId] ?? []),
        order: appliedDetails.length === 0 ? 0 : appliedDetails.length + 1,
        feeType: FeeModeType.DEDUCT_FEE,
      })
    }

    return { totalNewDiscount, appliedDetails }
  }

  async checkAvailability(
    dto: CheckAvailabilityBundleDiscountDto
  ): Promise<BundleDiscountAvailabilityResponse[]> {
    try {
      const { userAliasIds = [], siteId, institutionId, bundleId } = dto

      if (!userAliasIds.length) {
        this.logger.warn('No userAliasIds provided for bundle discount check')
        return []
      }

      // Expand userAliasIds to include all user aliases with the same parentId and the parent itself
      const expandedUserAliasIds = new Set<number>(userAliasIds)

      await Promise.all(
        userAliasIds.map(async (userAliasId) => {
          // Get the user alias to find its parent
          const userAlias = await this.userAliasesRepository.findOne({
            where: {
              id: userAliasId,
              institutionId,
            },
            select: ['id', 'childOfUserAliasId'],
          })

          if (!userAlias) {
            this.logger.warn(`User alias not found: ${userAliasId}`)
            return
          }

          // Determine the parent ID (either the user alias itself if it has no parent, or its parent)
          const parentId = userAlias.childOfUserAliasId || userAliasId

          // Add the parent user alias itself
          expandedUserAliasIds.add(parentId)

          // Find all user aliases with the same parentId
          const siblings = await this.userAliasesRepository.find({
            where: {
              childOfUserAliasId: parentId,
              institutionId,
            },
            select: ['id'],
          })

          siblings.forEach((sibling) => {
            expandedUserAliasIds.add(sibling.id)
          })
        })
      )

      const finalUserAliasIds = Array.from(expandedUserAliasIds)

      // Get invoice data for expanded userAliasIds from first of month
      const startDate = this.getInvoiceQueryStartDate()
      const endDate = new Date()

      // Collect all course IDs from invoices (allowing duplicates)
      let totalPaymentDone = 0
      const allCourseIdsFromInvoices: number[] = []

      await Promise.all(
        finalUserAliasIds.map(async (userAliasId) => {
          const invoices = await this.invoiceRepository.find({
            where: {
              userAliasId,
              siteId,
              institutionId,
              createdAt: Between(startDate, endDate),
            },
            relations: {
              enrollCourses: {
                course: true,
              },
            },
          })

          invoices.forEach((invoice) => {
            // Collect course IDs from enrollCourses (allowing duplicates)
            const courseIds =
              invoice.enrollCourses
                ?.map((ec) => ec.courseId)
                .filter((id): id is number => id !== null && id !== undefined) || []
            allCourseIdsFromInvoices.push(...courseIds)

            // Accumulate total payment
            totalPaymentDone += Number(invoice.payAmount || 0)
          })
        })
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bundleWhereConditions: any = {
        siteId,
        institutionId,
        isActive: true,
      }

      if (bundleId) {
        bundleWhereConditions.id = bundleId
      }

      const bundles = await this.bundleDiscountsRepository.find({
        where: bundleWhereConditions,
      })

      if (bundleId && !bundles.length) {
        this.logger.warn('Requested bundle not found or inactive', {
          bundleId,
          siteId,
          institutionId,
        })
        return []
      }

      const results: BundleDiscountAvailabilityResponse[] = []
      const now = new Date()

      for (const bundle of bundles) {
        if (now < bundle.startDate || (bundle.endDate && now > bundle.endDate)) {
          continue
        }

        // Get bundle's allowed course IDs from applicableItemIds (which are class IDs)
        // If bundle.applicableItemIds is empty or bundle.isAllItems is true, skip the check
        let bundleAllowedCourseIds: Set<number> | null = null

        if (!bundle.isAllItems && bundle.applicableItemIds && bundle.applicableItemIds.length > 0) {
          // Get course IDs from the bundle's applicable class IDs
          const applicableClasses = await this.classRepository.find({
            where: {
              id: In(bundle.applicableItemIds),
              siteId,
              institutionId,
            },
            select: ['courseId'],
          })

          bundleAllowedCourseIds = new Set(
            applicableClasses
              .map((cls) => cls.courseId)
              .filter((id): id is number => id !== null && id !== undefined)
          )

          // Check if ALL courses in invoices are within bundle's allowed course IDs
          const isAllCoursesInAllowedList = allCourseIdsFromInvoices.every((courseId) =>
            bundleAllowedCourseIds.has(courseId)
          )

          if (!isAllCoursesInAllowedList) {
            this.logger.warn("Not all courses are in the bundle's allowed list")

            results.push({
              bundleId: bundle.id,
              name: bundle.name,
              courseUsed: [],
              minAdditionalCoursesNeeded: bundle.minQty,
              totalPaymentDone: 0,
            })

            continue
          }
        }

        // Count unique courses for quota check
        const uniqueCourseIdsFromInvoices = new Set(allCourseIdsFromInvoices)

        // Get course information for all used course IDs
        const allUsedCourseIds = Array.from(uniqueCourseIdsFromInvoices)
        const coursesInfo = await this.courseService.getCoursesByIds(
          allUsedCourseIds,
          siteId,
          institutionId
        )

        // Create a map of course ID to course name for quick lookup
        const courseMap = new Map(coursesInfo.map((course) => [course.id, course.name]))

        // Build courseUsed array with duplicates preserved from invoices
        const courseUsed = allCourseIdsFromInvoices.map((courseId) => ({
          id: courseId,
          name: courseMap.get(courseId) || `Course ${courseId}`,
        }))

        // Calculate min additional courses needed based on bundle quota
        const currentCourseCount = uniqueCourseIdsFromInvoices.size
        const minAdditionalCoursesNeeded = Math.max(0, bundle.minQty - currentCourseCount)

        results.push({
          bundleId: bundle.id,
          name: bundle.name,
          courseUsed,
          minAdditionalCoursesNeeded,
          totalPaymentDone,
        })
      }

      return results
    } catch (error) {
      this.logger.error('Failed to check bundle availability', {
        error: error.message,
        stack: error.stack,
        dto,
      })
      throw new BadRequestException('Failed to check bundle availability: ' + error.message)
    }
  }

  /**
   * Get detailed class information by class ID (for availability check)
   */
  private async getClassDetailsById(
    classId: number,
    siteId: number,
    institutionId: number
  ): Promise<ClassDetailsDto | null> {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId, siteId, institutionId },
        relations: ['priceOptions'], // Using correct relation name from ClassEntity
      })

      if (!classEntity) return null

      // Map ClassTypeEnum to ClassType - direct enum mapping
      let classType: ClassType

      switch (classEntity.type) {
        case ClassTypeEnum.REGULAR_V2:
          classType = ClassType.REGULAR_V2
          break
        case ClassTypeEnum.RECURRING:
          classType = ClassType.RECURRING
          break
        case ClassTypeEnum.APPOINTMENT:
          classType = ClassType.APPOINTMENT
          break
        default:
          this.logger.warn(`Unknown class type: ${classEntity.type}`)
          return null
      }

      // Calculate total lessons in the current period for Regular v2 classes
      let totalLessonsInPeriod = 0
      if (classType === ClassType.REGULAR_V2) {
        totalLessonsInPeriod = await this.calculateLessonsInCurrentPeriod(classEntity)
      }

      // Map priceOptions to PricingOptionDto using ClassPriceOption fields
      const pricingOptions: PricingOptionDto[] = (classEntity.priceOptions || []).map((option) => ({
        id: option.id,
        numberOfLessons: option.numberOfLessons || 1, // Using actual field from ClassPriceOption
        price: option.amount || 0, // Using actual field from ClassPriceOption
        name: option.name || `Option ${option.id}`,
      }))

      return {
        id: classEntity.id,
        courseId: classEntity.courseId,
        type: classType,
        totalLessonsInPeriod,
        pricingOptions,
        startDate: classEntity.createdAt, // Using BaseEntity's createdAt
        endDate: classEntity.deletedAt || undefined, // Using BaseEntity's deletedAt
      }
    } catch (error) {
      this.logger.error(`Error getting class details for ${classId}:`, error)
      return null
    }
  }

  private async findInvoice(id: number, siteId: number, institutionId: number) {
    return this.invoiceRepository.findOne({
      where: { id, siteId, institutionId },
      relations: ['course'],
    })
  }

  private getInvoiceMonthRange(date: Date) {
    return {
      startOfMonth: dayjs(date).startOf('month').toDate(),
      endOfMonth: dayjs(date).endOf('month').toDate(),
    }
  }

  private async getMonthlyInvoices(
    userId: number,
    siteId: number,
    institutionId: number,
    start: Date,
    end: Date
  ) {
    return this.invoiceRepository.find({
      where: {
        userId,
        siteId,
        institutionId,
        paymentState: In(['PAID', 'PENDING']),
        createdAt: Between(start, end),
      },
      relations: {
        enrollCourses: {
          course: true,
        },
      },
    })
  }

  private async getEligibleBundles(start: Date, end: Date) {
    return this.bundleDiscountsRepository.find({
      where: {
        isActive: true,
        isAutoApply: true,
        isRetroactive: true,
        startDate: LessThanOrEqual(end),
        endDate: MoreThanOrEqual(start),
      },
    })
  }

  private findLatestInvoice(invoices: Invoice[]) {
    return invoices.sort((a, b) => dayjs(b.createdAt).diff(a.createdAt))[0]
  }

  private async getClassMapByCourseIds(courseIds: number[], siteId: number, institutionId: number) {
    const classes = await this.classRepository.find({
      where: {
        courseId: In(courseIds),
        siteId,
        institutionId,
      },
      select: ['id', 'courseId'],
    })

    return classes.reduce((acc, cls) => {
      if (!acc[cls.courseId]) acc[cls.courseId] = []
      acc[cls.courseId].push(cls.id)
      return acc
    }, {} as Record<number, number[]>)
  }
}
