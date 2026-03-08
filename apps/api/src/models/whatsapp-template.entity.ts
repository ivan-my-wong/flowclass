/* eslint-disable simple-import-sort/imports */
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { BaseEntity } from '../modules/base/base.entity'

import {
  WhatsappTemplateCategory,
  WhatsappTemplateLanguage,
  WhatsappTemplateStatus,
} from './enums/status'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Repository } from 'typeorm'

@Entity('whatsapp_template')
export class WhatsappTemplateEntity extends BaseEntity {
  @Index('IX_whatsapp_template_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'content', nullable: true })
  content: string

  @Column({ name: 'name', type: 'varchar', nullable: true, default: '' })
  name: string

  @Column({ name: 'status', default: WhatsappTemplateStatus.UNSUBMITTED })
  status: string

  @Column({ name: 'category', default: WhatsappTemplateCategory.UTILITY })
  category: string

  @Column({ name: 'language', default: WhatsappTemplateLanguage.EN })
  language: string

  @Column({ name: 'twilio_content_id', type: 'varchar', nullable: true })
  twilioContentId: string

  @Column({ name: 'assigned_to', type: 'jsonb', nullable: true, default: {} })
  assignedTo: Record<string, any>

  @Column({ name: 'content_type', type: 'varchar', default: 'twilio/text' })
  contentType: string

  @Column({ name: 'variables', type: 'jsonb', nullable: true })
  variables: Record<string, any>

  @Column({ name: 'twilio_response', type: 'jsonb', nullable: true })
  twilioResponse: Record<string, any>

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean
}

@Injectable()
export class WhatsappTemplateRepository extends BaseAbstractRepository<WhatsappTemplateEntity> {
  private _repository: Repository<WhatsappTemplateEntity>

  constructor(
    @InjectRepository(WhatsappTemplateEntity)
    repository: Repository<WhatsappTemplateEntity>
  ) {
    super(repository)
    this._repository = repository
  }
}
