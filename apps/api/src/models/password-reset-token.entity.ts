import { Column, Entity } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

@Entity('password_reset_tokens')
export class PasswordResetToken extends BaseEntity {
  @Column({ name: 'email' })
  email: string

  @Column({ name: 'token' })
  token: string

  @Column({ name: 'expired', type: 'timestamptz' })
  expired: Date
}
