import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { BookingCondition, ExpireCondition } from '@/models/appointment.entity'

export class AppointmentDTO {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  availabilityId?: number

  @ApiProperty({ type: BookingCondition, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingCondition)
  bookingCondition?: BookingCondition

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  needConfirm?: boolean

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsInt()
  bufferBeforeMinutes?: number

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsInt()
  bufferAfterMinutes?: number

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsInt()
  dailyLimit?: number

  @ApiProperty({ example: 60, required: false })
  @IsOptional()
  @IsInt()
  durationMinutes?: number

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsInt()
  gapBetweenAppointmentsMinutes?: number

  @ApiProperty({ example: 60, required: false })
  @IsOptional()
  @IsInt()
  minimumNoticeMinutes?: number

  @ApiProperty({ type: ExpireCondition, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExpireCondition)
  expireCondition?: ExpireCondition
}

export class CreateWithClassAppointmentDTO extends AppointmentDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  classId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  siteId: number

  @ApiProperty({ example: 100 })
  @IsOptional()
  @IsInt()
  tuition?: number
}

export class UpdateAppointmentDTO extends AppointmentDTO {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  availabilityId?: number
}

export class AppointmentPageOptionDTO extends PageOptionsDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number
}
