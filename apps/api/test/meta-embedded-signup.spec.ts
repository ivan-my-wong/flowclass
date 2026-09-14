import { MetaEmbeddedSignupService } from '../src/domain/external/meta/meta-embedded-signup.service'
import { MetaGraphApiService } from '../src/domain/external/meta/meta-graph-api.service'

describe('MetaEmbeddedSignupService', () => {
  let service: MetaEmbeddedSignupService
  let mockMetaEmbeddedSignupRepository: any
  let mockWhatsappProviderConnectionRepository: any
  let mockWhatsappCoexistenceSyncCheckpointRepository: any
  let mockMetaGraphApiService: Partial<MetaGraphApiService>

  beforeEach(() => {
    mockMetaEmbeddedSignupRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(entity => Promise.resolve({ id: 1, ...entity })),
      update: jest.fn(),
      delete: jest.fn(),
    }

    mockWhatsappProviderConnectionRepository = {
      findOne: jest.fn(),
      save: jest.fn(entity => Promise.resolve({ id: 1, ...entity })),
      update: jest.fn(),
    }

    mockWhatsappCoexistenceSyncCheckpointRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(entity => Promise.resolve({ id: 1, ...entity })),
    }

    mockMetaGraphApiService = {
      exchangeShortLivedToken: jest.fn().mockResolvedValue('permanent_token_123'),
      getWabaIdFromToken: jest.fn().mockResolvedValue('waba_999'),
      getWabaPhoneNumbers: jest.fn().mockResolvedValue([
        { id: 'phone_123', display_phone_number: '+85257225763' },
      ]),
      registerPhoneNumber: jest.fn().mockResolvedValue({ success: true }),
      subscribeAppToWaba: jest.fn().mockResolvedValue({ success: true }),
      getWhatsAppProfile: jest.fn().mockResolvedValue({ about: 'Flowclass WhatsApp' }),
      updateWhatsAppProfile: jest.fn().mockResolvedValue({ success: true }),
    }

    service = new MetaEmbeddedSignupService(
      mockMetaEmbeddedSignupRepository as any,
      mockWhatsappProviderConnectionRepository as any,
      mockWhatsappCoexistenceSyncCheckpointRepository as any,
      mockMetaGraphApiService as any
    )
  })

  describe('initiate', () => {
    it('should generate standard embedded signup config with ezchat App ID and Config ID', async () => {
      mockMetaEmbeddedSignupRepository.findOne.mockResolvedValue(null)

      const result = await service.initiate(123, { isCoexistence: false })

      expect(result.appId).toBe('1169305084905353')
      expect(result.configId).toBe('896013446059431')
      expect(result.graphApiVersion).toBe('v24.0')
      expect(result.extras).toBeUndefined()
    })

    it('should generate coexistence embedded signup config when isCoexistence is true', async () => {
      mockMetaEmbeddedSignupRepository.findOne.mockResolvedValue(null)

      const result = await service.initiate(123, { isCoexistence: true })

      expect(result.appId).toBe('1169305084905353')
      expect(result.configId).toBe('896013446059431')
      expect(result.extras).toEqual({
        featureType: 'whatsapp_business_app_onboarding',
        setup: {
          clientName: 'Institution 123',
        },
      })
    })
  })

  describe('complete', () => {
    it('should complete onboarding by exchanging token and saving provider connection', async () => {
      const existingSignup = {
        id: 1,
        institutionId: 123,
        status: 'initiated',
        isCoexistence: true,
      }
      mockMetaEmbeddedSignupRepository.findOne.mockResolvedValue(existingSignup)

      const result = await service.complete(123, {
        code: 'mock_fb_auth_code',
        sessionInfo: {
          waba_id: 'waba_999',
          phone_number_id: 'phone_123',
        },
      })

      expect(mockMetaGraphApiService.exchangeShortLivedToken).toHaveBeenCalledWith('mock_fb_auth_code')
      expect(mockWhatsappProviderConnectionRepository.save).toHaveBeenCalled()
      expect(mockMetaGraphApiService.registerPhoneNumber).toHaveBeenCalledWith(
        'phone_123',
        'permanent_token_123',
        undefined
      )
      expect(result.status).toBe('completed')
    })
  })

  describe('getStatus', () => {
    it('should return connected status if active signup exists', async () => {
      mockMetaEmbeddedSignupRepository.findOne.mockResolvedValue({
        id: 1,
        institutionId: 123,
        status: 'completed',
        wabaId: 'waba_999',
        phoneNumberId: 'phone_123',
        displayPhoneNumber: '+85257225763',
        isCoexistence: true,
      })

      const status = await service.getStatus(123)

      expect(status.status).toBe('completed')
      expect(status.wabaId).toBe('waba_999')
      expect(status.isCoexistence).toBe(true)
    })
  })
})
