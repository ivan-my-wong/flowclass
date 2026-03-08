import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

interface IWhatsappConnection {
  sessionName: string
  accessToken?: string
  status: string
  phoneNumber: string
}
export interface IWhatsAppSessionData {
  message: string
  sessionId: string
  token: string
  whatsAppConnection: IWhatsappConnection
}

@Entity('whatsapp_sessions')
export class WhatsAppSession extends BaseEntity {
  @Index()
  @Column({ type: 'int4', name: 'institution_id', unique: true })
  institutionId: number

  @Column({ name: 'session_id' })
  sessionId: string

  @Column({ type: 'jsonb', name: 'session_data' })
  sessionData: IWhatsAppSessionData
}

@Injectable()
export class WhatsappSessionRepository extends BaseAbstractRepository<WhatsAppSession> {
  private _repository: Repository<WhatsAppSession>

  constructor(
    @InjectRepository(WhatsAppSession)
    repository: Repository<WhatsAppSession>
  ) {
    super(repository)
    this._repository = repository
  }
}
