import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator'

import { MetaRef } from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { LessonString } from '@/models/custom-types/lesson-string'
import { DocumentRecipientsChannel } from '@/models/document-campaign-recipients.entity'
import { DiscountType, FeeModeType } from '@/models/enums'

export class DesignatedContactDto {
  @ApiProperty({ example: 'Sarah Chen' })
  @IsString()
  name: string

  @ApiProperty({ example: 'sarah.chen@email.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: '+1 (555) 123-4567' })
  @IsString()
  phone: string
}

export class EmailTemplateDto {
  @ApiProperty({ example: 'Invoice [invoiceNumber] - Payment Due [dueDate]' })
  @IsString()
  subject: string

  @ApiProperty({
    example:
      "Dear [customerName],\n\nI hope this email finds you well. Please find attached your invoice for the courses you've enrolled in at FlowClass Academy.",
  })
  @IsString()
  body: string

  @ApiProperty({ example: 'Invoice_[invoiceNumber].pdf' })
  @IsString()
  attachment: string
}

export class EmailNotificationDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean

  @ApiProperty({ example: 'billing@company.com' })
  @IsEmail()
  from: string

  @ApiProperty({ type: EmailTemplateDto })
  @ValidateNested()
  @Type(() => EmailTemplateDto)
  template: EmailTemplateDto
}

export class WhatsAppTemplateDto {
  @ApiProperty({
    example:
      '🧾 Invoice Notification - [customerName]\n\nInvoice #[invoiceNumber] for [invoiceAmount] is now available.\n💰 Amount: [invoiceAmount]',
  })
  @IsString()
  body: string

  @ApiProperty({ example: 'Invoice_[invoiceNumber].pdf' })
  @IsString()
  attachment: string
}

export class RecipientDto {
  @ApiPropertyOptional({
    example: 123,
    description:
      'UserAlias ID — when provided, used for direct lookup instead of name/email/phone search',
  })
  @IsOptional()
  @IsNumber()
  userAliasId?: number

  @ApiProperty({ example: 'John' })
  @IsString()
  name: string

