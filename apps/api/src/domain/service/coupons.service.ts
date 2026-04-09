/* eslint-disable simple-import-sort/imports */
import { AssignCouponDto } from '@/application/admin/promotions/dto/assign-coupon.dto'
import {
  CouponDetailDto,
  CouponDetailDtoV2,
} from '@/application/admin/promotions/dto/coupon-detail.dto'
import { CouponPageOptionDto } from '@/application/admin/promotions/dto/coupon-pagination.dto'
import { CreateCouponDTO, UpdateCouponDTO } from '@/application/admin/promotions/dto/coupon.dto'
import { CreateRecordLogDto } from '@/application/admin/record-log/dto/create-record-log.dto'
import { StudentCouponDto } from '@/application/admin/student-onboard/dtos/student-onboard.dto'
import {
  StudentCalculateCouponPriceDto,
  StudentCalculateCouponPriceResponse,
  StudentEnrolTokenDto,
  StudentValidCouponDto,
} from '@/application/student/promotions/dto/coupons.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { EmailService } from '@/domain/external/email.service'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { PromotionErrorMessage } from '@/exceptions/error-message/promotion'
import { Coupon } from '@/models/coupons.entity'
import { CouponsRepository } from '@/models/coupons.repository'
import { Course } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { DiscountType, PromotionType as PromotionTypeEnum, RecordLogType } from '@/models/enums/'
import { InvoicePromotionUsedRepository } from '@/models/invoice-promotion-used.repository'
import { CouponStatus, PromotionUsedStatus } from '@/models/enums/status'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { InvoiceRepository } from '@/models/invoice.repository'
import { SitesRepository } from '@/models/sites.repository'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { User } from '@/models/user.entity'
import { UsersRepository } from '@/models/users.repository'
import { BaseService } from '@/modules/base/base.service'

import { RecordLogService } from './record-log.service'

