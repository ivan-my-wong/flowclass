import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class CreatePaymentEvidenceDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  enrollCourseId: number

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File
}
