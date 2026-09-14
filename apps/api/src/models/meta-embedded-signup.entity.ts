import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, JoinColumn, OneToOne, Repository } from 'typeorm'

import { Institution } from '@/models/institutions.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

export enum MetaEmbeddedSignupStatus {
  NOT_STARTED = 'not_started',
  PREPARING = 'preparing',
  INITIATED = 'initiated',
  META_AUTH_PENDING = 'meta_auth_pending',
  META_AUTH_COMPLETED = 'meta_auth_completed',
  PROVISIONING = 'provisioning',
  PHONE_REGISTRATION_PENDING = 'phone_registration_pending',
  PAYMENT_REQUIRED = 'payment_required',
  VERIFICATION_REQUIRED = 'verification_required',
  CONNECTED = 'connected',
  REAUTH_REQUIRED = 'reauth_required',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DISCONNECTED = 'disconnected',
}

@Entity('meta_embedded_signups')
export class MetaEmbeddedSignup extends BaseEntity {
  @Index('IX_meta_embedded_signups_institution_id')
  @Column({ name: 'institution_id', unique: true, type: 'int4' })
  institutionId: number

  @OneToOne(() => Institution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'institution_id' })
  institution?: Institution

  @Column({ name: 'business_id', type: 'varchar', nullable: true })
  businessId?: string

  @Column({ name: 'configuration_id', type: 'varchar', nullable: true })
  configurationId?: string

  @Column({ name: 'embedded_signup_state', type: 'varchar', nullable: true })
  embeddedSignupState?: string

  @Column({ name: 'state_expires_at', type: 'timestamptz', nullable: true })
  stateExpiresAt?: Date

  @Column({ name: 'state_consumed_at', type: 'timestamptz', nullable: true })
  stateConsumedAt?: Date

  @Column({ name: 'authorization_code', type: 'varchar', nullable: true })
  authorizationCode?: string

  @Column('simple-array', { name: 'granted_scopes', nullable: true })
  grantedScopes?: string[]

  @Column({ name: 'is_coexistence', type: 'boolean', nullable: true })
  isCoexistence?: boolean

  @Column({ name: 'provisioning_step', type: 'varchar', nullable: true })
  provisioningStep?: string

  @Column({ name: 'provisioning_attempts', type: 'integer', default: 0 })
  provisioningAttempts: number

  @Column({ name: 'last_error_code', type: 'varchar', nullable: true })
  lastErrorCode?: string

  @Column({ name: 'last_error_message', type: 'text', nullable: true })
  lastErrorMessage?: string

  @Column({
    name: 'status',
    type: 'varchar',
    default: MetaEmbeddedSignupStatus.INITIATED,
  })
  status: MetaEmbeddedSignupStatus

  @Column({ name: 'embedded_signup_payload', type: 'jsonb', nullable: true })
  embeddedSignupPayload?: Record<string, any>
}

@Injectable()
export class MetaEmbeddedSignupRepository extends BaseAbstractRepository<MetaEmbeddedSignup> {
  private _repository: Repository<MetaEmbeddedSignup>

  constructor(
    @InjectRepository(MetaEmbeddedSignup)
    repository: Repository<MetaEmbeddedSignup>
  ) {
    super(repository)
    this._repository = repository
  }

  async findByInstitutionId(institutionId: number): Promise<MetaEmbeddedSignup | null> {
    return this._repository.findOne({ where: { institutionId } })
  }
}
