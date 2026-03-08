import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index } from 'typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { BaseEntity } from '../modules/base/base.entity'

@Entity('course_event_sessions')
export class WKSession extends BaseEntity {
  @Index('IX_course_event_sessions_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_course_event_sessions_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_course_event_sessions_course_id')
  @Column({ name: 'course_id' })
  courseId: number

  @Column({ name: 'name' })
  name: string

  @Column({
    name: 'total_fee',
    default: 0,
    type: 'numeric',
    transformer: {
      from: (value) => parseFloat(value),
      to: (value) => value,
    },
  })
  totalFee: number

  @Column({ name: 'quota', default: 0 })
  quota: number

  @Column({ name: 'location', nullable: true })
  location: string

  // @OneToMany(() => EnrollCourse, (enrollCourse) => enrollCourse.session)
  // enrollCourses: EnrollCourse[];
}

@Injectable()
export class WorkshopSessionRepository extends BaseAbstractRepository<WKSession> {
  private _repository: Repository<WKSession>

  constructor(
    @InjectRepository(WKSession)
    repository: Repository<WKSession>
  ) {
    super(repository)
    this._repository = repository
  }
}
