import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, JoinColumn, OneToOne, Repository } from 'typeorm'

import { WhatsAppProviderConnection } from '@/models/whatsapp-provider-connection.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

@Entity('meta_provider_credentials')
export class MetaProviderCredential extends BaseEntity {
  @Column({ name: 'connection_id', unique: true, type: 'int4' })
  connectionId: number

  @OneToOne(() => WhatsAppProviderConnection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connection_id' })
  connection?: WhatsAppProviderConnection

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string

  @Column({ name: 'token_expires_at', type: 'timestamptz', nullable: true })
  tokenExpiresAt?: Date
}

@Injectable()
export class MetaProviderCredentialRepository extends BaseAbstractRepository<MetaProviderCredential> {
  private _repository: Repository<MetaProviderCredential>

  constructor(
    @InjectRepository(MetaProviderCredential)
    repository: Repository<MetaProviderCredential>
  ) {
    super(repository)
    this._repository = repository
  }

  async findByConnectionId(connectionId: number): Promise<MetaProviderCredential | null> {
    return this._repository.findOne({ where: { connectionId } })
  }
}
