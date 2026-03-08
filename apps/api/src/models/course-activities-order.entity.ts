import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { Course } from './courses.entity'
@Entity('course_activities_order')
export class CourseActivitiesOrderEntity extends BaseEntity {
  @Index('IX_course_activities_order_course_id')
  @Column({ name: 'course_id' })
  courseId: number

  @Column({ name: 'activity_order', type: 'integer', array: true })
  activityOrder: number[]

  @OneToOne(() => Course, (course) => course.courseActivitiesOrder, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course
}

@Injectable()
export class CourseActivitiesOrderRepository extends BaseAbstractRepository<CourseActivitiesOrderEntity> {
  private _repository: Repository<CourseActivitiesOrderEntity>

  constructor(
    @InjectRepository(CourseActivitiesOrderEntity)
    repository: Repository<CourseActivitiesOrderEntity>
  ) {
    super(repository)
    this._repository = repository
  }
}
