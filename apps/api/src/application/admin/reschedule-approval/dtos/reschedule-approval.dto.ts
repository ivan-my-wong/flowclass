import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { PaymentStatus, RequestTimeChangeStatus } from '@/models/enums/status'
import { RequestTimeChange } from '@/models/request-time-change.entity'

export class RescheduleApprovalDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number
}

export class RescheduleApprovalPageDto extends PageDto<RequestTimeChange> {}

export class RescheduleApprovalOptionDto extends PageOptionsDto {
  @ApiProperty({
    example: 1,
  })
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  siteId?: number

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

  @ApiProperty({
    example: 1,
  })
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  classId: number

  @ApiPropertyOptional({
    enum: PaymentStatus,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentState?: PaymentStatus

  @ApiPropertyOptional({
    example: 'search',
  })
  @IsOptional()
  search?: string
}

export class ChangeRescheduleApprovalStatusDto {
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
  @IsArray()
  ids: number[]

  @ApiProperty({
    example: RequestTimeChangeStatus.APPROVED,
    enum: RequestTimeChangeStatus,
  })
  @IsEnum(RequestTimeChangeStatus)
  status: RequestTimeChangeStatus
}
