import { Injectable, Logger } from '@nestjs/common'

import {
  MetaCoexistenceSyncCheckpoint,
  MetaCoexistenceSyncCheckpointRepository,
} from '@/models/meta-coexistence-sync-checkpoint.entity'
import { MetaEmbeddedSignupRepository } from '@/models/meta-embedded-signup.entity'
import { WhatsAppProviderConnectionRepository } from '@/models/whatsapp-provider-connection.entity'

@Injectable()
export class MetaCoexistenceSyncService {
  private readonly logger = new Logger(MetaCoexistenceSyncService.name)

  constructor(
    private readonly connectionRepository: WhatsAppProviderConnectionRepository,
    private readonly signupRepository: MetaEmbeddedSignupRepository,
    private readonly checkpointRepository: MetaCoexistenceSyncCheckpointRepository
  ) {}

  async getStatus(institutionId: number): Promise<{
    isCoexistence: boolean
    checkpoints: MetaCoexistenceSyncCheckpoint[]
  }> {
    const signup = await this.signupRepository.findByInstitutionId(institutionId)
    const checkpoints = await this.checkpointRepository.findByInstitutionId(institutionId)
    return {
      isCoexistence: signup?.isCoexistence === true,
      checkpoints,
    }
  }
}
