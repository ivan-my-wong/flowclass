import { Injectable } from '@nestjs/common'

import { CreatePasswordResetTokenDto } from '@/application/admin/password-reset-token/dto/create-password-reset-token.dto'
import { PasswordResetToken } from '@/models/password-reset-token.entity'
import { PasswordResetTokenRepository } from '@/models/password-reset-token.repository'

@Injectable()
export class PasswordResetTokenService {
  constructor(private passwordResetTokenRepository: PasswordResetTokenRepository) {}
  create(createPasswordResetTokenDto: CreatePasswordResetTokenDto) {
    return this.passwordResetTokenRepository.save(
      this.passwordResetTokenRepository.create(createPasswordResetTokenDto)
    )
  }

  async findOneByToken(token: string): Promise<PasswordResetToken> {
    return await this.passwordResetTokenRepository.findOneBy({
      token,
    })
  }
}
