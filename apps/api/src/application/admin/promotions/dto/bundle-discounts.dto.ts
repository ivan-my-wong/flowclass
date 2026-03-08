import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { DiscountType } from '@/models/enums/'

// Your existing DTOs (keeping them as-is)
export class BundleDiscountsObject {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  siteId: number

  @ApiProperty()
  @Expose()
  institutionId: number

  @ApiProperty()
  @Expose()
  discountType: DiscountType

  // @ApiProperty()
  // @Expose()
  // bundleTable: BundleTableCell[]
}

export class BundleDiscountsPageOptionDto extends PageOptionsDto {
  @ApiProperty()
  @IsNotEmpty()
  siteId: number

  @ApiProperty()
  @IsNotEmpty()
  institutionId: number
}

export class CreateBundleDiscountDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsNumber()
  siteId: number

  @ApiProperty()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @IsNumber()
  amount: number

  @ApiProperty()
  @IsNumber()
  minQty: number

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType

  // @ApiProperty({
  //   type: [BundleTableCell],
  //   example: [
  //     { minQty: 2, amount: 15000 },
  //     { minQty: 4, amount: 30 }
  //   ]
  // })
  // @ValidateNested({ each: true })
  // @Type(() => BundleTableCell)
  // bundleTable: BundleTableCell[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAllItems?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAutoApply?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRetroactive?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isStackable?: boolean

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  applicableItemIds?: number[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string
}

export class UpdateBundleDiscountDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ example: DiscountType.FIXED_AMOUNT, required: false })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType

  // @ApiProperty({
  //   type: [BundleTableCell],
  //   required: false,
  //   example: [
  //     { minQty: 2, amount: 10000 },
  //     { minQty: 4, amount: 30000 },
  //   ],
  // })
  // @ValidateNested({ each: true })
  // @IsOptional()
  // @Type(() => BundleTableCell)
  // bundleTable?: BundleTableCell[]
}

export class CheckAvailabilityBundleDiscountDto {
  @ApiProperty()
  @IsNumber()
  siteId: number

  @ApiProperty()
  @IsNumber()
  institutionId: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  bundleId?: number

