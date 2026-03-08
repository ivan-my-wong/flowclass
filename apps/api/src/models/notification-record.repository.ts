import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { NotificationRecord } from '@/models/notification-record.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

@Injectable()
export class NotificationRecordRepository extends BaseAbstractRepository<NotificationRecord> {
  private _repository: Repository<NotificationRecord>

  constructor(
    @InjectRepository(NotificationRecord)
    repository: Repository<NotificationRecord>
  ) {
    super(repository)
    this._repository = repository
  }
}
