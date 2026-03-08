import { Body, Controller, Post } from '@nestjs/common'

import { PasswordResetTokenService } from '@/domain/service/password-reset-token.service'

import { CreatePasswordResetTokenDto } from './dto/create-password-reset-token.dto'

@Controller('password-reset-token')
export class PasswordResetTokenController {
  constructor(private readonly passwordResetTokenService: PasswordResetTokenService) {}

  @Post()
  create(@Body() createPasswordResetTokenDto: CreatePasswordResetTokenDto) {
    return this.passwordResetTokenService.create(createPasswordResetTokenDto)
  }
}
