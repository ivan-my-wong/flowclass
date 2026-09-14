import { MetaEmbeddedSignupStatus } from '@/models/meta-embedded-signup.entity'
import {
  WhatsAppProvider,
  WhatsAppProviderConnectionStatus,
} from '@/models/whatsapp-provider-connection.entity'

import { MetaService } from './meta.service'
import { MetaGraphApiService } from './meta-graph-api.service'
import { WhatsAppProviderConnectionService } from './whatsapp-provider-connection.service'
import { WhatsAppProviderCredentialService } from './whatsapp-provider-credential.service'

describe('MetaService - Embedded Signup & Coexistence', () => {
  let service: MetaService
  let mockInstitutionsRepository: any
  let mockMetaEmbeddedSignupRepository: any
  let mockWhatsappProviderConnectionService: Partial<WhatsAppProviderConnectionService>
  let mockWhatsappProviderCredentialService: Partial<WhatsAppProviderCredentialService>
  let mockMetaGraphApiService: Partial<MetaGraphApiService>

  beforeEach(() => {
    mockInstitutionsRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Flowclass Test Academy' }),
    }

    mockMetaEmbeddedSignupRepository = {
      findByInstitutionId: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => ({ ...data })),
      save: jest.fn((data) => Promise.resolve({ id: 1, ...data })),
      findOne: jest.fn(),
    }

    mockWhatsappProviderConnectionService = {
      upsertConnection: jest.fn().mockResolvedValue({
        id: 1,
        institutionId: 1,
        provider: WhatsAppProvider.META_CLOUD,
        status: WhatsAppProviderConnectionStatus.CONNECTED,
      } as any),
      getConnection: jest.fn().mockResolvedValue({
        id: 1,
        institutionId: 1,
        provider: WhatsAppProvider.META_CLOUD,
        status: WhatsAppProviderConnectionStatus.CONNECTED,
      } as any),
      disconnect: jest.fn().mockResolvedValue(undefined),
    }

    mockWhatsappProviderCredentialService = {
      upsertMeta: jest.fn().mockResolvedValue(undefined),
      getMeta: jest.fn().mockResolvedValue({ accessToken: 'permanent_system_user_token' }),
    }

    mockMetaGraphApiService = {
      exchangeAuthorizationCode: jest.fn().mockResolvedValue({
        accessToken: 'permanent_access_token_123',
        tokenType: 'bearer',
      }),
      getAccessibleWaba: jest.fn().mockResolvedValue({
        id: 'waba_999',
        name: 'Flowclass WhatsApp WABA',
      }),
      getPhoneNumber: jest.fn().mockResolvedValue({
        id: 'phone_123',
        display_phone_number: '+85257225763',
        verified_name: 'Flowclass Test Academy',
      }),
      getPhoneNumbers: jest
        .fn()
        .mockResolvedValue([{ id: 'phone_123', display_phone_number: '+85257225763' }]),
      registerPhoneNumber: jest.fn().mockResolvedValue(undefined),
      subscribeWaba: jest.fn().mockResolvedValue(undefined),
      triggerCoexistenceSync: jest.fn().mockResolvedValue({ success: true }),
    }

    service = new MetaService(
      mockInstitutionsRepository as any,
      mockMetaEmbeddedSignupRepository as any,
      mockWhatsappProviderConnectionService as any,
      mockWhatsappProviderCredentialService as any,
      mockMetaGraphApiService as any
    )
  })

  describe('initiateEmbeddedSignup', () => {
    it('should generate standard embedded signup config with ezchat App ID and Config ID', async () => {
      const result = await service.initiateEmbeddedSignup({
        institutionId: 1,
        isCoexistence: false,
      })

      expect(result.configuration.appId).toBe('1169305084905353')
      expect(result.configuration.configurationId).toBe('896013446059431')
      expect(result.configuration.graphApiVersion).toBe('v24.0')
      expect(result.embeddedSignup.isCoexistence).toBe(false)
      expect(result.embeddedSignup.status).toBe(MetaEmbeddedSignupStatus.META_AUTH_PENDING)
    })

    it('should initialize coexistence mode flag when isCoexistence is true', async () => {
      const result = await service.initiateEmbeddedSignup({
        institutionId: 1,
        isCoexistence: true,
      })

      expect(result.configuration.appId).toBe('1169305084905353')
      expect(result.configuration.configurationId).toBe('896013446059431')
      expect(result.embeddedSignup.isCoexistence).toBe(true)
    })
  })

  describe('completeEmbeddedSignup', () => {
    it('should exchange authorization code, register phone number and provision connection', async () => {
      const existingSignup = {
        id: 1,
        institutionId: 1,
        status: MetaEmbeddedSignupStatus.META_AUTH_PENDING,
        embeddedSignupState: 'state_123',
        stateExpiresAt: new Date(Date.now() + 60000),
        isCoexistence: true,
      }
      mockMetaEmbeddedSignupRepository.findByInstitutionId.mockResolvedValue(existingSignup)

      const result = await service.completeEmbeddedSignup({
        institutionId: 1,
        authorizationCode: 'auth_code_from_meta',
        state: 'state_123',
        wabaId: 'waba_999',
        phoneNumberId: 'phone_123',
      })

      expect(mockMetaGraphApiService.exchangeAuthorizationCode).toHaveBeenCalledWith(
        'auth_code_from_meta',
        ''
      )
      expect(mockMetaGraphApiService.registerPhoneNumber).toHaveBeenCalledWith(
        'phone_123',
        expect.any(String),
        'permanent_access_token_123'
      )
      expect(result.status).toBe(MetaEmbeddedSignupStatus.CONNECTED)
    })
  })
})
