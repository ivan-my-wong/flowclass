import { ApiProperty } from '@nestjs/swagger'
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

export class GenerateInvoicesNextMonthDTO {
  @ApiProperty({
    type: [Number],
    description: 'Array of class IDs to generate invoices for',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  classIds: number[]
}

export class SendCustomMessagesDto {
  @ApiProperty({
    type: [Number],
    description: 'Array of invoice IDs to send custom messages to',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  invoiceIds: number[]

  @ApiProperty({
    type: String,
    description: 'The message to send to the students',
  })
  @IsString()
  message: string

  @ApiProperty({
    type: Object,
    description: 'The variables to send to the students',
  })
  @IsObject()
  @IsOptional()
  variables: Record<string, string>
}

export class UpdateInvoiceRemarkDto {
  @ApiProperty({
    type: String,
    description: 'The remark to update',
  })
  @IsString()
  remark: string
}
