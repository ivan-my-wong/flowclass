import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator'

export enum WebhookType {
  /**
   * Triggers the collection of invoices for an institution
   */
  COLLECT_INVOICES = 'collect-invoices',
  /**
   * Creates a new invoice with the provided invoice IDs
   */
  CREATE_INVOICE = 'create-invoice',
  /**
   * Retrieves the next billing invoice
   */
  NEXT_BILLING_INVOICE = 'next-billing-invoice',
  /**
   * Records a notification log entry
   */
  RECORD_NOTIF_LOG = 'record-notif-log',
  /**
   * Collects lessons for an institution
   */
  COLLECT_LESSONS = 'collect-lessons',
  /**
   * Retrieves institution information
   */
  GET_INSTITUTION = 'get-institution',
}

export class MetaWebhook {
  @ApiProperty({
    type: String,
    enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'cronExpression'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'cronExpression'])
  field?: string

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsInt()
  secondsInterval?: number

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsInt()
  minutesInterval?: number

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsInt()
  daysInterval?: number

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsInt()
  weeksInterval?: number

  @ApiProperty({
    type: Array<number>,
    enum: [0, 1, 2, 3, 4, 5, 6],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  triggerAtDay?: number[]

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  triggerAtHour?: number

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(59)
  triggerAtMinute?: number

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(31)
  triggerAtDayOfMonth?: number

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  notice?: string

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  expression?: string
}

export class WebhookPayload {
  @ApiProperty({
    type: String,
    enum: WebhookType,
    required: true,
  })
  @IsEnum(WebhookType)
  @IsNotEmpty()
  type: WebhookType

  @ApiProperty({
    type: Number,
    example: 1,
  })
  @ValidateIf((o) => o.type !== WebhookType.GET_INSTITUTION)
  @IsNumber()
  @IsPositive()
  @IsInt()
  institutionId: number

  @ApiProperty({
    type: Array<string>,
    required: false,
    example: ['10 minutes', '1 hour', '1 day', '1 week', '1 month', '1 year'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  intervalBeforeLesson?: string[]

  @ApiProperty({
    type: MetaWebhook,
    required: false,
  })
  @ValidateIf(
    (o) => o.type === WebhookType.COLLECT_INVOICES || o.type === WebhookType.COLLECT_LESSONS
  )
  @ValidateNested()
  @Type(() => MetaWebhook)
  meta?: MetaWebhook

  @ApiProperty({
    type: Array<number>,
    example: [1, 2, 3],
  })
  @ValidateIf((o) => o.type === WebhookType.CREATE_INVOICE)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  @IsInt({ each: true })
  invoiceIds: number[]
}
