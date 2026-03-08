import { Injectable } from '@nestjs/common'
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { DataSource, Repository } from 'typeorm'

import { StudentRatesConfigDto } from '@/application/admin/instructors/dto/update-rates-status.dto'
import { BaseEntity } from '@/modules/base/base.entity'

import { InstructorRate } from './instructor-rates.entity'
import { UserRole } from './user-role.entity'

@Entity('instructor_profiles')
export class InstructorProfile extends BaseEntity {
  @Index('IX_instructor_profiles_user_role_id')
  @Column({ name: 'user_role_id' })
  userRoleId: number

  @Column({ name: 'is_rates_enabled', default: false })
  isRatesEnabled: boolean

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  // Relations
  @OneToOne(() => UserRole, (userRole) => userRole.instructorProfile, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_role_id' })
  userRole: UserRole

  @OneToMany(() => InstructorRate, (instructorRate) => instructorRate.instructorProfile)
  instructorRates: InstructorRate[]

  @Column({ name: 'is_student_rates_enabled', default: false })
  isStudentRatesEnabled: boolean

  @Column({ name: 'student_rates_config', type: 'jsonb', nullable: true })
  studentRatesConfig: StudentRatesConfigDto | null
}

@Injectable()
export class InstructorProfileRepository extends Repository<InstructorProfile> {
  constructor(private dataSource: DataSource) {
    super(InstructorProfile, dataSource.createEntityManager())
  }
}
