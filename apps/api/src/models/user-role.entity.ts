import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { Institution } from './institutions.entity'
import { InstructorProfile } from './instructor-profile.entity'
import { Site } from './site.entity'
import { User } from './user.entity'

@Entity('user_roles')
export class UserRole extends BaseEntity {
  @Index('IX_user_roles_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_user_roles_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_user_roles_user_id')
  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'is_master_admin', default: false })
  isMasterAdmin: boolean

  @Column({ name: 'is_site_manager', default: false })
  isSiteManager: boolean

  @Column({ name: 'is_institution_manager', default: false })
  isInstitutionManager: boolean

  @Column({ name: 'is_instructor', default: false })
  isInstructor: boolean

  @Column({ name: 'is_operator', default: false })
  isOperator: boolean

  @Column({ name: 'is_student', default: false })
  isStudent: boolean

  // @Column({ name: 'user_status', enum: UserStatus, default: UserStatus.ACTIVE })
  // userStatus: UserStatus

  @Column({ name: 'is_instructor_rates_enabled', default: false })
  isInstructorRatesEnabled: boolean

  @Index('IX_user_roles_instructor_profile_id')
  @Column({ name: 'instructor_profile_id', nullable: true })
  instructorProfileId: number | null

  @ManyToOne(() => User, (user) => user.userRoles, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Site, (site) => site.userRoles, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'site_id' })
  site: Promise<Site>

  @ManyToOne(() => Institution, (institution) => institution.userRoles, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Promise<Institution>

  @OneToOne(() => InstructorProfile, (instructorProfile) => instructorProfile.userRole, {
    createForeignKeyConstraints: false,
  })
  instructorProfile: InstructorProfile | null
}
