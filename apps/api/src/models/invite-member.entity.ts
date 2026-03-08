import { Column, Entity } from 'typeorm'

import { InviteSiteMemberStatus } from '@/models/enums/status'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('invite_site_members')
export class InviteMember extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'email' })
  email: string

  @Column({ name: 'name', nullable: true })
  name?: string

  @Column({ name: 'phone', nullable: true })
  phone?: string

  @Column({ name: 'is_site_manager' })
  isSiteManager: boolean

  @Column({ name: 'is_institution_manager' })
  isInstitutionManager: boolean

  @Column({ name: 'is_instructor' })
  isInstructor: boolean

  @Column({ name: 'is_operator' })
  isOperator: boolean

  @Column({ name: 'token' })
  token: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: InviteSiteMemberStatus,
    default: InviteSiteMemberStatus.INVITING,
  })
  status: InviteSiteMemberStatus
}
