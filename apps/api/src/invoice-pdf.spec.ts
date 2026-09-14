import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as fs from 'fs'
import * as path from 'path'

import { S3ClientFactory } from './config/s3/s3-factory.provider'
import { EmailService } from './domain/external/email.service'
import { MetaWhatsappService } from './domain/external/meta-whatsapp.service'
import { CoursesService } from './domain/service/courses.service'
import { CreditManagementService } from './domain/service/credit-management.service'
import { EnrollCoursesService } from './domain/service/enroll-courses.service'
import { InvoiceCampaignService } from './domain/service/invoice-campaign.service'
import { PaymentEvidenceService } from './domain/service/payment-evidence.service'
import { UsersService } from './domain/service/users.service'
import { ClassRepository } from './models/classes.repository'
import { DocumentCampaignRepository } from './models/document-campaign.repository'
import { DocumentCampaignRecipientsRepository } from './models/document-campaign-recipients.repository'
import { EnrollCourseRepository } from './models/enroll-courses.repository'
import { InstitutionsRepository } from './models/institutions.repository'
import { InvoiceRepository } from './models/invoice.repository'
import { PayoutMethodRepository } from './models/payout-method.entity'
import { SitesRepository } from './models/sites.repository'
import { UserAliasesRepository } from './models/user-aliases.repository'
import { SSEService } from './modules/sse/sse.service'

describe('Invoice PDF Generation', () => {
  let service: InvoiceCampaignService

  beforeAll(async () => {
    const mockPayoutMethods = [
      {
        methodName: 'Bank Transfer (International USD Wire & Local HKD Transfer)',
        methodType: 'bank_transfer',
        description: 'Please upload payment receipt after transfer is completed.',
        payoutMethodDetails: {
          bankName: 'The Hongkong and Shanghai Banking Corporation Limited (HSBC)',
          bankBranch: '004 - Central Main Branch Hong Kong',
          accountName: 'Flowsophic Cloud Educational Services Technology Limited',
          accountId: '123-456789-001 (HKD) / 987-654321-002 (USD)',
          payoutUrl:
            'https://flowclass.io/payment-portal/institution-payout-details?ref=1234567890&site=flowclass-demo-site',
          successMessage: 'Thank you for your payment. Processing takes 1 business day.',
        },
      },
      {
        methodName: 'FPS / PayMe Direct Payment',
        methodType: 'others',
        payoutMethodDetails: {
          accountName: 'Flowsophic Tech Limited',
          accountId: 'fps-id-987654321',
          payoutUrl: 'https://payme.hsbc/flowclass-demo-payme-link',
        },
      },
    ]

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceCampaignService,
        { provide: InstitutionsRepository, useValue: {} },
        { provide: EnrollCoursesService, useValue: {} },
        { provide: EnrollCourseRepository, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: SSEService, useValue: {} },
        { provide: CoursesService, useValue: {} },
        { provide: EmailService, useValue: {} },
        { provide: PaymentEvidenceService, useValue: {} },
        { provide: ClassRepository, useValue: {} },
        { provide: DocumentCampaignRepository, useValue: {} },
        { provide: DocumentCampaignRecipientsRepository, useValue: {} },
        { provide: InvoiceRepository, useValue: { findOne: async () => null } },
        { provide: UsersService, useValue: {} },
        { provide: UserAliasesRepository, useValue: {} },
        { provide: S3ClientFactory, useValue: {} },
        { provide: MetaWhatsappService, useValue: {} },
        { provide: CreditManagementService, useValue: {} },
        { provide: SitesRepository, useValue: {} },
        {
          provide: PayoutMethodRepository,
          useValue: {
            findAll: async () => mockPayoutMethods,
          },
        },
      ],
    }).compile()

    service = module.get<InvoiceCampaignService>(InvoiceCampaignService)
  })

  it('generates PDF buffer and writes to file', async () => {
    const mockInvoice: any = {
      id: 10001,
      createdAt: new Date('2026-08-01T10:00:00Z'),
      institutionId: 1,
      payBy: 'John Doe (Parent of Alex Doe)',
      originalFee: 1200,
      payAmount: 1200,
      discountAmount: 0,
      additionalFee: 0,
      usedBalance: 0,
      adminDiscounts: [],
      institution: {
        id: 1,
        name: 'Flowclass Academy',
        phone: '85291234567',
        address: {
          addressLine1: 'Unit 1201, 12/F, Cyberport 3',
          addressLine2: '100 Cyberport Road',
          area: 'Pok Fu Lam',
          state: 'Hong Kong Island',
          country: 'Hong Kong',
        },
      },
      site: {
        id: 1,
        currency: 'HKD',
        timeZone: { id: 'Asia/Hong_Kong' },
      },
      enrollCourses: [
        {
          id: 1,
          name: 'Mathematics Advanced Masterclass 2026',
          enrollInto: [
            {
              courseName: 'Core Algebra & Calculus Module',
              secondLevelName: 'Class A (Saturday 10:00 AM)',
              lessonCount: 4,
              price: 1200,
            },
          ],
          studentSchedule: [
            {
              studentLessons: [
                { startTime: '2026-08-08T10:00:00Z' },
                { startTime: '2026-08-15T10:00:00Z' },
                { startTime: '2026-08-22T10:00:00Z' },
                { startTime: '2026-08-29T10:00:00Z' },
              ],
            },
          ],
        },
      ],
    }

    const pdfBuffer = await service.createPdfBuffer(mockInvoice)
    expect(pdfBuffer).toBeInstanceOf(Buffer)
    expect(pdfBuffer.length).toBeGreaterThan(0)

    const outputPath = path.join(process.cwd(), 'test_invoice_output.pdf')
    fs.writeFileSync(outputPath, pdfBuffer)
    console.log('Saved PDF to:', outputPath)
  })
})