  @ApiProperty({
    type: [Number],
    required: false,
    description: 'List of userAliasIds to check invoices for',
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  userAliasIds?: number[]
}

export class CourseUsedDto {
  @ApiProperty({ example: 3081, description: 'Course ID' })
  id: number

  @ApiProperty({ example: 'Mathematics Advanced', description: 'Course name' })
  name: string
}

export class BundleDiscountAvailabilityResponse {
  @ApiProperty({ example: 1, description: 'Bundle ID that can be applied' })
  bundleId: number

  @ApiProperty({ example: 'Exam Bundle', description: 'Name of the bundle discount' })
  name: string

  @ApiProperty({
    type: [CourseUsedDto],
    example: [
      { id: 3081, name: 'Mathematics Advanced' },
      { id: 3082, name: 'English Writing' },
      { id: 3083, name: 'Science Fundamentals' },
    ],
    description: 'Courses used to satisfy the bundle rule (may include duplicates)',
  })
  courseUsed: CourseUsedDto[]

  @ApiProperty({
    example: 2,
    description: 'Minimum number of additional courses needed to meet bundle quota',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minAdditionalCoursesNeeded?: number

  @ApiProperty({
    example: 1500000,
    description: 'Total amount of payment already done in invoices',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalPaymentDone?: number
}

// NEW DTOs for Class Validation Logic

/**
 * Enum for class types used in bundle discount validation
 */
export enum ClassType {
  REGULAR_V2 = 'REGULAR_V2',
  RECURRING = 'RECURRING',
  APPOINTMENT = 'APPOINTMENT',
}

/**
 * Pricing option for recurring and appointment classes
 */
export class PricingOptionDto {
  @ApiProperty({ example: 1, description: 'Pricing option ID' })
  @IsNumber()
  id: number

  @ApiProperty({ example: 8, description: 'Number of lessons in this pricing option' })
  @IsNumber()
  @Min(1)
  numberOfLessons: number

  @ApiProperty({ example: 800000, description: 'Price for this option' })
  @IsNumber()
  @Min(0)
  price: number

  @ApiProperty({ example: '8 Lessons Package', required: false })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ example: 'Monthly package with 8 lessons', required: false })
  @IsOptional()
  @IsString()
  description?: string
}

/**
 * Class details for bundle discount validation
 */
export class ClassDetailsDto {
  @ApiProperty({ example: 1234, description: 'Class ID' })
  @IsNumber()
  id: number

  @ApiProperty({ example: 567, description: 'Course ID this class belongs to' })
  @IsNumber()
  courseId: number

  @ApiProperty({ enum: ClassType, example: ClassType.REGULAR_V2, description: 'Type of class' })
  @IsEnum(ClassType)
  type: ClassType

  @ApiProperty({
    example: 5,
    description: 'Total lessons available in current period (for REGULAR_V2)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalLessonsInPeriod?: number

  @ApiProperty({
    type: [PricingOptionDto],
    description: 'Available pricing options (for RECURRING/APPOINTMENT)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingOptionDto)
  pricingOptions?: PricingOptionDto[]

  @ApiProperty({ example: '2024-09-01', description: 'Class start date' })
  @IsDate()
  @Type(() => Date)
  startDate: Date

  @ApiProperty({ example: '2024-09-30', description: 'Class end date', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date

  @ApiProperty({
    example: 3,
    description: 'Currently enrolled lessons for this student',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  currentEnrolledLessons?: number

  @ApiProperty({ example: 'Mathematics Advanced', required: false })
  @IsOptional()
  @IsString()
  className?: string
}

/**
 * Extended invoice with class validation information
 */
export class InvoiceWithClassValidationDto {
  @ApiProperty({ example: 1001, description: 'Invoice ID' })
  id: number

  @ApiProperty({ example: 789, description: 'User ID' })
  userId: number

  @ApiProperty({ example: 567, description: 'Course ID' })
  courseId: number

  @ApiProperty({ example: 1234, description: 'Class ID' })
  classId: number

  @ApiProperty({ example: 500000, description: 'Payment amount' })
  payAmount: number

  @ApiProperty({ example: 50000, description: 'Discount amount applied' })
  discountAmount: number

  @ApiProperty({ example: 5, description: 'Number of lessons enrolled', required: false })
  @IsOptional()
  @IsNumber()
  lessonCount?: number

  @ApiProperty({ example: 5, description: 'Quantity purchased', required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number

  @ApiProperty({ example: 'PAID', description: 'Payment state' })
  paymentState: string

  @ApiProperty({ example: '2024-09-15T10:30:00Z', description: 'Invoice creation date' })
  createdAt: Date

  // Validation-specific properties
  @ApiProperty({
    example: true,
    description: 'Whether this invoice represents a complete class enrollment',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleteClass?: boolean

  @ApiProperty({
    type: ClassDetailsDto,
    description: 'Detailed class information',
    required: false,
  })
  @IsOptional()
  @Type(() => ClassDetailsDto)
  classDetails?: ClassDetailsDto

  @ApiProperty({
    example: 'Enrolled in all 5 lessons for September period',
    description: 'Reason for validation result',
    required: false,
  })
  @IsOptional()
  @IsString()
  validationReason?: string

  @ApiProperty({
    example: 'Complete class - qualifies for bundle discount',
    description: 'Additional validation notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  validationNote?: string
}

/**
 * Response for class completion validation
 */
export class ClassCompletionValidationResponse {
  @ApiProperty({ example: 1001, description: 'Invoice ID' })
  @IsNumber()
  invoiceId: number

  @ApiProperty({ example: 1234, description: 'Class ID' })
  @IsNumber()
  classId: number

  @ApiProperty({ example: true, description: 'Whether the class enrollment is complete' })
  @IsBoolean()
  isComplete: boolean

  @ApiProperty({ enum: ClassType, example: ClassType.REGULAR_V2, description: 'Type of class' })
  @IsEnum(ClassType)
  classType: ClassType

  @ApiProperty({
    example: 'Student enrolled in all 5 lessons required for this period',
    description: 'Explanation of validation result',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string

  @ApiProperty({
    example: 5,
    description: 'Number of lessons student enrolled in',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  enrolledLessons?: number

  @ApiProperty({ example: 5, description: 'Required lessons for completion', required: false })
  @IsOptional()
  @IsNumber()
  requiredLessons?: number

  @ApiProperty({
    example: 5,
    description: 'Total lessons available in period (for REGULAR_V2)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalLessonsInPeriod?: number
}

/**
 * Request DTO for bulk class validation
 */
export class ValidateClassCompletionDto {
  @ApiProperty({
    type: [Number],
    example: [1001, 1002, 1003],
    description: 'List of invoice IDs to validate',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  invoiceIds: number[]

  @ApiProperty({ example: 1, description: 'Site ID' })
  @IsNumber()
  siteId: number

  @ApiProperty({ example: 10, description: 'Institution ID' })
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: '2024-09-15T10:30:00Z',
    description: 'Date to use for validation (defaults to current date)',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validationDate?: Date
}

/**
 * Applied bundle information
 */
export class AppliedBundleDto {
  @ApiProperty({ example: 1, description: 'Bundle discount ID' })
  @IsNumber()
  bundleId: number

  @ApiProperty({ example: 'September Bundle Discount', description: 'Bundle name' })
  @IsString()
  bundleName: string

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: 'Type of discount',
  })
  @IsEnum(DiscountType)
  discountType: DiscountType

  @ApiProperty({ example: 25000, description: 'Discount amount in currency' })
  @IsNumber()
  discountAmount: number

  @ApiProperty({
    type: [Number],
    example: [1234, 1235, 1236],
    description: 'Class IDs this bundle applies to',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  applicableClassIds: number[]

  @ApiProperty({ example: 3, description: 'Number of classes used for this bundle' })
  @IsNumber()
  classesUsed: number
}

/**
 * Bundle discount application result
 */
export class BundleDiscountApplicationResultDto {
  @ApiProperty({ example: 1001, description: 'Target invoice ID' })
  @IsNumber()
  invoiceId: number

  @ApiProperty({ example: 75000, description: 'Total discount amount applied' })
  @IsNumber()
  totalDiscountApplied: number

  @ApiProperty({
    type: [AppliedBundleDto],
    description: 'List of bundles that were applied',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppliedBundleDto)
  appliedBundles: AppliedBundleDto[]

  @ApiProperty({ example: 3, description: 'Number of complete classes found' })
  @IsNumber()
  completeClassesCount: number

  @ApiProperty({ example: 5, description: 'Total invoices processed in the period' })
  @IsNumber()
  totalInvoicesProcessed: number

  @ApiProperty({ example: true, description: 'Whether the operation succeeded' })
  @IsBoolean()
  success: boolean

  @ApiProperty({
    example: 'Bundle discounts applied successfully',
    description: 'Result message',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string
}

export class CourseValidationSummary {
  @ApiProperty({
    description: 'Unique identifier for the course',
    example: 12345,
    type: 'number',
  })
  @IsNumber()
  courseId: number

  @ApiProperty({
    description: 'List of invoices with class validation data',
    type: () => [InvoiceWithClassValidationDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceWithClassValidationDto)
  invoices: InvoiceWithClassValidationDto[]

  @ApiProperty({
    description: 'Whether the course has at least one complete class',
    example: true,
    type: 'boolean',
  })
  @IsBoolean()
  hasCompleteClass: boolean

  @ApiProperty({
    description: 'Total number of invoices for this course',
    example: 25,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  totalInvoices: number

  @ApiProperty({
    description: 'Number of classes that are complete',
    example: 15,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  completeClassCount: number
}
