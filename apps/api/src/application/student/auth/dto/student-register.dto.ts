import { IsEmail, IsNotEmpty, IsOptional, Validate } from 'class-validator'

import { PhoneNumberRule } from '@/common/validators/phone-number.validator'

export class StudentRegisterDto {
  firstName: string
  lastName?: string

  @IsNotEmpty()
  @Validate(PhoneNumberRule)
  phone: string

  @IsOptional()
  @IsEmail()
  email?: string

  password: string
}
