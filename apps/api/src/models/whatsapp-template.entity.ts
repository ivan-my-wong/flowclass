/* eslint-disable simple-import-sort/imports */
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { BaseEntity } from '../modules/base/base.entity'

import {
  WhatsappTemplateCategory,
  WhatsappTemplateLanguage,
  WhatsappTemplateStatus,
} from './enums/status'

import { AutomationFunction } from '@/common/constants/automationFlow'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Repository } from 'typeorm'

@Entity('whatsapp_template')
export class WhatsappTemplateEntity extends BaseEntity {
  @Index('IX_whatsapp_template_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'provider', type: 'varchar', default: 'meta_cloud', nullable: true })
  provider?: string

  @Column({ name: 'content', nullable: true, type: 'text' })
  content: string

  @Column({ name: 'name', type: 'varchar', nullable: true, default: '' })
  name: string

  @Column({ name: 'friendly_name', type: 'varchar', nullable: true, default: '' })
  friendlyName: string

  @Column({ name: 'status', default: WhatsappTemplateStatus.UNSUBMITTED })
  status: string

  @Column({ name: 'category', default: WhatsappTemplateCategory.UTILITY })
  category: string

  @Column({ name: 'language', default: WhatsappTemplateLanguage.EN })
  language: string

  @Column({ name: 'meta_template_id', type: 'varchar', nullable: true })
  metaTemplateId?: string

  @Column({ name: 'twilio_content_id', type: 'varchar', nullable: true })
  twilioContentId?: string

  @Column({ name: 'assigned_to', type: 'jsonb', nullable: true, default: {} })
  assignedTo: AutomationFunction

  @Column({ name: 'content_type', type: 'varchar', default: 'meta/template' })
  contentType: string

  @Column({ name: 'variables', type: 'jsonb', nullable: true })
  variables: Record<string, any>

  @Column({ name: 'types', type: 'jsonb', nullable: true, default: {} })
  types: Record<string, unknown>

  @Column({ name: 'meta_response', type: 'jsonb', nullable: true })
  metaResponse?: Record<string, any>

  @Column({ name: 'twilio_response', type: 'jsonb', nullable: true })
  twilioResponse?: Record<string, any>

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
