import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { object } from 'joi'
import Stripe from 'stripe'

import { PayoutPreferenceDto } from '@/application/admin/request-payout/dto/receive-Payout-Preference.dto'
import { IsTimeSlotString, IsValidISOTimeRange } from '@/common/decorators/time-string.decorator'
import { BundleDiscount } from '@/models/bundle-discounts.entity'
import { ClassEntity } from '@/models/classes.entity'
import { FieldType } from '@/models/common-field.entity'
import { Coupon } from '@/models/coupons.entity'
import { RecurringSchedules } from '@/models/course-recurring-schedules.entity'
import { Course } from '@/models/courses.entity'
import { LessonString } from '@/models/custom-types/lesson-string'
import { EnrollCourse, EnrollIntoInfo } from '@/models/enroll-courses.entity'
import { ClassTypeEnum, PaymentMethod, PriceType, STRIPE_CURRENCY } from '@/models/enums/'
import { EnrollConfirmStatus, PaymentStatus } from '@/models/enums/status'
import { LocationRoom } from '@/models/location-room.entity'
import { PayoutMethod } from '@/models/payout-method.entity'
import { PeriodLessons } from '@/models/period-lessons.entity'
import { StudentFormMetadata } from '@/models/student-form.entity'
import { StudentSchedule } from '@/models/student-schedule.entity'
import { ClassTrialLesson } from '@/models/trial-lesson.entity'
import { User } from '@/models/user.entity'
import { UserAlias } from '@/models/user-aliases.entity'

import { RegularScheduleLessonPreviewPeriodGroup } from '../../course/dto/regular-schedules.dto'

import { StudentCreateInvoiceDTO } from './create-invoice.dto'

const pickedFirstDateExample = ['2025/06/07 03:19 pm - 04:19 pm', 60]

export class StudentPeriodLessonDto {
  static example1 = {
    id: 1,
    lessons: [
      '2023-05-16T15:00:00.000Z 2023-05-16T17:00:00.000Z',
      '2023-05-17T15:00:00.000Z 2023-05-17T17:00:00.000Z',
    ],
  }
  static example2 = {
    id: 2,
    lessons: [
      '2023-05-18T15:00:00.000Z 2023-05-18T17:00:00.000Z',
      '2023-05-19T15:00:00.000Z 2023-05-19T17:00:00.000Z',
      '2023-05-20T15:00:00.000Z 2023-05-20T17:00:00.000Z',
      '2023-05-21T15:00:00.000Z 2023-05-21T17:00:00.000Z',
      '2023-05-22T15:00:00.000Z 2023-05-22T17:00:00.000Z',
      '2023-05-23T15:00:00.000Z 2023-05-23T17:00:00.000Z',
      '2023-05-24T15:00:00.000Z 2023-05-24T17:00:00.000Z',
      '2023-05-25T15:00:00.000Z 2023-05-25T17:00:00.000Z',
    ],
  }
  @ApiProperty({ example: 1 })
  id: number
  @ApiProperty()
  @Expose()
  lessons: LessonString[]
}
export class MetaRef {
  @ApiProperty({ example: ClassTypeEnum.RECURRING })
  @IsString()
  @IsNotEmpty()
  type: ClassTypeEnum

  @ApiPropertyOptional({ example: null })
  @IsObject()
  @IsOptional()
  coupon?: Coupon | null

  @ApiPropertyOptional({ example: null })
  @IsInt()
  @IsOptional()
  bundleId?: number | null

  @ApiPropertyOptional({ example: null })
  @IsInt()
  @IsOptional()
  userAliasId?: number | null

  // This is temporary, because I need to provide a way to apply pre-calculated discounts
  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  directDiscount?: number | null

  @ApiPropertyOptional({ example: 45 })
  @IsInt()
  @IsOptional()
  courseId?: number

  @ApiPropertyOptional({ example: 45 })
  @IsInt()
  @IsNotEmpty()
  classId: number

  @ApiPropertyOptional({ example: 75 })
  @IsInt()
  @IsOptional()
  periodId?: number | null

  @ApiPropertyOptional({
    example: pickedFirstDateExample,
  })
  @IsValidISOTimeRange()
  @IsTimeSlotString()
  @IsOptional()
  pickedFirstDate?: string

