export class CreatePasswordResetTokenDto {
  email: string
  token: string
  expired: Date
}
