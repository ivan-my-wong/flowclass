import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString, Length, Matches } from 'class-validator'

export class RegisterPhoneNumberDto {
  @ApiProperty({ description: 'Institution ID whose WhatsApp phone number is being registered' })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({ description: '6-digit PIN to register with Meta Cloud API', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'PIN must be exactly 6 digits.' })
  pin: string
}