  // This is for regular class as it is periodLessons in the type
  @ApiPropertyOptional({
    example: [],
    isArray: true,
    type: PeriodLessons,
  })
  @IsOptional()
  @Type(() => PeriodLessons)
  pickedLessons?: PeriodLessons[]

  // This is for all types of classes that support individual picked lessons
  @ApiPropertyOptional({
    example: [],
    isArray: true,
    type: LessonString,
  })
  @IsOptional()
  individualPickedLessonsString?: LessonString[]

  // This is for recurring classes
  @ApiPropertyOptional({
    example: [],
  })
  @IsOptional()
  pickedRecurringSchedule?: RecurringSchedules

  @ApiPropertyOptional({
    type: [RegularScheduleLessonPreviewPeriodGroup],
    example: [],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegularScheduleLessonPreviewPeriodGroup)
  selectedRegularSchedulePreviewV2?: RegularScheduleLessonPreviewPeriodGroup[]

  @ApiProperty({ example: 1000 })
  @IsNumber()
  lessonPrice: number

  @ApiPropertyOptional({ description: 'Selected price option ID' })
  @IsOptional()
  @IsNumber()
  priceOptionId?: number

  @ApiPropertyOptional({
    example: 100,
  })
  @IsOptional()
  billingFormatId?: number

  @ApiPropertyOptional({
    example: new Date(),
  })
  @IsOptional()
  billingStartDate?: string

  @ApiPropertyOptional({
    example: new Date(),
  })
  @IsOptional()
  billingEndDate?: string

  @ApiPropertyOptional({
    example: new Date(),
  })
  @IsOptional()
  billingNextDate?: string

  static type_definition = {
    type: 'object',
    properties: {
      type: { type: 'string' },
      coupon: { type: 'object' },
      bundleId: { type: 'number' },
      directDiscount: { type: 'number' },
      classId: { type: 'number' },
      courseId: { type: 'number' },
      periodId: { type: 'number' },
      pickedFirstDate: { type: 'string' },
      pickedLessons: { type: 'array' },
      pickedRecurringSchedule: { type: 'object' },
      lessonPrice: { type: 'number' },
      billingFormatId: { type: 'number' },
      billingStartDate: { type: 'string' },
      billingEndDate: { type: 'string' },
      billingNextDate: { type: 'string' },
    },
  }
}

export class StudentMetaRefExtended extends MetaRef {
  pickedClass?: ClassEntity | null
  periodName?: string
  timeZoneOffset?: number | null
  bundle?: BundleDiscount | null

  lessonCount?: number
}

const fromExample = {
  name: 'John Doe',
  institutionName: 'ABC University',
  email: 'hsmt-student@gmail.com',
  age: 25,
  phoneNumber: '0123456789',
  specialRequest: 'Got wheelchair entrance',
}

export class StudentRegAccForm {
  static example = {
    email: 'student@example.com',
    password: 'SecurePassword123!',
  }
  @ApiProperty()
  @IsOptional()
  email?: string

  @ApiProperty()
  password: string
}

export type StudentData = {
  id?: number
  studentName: string
  phoneNumber: string
  email?: string
  createAnAccount?: boolean
  userId?: number
  userAliasId?: number
  userAlias?: UserAlias
  studentAccount?: User
}

export class StudentDataClass implements StudentData {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  id: number

  @ApiProperty({
    example: 'Jhon Doe',
  })
  @IsString()
  @IsNotEmpty()
  studentName: string

  @ApiPropertyOptional({
    example: 'jhon@example.com',
  })
  @IsString()
  @IsOptional()
  email?: string

