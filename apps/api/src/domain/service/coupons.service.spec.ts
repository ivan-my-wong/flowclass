import { ApiError } from '@/common/api-formats/api-error'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { PromotionErrorMessage } from '@/exceptions/error-message/promotion'
import { Coupon } from '@/models/coupons.entity'
import { DiscountType, RecordLogType } from '@/models/enums/'
import { CouponStatus, PromotionUsedStatus } from '@/models/enums/status'

import { CouponsService } from './coupons.service'

describe('CouponsService', () => {
  let service: CouponsService
  let mockCouponsRepository: any
  let mockInvoiceRepository: any
  let mockCourseRepository: any
  let mockClassRepository: any
  let mockUserRepository: any
  let mockInstitutionsRepository: any
  let mockSiteRepository: any
  let mockRecordLogService: any
  let mockStudentMemoRepository: any
  let mockCoursePromotionUsedRepository: any
  let mockEmailService: any
  let mockEnrollCourseRepository: any
  let mockEnrollClassRepository: any
  let mockUserAliasesRepository: any

  const mockAdminUser = {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@flowclass.io',
  }

  beforeEach(() => {
    mockCouponsRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn((data) => Promise.resolve({ id: 1, ...data })),
      create: jest.fn((data) => ({ ...data })),
      softRemove: jest.fn((data) => Promise.resolve(data)),
    }

    mockInvoiceRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
    }

    mockCourseRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    }

    mockClassRepository = {
      find: jest.fn(),
    }

    mockUserRepository = {
      findOne: jest.fn(),
    }

    mockInstitutionsRepository = {
      findOneById: jest.fn().mockResolvedValue({ id: 1, siteId: 10, name: 'Flowclass Academy' }),
    }

    mockSiteRepository = {
      findOneById: jest.fn().mockResolvedValue({ id: 10, currency: 'HKD' }),
    }

    mockRecordLogService = {
      create: jest.fn().mockResolvedValue(undefined),
    }

    mockStudentMemoRepository = {
      find: jest.fn().mockResolvedValue([]),
    }

    mockCoursePromotionUsedRepository = {
      count: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn().mockResolvedValue(null),
      save: jest.fn((data) => Promise.resolve({ id: 1, ...data })),
      create: jest.fn((data) => ({ ...data })),
    }

    mockEmailService = {
      sendAssignCouponEmail: jest.fn().mockResolvedValue(undefined),
    }

    mockEnrollCourseRepository = {}
    mockEnrollClassRepository = {}

    mockUserAliasesRepository = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
    }

    service = new CouponsService(
      mockCouponsRepository,
      mockInvoiceRepository,
      mockCourseRepository,
      mockClassRepository,
      mockUserRepository,
      mockInstitutionsRepository,
      mockSiteRepository,
      mockRecordLogService,
      mockStudentMemoRepository,
      mockCoursePromotionUsedRepository,
      mockEmailService,
      mockEnrollCourseRepository as any,
      mockEnrollClassRepository as any,
      mockUserAliasesRepository
    )
  })

  describe('Coupon Creation (create)', () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    it('should create an unrestricted / general coupon (applicable to any student/course/class)', async () => {
      mockCourseRepository.find.mockResolvedValue([])
      mockCouponsRepository.findOneBy.mockResolvedValue(null)

      const createDto: any = {
        code: 'GENERAL10',
        amount: 10,
        discountType: DiscountType.PERCENTAGE,
        quota: 100,
        expireDate: futureDate,
        institutionId: 1,
        siteId: 10,
        courseIds: [],
        userAliasIds: [],
        classIds: [],
      }

      const result = await service.create(createDto, mockAdminUser)

      expect(mockCouponsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'GENERAL10',
          amount: 10,
          discountType: DiscountType.PERCENTAGE,
          quota: 100,
          userAliasIds: [],
        })
      )
      expect(mockRecordLogService.create).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: RecordLogType.CREATE_COUPON,
            institutionId: 1,
          }),
        ])
      )
      expect(result.code).toBe('GENERAL10')
    })

    it('should create a coupon limited to specific student(s) and assign it with logs and email notifications', async () => {
      mockCourseRepository.find.mockResolvedValue([])
      mockCouponsRepository.findOneBy.mockResolvedValue(null)
      mockUserAliasesRepository.find.mockResolvedValue([
        {
          id: 101,
          userId: 201,
          name: 'John Doe',
          email: 'john@example.com',
          user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        },
      ])
      mockStudentMemoRepository.find.mockResolvedValue([
        {
          userAliasId: 101,
          preferredName: 'Johnny',
          preferredEmail: 'johnny.pref@example.com',
        },
      ])

      const createDto: any = {
        code: 'STUDENT_ONLY',
        amount: 50,
        discountType: DiscountType.FIXED_AMOUNT,
        quota: 1,
        expireDate: futureDate,
        institutionId: 1,
        siteId: 10,
        userAliasIds: [101],
        emailNotifyOn: true,
      }

      const result = await service.create(createDto, mockAdminUser)

      expect(mockCouponsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'STUDENT_ONLY',
          userAliasIds: [101],
        })
      )
      expect(mockEmailService.sendAssignCouponEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 201,
          studentName: 'Johnny',
          studentEmail: 'johnny.pref@example.com',
          couponCode: 'STUDENT_ONLY',
          discountAmountUnit: 'HKD 50',
          institutionId: 1,
        })
      )
      expect(result.code).toBe('STUDENT_ONLY')
    })

    it('should create a coupon limited to specific course(s) after validating course existence and institution', async () => {
      mockCourseRepository.find.mockResolvedValue([
        { id: 10, institutionId: 1 },
        { id: 11, institutionId: 1 },
      ])
      mockCouponsRepository.findOneBy.mockResolvedValue(null)

      const createDto: any = {
        code: 'COURSE_DISCOUNT',
        amount: 15,
        discountType: DiscountType.PERCENTAGE,
        quota: 50,
        expireDate: futureDate,
        institutionId: 1,
        siteId: 10,
        courseIds: [10, 11],
      }

      const result = await service.create(createDto, mockAdminUser)

      expect(mockCourseRepository.find).toHaveBeenCalled()
      expect(mockCouponsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'COURSE_DISCOUNT',
          courseIds: [10, 11],
        })
      )
      expect(result.code).toBe('COURSE_DISCOUNT')
    })

    it('should create a coupon limited to specific class(es)', async () => {
      mockCourseRepository.find.mockResolvedValue([])
      mockCouponsRepository.findOneBy.mockResolvedValue(null)

      const createDto: any = {
        code: 'CLASS_DISCOUNT',
        amount: 20,
        discountType: DiscountType.FIXED_AMOUNT,
        quota: 20,
        expireDate: futureDate,
        institutionId: 1,
        siteId: 10,
        classIds: [501, 502],
      }

      const result = await service.create(createDto, mockAdminUser)

      expect(mockCouponsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'CLASS_DISCOUNT',
          classIds: [501, 502],
        })
      )
      expect(result.code).toBe('CLASS_DISCOUNT')
    })

    it('should create a coupon limited to BOTH student AND class combination', async () => {
      mockCourseRepository.find.mockResolvedValue([])
      mockCouponsRepository.findOneBy.mockResolvedValue(null)
      mockUserAliasesRepository.find.mockResolvedValue([
        { id: 101, userId: 201, name: 'Alice', email: 'alice@example.com' },
      ])

      const createDto: any = {
        code: 'STUDENT_CLASS_COMBO',
        amount: 25,
        discountType: DiscountType.PERCENTAGE,
        quota: 1,
        expireDate: futureDate,
        institutionId: 1,
        siteId: 10,
        userAliasIds: [101],
        classIds: [501],
      }

      const result = await service.create(createDto, mockAdminUser)

      expect(mockCouponsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'STUDENT_CLASS_COMBO',
          userAliasIds: [101],
          classIds: [501],
        })
      )
      expect(result.code).toBe('STUDENT_CLASS_COMBO')
    })

    it('should create a bundle-only or trial-lesson coupon', async () => {
      mockCourseRepository.find.mockResolvedValue([])
      mockCouponsRepository.findOneBy.mockResolvedValue(null)

      const createDto: any = {
        code: 'BUNDLE_OR_TRIAL',
        amount: 30,
        discountType: DiscountType.PERCENTAGE,
        quota: -1,
        expireDate: futureDate,
        institutionId: 1,
        siteId: 10,
        forBundle: true,
        forTrialLesson: true,
      }

      const result = await service.create(createDto, mockAdminUser)

      expect(mockCouponsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'BUNDLE_OR_TRIAL',
          quota: -1,
          forBundle: true,
          forTrialLesson: true,
        })
      )
      expect(result.code).toBe('BUNDLE_OR_TRIAL')
    })

    it('should reject coupon creation if expireDate is in the past', async () => {
      const pastDate = new Date(Date.now() - 10000).toISOString()
      mockCourseRepository.find.mockResolvedValue([])

      const createDto: any = {
        code: 'EXPIRED_CODE',
        amount: 10,
        discountType: DiscountType.PERCENTAGE,
        quota: 10,
        expireDate: pastDate,
        institutionId: 1,
      }

      await expect(service.create(createDto, mockAdminUser)).rejects.toThrow(ApiError)
    })

    it('should reject coupon creation if code already exists in the same institution', async () => {
      mockCourseRepository.find.mockResolvedValue([])
      mockCouponsRepository.findOneBy.mockResolvedValue({ id: 99, code: 'EXISTING_CODE' })

      const createDto: any = {
        code: 'EXISTING_CODE',
        amount: 10,
        discountType: DiscountType.PERCENTAGE,
        quota: 10,
        expireDate: futureDate,
        institutionId: 1,
      }

      await expect(service.create(createDto, mockAdminUser)).rejects.toThrow(
        PromotionErrorMessage.COUPON_ALREADY_EXIST
      )
    })

    it('should reject coupon creation if specified courseIds do not exist', async () => {
      mockCourseRepository.find.mockResolvedValue([{ id: 1, institutionId: 1 }])

      const createDto: any = {
        code: 'MISSING_COURSE',
        amount: 10,
        discountType: DiscountType.PERCENTAGE,
        quota: 10,
        expireDate: futureDate,
        institutionId: 1,
        courseIds: [1, 2], // 2 is missing
      }

      await expect(service.create(createDto, mockAdminUser)).rejects.toThrow(
        PromotionErrorMessage.COURSE_NOT_FOUND
      )
    })

    it('should reject coupon creation if specified course belongs to another institution', async () => {
      mockCourseRepository.find.mockResolvedValue([
        { id: 1, institutionId: 2 }, // belongs to institution 2, not 1
      ])

      const createDto: any = {
        code: 'WRONG_INSTITUTION_COURSE',
        amount: 10,
        discountType: DiscountType.PERCENTAGE,
        quota: 10,
        expireDate: futureDate,
        institutionId: 1,
        courseIds: [1],
      }

      await expect(service.create(createDto, mockAdminUser)).rejects.toThrow(
        PromotionErrorMessage.COURSE_NOT_BELONG_INSTITUTION
      )
    })

    it('should reject coupon creation if assigned userAlias does not exist', async () => {
      mockCourseRepository.find.mockResolvedValue([])
      mockCouponsRepository.findOneBy.mockResolvedValue(null)
      mockUserAliasesRepository.find.mockResolvedValue([]) // No user alias found

      const createDto: any = {
        code: 'NONEXISTENT_USER',
        amount: 10,
        discountType: DiscountType.PERCENTAGE,
        quota: 10,
        expireDate: futureDate,
        institutionId: 1,
        userAliasIds: [999],
      }

      await expect(service.create(createDto, mockAdminUser)).rejects.toThrow(
        PromotionErrorMessage.USER_NOT_FOUND
      )
    })
  })

  describe('Coupon Validation for Current User + Course/Class Combination (isCouponValid)', () => {
    const baseCoupon: Partial<Coupon> = {
      id: 1,
      code: 'TEST_PROMO',
      institutionId: 1,
      status: CouponStatus.ACTIVE,
      expireDate: new Date(Date.now() + 86400000),
      quota: 10,
      userAliasIds: [],
      classIds: [],
    }

    it('should validate General coupon as valid for any user and class combination', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        userAliasIds: [],
        classIds: [],
      })
      mockInvoiceRepository.findOne.mockResolvedValue({
        id: 10,
        proofToken: 'token_general',
        userAliasId: 101,
        enrollCourses: [{ id: 1 }],
        studentSchedules: [{ classId: 501 }],
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        enrolToken: 'token_general',
        institutionId: 1,
        invoiceId: 10,
      })

      expect(result.valid).toBe(true)
      expect(result.coupon).toBeDefined()
    })

    it('should validate Student-Limited coupon: VALID for assigned student userAliasId', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        userAliasIds: [101, 102],
      })
      mockInvoiceRepository.findOne.mockResolvedValue({
        id: 10,
        proofToken: 'token_student_match',
        userAliasId: 101,
        enrollCourses: [{ id: 1 }],
        studentSchedules: [{ classId: 501 }],
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        enrolToken: 'token_student_match',
        institutionId: 1,
        invoiceId: 10,
      })

      expect(result.valid).toBe(true)
    })

    it('should validate Student-Limited coupon: REJECT for unassigned student userAliasId', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        userAliasIds: [101, 102],
      })
      mockInvoiceRepository.findOne.mockResolvedValue({
        id: 10,
        proofToken: 'token_student_mismatch',
        userAliasId: 999,
        enrollCourses: [{ id: 1 }],
        studentSchedules: [{ classId: 501 }],
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        enrolToken: 'token_student_mismatch',
        institutionId: 1,
        invoiceId: 10,
      })

      expect(result.valid).toBe(false)
      expect(result.message).toBe(PromotionErrorMessage.COUPON_NOT_APPLY_FOR_USER)
    })

    it('should validate Class-Limited coupon: VALID when enrolled class is in coupon.classIds', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        classIds: [501, 502],
      })
      mockInvoiceRepository.findOne.mockResolvedValue({
        id: 10,
        proofToken: 'token_class_match',
        userAliasId: 101,
        enrollCourses: [{ id: 1 }],
        studentSchedules: [{ classId: 501 }],
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        enrolToken: 'token_class_match',
        institutionId: 1,
        invoiceId: 10,
      })

      expect(result.valid).toBe(true)
    })

    it('should validate Class-Limited coupon: REJECT when enrolled class is not in coupon.classIds', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        classIds: [501, 502],
      })
      mockInvoiceRepository.findOne.mockResolvedValue({
        id: 10,
        proofToken: 'token_class_mismatch',
        userAliasId: 101,
        enrollCourses: [{ id: 1 }],
        studentSchedules: [{ classId: 999 }],
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        enrolToken: 'token_class_mismatch',
        institutionId: 1,
        invoiceId: 10,
      })

      expect(result.valid).toBe(false)
      expect(result.message).toBe(PromotionErrorMessage.COUPON_NOT_APPLY_FOR_THIS_COURSE)
    })

    it('should validate Combo (Student + Class) coupon: VALID when BOTH student and class match', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        userAliasIds: [101],
        classIds: [501],
      })
      mockInvoiceRepository.findOne.mockResolvedValue({
        id: 10,
        proofToken: 'token_combo_match',
        userAliasId: 101,
        enrollCourses: [{ id: 1 }],
        studentSchedules: [{ classId: 501 }],
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        enrolToken: 'token_combo_match',
        institutionId: 1,
        invoiceId: 10,
      })

      expect(result.valid).toBe(true)
    })

    it('should validate Combo coupon: REJECT when student matches but class does not match', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        userAliasIds: [101],
        classIds: [501],
      })
      mockInvoiceRepository.findOne.mockResolvedValue({
        id: 10,
        proofToken: 'token_combo_wrong_class',
        userAliasId: 101,
        enrollCourses: [{ id: 1 }],
        studentSchedules: [{ classId: 999 }],
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        enrolToken: 'token_combo_wrong_class',
        institutionId: 1,
        invoiceId: 10,
      })

      expect(result.valid).toBe(false)
      expect(result.message).toBe(PromotionErrorMessage.COUPON_NOT_APPLY_FOR_THIS_COURSE)
    })

    it('should validate Combo coupon: REJECT when class matches but student does not match', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        userAliasIds: [101],
        classIds: [501],
      })
      mockInvoiceRepository.findOne.mockResolvedValue({
        id: 10,
        proofToken: 'token_combo_wrong_student',
        userAliasId: 999,
        enrollCourses: [{ id: 1 }],
        studentSchedules: [{ classId: 501 }],
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        enrolToken: 'token_combo_wrong_student',
        institutionId: 1,
        invoiceId: 10,
      })

      expect(result.valid).toBe(false)
      expect(result.message).toBe(PromotionErrorMessage.COUPON_NOT_APPLY_FOR_USER)
    })

    it('should reject coupon if coupon does not exist', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue(null)

      const result = await service.isCouponValid({
        couponCode: 'NON_EXISTENT',
        institutionId: 1,
      })

      expect(result.valid).toBe(false)
      expect(result.message).toBe(PromotionErrorMessage.COUPON_NOT_FOUND)
    })

    it('should reject coupon if coupon is INACTIVE', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        status: CouponStatus.INACTIVE,
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        institutionId: 1,
      })

      expect(result.valid).toBe(false)
      expect(result.message).toBe(PromotionErrorMessage.COUPON_IS_NOT_ACTIVE)
    })

    it('should reject coupon if coupon has expired', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        expireDate: new Date(Date.now() - 10000),
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        institutionId: 1,
      })

      expect(result.valid).toBe(false)
      expect(result.message).toBe(PromotionErrorMessage.COUPON_HAS_EXPIRED)
    })

    it('should reject coupon if used in different institution', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        institutionId: 2,
      })

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        institutionId: 1,
      })

      expect(result.valid).toBe(false)
      expect(result.message).toBe(PromotionErrorMessage.COUPON_NOT_APPLY_FOR_THIS_COURSE)
    })

    it('should reject coupon if quota has been exhausted (confirmed usage >= quota)', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        quota: 5,
      })
      mockCoursePromotionUsedRepository.count.mockResolvedValue(5)

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        institutionId: 1,
      })

      expect(result.valid).toBe(false)
      expect(result.message).toBe(PromotionErrorMessage.COUPON_USED_UP)
    })

    it('should allow unlimited quota coupons (quota = -1) regardless of usage count', async () => {
      mockCouponsRepository.findOneBy.mockResolvedValue({
        ...baseCoupon,
        quota: -1,
      })
      mockCoursePromotionUsedRepository.count.mockResolvedValue(999)

      const result = await service.isCouponValid({
        couponCode: 'TEST_PROMO',
        institutionId: 1,
      })

      expect(result.valid).toBe(true)
    })
  })

  describe('Price Calculation (calculateCouponPrice)', () => {
    it('should correctly calculate price for PERCENTAGE discount', async () => {
      mockCouponsRepository.findOne.mockResolvedValue({
        id: 1,
        code: 'PCT20',
        discountType: DiscountType.PERCENTAGE,
        amount: 20,
        quota: 10,
        expireDate: new Date(Date.now() + 86400000),
      })

      const result = await service.calculateCouponPrice({
        couponCode: 'PCT20',
        courseId: 10,
        institutionId: 1,
        initialPrice: 500,
      })

      expect(result.couponPrice).toBe(400)
      expect(result.amountReduced).toBe(100)
    })

    it('should correctly calculate price for FIXED_AMOUNT discount', async () => {
      mockCouponsRepository.findOne.mockResolvedValue({
        id: 1,
        code: 'FIXED50',
        discountType: DiscountType.FIXED_AMOUNT,
        amount: 50,
        quota: 10,
        expireDate: new Date(Date.now() + 86400000),
      })

      const result = await service.calculateCouponPrice({
        couponCode: 'FIXED50',
        courseId: 10,
        institutionId: 1,
        initialPrice: 500,
      })

      expect(result.couponPrice).toBe(450)
      expect(result.amountReduced).toBe(50)
    })

    it('should cap amountReduced and ensure couponPrice does not drop below 0 when FIXED_AMOUNT exceeds initialPrice', async () => {
      mockCouponsRepository.findOne.mockResolvedValue({
        id: 1,
        code: 'BIGDISCOUNT',
        discountType: DiscountType.FIXED_AMOUNT,
        amount: 1000,
        quota: 10,
        expireDate: new Date(Date.now() + 86400000),
      })

      const result = await service.calculateCouponPrice({
        couponCode: 'BIGDISCOUNT',
        courseId: 10,
        institutionId: 1,
        initialPrice: 300,
      })

      expect(result.couponPrice).toBe(0)
      expect(result.amountReduced).toBe(300)
    })

    it('should throw error if coupon not found', async () => {
      mockCouponsRepository.findOne.mockResolvedValue(null)

      await expect(
        service.calculateCouponPrice({
          couponCode: 'NON_EXISTENT',
          courseId: 10,
          institutionId: 1,
          initialPrice: 500,
        })
      ).rejects.toThrow(PromotionErrorMessage.COUPON_NOT_FOUND)
    })

    it('should throw error if coupon is expired', async () => {
      mockCouponsRepository.findOne.mockResolvedValue({
        id: 1,
        code: 'EXPIRED',
        expireDate: new Date(Date.now() - 10000),
        quota: 10,
      })

      await expect(
        service.calculateCouponPrice({
          couponCode: 'EXPIRED',
          courseId: 10,
          institutionId: 1,
          initialPrice: 500,
        })
      ).rejects.toThrow(PromotionErrorMessage.COUPON_HAS_EXPIRED)
    })

    it('should throw error if coupon quota is 0', async () => {
      mockCouponsRepository.findOne.mockResolvedValue({
        id: 1,
        code: 'ZERO_QUOTA',
        expireDate: new Date(Date.now() + 86400000),
        quota: 0,
      })

      await expect(
        service.calculateCouponPrice({
          couponCode: 'ZERO_QUOTA',
          courseId: 10,
          institutionId: 1,
          initialPrice: 500,
        })
      ).rejects.toThrow(PromotionErrorMessage.COUPON_USED_UP)
    })
  })

  describe('Coupon Usage Lifecycle (updatePromotionHistory)', () => {
    const mockCoupon: any = {
      id: 1,
      code: 'PROMO_USE',
      institutionId: 1,
    }
    const mockCourse: any = {
      id: 10,
      name: 'Math 101',
      siteId: 10,
      institutionId: 1,
    }
    const mockStudent: any = {
      id: 201,
      firstName: 'Jane',
      lastName: 'Smith',
    }

    it('should create a new promotion used record when checkout starts (REDEEMED)', async () => {
      mockCoursePromotionUsedRepository.findOneBy.mockResolvedValue(null)

      await service.updatePromotionHistory({
        coupon: mockCoupon,
        course: mockCourse,
        enrollId: 100,
        invoiceId: 500,
        student: mockStudent,
        status: PromotionUsedStatus.REDEEMED,
      })

      expect(mockCoursePromotionUsedRepository.create).toHaveBeenCalled()
      expect(mockCoursePromotionUsedRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          couponId: 1,
          courseId: 10,
          siteId: 10,
          institutionId: 1,
          enrollId: 100,
          invoiceId: 500,
          studentId: 201,
          usedStatus: PromotionUsedStatus.REDEEMED,
        })
      )
      expect(mockRecordLogService.create).toHaveBeenCalledWith([
        expect.objectContaining({
          type: RecordLogType.USAGE_COUPON,
          institutionId: 1,
        }),
      ])
    })

    it('should update existing promotion used record to CONFIRMED when payment succeeds', async () => {
      mockCoursePromotionUsedRepository.findOneBy.mockResolvedValue({
        id: 1,
        couponId: 1,
        usedStatus: PromotionUsedStatus.REDEEMED,
      })

      await service.updatePromotionHistory({
        coupon: mockCoupon,
        course: mockCourse,
        enrollId: 100,
        invoiceId: 500,
        student: mockStudent,
        status: PromotionUsedStatus.CONFIRMED,
      })

      expect(mockCoursePromotionUsedRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          couponId: 1,
          usedStatus: PromotionUsedStatus.CONFIRMED,
        })
      )
      expect(mockRecordLogService.create).toHaveBeenCalledWith([
        expect.objectContaining({
          type: RecordLogType.CONFIRM_USAGE_COUPON,
          institutionId: 1,
        }),
      ])
    })

    it('should not mutate usedStatus if existing record is already CONFIRMED', async () => {
      mockCoursePromotionUsedRepository.findOneBy.mockResolvedValue({
        id: 1,
        couponId: 1,
        usedStatus: PromotionUsedStatus.CONFIRMED,
      })

      await service.updatePromotionHistory({
        coupon: mockCoupon,
        course: mockCourse,
        enrollId: 100,
        invoiceId: 500,
        student: mockStudent,
        status: PromotionUsedStatus.CONFIRMED,
      })

      expect(mockCoursePromotionUsedRepository.save).not.toHaveBeenCalled()
      expect(mockRecordLogService.create).toHaveBeenCalledWith([
        expect.objectContaining({
          type: RecordLogType.CONFIRM_USAGE_COUPON,
          institutionId: 1,
        }),
      ])
    })
  })

  describe('Student Coupon Discovery (getCoupons & getAvailableStudentCoupons)', () => {
    it('should query with ArrayContains for userAliasId when userAliasId is provided', async () => {
      mockCouponsRepository.findAll.mockResolvedValue([])

      await service.getCoupons({
        institutionId: 1,
        siteId: 1,
        userAliasId: 55,
      })

      expect(mockCouponsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            institutionId: 1,
            siteId: 1,
            userAliasIds: expect.anything(),
          }),
        })
      )
    })

    it('should not filter by userAliasIds if userAliasId is not provided', async () => {
      mockCouponsRepository.findAll.mockResolvedValue([])

      await service.getCoupons({
        institutionId: 1,
        siteId: 1,
      })

      expect(mockCouponsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            userAliasIds: expect.anything(),
          }),
        })
      )
    })

    it('should fetch available student coupons and filter out expired or exhausted coupons', async () => {
      mockInvoiceRepository.findOneBy.mockResolvedValue({
        id: 1,
        proofToken: 'token_123',
        userAliasId: 77,
        institutionId: 1,
        siteId: 2,
      })

      const mockCoupons = [
        {
          id: 1,
          code: 'ACTIVE_COUPON',
          expireDate: new Date(Date.now() + 86400000),
          quota: 5,
          usedCount: 1,
          couponUsed: [{ id: 1 }],
        },
        {
          id: 2,
          code: 'EXHAUSTED_COUPON',
          expireDate: new Date(Date.now() + 86400000),
          quota: 2,
          usedCount: 2,
          couponUsed: [{ id: 2 }, { id: 3 }],
        },
        {
          id: 3,
          code: 'EXPIRED_COUPON',
          expireDate: new Date(Date.now() - 86400000),
          quota: 10,
          usedCount: 0,
          couponUsed: [],
        },
      ]
      mockCouponsRepository.findAll.mockResolvedValue(mockCoupons)

      const result = await service.getAvailableStudentCoupons({ enrolToken: 'token_123' })
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe('ACTIVE_COUPON')
    })
  })
})
