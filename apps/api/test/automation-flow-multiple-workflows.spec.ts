import { AutomationFlowService } from '@/domain/service/automation-flow.service'
import { InstitutionsService } from '@/domain/service/institutions.service'
import { AutomationFlowStep } from '@/models/automation-flow-step.entity'
import { AutomationFlow } from '@/models/automation-flow.entity'
import { InstitutionAutomationFlow } from '@/models/institution-automation-flow.entity'
import { Institution } from '@/models/institutions.entity'
import { N8nService } from '@/modules/n8n-integration/n8n-integration.service'
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

describe('AutomationFlowService - Multiple Workflows Prevention', () => {
  let service: AutomationFlowService
  let institutionsService: InstitutionsService
  let n8nService: N8nService
  let institutionRepository: Repository<Institution>
  let automationFlowRepository: Repository<AutomationFlow>

  const mockInstitution = {
    id: 1,
    name: 'Test Institution',
    n8nWorkflowId: null,
    site: { id: 1, siteSettings: [] },
  }

  const mockWorkflow = {
    id: 'workflow-123',
    name: '[PRODUCTION ACTIVE PAID] Test Institution',
    nodes: [],
    connections: {},
    settings: { executionOrder: 'v1' },
  }

  const mockAutomationFlowPayload = {
    name: 'Test Flow',
    frequencyCron: '0 0 * * *',
    enabled: true,
    steps: [
      {
        order: 1,
        nodeType: 'trigger',
        nodeName: 'Test Trigger',
        nodeParameters: {},
      },
    ],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationFlowService,
        {
          provide: InstitutionsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: N8nService,
          useValue: {
            getWorkflow: jest.fn(),
            createWorkflow: jest.fn(),
            updateWorkflow: jest.fn(),
            activateWorkflow: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Institution),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(AutomationFlow),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(AutomationFlowStep),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(InstitutionAutomationFlow),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AutomationFlowService>(AutomationFlowService)
    institutionsService = module.get<InstitutionsService>(InstitutionsService)
    n8nService = module.get<N8nService>(N8nService)
    institutionRepository = module.get<Repository<Institution>>(getRepositoryToken(Institution))
    automationFlowRepository = module.get<Repository<AutomationFlow>>(getRepositoryToken(AutomationFlow))
  })

  describe('createNewAutomationFlow', () => {
    it('should create only one workflow per institution', async () => {
      // Mock institution without workflow
      const institutionWithoutWorkflow = { ...mockInstitution, n8nWorkflowId: null }
      jest.spyOn(institutionRepository, 'findOne').mockResolvedValue(institutionWithoutWorkflow as Institution)
      
      // Mock n8n service responses
      jest.spyOn(n8nService, 'getWorkflow').mockRejectedValue(new Error('Workflow not found'))
      jest.spyOn(n8nService, 'createWorkflow').mockResolvedValue({ data: mockWorkflow })
      jest.spyOn(n8nService, 'updateWorkflow').mockResolvedValue({ data: mockWorkflow })
      jest.spyOn(n8nService, 'activateWorkflow').mockResolvedValue({ data: {} })

      // Mock repository responses
      jest.spyOn(automationFlowRepository, 'count').mockResolvedValue(0)
      jest.spyOn(automationFlowRepository, 'create').mockReturnValue({} as AutomationFlow)
      jest.spyOn(automationFlowRepository, 'save').mockResolvedValue({} as AutomationFlow)

      // Mock transaction
      jest.spyOn(automationFlowRepository.manager, 'transaction').mockImplementation(async (callback) => {
        return await callback({
          findOne: jest.fn().mockResolvedValue(institutionWithoutWorkflow),
          count: jest.fn().mockResolvedValue(0),
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue({}),
        })
      })

      // Create first automation flow
      await service.createNewAutomationFlow(1, mockAutomationFlowPayload)

      // Verify that createWorkflow was called only once
      expect(n8nService.createWorkflow).toHaveBeenCalledTimes(1)

      // Verify that institution was updated with workflow ID
      expect(institutionRepository.update).toHaveBeenCalledWith(1, {
        n8nWorkflowId: mockWorkflow.id,
      })
    })

    it('should reuse existing workflow when institution already has one', async () => {
      // Mock institution with existing workflow
      const institutionWithWorkflow = { ...mockInstitution, n8nWorkflowId: 'existing-workflow-123' }
      jest.spyOn(institutionRepository, 'findOne').mockResolvedValue(institutionWithWorkflow as Institution)
      
      // Mock n8n service responses
      jest.spyOn(n8nService, 'getWorkflow').mockResolvedValue({ data: mockWorkflow })
      jest.spyOn(n8nService, 'createWorkflow').mockResolvedValue({ data: mockWorkflow })
      jest.spyOn(n8nService, 'updateWorkflow').mockResolvedValue({ data: mockWorkflow })

      // Mock repository responses
      jest.spyOn(automationFlowRepository, 'count').mockResolvedValue(1)
      jest.spyOn(automationFlowRepository, 'create').mockReturnValue({} as AutomationFlow)
      jest.spyOn(automationFlowRepository, 'save').mockResolvedValue({} as AutomationFlow)

      // Mock transaction
      jest.spyOn(automationFlowRepository.manager, 'transaction').mockImplementation(async (callback) => {
        return await callback({
          findOne: jest.fn().mockResolvedValue(institutionWithWorkflow),
          count: jest.fn().mockResolvedValue(1),
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue({}),
        })
      })

      // Create automation flow
      await service.createNewAutomationFlow(1, mockAutomationFlowPayload)

      // Verify that getWorkflow was called to check existing workflow
      expect(n8nService.getWorkflow).toHaveBeenCalledWith('existing-workflow-123')

      // Verify that createWorkflow was NOT called (reused existing)
      expect(n8nService.createWorkflow).not.toHaveBeenCalled()
    })

    it('should handle race condition when workflow is created by another process', async () => {
      // Mock institution without workflow initially
      const institutionWithoutWorkflow = { ...mockInstitution, n8nWorkflowId: null }
      const institutionWithWorkflow = { ...mockInstitution, n8nWorkflowId: 'race-condition-workflow-123' }
      
      // Mock repository to return different states on subsequent calls
      jest.spyOn(institutionRepository, 'findOne')
        .mockResolvedValueOnce(institutionWithoutWorkflow as Institution)
        .mockResolvedValueOnce(institutionWithWorkflow as Institution)
      
      // Mock n8n service responses
      jest.spyOn(n8nService, 'getWorkflow')
        .mockRejectedValueOnce(new Error('Workflow not found'))
        .mockResolvedValueOnce({ data: { ...mockWorkflow, id: 'race-condition-workflow-123' } })
      jest.spyOn(n8nService, 'createWorkflow').mockResolvedValue({ data: mockWorkflow })

      // Mock repository responses
      jest.spyOn(automationFlowRepository, 'count').mockResolvedValue(0)
      jest.spyOn(automationFlowRepository, 'create').mockReturnValue({} as AutomationFlow)
      jest.spyOn(automationFlowRepository, 'save').mockResolvedValue({} as AutomationFlow)

      // Mock transaction
      jest.spyOn(automationFlowRepository.manager, 'transaction').mockImplementation(async (callback) => {
        return await callback({
          findOne: jest.fn().mockResolvedValue(institutionWithoutWorkflow),
          count: jest.fn().mockResolvedValue(0),
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue({}),
        })
      })

      // Create automation flow
      await service.createNewAutomationFlow(1, mockAutomationFlowPayload)

      // Verify that the race condition was handled properly
      expect(n8nService.getWorkflow).toHaveBeenCalledTimes(2)
      expect(n8nService.createWorkflow).not.toHaveBeenCalled()
    })

    it('should throw error when institution is not found', async () => {
      // Mock repository to return null (institution not found)
      jest.spyOn(institutionRepository, 'findOne').mockResolvedValue(null)

      // Mock transaction
      jest.spyOn(automationFlowRepository.manager, 'transaction').mockImplementation(async (callback) => {
        return await callback({
          findOne: jest.fn().mockResolvedValue(null),
          count: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        })
      })

      // Attempt to create automation flow
      await expect(service.createNewAutomationFlow(999, mockAutomationFlowPayload))
        .rejects.toThrow(BadRequestException)
    })
  })

  describe('getOrCreateInstitutionWorkflow', () => {
    it('should validate workflow existence before creating new one', async () => {
      const institutionWithoutWorkflow = { ...mockInstitution, n8nWorkflowId: null }
      
      jest.spyOn(institutionRepository, 'findOne').mockResolvedValue(institutionWithoutWorkflow as Institution)
      jest.spyOn(n8nService, 'getWorkflow').mockRejectedValue(new Error('Workflow not found'))
      jest.spyOn(n8nService, 'createWorkflow').mockResolvedValue({ data: mockWorkflow })

      // Access private method for testing
      const getOrCreateInstitutionWorkflow = (service as any).getOrCreateInstitutionWorkflow.bind(service)
      const result = await getOrCreateInstitutionWorkflow(institutionWithoutWorkflow)

      expect(result).toEqual(mockWorkflow)
      expect(n8nService.createWorkflow).toHaveBeenCalledWith({
        name: '[PRODUCTION ACTIVE PAID] Test Institution',
        nodes: [],
        connections: {},
        settings: { executionOrder: 'v1' },
      })
    })
  })
})
