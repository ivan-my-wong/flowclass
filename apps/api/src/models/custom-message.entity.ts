/* eslint-disable simple-import-sort/imports */
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { BaseEntity } from '../modules/base/base.entity'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Repository } from 'typeorm'

@Entity('custom_message')
export class CustomMessageEntity extends BaseEntity {
  @Index('IX_custom_message_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'content', nullable: true })
  content: string

  @Column({ name: 'repeater_format', type: 'text', nullable: true })
  repeaterFormat?: string

  @Column({ name: 'name', type: 'varchar', nullable: true, default: '' })
  name: string

  @Column({ name: 'type' })
  type: string

  @Column({ name: 'variables', type: 'jsonb', nullable: true })
  variables: Record<string, any>

  @Column({ name: 'email_notification', type: 'boolean', default: true })
  emailNotification: boolean

  @Column({ name: 'whatsapp_notification', type: 'boolean', default: true })
  whatsappNotification: boolean
}

@Injectable()
export class CustomMessageRepository extends BaseAbstractRepository<CustomMessageEntity> {
  private _repository: Repository<CustomMessageEntity>

  constructor(
    @InjectRepository(CustomMessageEntity)
    repository: Repository<CustomMessageEntity>
  ) {
    super(repository)
    this._repository = repository
  }
}
