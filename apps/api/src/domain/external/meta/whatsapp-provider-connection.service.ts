import { Injectable, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { Institution } from '@/models/institutions.entity'
import {
  WhatsAppProvider,
  WhatsAppProviderConnection,
  WhatsAppProviderConnectionStatus,
} from '@/models/whatsapp-provider-connection.entity'

export interface IUpsertWhatsAppProviderConnectionInput {
  institutionId: number
  provider: WhatsAppProvider
  status: WhatsAppProviderConnectionStatus
  displayPhoneNumber?: string | null
  externalPhoneNumberId?: string | null
  connectedAt?: Date | null
  statusReason?: string | null
  wabaId?: string | null
  verifiedName?: string | null
  isSystemUser?: boolean
}

@Injectable()
export class WhatsAppProviderConnectionService {
  constructor(private readonly dataSource: DataSource) {}

  async upsertConnection(
    input: IUpsertWhatsAppProviderConnectionInput
  ): Promise<WhatsAppProviderConnection> {
    return this.dataSource.transaction(async (manager) => {
      const institutionRepository = manager.getRepository(Institution)
      const connectionRepository = manager.getRepository(WhatsAppProviderConnection)
      const institution = await institutionRepository.findOne({
        where: { id: input.institutionId },
      })

      if (!institution) {
        throw new NotFoundException(`Institution ${input.institutionId} not found.`)
      }

      const existing = await connectionRepository.findOne({
        where: { institutionId: input.institutionId },
      })

      const connection =
        existing ?? connectionRepository.create({ institutionId: input.institutionId })
      connection.provider = input.provider
      connection.status = input.status

      if (input.displayPhoneNumber !== undefined) {
        connection.displayPhoneNumber = input.displayPhoneNumber ?? undefined
      }
      if (input.externalPhoneNumberId !== undefined) {
        connection.externalPhoneNumberId = input.externalPhoneNumberId ?? undefined
      }
      if (input.statusReason !== undefined) {
        connection.statusReason = input.statusReason ?? null
      }
      if (input.wabaId !== undefined) {
        connection.wabaId = input.wabaId ?? undefined
      }
      if (input.verifiedName !== undefined) {
        connection.verifiedName = input.verifiedName ?? undefined
      }
      if (input.isSystemUser !== undefined) {
        connection.isSystemUser = input.isSystemUser
      }
      if (input.connectedAt !== undefined) {
        connection.connectedAt = input.connectedAt ?? undefined
      } else if (
        input.status === WhatsAppProviderConnectionStatus.CONNECTED &&
        !connection.connectedAt
      ) {
        connection.connectedAt = new Date()
      }

      return connectionRepository.save(connection)
    })
  }

  async disconnect(institutionId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const connectionRepository = manager.getRepository(WhatsAppProviderConnection)
      const connection = await connectionRepository.findOne({ where: { institutionId } })
      if (!connection) return

      connection.status = WhatsAppProviderConnectionStatus.DISCONNECTED
      await connectionRepository.save(connection)
    })
  }

  async getConnection(institutionId: number): Promise<WhatsAppProviderConnection | null> {
    const connectionRepository = this.dataSource.getRepository(WhatsAppProviderConnection)
    return connectionRepository.findOne({ where: { institutionId } })
  }
}
