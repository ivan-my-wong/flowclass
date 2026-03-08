import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

import { Course } from './courses.entity'
import { Institution } from './institutions.entity'
import { Site } from './site.entity'

@Entity('comments')
export class CommentEntity extends BaseEntity {
  @Index('IX_comments_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_comments_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Index('IX_comments_course_id')
  @Column({ name: 'course_id' })
  courseId: number

  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'rating' })
  rating: number

  @Column({ name: 'content' })
  content: string

  @ManyToOne(() => Site, (site) => site.comments, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @ManyToOne(() => Institution, (institution) => institution.comments, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @ManyToOne(() => Course, (course) => course.comments, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course
}

@Injectable()
export class CommentRepository extends BaseAbstractRepository<CommentEntity> {
  private _repository: Repository<CommentEntity>

  constructor(
    @InjectRepository(CommentEntity)
    repository: Repository<CommentEntity>
  ) {
    super(repository)
    this._repository = repository
  }
}