  @ApiProperty({
    example: '+85212312312',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string

  @ApiProperty({
    example: 1,
  })
  @IsBoolean()
  @IsNotEmpty()
  createAnAccount?: boolean
}

export class StudentMetaRef extends MetaRef {
  static type_definition = {
    type: 'object',
    properties: {
      ...MetaRef.type_definition.properties,
    },
  }

  static example = {
    type: 'regular',
    coupon: null,
    bundleId: null,
    directDiscount: null,
    classId: 1,
    periodId: null,
    pickedFirstDate: null,
    pickedLessons: [],
    pickedRecurringSchedule: null,
    lessonPrice: 100,
    billingFormatId: null,
    billingStartDate: null,
    billingEndDate: null,
    billingNextDate: null,
  }
}

export class StudentFormMetadataClass implements StudentFormMetadata {
  @ApiProperty({ example: '1' })
  id: string
  @ApiProperty()
  type: FieldType
  @ApiProperty({ example: 'John Doe' })
  value: string | number | string[] | boolean
  @ApiProperty({ example: 'What is your name?' })
  question: string
  @ApiProperty({ example: false })
  isDefault?: boolean
  @ApiProperty({ example: 1 })
  order?: number
  @ApiProperty({ example: 'columnMapping' })
  columnMapping?: string
}

export class StudentCreateEnrollCourseDto {
  siteId: number
  institutionId: number

  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number

  @ApiProperty({
    example: [StudentMetaRef.example],
    isArray: true,
    type: StudentMetaRef,
    items: {
      type: 'object',
      properties: {
        ...StudentMetaRef.type_definition.properties,
      },
    },
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => StudentMetaRef)
  selectedClassMeta: StudentMetaRef[]

  @ApiPropertyOptional({
    example: 'ABCD1234',
  })
  @IsNotEmpty()
  @IsOptional()
  coupon?: string

  @ApiProperty({
    example: PaymentMethod.PAY_LATER,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiProperty({
    example: PayoutPreferenceDto.example,
  })
  @IsOptional()
  @Type(() => PayoutMethod)
  payLaterMethod: PayoutMethod

  @ApiProperty({
    example: PaymentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus

  @ApiProperty({
    example: [
      {
        studentName: 'John',
        email: 'jhon@gmail.com',
        phoneNumber: '0123456789',
        createAnAccount: true,
      },
    ],
    isArray: true,
    type: StudentDataClass,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentDataClass)
  studentData: StudentData[]

  @ApiPropertyOptional({ example: {} })
  @IsOptional()
  enrollInto: EnrollIntoInfo

  @ApiProperty({ example: fromExample, required: false })
  @IsOptional()
  registrationForm: any

  @ApiProperty({
    example: 'https://example.com?school=flowclass&course=regular',
  })
  @IsNotEmpty()
  @IsString()
  redirectUrl: string

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  setMultipleClass: boolean

  @ApiProperty({ required: false, isArray: true, type: StudentFormMetadataClass })
  @IsOptional()
  @IsArray()
  enrollmentForm: StudentFormMetadata[]

  // @IsOptional()
  // studentSchedule?: StudentSchedule;

  @ApiProperty({ example: 1, default: 1 })
  @IsNumber()
  numOfApplicant?: number

  @ApiProperty({ example: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  classTrialLessonId?: number

  @ApiProperty({ example: new Date(), default: new Date() })
  @IsDateString()
  @IsOptional()
  billingStartDate?: string

  @ApiProperty({ example: new Date(), default: new Date() })
  @IsDateString()
  @IsOptional()
  billingNextDate?: string

  @ApiProperty({ example: new Date(), default: new Date() })
  @IsDateString()
  @IsOptional()
  billingEndDate?: string

  classTrialLesson?: ClassTrialLesson
}

export class StudentCreateEnrollCourseMultipleDto {
  @ApiProperty({
    isArray: true,
    type: StudentCreateEnrollCourseDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentCreateEnrollCourseDto)
  @ArrayNotEmpty()
  payload: StudentCreateEnrollCourseDto[]
}

export class StudentConfirmEnrollDto {
  siteId: number
  institutionId: number

  @ApiProperty({
    example: MetaRef,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MetaRef)
  meta: MetaRef

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number

  @ApiPropertyOptional({
    example: 'ABCD1234',
  })
  @IsNotEmpty()
  @IsOptional()
  coupon: string

  @ApiProperty({ example: 200 })
  price: number

  @ApiProperty({ example: 5 })
  @IsInt()
  numOfClasses: number

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  numOfApplicant: number

  @ApiProperty({ example: 5 })
  @IsInt()
  lessonCount: number
}

@Exclude()
export class StudentEnrollCourseResponse {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  id: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  userId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  classId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  sessionId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  appointmentId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  courseId: number

  @ApiProperty({
    example: '[Regular] Math 101 | Class: A, period: March',
  })
  @Expose()
  enrollInto: EnrollIntoInfo

  @ApiProperty({
    example: EnrollConfirmStatus.PENDING,
  })
  @Expose()
  confirmState: string

  @ApiProperty({
    example: 2500,
  })
  @Expose()
  paymentAmount: string

  @ApiProperty({
    example: 'HKD',
  })
  @Expose()
  currency: string

  @ApiProperty({
    example: 'John',
  })
  @Expose()
  name: string

  @ApiProperty({
    example: 'Hong Kong School',
  })
  @Expose()
  school: string

  @ApiProperty()
  @Expose()
  course: Course

  @ApiProperty()
  @Expose()
  phone: string

  @ApiPropertyOptional()
  @Expose()
  email?: string

  @ApiProperty()
  @Expose()
  token: string

  @ApiProperty({
    isArray: true,
    type: StudentFormMetadataClass,
  })
  @Expose()
  registrationForm: StudentFormMetadata[]

  @ApiProperty({
    example: object,
    isArray: true,
    type: StudentSchedule,
  })
  @Type(() => StudentSchedule)
  @Expose()
  studentSchedule: StudentSchedule[]
}

export class StudentUpdateEnrollCourseResponse extends StudentEnrollCourseResponse {
  @Type(() => StudentCreateInvoiceDTO)
  @Expose()
  invoice: StudentCreateInvoiceDTO
}

@Exclude()
export class PayNowResponse {
  @ApiProperty({
    example: 'https://buy.stripe.com/test_28o1881Utd5RgXmeUW',
  })
  @Expose()
  url: string
}

// This is basically the same as PricingInfo
@Exclude()
export class StudentEnrollCoursePricingInfo {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  courseId: number

  @ApiProperty({
    example: 1,
  })
  @Expose()
  classId: number

  @ApiProperty({ example: 10 })
  @Expose()
  numberOfLesson: number

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  numOfApplicant: number

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  numOfNewStudent?: number

  @ApiProperty({ example: 160 })
  @Expose()
  feePerLesson: number

  // @ApiProperty({
  //   example: [PeriodLessonDto.example1, PeriodLessonDto.example2],
  // })
  // @Type(() => PeriodLessonDto)
  // period: PeriodLessonDto[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceOptionId?: number

  @ApiProperty({ example: 1600 })
  @Expose()
  originalFee: number

  @ApiProperty({ example: null })
  @Expose()
  discountInfo: string

  @ApiProperty({ example: 80 })
  @Expose()
  couponDiscount: number

  @ApiProperty({ example: 0 })
  @Expose()
  additionalFee: number

  @ApiProperty({ example: 0 })
  @Expose()
  directDiscount: number

  @ApiProperty({ example: 0 })
  @Expose()
  bundleDiscount: number

  @ApiProperty({ example: 0 })
  @Expose()
  recurringDiscount: number

  @ApiProperty({ example: 80 })
  @Expose()
  totalDiscount: number

  @ApiProperty({ example: 1520 })
  @Expose()
  paymentAmount: number

  @ApiProperty({ example: 'HKD' })
  @Expose()
  currency: STRIPE_CURRENCY

  @ApiPropertyOptional({ example: PriceType.PER_CLASS })
  @Expose()
  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType

  classTrialLesson?: ClassTrialLesson
}

@Exclude()
export class StudentMultipleClassInfo {
  @ApiProperty({
    example: 'https://example.com/confirm-enroll/1',
  })
  @Expose()
  paymentLink: Stripe.Response<Stripe.PaymentLink>

  @ApiProperty({
    example: EnrollCourse,
  })
  @Type(() => EnrollCourse)
  enrollCourse: EnrollCourse

  @ApiProperty({
    example: Object,
  })
  @ValidateNested({ each: true })
  @Type(() => StudentClassInfo)
  classes: StudentClassInfo[]

  constructor() {
    this.classes = []
  }
}

@Exclude()
export class StudentClassInfo {
  @ApiProperty({
    example: object,
  })
  @Type(() => MetaRef)
  meta: MetaRef

  @ApiProperty({
    example: object,
  })
  @Type(() => StudentEnrollCoursePricingInfo)
  pricingInfo: StudentEnrollCoursePricingInfo

  @ApiProperty({
    example: 'Class name',
  })
  @Expose()
  enrollInto: EnrollIntoInfo

  // @ApiProperty({
  //   example: object,
  // })
  // @Type(() => StudentSchedule)
  // @Expose()
  // studentSchedule: StudentSchedule;

  @ApiProperty()
  @Expose()
  location?: LocationRoom

  @ApiProperty()
  @Expose()
  instructor?: User

  @ApiPropertyOptional({ example: 'Class name' })
  @Expose()
  className?: string
}
