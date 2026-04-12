import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator'

import { IsDateRange } from '@/common/decorators/is-date-range.decorator'
import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { PaymentStatus } from '@/models/enums/status'
import { Invoice } from '@/models/invoice.entity'

export class InvoicesPageDto extends PageDto<Invoice> {}

export const SELECT_INVOICE_FIELDS_EXAMPLE = {
  id: true,
  createdAt: true,
  updatedAt: true,
  paymentState: true,
  paymentMethod: true,
  paymentDate: true, // shown payment date
  payAmount: true,
  additionalFee: true,
  discountAmount: true,
  feePerLesson: true,
  proofToken: true,
  payLaterMethod: {
    id: true,
    siteId: true,
    enabled: true,
    methodName: true,
    methodType: true,
    description: true,
    payoutMethodDetails: {
      bankName: true,
      accountId: true,
      payoutImg: true,
      payoutUrl: true,
      bankBranch: true,
      accountName: true,
      successMessage: true,
      receiptRequired: true,
      paymentMethodName: true,
    },
  },
  siteId: true,
  institutionId: true,
  course: {
    id: true,
    name: true,
    path: true,
  },
  enrollCourse: {
    id: true,
    name: true,
    phone: true,
    email: true,
    currency: true,
    confirmState: true,
    paymentAmount: true,
    enrollInto: {
      id: true,
      secondLevelName: true,
      thirdLevelName: true,
    },
    registrationForm: true,
  },
  studentSchedules: {
    id: true,
    classId: true,
    class: {
      id: true,
      name: true,
    },
    firstStudentLesson: {
      id: true,
      startTime: true,
      endTime: true,
      changeStartTime: true,
      changeEndTime: true,
    },
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
  splitItems: true,
}
export class InvoicesOptionDto extends PageOptionsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  courseId: number

  @ApiPropertyOptional({
    enum: PaymentStatus,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentState?: PaymentStatus

  // shown payment date
  @ApiPropertyOptional({
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isInitialRequest?: boolean

  @ApiPropertyOptional({
    example: 'search',
  })
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date

  @ApiPropertyOptional({
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ValidateIf((o) => o.startDate && o.endDate)
  @IsDateRange('startDate', {
    message: 'endDate must be after startDate',
  })
  endDate?: Date

  @ApiProperty({
    example: 1,
  })
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  invoiceId?: number
}

export class FindInvoiceStatisticsByDateRangeDto {
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  startDate?: Date

  @IsOptional()
  @ApiPropertyOptional({
    description: 'End date',
    example: '2025-01-01T00:00:00.000Z',
  })
  endDate?: Date

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  institutionId: number

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  siteId: number
}
