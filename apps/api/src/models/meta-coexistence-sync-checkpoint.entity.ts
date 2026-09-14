import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Repository, Unique } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

export enum MetaCoexistenceSyncType {
  CONTACTS = 'contacts',
  HISTORY = 'history',
  MESSAGE_ECHOES = 'message_echoes',
}

export enum MetaCoexistenceSyncStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('meta_coexistence_sync_checkpoints')
@Unique('UQ_meta_coexistence_sync_checkpoint_institution_type', ['institutionId', 'syncType'])
export class MetaCoexistenceSyncCheckpoint extends BaseEntity {
  @Index('IX_meta_coexistence_sync_checkpoints_institution_id')
  @Column({ name: 'institution_id', type: 'int4' })
  institutionId: number

  @Column({ name: 'sync_type', type: 'varchar' })
  syncType: MetaCoexistenceSyncType

  @Column({ name: 'status', type: 'varchar' })
  status: MetaCoexistenceSyncStatus

  @Column({ name: 'phase', type: 'integer', nullable: true })
  phase?: number

  @Column({ name: 'chunk_order', type: 'integer', nullable: true })
  chunkOrder?: number

  @Column({ name: 'progress', type: 'integer', nullable: true })
  progress?: number

  @Column({ name: 'processed_items', type: 'integer', default: 0 })
  processedItems: number

  @Column({ name: 'last_event_at', type: 'timestamptz', nullable: true })
  lastEventAt?: Date

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string
}

@Injectable()
export class MetaCoexistenceSyncCheckpointRepository extends BaseAbstractRepository<MetaCoexistenceSyncCheckpoint> {
  private _repository: Repository<MetaCoexistenceSyncCheckpoint>

  constructor(
    @InjectRepository(MetaCoexistenceSyncCheckpoint)
    repository: Repository<MetaCoexistenceSyncCheckpoint>
  ) {
    super(repository)
    this._repository = repository
  }

  async findByInstitutionId(institutionId: number): Promise<MetaCoexistenceSyncCheckpoint[]> {
    return this._repository.find({ where: { institutionId } })
  }
}
