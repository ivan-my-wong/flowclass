import { Injectable } from '@nestjs/common'

import { MetaProviderCredentialRepository } from '@/models/meta-provider-credential.entity'
import {
  WhatsAppProvider,
  WhatsAppProviderConnectionRepository,
  WhatsAppProviderConnectionStatus,
} from '@/models/whatsapp-provider-connection.entity'

@Injectable()
export class WhatsAppProviderCredentialService {
  constructor(
    private readonly connectionRepository: WhatsAppProviderConnectionRepository,
    private readonly metaRepository: MetaProviderCredentialRepository
  ) {}

  async upsertMeta(
    institutionId: number,
    accessToken: string,
    tokenExpiresAt?: Date
  ): Promise<void> {
    let connection = await this.connectionRepository.findByInstitutionId(institutionId)
    if (!connection) {
      connection = await this.connectionRepository.create({
        institutionId,
        provider: WhatsAppProvider.META_CLOUD,
        status: WhatsAppProviderConnectionStatus.CONNECTED,
      })
      connection = await this.connectionRepository.save(connection)
    } else if (connection.provider !== WhatsAppProvider.META_CLOUD) {
      connection.provider = WhatsAppProvider.META_CLOUD
      connection = await this.connectionRepository.save(connection)
    }

    const existingCredential = await this.metaRepository.findByConnectionId(connection.id)
    if (existingCredential) {
      existingCredential.accessToken = accessToken
      existingCredential.tokenExpiresAt = tokenExpiresAt
      await this.metaRepository.save(existingCredential)
    } else {
      const newCred = await this.metaRepository.create({
        connectionId: connection.id,
        accessToken,
        tokenExpiresAt,
      })
      await this.metaRepository.save(newCred)
    }
  }

  async getMeta(
    institutionId: number
  ): Promise<{ accessToken: string; tokenExpiresAt?: Date } | null> {
    try {
      const connection = await this.connectionRepository.findByInstitutionId(institutionId)
      if (!connection || connection.provider !== WhatsAppProvider.META_CLOUD) {
        return null
      }

      if (connection.isSystemUser) {
        const credential = await this.metaRepository.findByConnectionId(connection.id)
        if (credential?.accessToken) {
          return { accessToken: credential.accessToken, tokenExpiresAt: credential.tokenExpiresAt }
        }
        const systemToken = process.env.META_SYSTEM_USER_TOKEN
        if (!systemToken) {
          throw new Error('META_SYSTEM_USER_TOKEN is not configured.')
        }
        return { accessToken: systemToken }
      }

      const credential = await this.metaRepository.findByConnectionId(connection.id)
      return credential
        ? { accessToken: credential.accessToken, tokenExpiresAt: credential.tokenExpiresAt }
        : null
    } catch {
      return null
    }
  }

  async deleteForConnection(connectionId: number): Promise<void> {
    await this.metaRepository.delete({ connectionId })
  }
}
