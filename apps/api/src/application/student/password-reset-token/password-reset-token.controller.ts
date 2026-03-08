import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { PasswordResetTokenService } from '@/domain/service/password-reset-token.service'

import { StudentCreatePasswordResetTokenDto } from './dto/create-password-reset-token.dto'

@Controller('password-reset-token')
export class PasswordResetTokenController {
  constructor(private readonly passwordResetTokenService: PasswordResetTokenService) {}

  @Post()
  @ApiOperation({
    operationId: 'studentPasswordResetTokenCreate',
    summary: 'This api for user use to create a password reset token',
  })
  create(@Body() createPasswordResetTokenDto: StudentCreatePasswordResetTokenDto) {
    return this.passwordResetTokenService.create(createPasswordResetTokenDto)
  }
}
