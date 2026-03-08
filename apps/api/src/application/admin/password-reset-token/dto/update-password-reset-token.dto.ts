import { PartialType } from '@nestjs/swagger'

import { CreatePasswordResetTokenDto } from './create-password-reset-token.dto'

export class UpdatePasswordResetTokenDto extends PartialType(CreatePasswordResetTokenDto) {}
