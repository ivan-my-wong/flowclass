import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, JoinColumn, OneToOne, Repository } from 'typeorm'

import { Institution } from '@/models/institutions.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

export enum WhatsAppProvider {
  TWILIO = 'twilio',
  META_CLOUD = 'meta_cloud',
}

export enum WhatsAppProviderConnectionStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',
  DEGRADED = 'degraded',
  DISCONNECTED = 'disconnected',
}

@Entity('whatsapp_provider_connections')
export class WhatsAppProviderConnection extends BaseEntity {
  @Index('IX_whatsapp_provider_connections_institution_id')
  @Column({ name: 'institution_id', unique: true, type: 'int4' })
  institutionId: number

  @OneToOne(() => Institution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'institution_id' })
  institution?: Institution

  @Column({
    type: 'enum',
    enum: WhatsAppProvider,
    default: WhatsAppProvider.META_CLOUD,
  })
  provider: WhatsAppProvider

  @Column({
    type: 'enum',
    enum: WhatsAppProviderConnectionStatus,
    default: WhatsAppProviderConnectionStatus.PENDING,
  })
  status: WhatsAppProviderConnectionStatus

  @Column({ name: 'display_phone_number', nullable: true })
  displayPhoneNumber?: string

  @Column({ name: 'external_phone_number_id', nullable: true })
  externalPhoneNumberId?: string

  @Column({ name: 'connected_at', type: 'timestamptz', nullable: true })
  connectedAt?: Date

  @Column({ name: 'last_health_check_at', type: 'timestamptz', nullable: true })
  lastHealthCheckAt?: Date

  @Column({ name: 'status_reason', type: 'text', nullable: true })
  statusReason?: string | null

  @Column({ name: 'waba_id', nullable: true })
  wabaId?: string | null

  @Column({ name: 'verified_name', nullable: true })
  verifiedName?: string | null

  @Column({ name: 'is_system_user', default: false })
  isSystemUser: boolean
}

@Injectable()
export class WhatsAppProviderConnectionRepository extends BaseAbstractRepository<WhatsAppProviderConnection> {
  private _repository: Repository<WhatsAppProviderConnection>

  constructor(
    @InjectRepository(WhatsAppProviderConnection)
    repository: Repository<WhatsAppProviderConnection>
  ) {
    super(repository)
    this._repository = repository
  }

  async findByInstitutionId(institutionId: number): Promise<WhatsAppProviderConnection | null> {
    return this._repository.findOne({ where: { institutionId } })
  }
}