import { ClassRepository } from '@/models/classes.repository'
import {
  EnrollClassMappingRepository,
  EnrollCourseRepository,
} from '@/models/enroll-courses.repository'
import { BadRequestException, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import * as dayjs from 'dayjs'
import * as _ from 'lodash'
import { ArrayContains, FindOptionsOrder, FindOptionsWhere, In, MoreThanOrEqual } from 'typeorm'

// import { StudentOnbService } from '@/domain/service/student-onboard.service';
const UN_LIMITED_COUPON = -1

@Injectable()
export class CouponsService extends BaseService<Coupon> {
  constructor(
    private couponsRepository: CouponsRepository,

    private readonly invoiceRepository: InvoiceRepository,

    private courseRepository: CoursesRepository,
    private classRepository: ClassRepository,
    private userRepository: UsersRepository,
    private institutionsRepository: InstitutionsRepository,
    private siteRepository: SitesRepository,
    private recordLogService: RecordLogService,

    // private studentOnbService: StudentOnbService
    private readonly invoicePromotionUsedRepository: InvoicePromotionUsedRepository,
    private emailService: EmailService,
    private enrollCourseRepository: EnrollCourseRepository,
    private enrollClassRepository: EnrollClassMappingRepository,
    private readonly userAliasesRepository: UserAliasesRepository
  ) {
    super(couponsRepository)
  }

  async findAll(pageOptionsDto: CouponPageOptionDto) {
    const whereCondition: FindOptionsWhere<Coupon> = {}
    if (pageOptionsDto.institutionId) {
      whereCondition.institutionId = pageOptionsDto.institutionId
    }

    if (pageOptionsDto.discountType) {
      whereCondition.discountType = pageOptionsDto.discountType
    }

    const orderOption: FindOptionsOrder<Coupon> = {}
    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }

    whereCondition.expireDate = MoreThanOrEqual(new Date())

    const listOfCoupons = await this.couponsRepository.pagination(
      pageOptionsDto,
      whereCondition,
      orderOption
    )

    await Promise.all(
      listOfCoupons.content.map(async (coupon) => {
        coupon.usedCount = await this.invoicePromotionUsedRepository.count({
          where: {
            promotionId: coupon.id,
            promotionType: PromotionTypeEnum.COUPON_DISCOUNT,
            usedStatus: PromotionUsedStatus.CONFIRMED,
          },
        })
      })
    )

    return listOfCoupons
  }

  async findOne(id: number): Promise<CouponDetailDtoV2> {
    const coupon = await this.couponsRepository.findOneBy({ id })
    if (!coupon) {
      throw new BadRequestException(PromotionErrorMessage.COUPON_NOT_FOUND)
    }

    const usedCount = await this.invoicePromotionUsedRepository.count({
      where: {
        promotionId: coupon.id,
        promotionType: PromotionTypeEnum.COUPON_DISCOUNT,
        usedStatus: PromotionUsedStatus.CONFIRMED,
      },
    })

    const [studentAssigned, courseAssigned] = await Promise.all([
      this.getStudentAssigned(coupon.userIds),
      this.getCourseClassAssigned(coupon.classIds),
    ])
    return plainToInstance(CouponDetailDtoV2, {
      ...coupon,
      usage: usedCount,
      studentsAssigned: studentAssigned,
      courseAssigned,
    })
  }

  async getStudentAssigned(userIds: number[]) {
    const studentAssigned = await this.userRepository.find({
      where: {
        id: In(userIds),
        deletedAt: null,
      },
      select: ['email', 'lastName', 'firstName', 'id', 'phone'],
    })

    return studentAssigned
  }

  async getCourseAssigned(couponId: number, classIds: number[]) {
    const courseAssigned = this.courseRepository
      .createQueryBuilder('c')
      .leftJoin('course_promotion_used', 'cc', 'cc.course_id = c.id')
      .leftJoin('classes', 'cl', 'cl.course_id = c.id ')
      .leftJoin('invoices', 'i', 'i.id = cc.invoice_id ')
      .leftJoin('student_lesson', 'sl', 'sl.enroll_course_id = i.enroll_id ')
      .where('cc.coupon_id = :coupon_id', { coupon_id: couponId })
      .select([
        'c.id as id',
        'c.name as name',
        // 'c.type as type',
        'c.seo_content as "seoContent"',
        'c.preview_image_url as "previewImageUrl"',
        'cl.id as "classId"',
        'cl.name as "className"',
        'cc.created_at as "createdAt"',
        'i.original_fee as "originalFee"',
        'i.pay_amount as "payAmount"',
        'i.currency as "currency"',
        'sl.start_time as "startTime"',
        'sl.end_time as "endTime"',
      ])

    if (classIds.length != 0) {
      courseAssigned.andWhere('cl.id IN (:...classIds)', { classIds })
    }

    const coursesResult = await courseAssigned.getRawMany()

    const res = _.reduce(
      coursesResult,
      (data, item: any) => {
        if (!data[item.id]) {
          data[item.id] = {
            ..._.pick(item, [
              'id',
              'name',
              'type',
              'seoContent',
              'previewImageName',
              'previewImageUrl',
            ]),
            classes: [],
          }
        }
        data[item.id].classes.push({
          id: item.classId,
          name: item.className,
          createdAt: item.createdAt,
          originalFee: +item.originalFee,
          payAmount: +item.payAmount,
          currency: item.currency,
          startTime: item.startTime,
          endTime: item.endTime,
        })

        return data
      },
      []
    )

    return res
  }

  async getCourseClassAssigned(classIds: number[]) {
    if (!Array.isArray(classIds)) {
      throw new Error('classIds must be an array')
    }

    const validClassIds = classIds.filter((id) => id != null && !isNaN(Number(id)))
    const courseAssigned = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.classes', 'class')
      .where(
        validClassIds.length > 0 ? 'class.id IN (:...classIds)' : '1=0',
        validClassIds.length > 0 ? { classIds: validClassIds } : {}
      )
      .getMany()

    // const courseAssigned = this.classRepository.find({
    //   where: {
    //     id: In(classIds),
    //   },
    //   relations: {
    //     course: true,
    //   },
    //   order: {
    //     course: {
    //       id: 'ASC',
    //     },
    //   },
    // })
    return courseAssigned
  }

  async create(createCouponDto: CreateCouponDTO, user): Promise<CouponDetailDto> {
    const courses = await this.courseRepository.find({
      select: {
        id: true,
        institutionId: true,
      },
      where: {
        id: In(createCouponDto.courseIds),
      },
    })
    if (courses.length != createCouponDto.courseIds?.length) {
      throw new BadRequestException(PromotionErrorMessage.COURSE_NOT_FOUND)
    }

    if (courses.some((cid) => cid.institutionId != createCouponDto.institutionId)) {
      throw new BadRequestException(PromotionErrorMessage.COURSE_NOT_BELONG_INSTITUTION)
    }

    if (new Date(createCouponDto.expireDate) <= new Date())
      throw new ApiError(ErrorCode.INVALID_EXPRIRE_DATE)

    const existCoupon = await this.couponsRepository.findOneBy({
      code: createCouponDto.code,
      institutionId: createCouponDto.institutionId,
    })
    if (existCoupon) throw new BadRequestException(PromotionErrorMessage.COUPON_ALREADY_EXIST)

    createCouponDto.quota = createCouponDto.quota >= 0 ? createCouponDto.quota : UN_LIMITED_COUPON
    const coupon = await this.couponsRepository.save(this.couponsRepository.create(createCouponDto))

    // record log create coupon
    await this.recordLogService.create([
      {
        type: RecordLogType.CREATE_COUPON,
        institutionId: createCouponDto.institutionId,
        detail: {
          couponCode: createCouponDto.code,
          educatorFirstName: user.firstName,
          educatorLastName: user.lastName,
          educatorId: user.id,
          modifiedDate: dayjs().toDate(),
        },
      },
    ])

    /**
     * check field missing
     * assign coupon to user
     * record history assign coupon
     *
     */
    if (!_.isEmpty(createCouponDto.userIds)) {
      const dataAssignUser: AssignCouponDto = {
        userIds: createCouponDto.userIds,
        institutionId: createCouponDto.institutionId,
        coupon,
        educatorName: user.firstName,
        educatorId: user.id,
        emailNotifyOn: createCouponDto.emailNotifyOn,
      }
      await this.assignCouponForUsers(dataAssignUser)
    }

    return plainToInstance(CouponDetailDto, coupon)
  }

  async update(id: number, updateCouponDto: UpdateCouponDTO): Promise<CouponDetailDto> {
    const coupon = await this.couponsRepository.findOneBy({ id })
    if (!coupon) {
      throw new BadRequestException(PromotionErrorMessage.COUPON_NOT_FOUND)
    }

    // Validate courses if courseIds provided
    if (updateCouponDto.courseIds?.length) {
      const course = await this.courseRepository.find({
        select: {
          id: true,
          institutionId: true,
        },
        where: {
          id: In(updateCouponDto.courseIds),
        },
      })

      if (!course?.length || course.length !== updateCouponDto.courseIds.length) {
        throw new BadRequestException(PromotionErrorMessage.COURSE_NOT_FOUND)
      }

      if (course.some((cid) => cid.institutionId != coupon.institutionId)) {
        throw new BadRequestException(PromotionErrorMessage.COURSE_NOT_BELONG_INSTITUTION)
      }
    }

    // Validate users if userIds provided
    if (updateCouponDto.userIds?.length) {
      const users = await this.userRepository.find({
        select: {
          id: true,
        },
        where: {
          id: In(updateCouponDto.userIds),
        },
        relations: {
          userRoles: {
            institution: true,
          },
        },
      })

      if (!users?.length || users.length !== updateCouponDto.userIds.length) {
        throw new BadRequestException(PromotionErrorMessage.USER_NOT_FOUND)
      }

      // Check if all users belong to the same institution as the coupon
      for (const user of users) {
        const userRoles = (await user.userRoles) || []
        const hasValidInstitution = userRoles.some(
          (role) => role.institutionId === coupon.institutionId
        )
        if (userRoles.length > 0 && !hasValidInstitution) {
          updateCouponDto.userIds = updateCouponDto.userIds.filter((id) => id !== user.id)
          console.log('updateCouponDto.userIds', user.id)
        }
      }
    }

    // Only update quota if provided
    if (updateCouponDto.quota !== undefined) {
      updateCouponDto.quota = updateCouponDto.quota >= 0 ? updateCouponDto.quota : UN_LIMITED_COUPON
    }

    // Filter out undefined values to only update provided fields
    const updateData = Object.fromEntries(
      Object.entries(updateCouponDto).filter(([, value]) => value !== undefined)
    )

    const couponInstance = plainToInstance(Coupon, {
      ...coupon,
      ...updateData,
    })
    const couponUpdated = await this.couponsRepository.save(couponInstance)
    return plainToInstance(CouponDetailDto, couponUpdated)
  }

  async remove(id: number, user): Promise<CouponDetailDto> {
    const coupon = await this.couponsRepository.findOneBy({ id })
    if (!coupon) {
      throw new BadRequestException(PromotionErrorMessage.COUPON_NOT_FOUND)
    }
    const couponRemoved = await this.couponsRepository.softRemove(coupon)

    const uids = [...coupon.userIds, user.id]

    const logs = _.map(uids, (id) => {
      return {
        type: RecordLogType.DELETE_COUPON,
        institutionId: coupon.institutionId,
        userId: id,
        detail: {
          deleteBy: { id: user.id, name: user.firstName },
          modifiedDate: dayjs().toDate(),
        },
      }
    })

    await this.recordLogService.create(logs)

    return plainToInstance(CouponDetailDto, couponRemoved)
  }

  async calculateCouponPrice(
    checkCouponDto: StudentCalculateCouponPriceDto
  ): Promise<StudentCalculateCouponPriceResponse> {
    const coupon = await this.couponsRepository.findOne({
      where: {
        code: checkCouponDto.couponCode,
        institutionId: checkCouponDto.institutionId,
      },
    })

    if (!coupon) {
      throw new BadRequestException(PromotionErrorMessage.COUPON_NOT_FOUND)
    }

    if (coupon.expireDate < new Date()) {
      throw new BadRequestException(PromotionErrorMessage.COUPON_HAS_EXPIRED)
    }

    if (coupon.quota == 0) {
      throw new BadRequestException(PromotionErrorMessage.COUPON_USED_UP)
    }

    // if (coupon.institutionId !== checkCouponDto.institutionId) {
    //   throw new BadRequestException(PromotionErrorMessage.COUPON_NOT_APPLY_FOR_THIS_COURSE);
    // }

    // const course = await this.courseRepository
    //   .createQueryBuilder('course')
    //   .leftJoinAndSelect('course.courseCoupons', 'coupon_course')
    //   .where('coupon_course.coupon_id = :coupon_id AND coupon_course.course_id = :course_id', {
    //     coupon_id: coupon.id,
    //     course_id: checkCouponDto.courseId,
    //   })
    //   .getRawOne();

    let couponPrice = 0
    let amountReduced = 0

    if (coupon.discountType == DiscountType.PERCENTAGE) {
      couponPrice =
        checkCouponDto.initialPrice - (checkCouponDto.initialPrice * coupon.amount) / 100
      amountReduced = (checkCouponDto.initialPrice * coupon.amount) / 100
    } else {
      couponPrice = Math.max(checkCouponDto.initialPrice - coupon.amount, 0)
      amountReduced = Math.min(coupon.amount, checkCouponDto.initialPrice)
    }

    return { coupon, couponPrice, amountReduced }
  }

  async isCouponValid({ couponCode, enrolToken, institutionId, invoiceId }: StudentValidCouponDto) {
    const coupon = await this.findOneBy({
      code: couponCode,
      institutionId,
      deletedAt: null,
    })

    if (!coupon) {
      return {
        valid: false,
        coupon: null,
        message: PromotionErrorMessage.COUPON_NOT_FOUND,
      }
    }

    if (coupon.status === CouponStatus.INACTIVE) {
      return {
        valid: false,
        coupon: null,
        message: PromotionErrorMessage.COUPON_IS_NOT_ACTIVE,
      }
    }

    if (coupon.expireDate < new Date()) {
      return {
        valid: false,
        coupon: null,
        message: PromotionErrorMessage.COUPON_HAS_EXPIRED,
      }
    }

    if (coupon.institutionId !== institutionId) {
      return {
        valid: false,
        coupon: null,
        message: PromotionErrorMessage.COUPON_NOT_APPLY_FOR_THIS_COURSE,
      }
    }

    // NEED CHECK THE INVOICE PROMOTION USED TO SEE IF THE COUPON IS USED
    const couponUsed = await this.invoicePromotionUsedRepository.count({
      where: {
        promotionId: coupon.id,
        promotionType: PromotionTypeEnum.COUPON_DISCOUNT,
        usedStatus: PromotionUsedStatus.CONFIRMED,
      },
    })

    const quotaAvailable = coupon.quota == UN_LIMITED_COUPON || couponUsed < coupon.quota

    if (!quotaAvailable) {
      return {
        valid: false,
        coupon: null,
        message: PromotionErrorMessage.COUPON_USED_UP,
      }
    }

    if (enrolToken && enrolToken !== '') {
      const enrolment = await this.invoiceRepository.findOne({
        where: { proofToken: enrolToken, id: invoiceId },
        relations: { enrollCourses: true },
      })
      if (enrolment && enrolment.enrollCourses.length) {
        const invoiceOfEnrollment = await this.invoiceRepository.findOne({
          where: { proofToken: enrolToken, id: invoiceId },
          relations: { studentSchedules: true },
        })
        const classIds = invoiceOfEnrollment.studentSchedules?.map((s) => s.classId)
        if (
          coupon.userIds &&
          coupon.userIds.length > 0 &&
          !coupon.userIds.includes(enrolment.userId)
        ) {
          return {
            valid: false,
            coupon: null,
            message: PromotionErrorMessage.COUPON_NOT_APPLY_FOR_USER,
          }
        }

        console.log('coupon.classIds', coupon.classIds)
        console.log('classIds', classIds)

        if (
          coupon.classIds &&
          coupon.classIds.length > 0 &&
          !coupon.classIds.some((id) => classIds.includes(id))
        ) {
          return {
            valid: false,
            coupon: null,
            message: PromotionErrorMessage.COUPON_NOT_APPLY_FOR_THIS_COURSE,
          }
        }
      }
    }

    return { valid: true, coupon, message: '' }
  }

  async getCoupons(params: StudentCouponDto) {
    const where: FindOptionsWhere<Coupon> = {
      institutionId: params.institutionId,
      siteId: params.siteId,
      status: CouponStatus.ACTIVE,
      deletedAt: null,
      expireDate: MoreThanOrEqual(new Date()),
    }
    if (params.userId) {
      where.userIds = ArrayContains([params.userId])
    }
    return await this.couponsRepository.findAll({
      where,
      order: {
        createdAt: 'DESC',
      },
    })
  }

  async getAvailableStudentCoupons({ enrolToken }: StudentEnrolTokenDto): Promise<Coupon[]> {
    const couponCourse = await this.invoiceRepository.findOneBy({
      proofToken: enrolToken,
    })

    if (!!couponCourse && couponCourse.userId && couponCourse.institutionId) {
      const coupon = await this.getCoupons({
        userId: couponCourse.userId,
        institutionId: couponCourse.institutionId,
        siteId: couponCourse.siteId,
      })

      if (!coupon || coupon.length === 0) {
        return []
      }

      // Compute usedCount for each coupon via invoice_promotion_used
      const couponIds = coupon.map((c) => c.id)
      if (couponIds.length > 0) {
        const usedRecords = await this.invoicePromotionUsedRepository.find({
          where: {
            promotionId: In(couponIds),
            promotionType: PromotionTypeEnum.COUPON_DISCOUNT,
            usedStatus: PromotionUsedStatus.CONFIRMED,
          },
          select: ['promotionId'],
        })
        const usedCountMap: Record<number, number> = {}
        usedRecords.forEach((u) => {
          usedCountMap[u.promotionId] = (usedCountMap[u.promotionId] || 0) + 1
        })
        coupon.forEach((c) => {
          c.usedCount = usedCountMap[c.id] || 0
        })
      }

      // The above function get ALL coupon that belongs to a student. We need to filter out the expired coupons
      const filteredCoupon = coupon.filter((c) => {
        return (
          c.expireDate >= new Date() && (c.quota === UN_LIMITED_COUPON || c.usedCount < c.quota)
        )
      })

      return filteredCoupon
    } else {
      throw new ApiError(ErrorCode.USERID_NOT_FOUND)
    }
  }

  async assignCouponForUsers(data: AssignCouponDto): Promise<void> {
    const { userIds, institutionId, coupon, educatorName, educatorId, emailNotifyOn } = data
    const users = await this.userRepository.find({
      where: {
        id: In(userIds),
        deletedAt: null,
        userRoles: {
          isStudent: true,
          institutionId,
        },
      },
      relations: {
        userRoles: true,
      },
      select: ['id', 'email', 'firstName', 'lastName'],
    })

    const userAliases = await this.userAliasesRepository.find({
      where: {
        userId: In(userIds),
        institutionId,
      },
      relations: {
        user: true,
      },
    })

    const school = await this.institutionsRepository.findOneById(institutionId)
    const site = await this.siteRepository.findOneById(school.siteId)

    if (users.length != userIds.length) {
      throw new BadRequestException(PromotionErrorMessage.USER_NOT_FOUND)
    }

    const createCouponLog: CreateRecordLogDto[] = []
    for (const user of users) {
      let contactEmail = user.email
      let contactName = user.fullName

      const userAlias = userAliases.find((ua) => ua.userId === user.id)

      if (userAlias) {
        contactEmail = userAlias.email ?? userAlias.user?.email ?? contactEmail
        contactName = userAlias.name ?? contactName
      }

      const params = {
        type: RecordLogType.CREATE_COUPON,
        institutionId,
        userId: user.id,
        detail: {
          studentId: user.id,
          studentFirstName: user.firstName,
          studentLastName: user.lastName,
          couponCode: coupon.code,
          educatorName,
          educatorId,
          modifiedDate: dayjs().toDate(),
        },
      }
      createCouponLog.push(params)

      const discountAmountUnit =
        coupon.discountType === DiscountType.FIXED_AMOUNT
          ? `${site.currency} ${coupon.amount}`
          : `${coupon.amount} %`

      if (emailNotifyOn) {
        await this.emailService.sendAssignCouponEmail({
          userId: user.id,
          studentName: contactName,
          studentEmail: contactEmail,
          institutionName: school.name,
          couponCode: coupon.code,
          discountAmountUnit,
          expiredDate: coupon.expireDate,
        })
      }
    }

    await this.recordLogService.create(createCouponLog)
  }

  async updatePromotionHistory({
    coupon,
    course,
    enrollId,
    invoiceId,
    student,
    status,
  }: {
    coupon: Coupon
    course: Course
    enrollId: number
    invoiceId: number
    student: User
    status: PromotionUsedStatus
  }): Promise<void> {
    const existingPromoUsed = await this.invoicePromotionUsedRepository.findOneBy({
      invoiceId,
      promotionType: PromotionTypeEnum.COUPON_DISCOUNT,
    })

    if (!existingPromoUsed) {
      const invoice = await this.invoiceRepository.findOneBy({ id: invoiceId })
      const amount =
        coupon.discountType === DiscountType.FIXED_AMOUNT
          ? coupon.amount
          : invoice
          ? (coupon.amount / 100) * invoice.payAmount
          : 0
      await this.invoicePromotionUsedRepository.save({
        invoiceId,
        siteId: course.siteId,
        institutionId: course.institutionId,
        promotionType: PromotionTypeEnum.COUPON_DISCOUNT,
        promotionId: coupon.id,
        name: coupon.code,
        amount,
        usedStatus: status,
      })

      await this.recordLogService.create([
        {
          type: RecordLogType.USAGE_COUPON,
          institutionId: coupon.institutionId,
          detail: {
            couponCode: coupon.code,
            courseName: course.name,
            studentName: `${student.firstName} ${student.lastName}`,
            modifiedDate: dayjs().toDate(),
            usedStatus: status,
          },
        },
      ])
    } else {
      if (existingPromoUsed.usedStatus !== PromotionUsedStatus.CONFIRMED) {
        await this.invoicePromotionUsedRepository.save({ ...existingPromoUsed, usedStatus: status })
      }

      await this.recordLogService.create([
        {
          type: RecordLogType.CONFIRM_USAGE_COUPON,
          institutionId: coupon.institutionId,
          detail: {
            couponCode: coupon.code,
            courseName: course.name,
            studentName: `${student.firstName} ${student.lastName}`,
            modifiedDate: dayjs().toDate(),
            usedStatus: status,
          },
        },
      ])
    }
  }

  async updateStatus(id: number, { status }, user): Promise<boolean> {
    const couponExist = await this.couponsRepository.findOneBy({
      id,
      deletedAt: null,
    })
    if (!couponExist) throw new ApiError(ErrorCode.COUPON_NOT_FOUND)
    couponExist.status = status
    await this.couponsRepository.save(couponExist)

    if (status === CouponStatus.INACTIVE) {
      const logs = _.map(couponExist.userIds, (id) => {
        return {
          type: RecordLogType.INACTIVE_COUPON,
          institutionId: couponExist.institutionId,
          detail: {
            couponCode: couponExist.code,
            updateBy: { id: user.id, name: user.firstName },
            modifiedDate: dayjs().toDate(),
          },
        }
      })

      await this.recordLogService.create(logs)
    }

    return true
  }

  async findCouponByCodeAndSchoolId(institutionId: number, couponCode: string) {
    const coupon = await this.couponsRepository.find({
      where: {
        code: couponCode,
        institutionId,
      },
    })

    return coupon
  }
}
