import { Column, Entity } from 'typeorm'

import { RecordLogType } from '@/models/enums/'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('record_logs')
export class RecordLog extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  userId: number

  @Column({ name: 'institution_id', nullable: true })
  institutionId: number

  @Column({ name: 'type', enum: RecordLogType, type: 'enum' })
  type: RecordLogType

  @Column({ name: 'detail', type: 'jsonb' })
  detail: object
}
