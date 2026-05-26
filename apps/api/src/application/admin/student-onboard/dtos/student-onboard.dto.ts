/* eslint-disable simple-import-sort/imports */
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Exclude, Expose, Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator'

import { IsDateRange } from '@/common/decorators/is-date-range.decorator'
import { FieldType } from '@/models/common-field.entity'
import { LessonString } from '@/models/custom-types/lesson-string'
import { EnrollCourse, StudentFormResponse } from '@/models/enroll-courses.entity'
import { ChargeFrequency, FilterMatchMode, Operator } from '@/models/enums/'
import { AttendanceStatus, EnrollConfirmStatus, PaymentStatus } from '@/models/enums/status'
import { StudentFormMetadata } from '@/models/student-form.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { UserAlias } from '@/models/user-aliases.entity'
import { User, UserStatus } from '@/models/user.entity'

export enum StudentOnbType {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  BIN = 'BIN',
}

export const SELECT_STUDENT_FIELDS_EXAMPLE = {
  id: true,
  userId: true,
  user: {
    email: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  },
  phone: true,
  name: true,
  enrollCourses: {
    id: true,
    institutionId: true,
    registrationForm: true,
    invoices: true,
  },
}

export class StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number
}

export class StudentOnbListDto extends StudentOnbBaseDto {
  @ApiProperty({
    default: StudentOnbType.ACTIVE,
    type: 'enum',
    enum: StudentOnbType,
  })
  @IsNotEmpty()
  @IsEnum(StudentOnbType)
  type: StudentOnbType

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  userId?: number
}

export class StudentListWithSelectedFieldsDto {
  @ApiPropertyOptional({
    example: 'search',
  })
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    example: SELECT_STUDENT_FIELDS_EXAMPLE,
  })
  @IsOptional()
  select?: Record<string, string[]>
}

export class StudentOnbFilterListDto extends StudentOnbListDto {
  @ApiPropertyOptional({
    example: FilterMatchMode.All,
  })
  @IsOptional()
  @IsEnum(FilterMatchMode)
  matchMode: FilterMatchMode

  static filterRuleExample = [
    {
      selectedFieldId: 220,
      operator: Operator.Contain,
      matchValue: 'nanami',
      matchOptions: [],
    },
    {
      selectedFieldId: 1229,
      operator: Operator.NotContain,
      matchValue: '',
      matchOptions: ['a', 'b', 'c'],
    },
  ]

  @ApiPropertyOptional({
    example: StudentOnbFilterListDto.filterRuleExample,
  })
  @IsOptional()
  filterRules: CustomFieldFilterOption[]
}

export class GetStudentDetailResponseDto extends PartialType(User) {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the student',
  })
  @Expose()
  id: number

  @ApiPropertyOptional({
    description: 'The student info (user alias with memo fields)',
    type: UserAlias,
  })
  @Expose()
  studentInfo?: {
    userAlias?: Pick<
      UserAlias,
      'id' | 'name' | 'email' | 'userId' | 'secondaryEmail' | 'childOfUserAliasId'
    >
    userAliasId?: number
    [key: string]: unknown
  } | null

  @ApiPropertyOptional({
    description: 'See if the user has user aliases in other institutions',
    type: Boolean,
  })
  @Expose()
  isOnlyUserAlias?: boolean

  @ApiPropertyOptional({
    description: 'The enroll course associated with the student',
    type: EnrollCourse,
  })
  @Expose()
  @Type(() => EnrollCourse)
  enrollCourses?: EnrollCourse[]
}

export class StudentOnbDeleteDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsArray()
  userAliasIds: Array<number>
}

export class CreateStudentDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 'Student A',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    example: '0123...',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  phone: string

  @ApiProperty({
    example: 'abc@xyz.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSendEmail?: boolean
}

export class StudentOnbDetailtDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class StudentOnbDetailtByAliasIdDto extends StudentOnbDetailtDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userAliasId: number

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  invoiceId?: number
}

