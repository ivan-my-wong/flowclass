import { Injectable } from '@nestjs/common'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { DataSource, Repository } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { Course } from './courses.entity'
import { InstructorProfile } from './instructor-profile.entity'

@Entity('instructor_rates')
export class InstructorRate extends BaseEntity {
  @Index('IX_instructor_rates_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_instructor_rates_instructor_profile_id')
  @Column({ name: 'instructor_profile_id' })
  instructorProfileId: number

  @Index('IX_instructor_rates_user_role_id')
  @Column({ name: 'user_role_id' })
  userRoleId: number

  // If courseId is provided, then classIds must be null, and it means that the rate is for the course
  @Index('IX_instructor_rates_course_id')
  @Column({ name: 'course_id', nullable: true })
  courseId: number | null

  // If classIds must be provided, and it means that the rate is for the classes
  @Index('IX_instructor_rates_class_ids')
  @Column({ name: 'class_ids', type: 'jsonb', nullable: true })
  classIds: number[] | null

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number

  @Column({ name: 'is_default_rate', default: false })
  isDefaultRate: boolean

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @Column({ name: 'effective_until', type: 'timestamptz', nullable: true })
  effectiveUntil: Date | null

  @Column({ name: 'minimum_students', type: 'integer', nullable: true })
  minimumStudents: number | null

  @Column({
    name: 'additional_salary_per_student',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  additionalSalaryPerStudent: number | null

  // Relations
  @ManyToOne(() => InstructorProfile, (instructorProfile) => instructorProfile.instructorRates, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'instructor_profile_id' })
  instructorProfile: InstructorProfile

  @ManyToOne(() => Course, (course) => course.instructorRates, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course
}

@Injectable()
export class InstructorRatesRepository extends Repository<InstructorRate> {
  constructor(private dataSource: DataSource) {
    super(InstructorRate, dataSource.createEntityManager())
  }
}
