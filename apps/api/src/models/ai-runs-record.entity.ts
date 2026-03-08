import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'

export class AiDelta {
  role?: string
  content?: string
}
export class AiChoice {
  content_filter_results: Record<string, any>
  messages?: { delta: AiDelta }[]
  delta?: AiDelta
  finish_reason: string | null
  index: number
}

export class AiCompletionChunk {
  choices: AiChoice[]
  created: number
  id: string
  model: string
  object: string
}

@Entity('ai_runs_record')
export class AiRunsRecord extends BaseEntity {
  @Column({ name: 'user_browser_uuid' })
  userBrowserId: string

  @Column({ name: 'openai_request_id' })
  openAiRequestId: string

  @Column({ name: 'token_usage', default: 0 })
  tokenUsage: number

  @Column({ name: 'prompt' })
  prompt: string

  @Column({ name: 'language', default: 'English' })
  language: string

  @Column({ name: 'result', nullable: true })
  result?: string

  @Column({ name: 'model' })
  model: string

  @Column({ name: 'is_login', default: false })
  isLogin: boolean

  @Column({ name: 'user_id', nullable: true })
  userId?: number

  @Column({ name: 'institution_id', nullable: true })
  institutionId?: string
}

@Injectable()
export class AiRunsRecordRepository extends BaseAbstractRepository<AiRunsRecord> {
  private _repository: Repository<AiRunsRecord>

  constructor(
    @InjectRepository(AiRunsRecord)
    repository: Repository<AiRunsRecord>
  ) {
    super(repository)
    this._repository = repository
  }
}