// Used by the invoice-scoped teaching-service endpoint where the invoice itself
// constrains the result set. Either invoiceId or userAliasId must be supplied;
// when invoiceId is provided, every enrollCourse on the invoice is returned
// regardless of which alias it belongs to (combined invoices ↔ many students).
export class GetTeachingServiceByInvoiceDto extends StudentOnbDetailtDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  userAliasId?: number

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  invoiceId?: number
}

export class UpdateStudentDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 'Student A',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    example: '0123...',
  })
  @IsNotEmpty()
  @IsString()
  phone: string

  @ApiProperty({
    example: 'abc@xyz.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class PeriodV2Dto {
  @ApiProperty({
    example: '2024-03-25T14:50:00.000Z',
    format: 'date-time',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startTime: Date

  @ApiProperty({
    example: '2024-03-25T15:50:00.000Z',
    format: 'date-time',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  @ValidateIf((o) => o.startTime && o.endTime)
  @IsDateRange('startTime', { message: 'endTime must be after startTime' })
  endTime: Date
}

export class UpdateStatusDto extends StudentOnbBaseDto {
  @ApiProperty({
    default: UserStatus.ACTIVE,
    type: 'enum',
    enum: UserStatus,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class TeachingServiceDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number
}

export class StudentCouponDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  userId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  siteId: number
}

export class GetTeachingServiceOptDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number
}

export class BulkAssignCourseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userAliasId: number

  @ApiProperty({
    example: 'Student A',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    example: '0123...',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  phone: string

  @ApiProperty({
    example: 'abc@xyz.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string
}

export class AddTeachingServiceDto extends CreateStudentDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userAliasId: number

  @ApiProperty({
    type: [PeriodV2Dto],
    isArray: true,
    example: [
      {
        startTime: '2024-03-25T14:50:00.000Z',
        endTime: '2024-03-25T15:50:00.000Z',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeriodV2Dto)
  individualLessons?: PeriodV2Dto[]

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  classId: number

  // This is only needed when the user selected a regular course or events
  @ApiPropertyOptional({ example: 75 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  periodId?: number

  // This is only needed when the user selected a recurring course
  @ApiPropertyOptional({ example: 75 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  recurringScheduleId?: number

  // This is only needed when the user selected an appointment class
  @ApiPropertyOptional({ example: 75 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  appointmentId?: number

  @ApiProperty({
    example: '2025-08-10T14:50:00.000Z 2025-08-10T14:50:00.000Z',
  })
  @IsOptional()
  @IsString()
  firstLessonDate: LessonString

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsNumber()
  lessonPrice?: number

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  priceOptionId?: number

  @ApiPropertyOptional({
    example: 'https://example.com',
  })
  @IsNotEmpty()
  @IsString()
  redirectUrl: string

  @ApiPropertyOptional({
    example: [],
    default: [],
  })
  @IsOptional()
  @IsArray()
  bulkAssignCourse?: BulkAssignCourseDto[]

  @ApiProperty({
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSendEmail?: boolean

  @ApiPropertyOptional({
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isChangeClass?: boolean
}

export class ChangeStudentLessonDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  studentLessonId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  classLessonId: number
}

export class DeleteTeachingServiceDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  enrollCourseId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  classId: number
}

export class UpdateStudentEnrollClass extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  enrollId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @ApiProperty({
    default: PaymentStatus.PENDING,
    type: 'enum',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentState: PaymentStatus
}

export class UpdateEnrollCourseDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  enrollCourseId: number

  @ApiProperty({
    default: EnrollConfirmStatus.PENDING,
    type: 'enum',
    enum: EnrollConfirmStatus,
  })
  @IsOptional()
  @IsEnum(EnrollConfirmStatus)
  confirmState: EnrollConfirmStatus

  @ApiProperty({
    example: '2024-03-25T14:50:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  billingStartDate?: string

  @ApiProperty({
    example: '2024-03-25T14:50:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  billingEndDate?: string

  @ApiProperty({
    example: '2024-03-25T14:50:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  billingNextDate?: string

  @ApiProperty({
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  price: number

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isPaused?: boolean
}

export class MergeStudentDto extends StudentOnbBaseDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  sourceUserAliasId: number

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  targetUserAliasId: number
}

export class UpdateInvoicePaymentStateDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  invoiceId: number

  @ApiProperty({
    default: PaymentStatus.PAID,
    type: 'enum',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentState: PaymentStatus
}

export class StudentChangeLessonOptDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  studentLessonId: number
}

export class StudentChangeLessonDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number

  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  classId: number

  @ApiProperty({
    example: 87,
  })
  @IsNotEmpty()
  @IsNumber()
  currentLessonId: number

  @Type(() => LessonString)
  @IsString()
  lessonDateTime?: LessonString | string

  @ApiProperty({
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSendEmail?: boolean
}

export class UpdateLessonAttendanceDto {
  @ApiProperty({
    example: 220,
  })
  @IsNotEmpty()
  @IsNumber()
  studentLessonId: number

  @ApiProperty({
    example: AttendanceStatus.ATTENDED,
  })
  @IsNotEmpty()
  attendance: AttendanceStatus
}

export class GetEnrolledLessonsDto {
  @ApiProperty({
    example: [220, 1229],
  })
  @IsNotEmpty()
  studentLessonIds: number[]

  @ApiProperty({
    example: '1234567890',
  })
  @IsOptional()
  invoiceToken?: string
}

@Exclude()
export class StudentAttendanceDataResponse {
  @ApiProperty({
    example: [220, 1229],
  })
  @Expose()
  studentLesson: StudentLesson

  @ApiPropertyOptional()
  @Expose()
  registrationForm?: StudentFormResponse[]

  @ApiProperty({
    example: 1,
  })
  @Expose()
  studentId: number

  @ApiProperty({
    example: 'studentName',
  })
  @Expose()
  name: string

  @ApiProperty({
    example: 'studentEmail',
  })
  @Expose()
  email: string

  @ApiProperty({
    example: '28499348',
  })
  @Expose()
  phone: string

  @ApiProperty({
    example: 'courseName',
  })
  @Expose()
  courseName: string

  @ApiProperty({
    example: 'className',
  })
  @Expose()
  className: string
}

export class StudentFormDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userAliasId: number
}

export class UpdateStudentFormDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @ApiProperty({
    example: [
      {
        id: 1,
        type: 'SHORT_ANSWER',
        value: 'ABC',
        question: 'What is your name?',
        isDefault: true,
        order: 1,
        columnMapping: 'name',
      },
    ],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        type: { type: 'string', example: 'SHORT_ANSWER' },
        value: { type: 'string | number | boolean | string[]', example: 'ABC' },
        question: { type: 'string', example: 'What is your name?' },
        isDefault: { type: 'boolean', example: true },
        order: { type: 'number', example: 1, nullable: true },
        columnMapping: { type: 'string', example: 'name', nullable: true },
      },
    },
  })
  @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => StudentFormMetadata)
  metadata: StudentFormMetadata[]

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  invoiceId?: number

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  userAliasId?: number
}

export class ImportCommonField {
  @IsNumber()
  id: number

  @IsEnum(FieldType)
  type: FieldType

  @IsString()
  field: string

  @IsString()
  column: string
}

export type ImportStudentField = {
  StudentName: string
  StudentEmail: string
  StudentPhone: string
  CourseName?: string
  ClassName?: string
  AmountCharged?: number
  FirstChargeDate?: string
  ChargeFrequency?: string
  StudentId?: string

  importError?: string[]
  dataFoundInDb: Record<string, string>
}

export type ImportStudentFieldResponse = {
  user: User
  userAlias: UserAlias
  customFields: StudentFormResponse[]
}

export type CustomFieldFilterOption = {
  selectedFieldId: number
  operator: Operator
  matchValue?: any
  matchOptions?: string[]
}

export type CsvValueToDbValue = {
  csvValue: string
  dbValue: string
}

export type DbMapping = {
  headerMap: ImportCommonField[]
  chargeFreqValMap?: CsvValueToDbValue[]
  defaultChargeFreqValue?: ChargeFrequency
}

export class ImportStuDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: [],
  })
  @IsNotEmpty()
  convertedData: ImportStudentField[]

  @ApiPropertyOptional({
    example: 'overwrite',
  })
  @IsOptional()
  handleDataMethod?: string
}

export class ImportStuResponseDto {
  @Expose()
  user: {
    id: number
    firstName: string
    email: string
    phone: string
  }

  @Expose()
  @Type(() => UserAlias)
  userAlias: UserAlias

  @Expose()
  @Type(() => UserAlias)
  studentMemo: UserAlias

  @Expose()
  @Type(() => StudentFormMetadata)
  customFields: StudentFormMetadata[]
}

export class GetStudentFormFieldsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userAliasId: number
}

export class StudentAllLessonsReponseDto {
  @ApiProperty({ type: () => StudentLesson })
  @IsNotEmpty()
  @Expose()
  studentLesson: StudentLesson

  @ApiProperty({ type: () => [StudentFormResponse] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentFormResponse)
  @Expose()
  registrationForm: StudentFormResponse[]

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  studentId: number

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email: string

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  phone: string

  @ApiProperty({ example: 'Mathematics 101' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  courseName: string

  @ApiProperty({ example: 'Morning Batch' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  className: string
}

export type GetStudentFormResponseDto = {
  id: string | number
  order: number
  value: string[] | string
  question: string
  isDefault: boolean
  columnMapping: string
}

export class CsvHeadersMappingDto {
  @ApiProperty({
    description: 'CSV file you want to add',
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  file: any

  @ApiProperty({
    example: [],
  })
  @IsNotEmpty()
  @Transform(({ value }) => JSON.parse(value))
  fields: ImportCommonField[]
}

export class CheckImportStuDto {
  @ApiProperty({
    description: 'CSV file you want to add',
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  file: any

  @ApiProperty({
    example: [],
  })
  @IsNotEmpty()
  @Transform(({ value }) => JSON.parse(value))
  mapDbValue: DbMapping
}

export class ExportStuDto extends StudentOnbBaseDto {
  @ApiProperty({
    example: [],
  })
  @IsNotEmpty()
  fields: ImportCommonField[]
}

export class CreateExtraLessonDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  enrollId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  numOfLesson: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  feePerLesson: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsBoolean()
  isCustomised: boolean

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  recurringScheduleId?: number

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  studentScheduleId: number

  @ApiProperty({
    example: ['2024-03-25T14:50:00.000Z 2024-03-25T15:50:00.000Z'],
  })
  @IsOptional()
  extraLessons: LessonString[]

  @ApiProperty({
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSendEmail?: boolean

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  classId?: number
}

export class CreateStudentLessonDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  institutionId: number

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  classLessonId?: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  courseId: number

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  enrollCourseId?: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  studentScheduleId: number

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  classId?: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  userId: number

  @ApiProperty({
    example: '2024-02-20',
  })
  @IsNotEmpty()
  date: Date

  @ApiProperty({
    example: '2024-03-25T14:50:00.000Z 2024-03-25T15:50:00.000Z',
  })
  @IsNotEmpty()
  startTime: Date

  @ApiProperty({
    example: '2024-03-25T14:50:00.000Z 2024-03-25T15:50:00.000Z',
  })
  @IsNotEmpty()
  endTime: Date

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  periodId?: number

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  appointmentId?: number

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  sessionId?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isExtra?: boolean
}

export type QRCodeAttendanceDto = {
  enrollCourseId: number
  studentLessonIds: number[]
  invoiceId: number
}