  @ApiPropertyOptional({
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email: string

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @ValidateIf((o) => !o.email) // Phone is required if email is not provided
  phone: string

  @ApiPropertyOptional({ example: false, description: 'Whether to send invoice to parent' })
  @IsBoolean()
  isSendToParent?: boolean
}

export enum PromotionType {
  BUNDLE = 'bundle',
  COUPON = 'coupon',
  MANUAL = 'manual',
  REFERRAL = 'referral',
  PACKAGE = 'package',
}
export enum DiscountAmountType {
  FIXED = 'fixedAmount',
  PERCENTAGE = 'percentage',
}

export class DiscountInvoices {
  @ApiProperty({
    example: 1,
    required: false,
  })
  @ValidateIf(
    (o) => ![PromotionType.REFERRAL, PromotionType.MANUAL, PromotionType.PACKAGE].includes(o.type)
  )
  @IsNumber()
  id?: number

  @ApiPropertyOptional({
    example: 1,
    required: false,
    description: 'Referrer user alias ID (not user ID)',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  studentId?: number

  @ApiPropertyOptional({ example: 1, required: false, description: 'Parent/payer user alias ID' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  parentId?: number

  @ApiPropertyOptional({
    example: 'Bundle promotion',
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    example: PromotionType.BUNDLE,
    enum: PromotionType,
  })
  @IsEnum(PromotionType)
  type: PromotionType

  @ApiProperty({
    example: DiscountType.FIXED_AMOUNT,
    enum: DiscountType,
  })
  @IsEnum(DiscountType)
  discountType: DiscountType

  @ApiProperty({
    example: FeeModeType.ADD_FEE,
    enum: FeeModeType,
  })
  @IsEnum(FeeModeType)
  feeType: FeeModeType

  @ApiProperty({
    example: 500,
    required: true,
  })
  @IsNumber()
  amount: number

  @ApiProperty({
    example: 0,
    description: '',
    required: true,
  })
  @IsNumber()
  order: number

  @ApiProperty({
    name: 'Eligible class ids',
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  classesIds?: number[]

  @ApiPropertyOptional({ example: 1, required: false, description: 'Required when type=REFERRAL' })
  @ValidateIf((o) => o.type === PromotionType.REFERRAL)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  parentCredit?: number
}
export class SplitItem {
  @ApiProperty({ example: 'Split Item 1' })
  @IsString()
  description: string

  @ApiProperty({ example: '2025-01-01' })
  @IsString()
  dueDate: string

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  @Max(100)
  percentage: number

  @ApiPropertyOptional({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  invoiceId?: number
}

export class ClassItem {
  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  courseId: number
  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  classId: number

  @ApiPropertyOptional({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  periodId: number | null

  @ApiPropertyOptional({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  recurringScheduleId: number | null

  @ApiPropertyOptional({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  appointmentId: number | null

  @ApiProperty({ example: '2025-01-01T00:00:00Z 2025-01-01T00:00:00Z', required: false })
  @IsString()
  firstLessonDate: string

  @ApiProperty({ example: 1, required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndividualLesson)
  individualLessons: IndividualLesson[]

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  priceOptionId: number

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  lessonPrice: number

  @ApiProperty({ example: 'Notes', required: false })
  @IsString()
  remark: string

  @ApiProperty({
    type: [String],
    example: [
      '2025-01-01T00:00:00Z 2025-01-01T00:00:00Z',
      '2025-01-01T00:00:00Z 2025-01-01T00:00:00Z',
    ],
  })
  @IsArray()
  @Type(() => LessonString)
  @IsString({ each: true })
  pickedLessons: LessonString[]
}

export enum InvoiceSplitType {
  SINGLE = 'single',
  DUAL_SPLIT = 'dual-split',
  CUSTOM_SPLIT = 'custom-split',
}

export class ManualDiscountDto {
  @ApiProperty({ example: 100, required: true })
  @IsNumber()
  amount: number

  @ApiProperty({ example: 'Early Bird Discount', required: false })
  @IsString()
  @IsOptional()
  name?: string
}

export class ChildInvoiceItem {
  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  id: number

  @ApiProperty({ example: 'John Doe', required: true })
  @IsString()
  name: string

  @ApiPropertyOptional({ example: '+1234567890', required: false })
  @ValidateIf((o) => o.phone && o.phone.trim() !== '')
  @IsString()
  phone?: string

  @ApiPropertyOptional({ example: 'john@example.com', required: false })
  @IsOptional()
  @ValidateIf((o) => o.email && o.email.trim() !== '')
  @IsEmail()
  email?: string

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  userId: number
}

export class InvoiceItem {
  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  invoiceId?: number

  @ApiProperty({ example: 'John Doe', required: true })
  @IsString()
  name: string

  @ApiPropertyOptional({ example: 'john@example.com', required: false })
  @IsOptional()
  // @IsEmail()
  email?: string

  @ApiProperty({ example: '+1234567890', required: true })
  @IsString()
  phone: string

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  siteId: number

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  userAliasId: number

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  userId: number

  @ApiPropertyOptional({ example: 'Invoice Remark', required: false })
  @IsString()
  @IsOptional()
  invoiceRemark?: string

  @ApiPropertyOptional({ type: [MetaRef], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaRef)
  classes?: MetaRef[]

  @ApiPropertyOptional({
    example: InvoiceSplitType.SINGLE,
    required: false,
    enum: InvoiceSplitType,
  })
  @IsEnum(InvoiceSplitType)
  @IsOptional()
  splitType?: InvoiceSplitType

  @ApiPropertyOptional({ type: [SplitItem], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitItem)
  @ValidateIf((o) => o.splitType !== InvoiceSplitType.SINGLE)
  splitItems?: SplitItem[]

  @ApiPropertyOptional({ type: [DiscountInvoices] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountInvoices)
  discounts?: DiscountInvoices[]

  @ApiPropertyOptional({
    type: Number,
    description: 'Parent user alias ID to deduct credit from (if paying by credit)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  childOfUserAliasId?: number

  @ApiPropertyOptional({ type: Boolean, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPayByCredit?: boolean

  @ApiPropertyOptional({ type: Number, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  usedBalance?: number

  @ApiPropertyOptional({ example: 'HKD', required: false })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  total?: number

  @ApiPropertyOptional({ example: false, description: 'Whether to send invoice to parent' })
  @IsBoolean()
  isSendToParent?: boolean

  @ApiPropertyOptional({ type: [ChildInvoiceItem], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChildInvoiceItem)
  childs?: ChildInvoiceItem[]

  @ApiPropertyOptional({
    example: '2026-04-01',
    description: 'Payment date for this invoice (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  paymentDate?: string | null
}

export class IndividualLesson {
  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  @IsString()
  startDate: string

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  @IsString()
  endDate: string
}

export class InvoiceCampaignDto {
  @ApiProperty({ example: 'Invoice Campaign for Q1 2025' })
  @IsString()
  title: string

  @ApiProperty({ example: false })
  @IsBoolean()
  isDraft: boolean

  @ApiProperty({ example: true })
  @IsBoolean()
  isCombined?: boolean

  @ApiProperty({ type: [InvoiceItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItem)
  invoices?: InvoiceItem[]

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  sendViaEmail?: boolean

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  sendViaWhatsapp?: boolean

  @ApiPropertyOptional({ type: String, example: 'Invoice for Q1 2025' })
  @IsString()
  @ValidateIf((o) => o.sendViaEmail)
  @IsOptional()
  emailSubject?: string

  @ApiPropertyOptional({
    type: String,
    example: 'Dear [Name],\n\n this is your invoice for [Course Name]!',
  })
  @IsString()
  @ValidateIf((o) => o.sendViaEmail)
  @IsOptional()
  emailBody?: string

  @ApiPropertyOptional({
    type: String,
    example: 'Dear [Name],\n\n this is your invoice for [Course Name]!',
  })
  @IsString()
  @ValidateIf((o) => o.sendViaWhatsapp)
  @IsOptional()
  whatsappContent?: string
}

export class SendInvoiceBaseDto {
  @ApiPropertyOptional({
    description: 'Email subject',
    example: 'Invoice for Q1 2025',
  })
  @IsString()
  @IsOptional()
  emailSubject?: string

  @ApiPropertyOptional({
    description: 'Email body',
    example: 'Dear [Name],\n\n this is your invoice for [Course Name]!',
  })
  @IsOptional()
  @IsString()
  emailBody?: string

  @ApiProperty({
    description: 'Whatsapp content',
    example: 'Dear [Name],\n\n this is your invoice for [Course Name]!',
  })
  @IsString()
  // Required when sendWhatsapp is true
  @ValidateIf((o) => o.sendViaWhatsapp)
  whatsappContent: string

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to send email notifications for the invoice campaign',
  })
  @IsBoolean()
  @IsOptional()
  sendViaEmail?: boolean

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to send WhatsApp notifications for the invoice campaign',
  })
  @IsBoolean()
  @IsOptional()
  sendViaWhatsapp?: boolean
}

export class CreateInvoiceCampaignDto extends SendInvoiceBaseDto {
  @ApiProperty({ example: 'Invoice Q1 2025 Campaign', required: true })
  @IsString()
  title: string

  @ApiPropertyOptional({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isCombined: boolean

  @ApiPropertyOptional({
    type: [InvoiceItem],
    isArray: true,
    description: 'Array of invoices',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItem)
  invoices?: InvoiceItem[]
}

export class SendInvoiceDto extends CreateInvoiceCampaignDto {
  @ApiProperty({
    type: [RecipientDto],
    example: [{ name: 'John', email: 'john@example.com', phone: '+1234567890' }],
    description: 'List of recipients',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients: RecipientDto[]
}

export enum SendCampaignSteps {
  CREATING_INVOICES = 'CREATING_INVOICES',
  SENDING_INVOICES = 'SENDING_INVOICES',
  COMPLETED = 'COMPLETED',
}

export enum SendingCampaignStatus {
  PENDING = 'pending',
  CREATING = 'creating',
  CREATED = 'created',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
}
export interface SendingInvoiceData {
  id?: string | null
  name: string
  email: string
  phone: string
  invoiceNumber?: string
  amount?: string
  status?: SendingCampaignStatus
  message?: string
  invoiceId?: number
  proofToken?: string
  userAliasId?: number
  userId?: number
  institutionId?: number
}

export class ResendInvoiceDto {
  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  recipientId?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional()
  @ValidateIf((o) => o.email && o.email.trim() !== '')
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string

  @ApiPropertyOptional({
    enum: DocumentRecipientsChannel,
  })
  @IsEnum(DocumentRecipientsChannel)
  @IsOptional()
  channel?: DocumentRecipientsChannel

  @ApiPropertyOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @IsString()
  @IsOptional()
  message?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @ValidateIf((o) => o.channel === DocumentRecipientsChannel.Email)
  subject?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean
}

export class SendInvoiceDirectlyDto extends SendInvoiceBaseDto {
  @ApiProperty()
  @IsInt()
  invoiceId: number
}

export class SyncEnrollCoursesDiffItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  invoiceId: number

  @ApiPropertyOptional({ type: [MetaRef] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaRef)
  addedClasses?: MetaRef[]

  @ApiPropertyOptional({ example: [1, 2] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  removedClassIds?: number[]
}

export class SyncEnrollCoursesDto {
  @ApiProperty({ type: [SyncEnrollCoursesDiffItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncEnrollCoursesDiffItemDto)
  diffs: SyncEnrollCoursesDiffItemDto[]
}

export class PageParamsDto {
  @ApiPropertyOptional({ example: 'search', description: 'Search params' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  search?: string

  @ApiPropertyOptional({ example: 'active', description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}
