import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { CoursePromotionUsed } from './course-promotion-used.entity'

@Injectable()
export class CoursePromotionUsedRepository extends BaseAbstractRepository<CoursePromotionUsed> {
  private _repository: Repository<CoursePromotionUsed>

  constructor(
    @InjectRepository(CoursePromotionUsed)
    repository: Repository<CoursePromotionUsed>
  ) {
    super(repository)
    this._repository = repository
  }
}
