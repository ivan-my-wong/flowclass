import { PartialType } from '@nestjs/swagger'

import { StudentCreatePasswordResetTokenDto } from './create-password-reset-token.dto'

export class StudentUpdatePasswordResetTokenDto extends PartialType(
  StudentCreatePasswordResetTokenDto
) {}
