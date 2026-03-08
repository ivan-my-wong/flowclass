import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class DeleteFieldFromStudentRecordDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @ApiProperty({ description: 'Institution ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({ description: 'Field ID to delete', example: '657' })
  @IsNotEmpty()
  @IsString()
  fieldId: string
}
