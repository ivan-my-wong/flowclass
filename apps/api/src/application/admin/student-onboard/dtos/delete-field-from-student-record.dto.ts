import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class DeleteFieldFromStudentRecordDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @ApiProperty({ description: 'User Alias ID', example: 1 })
  @IsOptional()
  @IsNumber()
  userAliasId?: number

  @ApiProperty({ description: 'Institution ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({ description: 'Field ID to delete', example: '657' })
  @IsNotEmpty()
  @IsString()
  fieldId: string

  @ApiProperty({ description: 'Invoice ID', example: 1 })
  @IsOptional()
  @IsNumber()
  invoiceId?: number
}
