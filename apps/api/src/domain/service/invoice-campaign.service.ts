/* eslint-disable simple-import-sort/imports */
import {
  CreateInvoiceCampaignDto,
  DiscountInvoices,
  InvoiceCampaignDto,
  InvoiceItem,
  InvoiceSplitType,
  PageParamsDto,
  PromotionType,
  RecipientDto,
  ResendInvoiceDto,
  SendCampaignSteps,
  SendingCampaignStatus,
  SendingInvoiceData,
  SendInvoiceDirectlyDto,
  SendInvoiceDto,
  SyncEnrollCoursesDto,
} from '@/application/admin/invoice-campaign/dto/send-invoice.dto'
import {
  DocumentCampaignRecipientsStatus,
  DocumentRecipientsChannel,
} from '@/models/document-campaign-recipients.entity'
import { DocumentCampaignRecipientsRepository } from '@/models/document-campaign-recipients.repository'
import { DocumentCampaignRepository } from '@/models/document-campaign.repository'
import { Invoice } from '@/models/invoice.entity'
import { InvoicePromotionUsed } from '@/models/invoice-promotion-used.entity'
import { InvoicePromotionUsedRepository } from '@/models/invoice-promotion-used.repository'
import { InvoiceRepository } from '@/models/invoice.repository'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import PDFDocument from 'pdfkit'

import { ObjectStorageProvider } from '@/config/storage/object-storage.provider'
import { DocumentCampaign, DocumentCampaignStatus } from '@/models/document-campaign.entity'
import { DocumentTemplateType } from '@/models/document-template.entity'
import { UserAlias } from '@/models/user-aliases.entity'
import dayjs from 'dayjs'
import 'dayjs/plugin/timezone'
import { NodemailerEmailTransport } from '@/domain/external/email-transport.provider'

import {
  MetaRef,
  StudentClassInfo,
  StudentConfirmEnrollDto,
  StudentCreateEnrollCourseDto,
  StudentMetaRefExtended,
  StudentMultipleClassInfo,
} from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { InvoiceErrorMessage } from '@/exceptions/error-message/invoice'
import { ClassRepository } from '@/models/classes.repository'
import { Course } from '@/models/courses.entity'
import { CreditSourceType } from '@/models/credit-transactions.entity'
import { ReminderDataType, StudentEnrollCourseAlias } from '@/models/custom-types/enroll-course'
import { EnrollClassMapping, EnrollCourse } from '@/models/enroll-courses.entity'
import {
  EnrollClassMappingRepository,
  EnrollCourseRepository,
} from '@/models/enroll-courses.repository'
import {
  ClassTypeEnum,
  DiscountType,
  EnrollConfirmStatus,
  FeeModeType,
  PaymentMethod,
  PaymentStatus,
  PriceType,
  PromotionType as PromotionTypeEnum,
} from '@/models/enums'

import { SendPaymentActions } from '@/application/admin/payment-evidence/dto/confirm-state-payment-evidence.dto'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { User } from '@/models/user.entity'
import { SSEService } from '@/modules/sse/sse.service'
import { calculateClassPrice } from '@/utils/courses.utils'
import { buildCmsUploadReceiptLink, buildUploadReceiptLink } from '@/utils/payment-link.utils'
import { shallow } from '@/utils/shallow.utils'
import { studentScheduleToString } from '@/utils/string.utils'
import { calculateBillingEndDate, calculateBillingNextDate } from '@/utils/time.utils'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { plainToInstance } from 'class-transformer'
import { randomUUID } from 'crypto'
import { FindOptionsWhere, ILike, In } from 'typeorm'
import { EmailService } from '../external/email.service'
import { CoursesService } from './courses.service'
import { CreditManagementService } from './credit-management.service'
import { EnrollCoursesService } from './enroll-courses.service'
import { PaymentEvidenceService } from './payment-evidence.service'
import { UsersService } from './users.service'
import { WhatsappWebService } from './whatsapp-web.service'
import { SitesRepository } from '@/models/sites.repository'
import parsePhoneNumberFromString from 'libphonenumber-js'

export type InvoiceCampaign = DocumentCampaign & { invoices: Invoice[] }
export const SupportedVariables = [
  'studentName',
  'invoiceNumber',
  'invoiceDate',
  'dueDate',
  'payAmount',
  'uploadPaymentUrl',
]
export type ReminderMapValue = {
  reminderData: ReminderDataType
  multipleClassInfo: StudentMultipleClassInfo
  createEnrollCourseDto: StudentCreateEnrollCourseDto
  successfulAccounts: StudentEnrollCourseAlias
}

const SELECT_INVOICE_FIELDS = {
  id: true,
  siteId: true,
  institutionId: true,
  courseId: true,
  // enrollId is deprecated - use enrollCourses relation instead
  enrollCourses: true,
  userId: true,
  userAliasId: true,
  paymentState: true,
  paymentMethod: true,
  paymentLinkId: true,
  priceOptionId: true,
  feePerLesson: true,
  numOfLesson: true,
  numOfApplicant: true,
  originalFee: true,
  payAmount: true,
  currency: true,
  // course: {
  //   id: true,
  //   name: true,
  // },
  payBy: true,
  payById: true,
  discounts: true,
  discountAmount: true,
  additionalFee: true,
  reviewed: true,
  approvedBy: true,
  approverId: true,
  proofToken: true,
  transactionId: true,
  applicants: true,
  invoiceParentId: true,
  isParent: true,
  isCombined: true,
  discountDetails: true,
  invoiceIds: true,
  splitType: true,
  splitItems: true,
  adminDiscounts: true,
  documentCampaignId: true,
  usedBalance: true,
  creditTransactionsId: true,
  pdfUrl: true,
  institution: {
    id: true,
    name: true,
    email: true,
    phone: true,
    address: true,
    logo: true,
  },
  site: {
    id: true,
    name: true,
    email: true,
    phone: true,
  },
  userAlias: {
    id: true,
    userId: true,
    institutionId: true,
    refUserId: true,
    name: true,
    email: true,
    isPrimary: true,
    isStudentParent: true,
    childOfUserAliasId: true,
  },
  user: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
  },
}
@Injectable()
export class InvoiceCampaignService {
  private readonly logger = new Logger(InvoiceCampaignService.name)
  private readonly emailTransport: NodemailerEmailTransport

  private readonly jwtOption: JwtSignOptions = {}
  constructor(
    private readonly institutionRepository: InstitutionsRepository,
    private readonly enrollCourseService: EnrollCoursesService,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly enrollClassMappingRepository: EnrollClassMappingRepository,
    private readonly jwtService: JwtService,
    private readonly sseService: SSEService,
    private readonly courseService: CoursesService,
    private readonly emailService: EmailService,
    private readonly paymentEvidenceService: PaymentEvidenceService,
    private readonly classRepository: ClassRepository,
    private readonly documentCampaignRepository: DocumentCampaignRepository,
    private readonly documentRecipientRepository: DocumentCampaignRecipientsRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly userService: UsersService,
    private readonly userAliasRepository: UserAliasesRepository,
    private readonly objectStorageProvider: ObjectStorageProvider,
    private readonly whatsappWebService: WhatsappWebService,
    private readonly creditManagementService: CreditManagementService,
    private readonly sitesRepository: SitesRepository,
    private readonly invoicePromotionUsedRepository: InvoicePromotionUsedRepository,
    private readonly studentLessonRepository: StudentLessonRepository
  ) {
    this.emailTransport = new NodemailerEmailTransport()
    this.jwtOption = {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    }
  }

  async getInvoiceCampaigns(
    institutionId: number,
    filter: PageParamsDto
  ): Promise<{ data: DocumentCampaign[]; total: number }> {
    const where: FindOptionsWhere<DocumentCampaign> = {
      institutionId,
      type: DocumentTemplateType.INVOICE,
    }
    if (filter?.status && filter.status !== 'all') {
      where.status = filter.status as DocumentCampaignStatus
    }
    if (filter?.search) {
      where.title = ILike(`%${filter.search}%`) // Or use Like if supported
      // For partial match, use Like:
      // where.title = Like(`%${filter.search}%`)
    }
    const page = Math.max(1, Number.parseInt(String(filter?.page ?? 1), 10))
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(filter?.limit ?? 20), 10)))
    const [data, total] = await this.documentCampaignRepository.findAndCount({
      where,
      relations: {
        recipientList: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    })
    return { data, total }
  }

  async getInvoiceById(invoiceId: number, institutionId: number) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId, institutionId },
      relations: {
        childInvoices: {
          course: true,
        },
        parentInvoice: {
          userAlias: true,
        },
        enrollCourses: {
          course: true,
          multipleClassMapping: true,
          priceOption: true,
          studentSchedule: {
            studentLessons: true,
          },
          // Required for grouping the PDF's items table by student on
          // combined invoices (one invoice ↔ many students).
          userAlias: true,
        },
        // Per-discount breakdown for the PDF summary — mirrors what
        // DialogSendInvoice's AppliedDiscount section renders.
        invoicePromotionsUsed: true,
        user: true,
        institution: true,
        userAlias: true,
        course: true,
        site: true,
      },
    })
    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID ${invoiceId} not found for institution ${institutionId}`
      )
    }
    return invoice
  }

  async getOneInvoiceCampaign(documentCampaignId: number, institutionId: number) {
    const documentCampaign = await this.documentCampaignRepository.findOne({
      where: { id: documentCampaignId, institutionId },
      relations: {
        recipientList: {
          student: {
            user: true,
            parentUserAlias: {
              user: true,
            },
          },
          invoice: true,
        },
        institution: true,
      },
    })
    if (!documentCampaign) {
      throw new NotFoundException(
        `Document template with ID ${documentCampaignId} not found for institution ${institutionId}`
      )
    }
    return documentCampaign
  }

  async createInvoicesForInvoiceCampaign(
    document: DocumentCampaign,
    dto: CreateInvoiceCampaignDto,
    institutionId: number,
    invoiceIds: number[],
    jobId: string,
    processingData?: SendingInvoiceData[],
    createdByUserId?: number
  ): Promise<{
    invoicesResult: Invoice[]
    processingData: SendingInvoiceData[]
  }> {
    const invoicesDto = dto.invoices ?? document.metadata?.invoices

    const invoicesResult: Invoice[] = []

    for (const service of invoicesDto) {
      if (!service) {
        continue
      }

      // ✅ Initialize processing data without invoiceNumber (will be set after invoice creation)
      processingData?.push({
        email: service.email,
        name: service.name,
        phone: service?.phone,
        amount: (service.total || 0).toString(),
        invoiceNumber: undefined, // Will be set after invoice is created
      })

      // ✅ Don't emit event yet - wait until invoice is created to avoid showing "N/A"
      let error: Error | null = null
      let parentInvoice: Invoice | null = null

      const findIndex = processingData?.findIndex((item) => item?.email === service?.email)

      try {
        this.logger.log(`Creating invoice for Student: ${service.name}`)

        if (!document.isCombined && (!service.classes || service.classes.length === 0)) {
          this.logger.warn(`No classes found for Student: ${service.name}`)
          continue
        }

        const { invoice: pInvoice, processingData: data } = await this.createNewInvoice(
          institutionId,
          document.id,
          document.isCombined,
          service,
          jobId,
          invoiceIds,
          processingData,
          createdByUserId
        )
        this.logger.log(`Invoice created for Student: ${service.name}`)
        parentInvoice = pInvoice
        processingData = data
        if (!parentInvoice) {
          continue
        }

        if (parentInvoice.usedBalance > 0 && document?.metadata?.invoices?.length) {
          document.metadata.invoices = document.metadata.invoices.map((inv: InvoiceItem) => {
            if (inv.userAliasId === parentInvoice.userAliasId)
              return {
                ...inv,
                usedBalance: parentInvoice.usedBalance,
                currency: parentInvoice.currency,
              }
            return inv
          })
          await this.documentCampaignRepository.save(document)
        }
      } catch (err) {
        error = err as Error
        console.log(err)
      }
      if (error || !parentInvoice) {
        if (findIndex !== undefined && findIndex >= 0 && processingData) {
          processingData[findIndex] = {
            ...processingData[findIndex],
            invoiceNumber: undefined,
            status: SendingCampaignStatus.FAILED,
            message: error?.message ?? 'Invoice creation failed',
          }
        }
        this.emitSendCampaignSseEvent({
          jobId,
          step: SendCampaignSteps.CREATING_INVOICES,
          data: processingData,
        })
        continue
      }
      if (findIndex !== undefined && findIndex >= 0 && processingData) {
        processingData[findIndex] = {
          ...processingData[findIndex],
          invoiceNumber: `INV#${parentInvoice.id}`,
          amount: (parentInvoice?.payAmount || 0).toString(),
          status: SendingCampaignStatus.CREATED,
          message: null,
        }
      }
      this.emitSendCampaignSseEvent({
        jobId,
        step: SendCampaignSteps.CREATING_INVOICES,
        data: processingData,
      })
      invoicesResult.push(parentInvoice)
    }
    return { invoicesResult, processingData }
  }

  async createInvoice(dto: InvoiceCampaignDto, institutionId: number) {
    const documentTemplate = this.documentCampaignRepository.create({
      institutionId,
      title: dto.title,
      type: DocumentTemplateType.INVOICE,
      isCombined: dto.isCombined,
      emailSubject: dto.emailSubject,
      emailBody: dto.emailBody,
      sendViaEmail: dto.sendViaEmail,
      sendViaWhatsapp: dto.sendViaWhatsapp,
      whatsappContent: dto.whatsappContent,
      recipients: 0,
      status: DocumentCampaignStatus.PENDING,
      metadata: {
        invoices: dto.invoices,
      },
    })
    return this.documentCampaignRepository.save(documentTemplate)
  }

  async getDetailInvoiceCampaign(
    documentId: number,
    institutionId: number
  ): Promise<InvoiceCampaign> {
    const documentCampaign = await this.getOneInvoiceCampaign(documentId, institutionId)
    const invoiceCampaign = {
      ...documentCampaign,
      invoices: [],
    }
    if (documentCampaign.invoiceIds)
      invoiceCampaign.invoices = await this.getInvoicesByIds(documentCampaign.invoiceIds, true)
    else invoiceCampaign.invoices = []
    return invoiceCampaign
  }

  async getInvoicesByIds(invoiceIds: number[], withEnrollCourse = false) {
    const enrollCourseRelations = {
      course: true,
      multipleClassMapping: {
        class: true,
      },
      studentSchedule: {
        studentLessons: true,
      },
      priceOption: true,
      userAlias: true,
      student: true,
    }
    const invoiceRelations = {
      institution: true,
      site: true,
      course: true,
      userAlias: true,
      user: true,
      invoicePromotionsUsed: true,
      // enrollCourse: enrollCourseRelations,
    }
    if (withEnrollCourse) {
      invoiceRelations['enrollCourses'] = enrollCourseRelations
    }
    return this.invoiceRepository.find({
      where: {
        id: In(invoiceIds),
      },
      relations: {
        ...invoiceRelations,
        childInvoices: {
          ...invoiceRelations,
        },
      },
      select: {
        ...SELECT_INVOICE_FIELDS,
        childInvoices: SELECT_INVOICE_FIELDS as any,
        enrollCourses: {
          id: true,
          name: true,
          courseId: true,
          enrollInto: true,
          priceOption: {
            id: true,
            amount: true,
            priceType: true,
            numberOfLessons: true,
          },
          multipleClassMapping: {
            lessonPrice: true,
            id: true,
            class: {
              id: true,
              name: true,
            },
          },
        },
      } as any,
    })
  }

  async updateInvoiceCampaign(
    dto: Partial<CreateInvoiceCampaignDto>,
    documentId: number,
    institutionId: number
  ) {
    const documentCampaign = await this.getOneInvoiceCampaign(documentId, institutionId)
    for (const key in dto) {
      if (Object.prototype.hasOwnProperty.call(documentCampaign, key) && key !== 'invoices') {
        // Avoid overwriting invoices directly
        // This is to prevent accidental loss of invoice data
        documentCampaign[key] = dto[key]
      } else if (key === 'invoices') {
        documentCampaign.metadata = {
          invoices: dto.invoices,
        }
      }
    }
    return this.documentCampaignRepository.save(documentCampaign)
  }

  async syncEnrollCoursesForCampaign(
    documentId: number,
    institutionId: number,
    dto: SyncEnrollCoursesDto
  ) {
    await this.getOneInvoiceCampaign(documentId, institutionId)

    for (const diff of dto.diffs) {
      const { invoiceId, addedClasses = [], removedClassIds = [] } = diff
      if (!addedClasses.length && !removedClassIds.length) continue

      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
        relations: { enrollCourses: { multipleClassMapping: true } },
      })
      if (!invoice?.enrollCourses?.length) continue

      const enrollCourse = invoice.enrollCourses[0]

      if (removedClassIds.length > 0) {
        const mappingsToRemove = (enrollCourse.multipleClassMapping ?? []).filter((m) =>
          removedClassIds.includes(m.classId)
        )
        for (const mapping of mappingsToRemove) {
          await this.enrollClassMappingRepository.delete(mapping.id)
        }
      }

      for (const cls of addedClasses) {
        if (!cls.classId) continue
        const alreadyMapped = (enrollCourse.multipleClassMapping ?? []).some(
          (m) => m.classId === cls.classId
        )
        if (alreadyMapped) continue
        const newMapping = this.enrollClassMappingRepository.create({
          enrollCourseId: enrollCourse.id,
          classId: cls.classId,
          lessonPrice: cls.lessonPrice ?? 0,
        } as Partial<EnrollClassMapping>)
        await this.enrollClassMappingRepository.save(newMapping)
      }
    }
  }

  async createDocumentCampaignRecipients(
    institutionId: number,
    documentTemplateId: number,
    recipients: RecipientDto[]
  ) {
    for (const recipientDto of recipients) {
      const user = await this.userService.findUserByStudentPrimaryIdentifier({
        firstName: recipientDto.name,
        email: recipientDto.email,
        phone: recipientDto.phone,
        institutionId,
      })
      if (!user) {
        throw new NotFoundException(
          `User with email ${recipientDto.email} not found in institution ${institutionId}`
        )
      }
      const { userAlias } = user
      const recipient = this.documentRecipientRepository.create({
        campaignId: documentTemplateId,
        studentId: userAlias.id,
        status: DocumentCampaignRecipientsStatus.PENDING,
        institutionId,
      })
      await this.documentRecipientRepository.save(recipient)
    }
  }

  async sendInvoiceSynchronous(
    documentCampaignId: number,
    institutionId: number,
    dto: SendInvoiceDto,
    createdByUserId: number
  ) {
    const jobId = randomUUID()
    const documentCampaign = await this.getOneInvoiceCampaign(documentCampaignId, institutionId)
    this.sendInvoices(documentCampaign, institutionId, dto, jobId, createdByUserId)

    return {
      jobId,
      document: documentCampaign,
    }
  }

  /**
   * Edit and re-send an already-sent invoice campaign.
   *
   * Unlike `sendInvoiceSynchronous` (which is used for first-time sends),
   * this method validates that the campaign already has linked invoice records
   * (invoiceIds). Those existing invoices are updated in-place, preserving
   * the original `amountPaid` and setting `paymentState` to PARTIALLY_PAID
   * when the new total exceeds what was already collected.
   */
  async editAndResendInvoiceCampaign(
    documentCampaignId: number,
    institutionId: number,
    dto: SendInvoiceDto,
    createdByUserId: number
  ) {
    const documentCampaign = await this.getOneInvoiceCampaign(documentCampaignId, institutionId)

    if (!documentCampaign.invoiceIds?.length) {
      throw new NotFoundException(
        `Campaign ${documentCampaignId} has no existing invoices. Use /send-campaign for the initial send.`
      )
    }

    const jobId = randomUUID()
    this.sendInvoices(documentCampaign, institutionId, dto, jobId, createdByUserId)

    return {
      jobId,
      document: documentCampaign,
    }
  }

  async sendInvoices(
    documentCampaign: DocumentCampaign,
    institutionId: number,
    dto: SendInvoiceDto,
    jobId?: string,
    createdByUserId?: number
  ) {
    let processingData = []
    let atLeastOneSent = false
    // Reset
    this.mapStudentCreateEnrollCourse = new Map()
    // Implement your business logic here, e.g., send invoices for the campaign
    try {
      const { recipients } = dto
      if (recipients.length === 0) {
        throw new NotFoundException(
          `No recipients found for document campaign with ID ${documentCampaign?.id} in institution ${institutionId}`
        )
      }
      if (jobId) {
        documentCampaign.jobId = jobId
      }
      for (const key in dto) {
        // If key is property of documentCampaign then assign
        if (
          Object.prototype.hasOwnProperty.call(documentCampaign, key) &&
          key !== 'recipients' &&
          key !== 'invoices'
        ) {
          documentCampaign[key] = dto[key]
        }
      }
      documentCampaign.recipients = recipients.length
      documentCampaign.isSentOnly = recipients.length === 1
      await this.documentCampaignRepository.save(documentCampaign)
      const invoiceIds = documentCampaign.invoiceIds || []
      try {
        const { invoicesResult: resInvoices, processingData: data } =
          await this.createInvoicesForInvoiceCampaign(
            documentCampaign,
            dto,
            institutionId,
            invoiceIds,
            jobId,
            processingData,
            createdByUserId
          )
        processingData = data
        documentCampaign.invoiceIds = resInvoices.map((invoice) => invoice.id)
      } catch (error) {
        this.logger.error('Error creating invoices for document campaign', error)
      }

      if (documentCampaign.invoiceIds?.length <= 0) {
        return
      }
      const invoices = await this.getInvoicesByIds(documentCampaign.invoiceIds ?? [], true)
      await this.documentCampaignRepository.save(documentCampaign)

      for (const recipient of recipients) {
        if (!recipient) {
          continue
        }

        let userAlias: any = null
        let user: any = null
        if (recipient.userAliasId) {
          userAlias = await this.userAliasRepository.findOne({
            where: { id: recipient.userAliasId },
            relations: { user: true },
          })
          user = userAlias?.user ?? null
        } else {
          const result = await this.userService.findUserByStudentPrimaryIdentifier({
            firstName: recipient.name,
            email: recipient.email,
            phone: recipient.phone,
            institutionId,
          })
          userAlias = result?.userAlias ?? null
          user = result?.user ?? null
        }

        if (!userAlias) {
          this.logger.log('User alias not found for recipient: ' + recipient.email)
          continue
        }

        // Match invoice by userAliasId first, then fall back to matching by userId or email
        // to handle cases where userAlias lookup returns a different alias than the one on the invoice
        const invoice = invoices.find((inv) => {
          if (inv.userAliasId === userAlias.id) return true
          if (inv.userAlias?.userId && inv.userAlias.userId === userAlias.userId) return true
          if (inv.userAlias?.user?.email && inv.userAlias.user.email === recipient.email)
            return true
          return false
        })

        // ✅ Invoice should always exist if invoices were created successfully
        if (!invoice) {
          this.logger.error(
            `Invoice not found for userAlias ${userAlias.id} in campaign ${documentCampaign.id}`
          )
          const findIndex = processingData.findIndex((item) => item.email === recipient.email)

          if (findIndex >= 0) {
            processingData[findIndex] = {
              ...processingData[findIndex],
              name: userAlias.name,
              phone: userAlias.user?.phone ?? user.phone,
              amount: '0',
              invoiceNumber: undefined, // Invoice not found - this should not happen
              status: SendingCampaignStatus.FAILED,
              message: 'Invoice not found for recipient',
            }
          }

          this.emitSendCampaignSseEvent({
            jobId,
            step: SendCampaignSteps.SENDING_INVOICES,
            data: processingData,
          })
          continue // Skip this recipient
        }

        // If recipient is send to parent, we will use the parent user alias
        // If parent user alias is not found and isSendToParent is true then send to student
        const findIndex = processingData.findIndex((item) => item.email === recipient.email)
        if (findIndex >= 0) {
          processingData[findIndex] = {
            ...processingData[findIndex],
            name: userAlias.name,
            phone: userAlias.user?.phone ?? user.phone,
            amount: (invoice?.payAmount || 0).toString(),
            invoiceNumber: `INV#${invoice.id}`, // ✅ Invoice always exists here
            status: !userAlias ? SendingCampaignStatus.FAILED : SendingCampaignStatus.SENDING,
            message: !userAlias ? 'User alias not found' : null,
          }
        }
        this.emitSendCampaignSseEvent({
          jobId,
          step: SendCampaignSteps.SENDING_INVOICES,
          data: processingData,
        })
        this.logger.log('Sending invoice for user: ' + userAlias.name + ' INV: #' + invoice.id)
        const result = await this.sendInvoiceReminder(
          invoice,
          documentCampaign,
          userAlias,
          user,
          jobId,
          recipient.isSendToParent
        )
        if (result.error) {
          this.logger.error(result.error)
        } else {
          atLeastOneSent = true
        }

        const index = processingData.findIndex((item) => item.email === recipient.email)
        if (index >= 0) {
          processingData[index] = {
            ...processingData[index],
            name: userAlias.name,
            phone: userAlias.user?.phone ?? user.phone,
            invoiceNumber: `INV#${invoice.id}`,
            amount: (invoice?.payAmount || 0).toString(),
            status: result.error ? SendingCampaignStatus.FAILED : SendingCampaignStatus.SENT,
            message: result.error ? String(result.error) : 'Successfully',
          }
        }
        this.emitSendCampaignSseEvent({
          jobId,
          step: SendCampaignSteps.SENDING_INVOICES,
          data: processingData,
        })
      }
    } catch (error) {
      console.log(error)
      this.logger.error(error)
      throw error
    } finally {
      await this.resetJob(documentCampaign?.id)
    }

    this.emitSendCampaignSseEvent({
      jobId,
      step: SendCampaignSteps.COMPLETED,
      data: processingData,
    })

    await this.documentCampaignRepository.update(
      {
        id: documentCampaign.id,
      },
      {
        status: atLeastOneSent ? DocumentCampaignStatus.SENT : DocumentCampaignStatus.FAILED,
      }
    )
  }

  async resetJob(documentCampaignId: number) {
    await this.documentCampaignRepository.update(
      {
        id: documentCampaignId,
      },
      {
        jobId: null,
      }
    )
  }

  emitSendCampaignSseEvent(params: {
    jobId: string
    step: SendCampaignSteps
    data?: SendingInvoiceData[]
    error?: string
  }) {
    const { jobId, data, error, step } = params
    if (jobId) {
      this.sseService.emitEvent(jobId, {
        step,
        data,
        error,
      })
    }
  }

  async sendInvoiceReminder(
    invoice: Invoice,
    documentCampaign: DocumentCampaign,
    userAlias: UserAlias,
    user: User,
    jobId?: string,
    isSendToParent?: boolean
    // isCombined: boolean,
    // parentInvoice?: Invoice
  ) {
    let result = { error: null, userAlias, uploadUrl: '' }
    try {
      // If this is a split invoice, get the first child invoice
      let invoiceToSend = invoice
      if (invoice.splitType !== InvoiceSplitType.SINGLE && invoice.childInvoices?.length > 0) {
        // Sort child invoices by due date to get the first installment
        const sortedChildInvoices = [...invoice.childInvoices].sort((a, b) => {
          const dateA = a.splitItems?.[0]?.dueDate ? new Date(a.splitItems[0].dueDate) : new Date()
          const dateB = b.splitItems?.[0]?.dueDate ? new Date(b.splitItems[0].dueDate) : new Date()
          return dateA.getTime() - dateB.getTime()
        })
        invoiceToSend = sortedChildInvoices[0]
      }
      const pdfBuffer = await this.createPdfBuffer(invoiceToSend)
      const uploadUrl = await this.uploadPdfToStorage(pdfBuffer)
      result = { userAlias, error: null, uploadUrl }
      if (userAlias?.email && documentCampaign.sendViaEmail) {
        await this.sendInvoiceViaEmail(
          invoice,
          uploadUrl,
          userAlias,
          user,
          documentCampaign,
          pdfBuffer,
          jobId,
          isSendToParent
        )
      }
      if (user.phone && documentCampaign.sendViaWhatsapp && documentCampaign.whatsappContent) {
        await this.sendViaWhatsapp(invoice, uploadUrl, user, userAlias, documentCampaign)
      }
    } catch (error) {
      this.logger.error(
        `Failed to send invoice for user ${userAlias.name}: ${(error as any).message}`,
        (error as any).stack
      )
      result.error = (error as any).message
    }
    await this.documentCampaignRepository.update(
      {
        id: documentCampaign.id,
      },
      {
        status: result.error ? DocumentCampaignStatus.FAILED : DocumentCampaignStatus.SENT,
      }
    )
    return result
  }

  async uploadPdfToStorage(pdfBuffer: Buffer) {
    const uploadUrl = await this.objectStorageProvider.uploadObject('invoices', pdfBuffer, {
      isPrivateBucket: false,
      contentType: 'application/pdf',
    })
    return uploadUrl
  }

  async fetchEnrollCourseRelativeData(classItem: MetaRef) {
    const classEntity = await this.classRepository.findOne({
      where: { id: classItem.classId },
      relations: {
        course: true,
        recurringFormat: true,
      },
    })
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classItem.classId} not found`)
    }
    return this.enrollCourseService.retrieveRelateData(classEntity.course, classItem)
  }

  async createStudentMetaRef(classes: MetaRef[]): Promise<StudentMetaRefExtended[]> {
    const selectedClassMeta: StudentMetaRefExtended[] = []
    for (const classItem of classes) {
      const meta = await this.fetchEnrollCourseRelativeData(classItem)
      selectedClassMeta.push(meta)
    }

    await this.enrollCourseService.checkAvailableSeats(selectedClassMeta)
    await this.enrollCourseService.validateSchedule(selectedClassMeta, false)
    return selectedClassMeta
  }
  // Data structure
  // First key is identical key for each process, second key is userAliasId
  // Every end of process will be reset the map
  private mapStudentCreateEnrollCourse = new Map<string, Map<string, ReminderMapValue>>()

  async createNewInvoice(
    institutionId: number,
    documentId: number,
    isCombined: boolean,
    invoice: InvoiceItem,
    jobId: string,
    invoiceIds?: number[],
    processingData?: SendingInvoiceData[],
    createdByUserId?: number
  ): Promise<{ invoice: Invoice; processingData: SendingInvoiceData[] }> {
    const institution = await this.institutionRepository.findOne({
      where: { id: institutionId },
    })

    const userAlias = await this.userAliasRepository.findOne({
      where: {
        userId: invoice.userId,
        name: invoice.name,
        institutionId,
      },
      relations: {
        user: true,
      },
    })

    if (!userAlias) {
      throw new NotFoundException(`User alias not found for invoice`)
    }

    let selectedClassMeta: StudentMetaRefExtended[] = []
    try {
      selectedClassMeta = await this.createStudentMetaRef(invoice.classes)
    } catch (error) {
      const findIndex = processingData?.findIndex((item) => item.email === invoice.email)
      if (findIndex !== undefined && findIndex >= 0 && processingData) {
        // ✅ For error cases, throw error instead of returning with 'N/A'
        // This ensures invoiceNumber is always set when processingData is used
        processingData[findIndex] = {
          ...processingData[findIndex],
          amount: (invoice.total || 0).toString(),
          invoiceNumber: undefined, // Will not be set since invoice creation failed
          status: SendingCampaignStatus.FAILED,
          message: (error as any).message,
        }
      }
      this.emitSendCampaignSseEvent({
        jobId,
        step: SendCampaignSteps.CREATING_INVOICES,
        data: processingData,
      })
      // ✅ Re-throw error to prevent continuing with invalid state
      throw error
    }

    const token = this.jwtService.sign(
      {
        email: userAlias.email,
      },
      this.jwtOption
    )

    const parentData = {
      email: userAlias?.email,
      phone: userAlias?.user?.phone,
      name: userAlias?.name,
      studentAccount: userAlias?.user,
      userAliasId: userAlias?.id,
      userAlias,
      userId: userAlias?.user?.id,
      token,
    } as StudentEnrollCourseAlias
    let studentData: StudentEnrollCourseAlias[] = [parentData]

    if (isCombined) {
      const childStudents = []

      for (const child of invoice.childs) {
        // Resolve each child by user-alias id directly. Looking up by
        // (name, email, phone) collapses siblings who share parent contact
        // info onto the same alias, causing both enroll-courses to be
        // attributed to a single student.
        const childUserAlias = await this.userAliasRepository.findOne({
          where: { id: child.id, institutionId },
          relations: { user: true },
        })
        if (!childUserAlias) {
          throw new NotFoundException(`User alias not found for child id ${child.id}`)
        }
        const token = this.jwtService.sign(
          {
            email: childUserAlias.email,
          },
          this.jwtOption
        )
        childStudents.push({
          email: childUserAlias.email,
          phone: childUserAlias.user.phone,
          name: childUserAlias.name,
          token,
          studentAccount: childUserAlias.user,
          userAliasId: childUserAlias.id,
          userAlias: childUserAlias,
          userId: childUserAlias.user?.id,
        })
      }
      studentData = childStudents
    }

    const applicantCount = studentData.length
    // Group selectedClassMeta by courseId
    const classes: StudentClassInfo[] = []
    let firstCourse: Course | null = null
    for (const meta of selectedClassMeta) {
      const classInfo = new StudentClassInfo()
      classInfo.meta = meta
      const dto = new StudentConfirmEnrollDto()
      dto.numOfClasses = selectedClassMeta.length
      dto.numOfApplicant = 1
      const pickedClass = await this.pickClassWithRelations(meta.classId)
      if (!pickedClass) {
        throw new NotFoundException(`Class with ID ${meta.classId} not found`)
      }
      const priceOption = await this.enrollCourseService.selectPriceOptions(meta, pickedClass)
      const resultLessonCalculation = await this.enrollCourseService.calculateTotalLesson(
        pickedClass,
        priceOption,
        meta
      )
      classInfo.className = pickedClass.name
      const numberOfSelectedLessons = resultLessonCalculation.numberOfSelectedLessons
      const price = calculateClassPrice(
        pickedClass,
        numberOfSelectedLessons,
        resultLessonCalculation.totalLesson,
        priceOption
      )
      meta.lessonCount = numberOfSelectedLessons
      dto.lessonCount = resultLessonCalculation.lessonCount
      dto.price = price
      classInfo.pricingInfo = await this.enrollCourseService.calculateClassPriceInfo(
        pickedClass,
        pickedClass.course,
        priceOption?.priceType === PriceType.PER_LESSON
          ? price / resultLessonCalculation.lessonCount
          : price,
        meta,
        dto,
        studentData,
        applicantCount,
        false,
        null
      )
      classInfo.enrollInto = this.enrollCourseService.getEnrollIntoInfo(
        pickedClass.course,
        meta,
        classInfo.pricingInfo
      )
      if (pickedClass.type === ClassTypeEnum.SUBSCRIPTION) {
        classInfo.meta.billingFormatId = pickedClass.recurringFormat.id
        classInfo.meta.billingStartDate = new Date().toISOString()
        classInfo.meta.billingNextDate = calculateBillingNextDate(
          new Date(classInfo.meta.billingStartDate),
          pickedClass.recurringFormat
        ).toISOString()
        classInfo.meta.billingEndDate = calculateBillingEndDate(
          new Date(classInfo.meta.billingStartDate),
          pickedClass.recurringFormat
        ).toISOString()
      }
      classInfo.meta.courseId = pickedClass.course.id
      classes.push(classInfo)
      if (!firstCourse) firstCourse = pickedClass.course
    }
    const paymentAmount = classes.reduce(
      (price, classes) => price + Number(classes.pricingInfo.paymentAmount),
      0
    )
    const { discountAmount, payAmount, additionalFee } = this.calculateDiscountTotal(
      invoice.discounts,
      +paymentAmount
    )
    const multipleClassInfo = new StudentMultipleClassInfo()
    multipleClassInfo.classes = classes

    const multipleClassTotalPrice = multipleClassInfo.classes.reduce(
      (price, classes) => price + Number(classes.pricingInfo.paymentAmount),
      0
    )
    let enrollCourseInstances: EnrollCourse[] = []
    let tempInvoice: Invoice | null = null
    if (invoiceIds && invoiceIds.length > 0) {
      // UPDATE path: find the existing invoice to preserve payment data,
      // but create fresh enrollCourses from the DTO (same as the new-invoice branch)
      tempInvoice = await this.invoiceRepository.findOne({
        where: {
          id: In(invoiceIds || []),
          institutionId,
          userAliasId: userAlias.id,
        },
        relations: {
          enrollCourses: {
            studentSchedule: {
              studentLessons: true,
            },
          },
          course: true,
          userAlias: true,
        },
      })
      if (!tempInvoice) throw new NotFoundException('Invoice not found')
      // Do NOT reuse tempInvoice.enrollCourses — fall through to create fresh ones
    }
    if (!tempInvoice || enrollCourseInstances.length === 0) {
      if (isCombined) {
        enrollCourseInstances = await this.createEnrollCourseInstances(
          institutionId,
          institution.siteId,
          invoice,
          multipleClassInfo,
          multipleClassTotalPrice,
          token
        )
      } else {
        const studentData = {
          name: invoice.name,
          email: invoice.email,
          phone: invoice.phone,
        }
        const enrollCourseInstance = this.createEnrollCourse(
          studentData,
          multipleClassInfo,
          multipleClassTotalPrice,
          userAlias,
          token,
          institution.siteId,
          institution.id
        )
        enrollCourseInstances.push(enrollCourseInstance)
      }
    }
    let enrollCourses = await this.enrollCourseRepository.save(enrollCourseInstances)
    enrollCourses = await this.enrollCourseRepository.find({
      where: {
        id: In(enrollCourseInstances.map((d) => d.id)),
      },
      relations: {
        course: true,
        studentSchedule: {
          studentLessons: true,
        },
        multipleClassMapping: true,
        userAlias: true,
        student: true,
      },
    })
    // UPDATE path: always re-link fresh enrollCourses to the existing invoice
    // regardless of payment status. enrollCourses represent what is being invoiced
    // (class list), while amountPaid is financial history — they update independently.
    if (tempInvoice) {
      const oldEnrollCourseIds = (tempInvoice.enrollCourses ?? []).map((ec) => ec.id)
      if (oldEnrollCourseIds.length > 0) {
        await this.enrollCourseRepository.delete(oldEnrollCourseIds)
      }
      for (const ec of enrollCourses) {
        ec.invoiceId = tempInvoice.id
      }
      enrollCourses = await this.enrollCourseRepository.save(enrollCourses)
      tempInvoice.enrollCourses = enrollCourses
    }
    // Handle split invoice creation based on splitType and splitItems
    let invoiceResult: Invoice

    if (
      invoice.splitType &&
      invoice.splitType !== InvoiceSplitType.SINGLE &&
      invoice.splitItems?.length > 0
    ) {
      // Create parent invoice first
      const parentInvoice =
        tempInvoice ??
        (await this.enrollCourseService.createInvoiceOfEnrollCourse(
          applicantCount,
          PaymentMethod.PAY_LATER,
          multipleClassInfo,
          enrollCourses,
          studentData,
          parentData,
          null
        ))
      parentInvoice.remark = invoice?.invoiceRemark
      if (!tempInvoice) {
        const splitFirstLessonDate = this.getFirstLessonDate([], multipleClassInfo)
        if (splitFirstLessonDate) {
          parentInvoice.createdAt = splitFirstLessonDate
          parentInvoice.updatedAt = splitFirstLessonDate
        }
      }
      if (invoice.paymentDate) {
        parentInvoice.paymentDate = new Date(invoice.paymentDate)
      }
      // Set currency on parent invoice if not already set
      if (!parentInvoice.currency) {
        const parentCurrency =
          invoice.currency || multipleClassInfo.classes[0]?.pricingInfo?.currency
        if (!parentCurrency) {
          const site = await this.sitesRepository.findOneById(institution.siteId)
          parentInvoice.currency = site?.currency
        } else {
          parentInvoice.currency = parentCurrency
        }
      }

      // Create child invoices based on splitItems
      const childInvoices: Invoice[] = []
      const newSplitItems = []
      for (const splitItem of invoice.splitItems) {
        const childInvoice = new Invoice()
        // Calculate amount based on percentage of parent invoice amount
        const calculatedAmount = Math.round((splitItem.percentage / 100) * parentInvoice.payAmount)

        const token = this.jwtService.sign(
          {
            email: userAlias.email,
            // This fields it's to make the token different for each invoice installment
            description: splitItem.description,
            dueDate: splitItem.dueDate,
          },
          this.jwtOption
        )
        Object.assign(childInvoice, {
          ...parentInvoice,
          id: undefined,
          parentInvoiceId: undefined,
          payAmount: calculatedAmount,
          dueDate: splitItem.dueDate,
          proofToken: token,
          paymentState: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.PAY_LATER,
          splitType: invoice.splitType,
          userAliasId: userAlias.id,
          userId: userAlias.user?.id,
          institutionId,
        })

        const savedChildInvoice = await this.invoiceRepository.save(childInvoice)
        splitItem.invoiceId = savedChildInvoice.id
        newSplitItems.push(splitItem)
        childInvoices.push(childInvoice)
      }
      // Update parent invoice with new split items
      parentInvoice.splitItems = newSplitItems

      // Update parent invoice with child references
      parentInvoice.childInvoices = childInvoices
      parentInvoice.splitType = invoice.splitType
      parentInvoice.isParent = true // Ensure parentInvoiceId is null for parent
      invoiceResult = parentInvoice
      await this.invoiceRepository.save(parentInvoice)
    } else {
      // Create single invoice as before
      invoiceResult =
        tempInvoice ??
        (await this.enrollCourseService.createInvoiceOfEnrollCourse(
          applicantCount,
          PaymentMethod.PAY_LATER,
          multipleClassInfo,
          enrollCourses,
          studentData,
          parentData,
          null
        ))
    }
    const createEnrollCourseDto = {
      studentData: studentData.map((d) => ({
        ...shallow({
          source: d,
          fields: Object.keys(d),
          fieldsReplace: {
            phone: 'phoneNumber',
            name: 'studentName',
          },
        }),
        createAnAccount: false,
      })),
      selectedClassMeta: classes,
      institutionId,
    } as unknown as StudentCreateEnrollCourseDto
    let studentScheduleList: StudentLesson[][] = []
    // Only reuse existing schedules when they actually have lessons.
    // Fresh enrollCourses (just created) have no lessons yet, so we fall
    // through to createStudentScheduleFromEnrollClass to create them.
    if (tempInvoice && tempInvoice.enrollCourses.length) {
      const hasExistingLessons = tempInvoice.enrollCourses.some((ec) =>
        (ec.studentSchedule ?? []).some((s) => (s.studentLessons ?? []).length > 0)
      )
      if (hasExistingLessons) {
        studentScheduleList = tempInvoice.enrollCourses.map((enrollCourse) =>
          enrollCourse.studentSchedule.flatMap((studentSchedule) => studentSchedule.studentLessons)
        )
      }
    }
    if (studentScheduleList.length === 0) {
      for (const enrollCourse of enrollCourses) {
        createEnrollCourseDto.studentData = [
          {
            phoneNumber: enrollCourse.phone,
            studentName: enrollCourse.name,
            email: enrollCourse.email,
            userId: enrollCourse.userId,
            userAliasId: enrollCourse.userAliasId,
            userAlias: enrollCourse.userAlias,
            studentAccount: enrollCourse.student,
          },
        ]
        const studentSchedules =
          await this.enrollCourseService.createStudentScheduleFromEnrollClass(
            createEnrollCourseDto,
            selectedClassMeta,
            enrollCourse,
            invoiceResult,
            studentData
          )
        studentScheduleList = studentSchedules.concat(studentScheduleList)
      }
    }

    // UPDATE path: recalculate outstanding amount from the new class list.
    // payAmount (outstanding) = max(0, newTotal − alreadyPaid).
    // amountPaid is preserved on tempInvoice and never modified here.
    if (tempInvoice) {
      const alreadyPaid = tempInvoice.amountPaid ?? 0
      invoiceResult.payAmount = Math.max(0, payAmount - alreadyPaid)
      invoiceResult.discountAmount = discountAmount
      invoiceResult.additionalFee = additionalFee
      if (alreadyPaid > 0 && alreadyPaid >= payAmount) {
        invoiceResult.paymentState = PaymentStatus.PAID
      } else if (alreadyPaid > 0) {
        invoiceResult.paymentState = PaymentStatus.PARTIALLY_PAID
      }
    }
    // multipleClassInfo.enrollCourse = enrollCourses
    invoiceResult.userAliasId = userAlias.id
    invoiceResult.documentCampaignId = documentId
    invoiceResult.remark = invoice?.invoiceRemark
    // Set currency from invoice item, pricingInfo, or site
    let currency = invoice.currency || multipleClassInfo.classes[0]?.pricingInfo?.currency
    if (!currency) {
      // Fetch site to get currency if not available from pricingInfo
      const site = await this.sitesRepository.findOneById(institution.siteId)
      currency = site?.currency
    }
    if (currency) {
      invoiceResult.currency = currency
    }
    if (!tempInvoice) {
      const firstLessonDate = this.getFirstLessonDate(studentScheduleList, multipleClassInfo)
      if (firstLessonDate) {
        invoiceResult.createdAt = firstLessonDate
        invoiceResult.updatedAt = firstLessonDate
      }
    }
    if (invoice.paymentDate) {
      invoiceResult.paymentDate = new Date(invoice.paymentDate)
    }
    if (createdByUserId) {
      invoiceResult.createdBy = createdByUserId
    }
    let newInvoice = await this.invoiceRepository.save(invoiceResult)
    newInvoice.institution = institution
    // When creating bundle discounts, always ensure discountType is FIXED_AMOUNT (not PERCENTAGE)
    // Bundle discounts have their amount already calculated, so they should be stored as FIXED_AMOUNT
    newInvoice.adminDiscounts = (invoice.discounts || []).map((discount) => {
      if (
        discount.type === PromotionType.BUNDLE &&
        discount.discountType === DiscountType.PERCENTAGE
      ) {
        return {
          ...discount,
          discountType: DiscountType.FIXED_AMOUNT,
        }
      }
      return discount
    })
    newInvoice.discountAmount = discountAmount
    newInvoice.additionalFee = additionalFee
    newInvoice.payAmount = payAmount
    // Ensure currency is set on the final invoice
    if (currency && !newInvoice.currency) {
      newInvoice.currency = currency
    }
    const parentUserAliasId = userAlias.childOfUserAliasId ?? userAlias.id
    // Use amountPaid > 0 rather than paymentState === PAID so that
    // PARTIALLY_PAID invoices are also protected — any collected amount
    // must be preserved unconditionally once an invoice exists.
    const collectedAmount = tempInvoice?.amountPaid ?? 0
    const hasCollectedPayment = !!tempInvoice && collectedAmount > 0
    if (hasCollectedPayment) {
      // Editing an invoice that has been at least partially paid:
      // lock amountPaid and derive paymentState from the new total.
      newInvoice.amountPaid = collectedAmount
      if (payAmount > collectedAmount) {
        // New total exceeds what was collected → still owes a balance
        newInvoice.paymentState = PaymentStatus.PARTIALLY_PAID
      } else {
        // New total <= amount collected → fully settled; credit the excess
        newInvoice.paymentState = PaymentStatus.PAID
        const excess = collectedAmount - payAmount
        if (excess > 0) {
          const refundUserAliasId = userAlias.childOfUserAliasId ?? userAlias.id
          await this.creditManagementService.addCredit(institutionId, {
            institutionId,
            amount: excess,
            userAliasId: refundUserAliasId,
            sourceType: CreditSourceType.REFUND,
            description: `Credit refund from invoice adjustment #${newInvoice.id ?? ''}`,
          })
        }
      }
      // Never apply payByCredit on an invoice that already has a collected amount
    } else {
      // New invoice or existing invoice with zero collected: normal flow
      newInvoice.paymentState = PaymentStatus.PENDING
      if (invoice.isPayByCredit && parentUserAliasId) {
        const parentUserAlias = await this.userAliasRepository.findOneById(parentUserAliasId)
        if (parentUserAlias && (tempInvoice?.usedBalance ?? 0) <= 0) {
          newInvoice = await this.payByCredit(institutionId, parentUserAliasId, newInvoice)
        }
      }
    }
    newInvoice.userAliasId = userAlias.id
    await this.invoiceRepository.save(newInvoice)
    await this.saveInvoicePromotionsUsed(
      newInvoice.id,
      invoice.siteId,
      institutionId,
      invoice.discounts ?? []
    )
    if (userAlias.id) {
      const reminderData = await this.enrollCourseService.prepareReminderData(
        institutionId,
        newInvoice.enrollCourses,
        studentScheduleList
      )
      const map = this.mapStudentCreateEnrollCourse.get(jobId)
      if (map) {
        map.set(userAlias.id.toString(), {
          reminderData,
          createEnrollCourseDto,
          multipleClassInfo,
          successfulAccounts: parentData as StudentEnrollCourseAlias,
        })
      } else {
        this.mapStudentCreateEnrollCourse.set(
          jobId,
          new Map([
            [
              userAlias.id.toString(),
              {
                reminderData,
                createEnrollCourseDto,
                multipleClassInfo,
                successfulAccounts: parentData as StudentEnrollCourseAlias,
              },
            ],
          ])
        )
      }
    }
    return {
      invoice: newInvoice,
      processingData,
    }
  }

  private readonly dtoToModelPromotionType: Record<string, PromotionTypeEnum> = {
    [PromotionType.BUNDLE]: PromotionTypeEnum.BUNDLE_DISCOUNT,
    [PromotionType.COUPON]: PromotionTypeEnum.COUPON_DISCOUNT,
    [PromotionType.MANUAL]: PromotionTypeEnum.DIRECT_DISCOUNT,
    [PromotionType.REFERRAL]: PromotionTypeEnum.DIRECT_DISCOUNT,
    [PromotionType.PACKAGE]: PromotionTypeEnum.PACKAGE_DISCOUNT,
  }

  private async saveInvoicePromotionsUsed(
    invoiceId: number,
    siteId: number,
    institutionId: number,
    discounts: DiscountInvoices[]
  ): Promise<void> {
    // Delete existing records for this invoice (upsert pattern for edit mode re-saves)
    await this.invoicePromotionUsedRepository.delete({ invoiceId })

    if (!discounts.length) return

    const records: Partial<InvoicePromotionUsed>[] = discounts.map((discount) => ({
      invoiceId,
      siteId,
      institutionId,
      promotionType:
        this.dtoToModelPromotionType[discount.type] ?? PromotionTypeEnum.DIRECT_DISCOUNT,
      promotionId: typeof discount.id === 'number' ? discount.id : null,
      name: discount.name ?? null,
      amount: discount.amount,
    }))

    await this.invoicePromotionUsedRepository.save(records as InvoicePromotionUsed[])
  }

  async createEnrollCourseInstances(
    institutionId: number,
    siteId: number,
    invoice: InvoiceItem,
    multipleClassInfo: StudentMultipleClassInfo,
    multipleClassTotalPrice: number,
    token: string
  ) {
    const enrollCourseInstances: EnrollCourse[] = []
    for (const child of invoice.childs) {
      // Resolve each child by user-alias id. The previous (name, email,
      // phone) lookup collapses siblings who share parent contact info onto
      // the same alias, which then makes both enroll-course rows reference
      // a single student.
      const childUserAlias = await this.userAliasRepository.findOne({
        where: { id: child.id, institutionId },
        relations: { user: true },
      })
      if (!childUserAlias) {
        throw new NotFoundException(`User alias not found for child id ${child.id}`)
      }
      const studentData = {
        name: childUserAlias.name,
        email: childUserAlias.email,
        phone: childUserAlias.user?.phone,
      }

      const enrollCourseInstance = this.createEnrollCourse(
        studentData,
        multipleClassInfo,
        multipleClassTotalPrice,
        childUserAlias,
        token,
        siteId,
        institutionId
      )
      enrollCourseInstance.courseId = invoice.classes.find(
        (d) => d.userAliasId === childUserAlias.id
      )?.courseId
      enrollCourseInstances.push(enrollCourseInstance)
    }
    return enrollCourseInstances
  }

  async payByCredit(institutionId: number, parentUserAliasId: number, invoice: Invoice) {
    const credit = await this.creditManagementService.getBalance(institutionId, parentUserAliasId)
    if (credit && credit.balance > 0) {
      try {
        const remainingPayment = credit.balance - invoice.payAmount
        let creditToBeUsed = invoice.payAmount
        if (remainingPayment < 0) {
          // Use all remaining credit
          creditToBeUsed = credit.balance
        }
        invoice.usedBalance = creditToBeUsed
        const creditTransaction = await this.creditManagementService.deductCredit(institutionId, {
          userAliasId: parentUserAliasId,
          amount: creditToBeUsed,
          sourceType: CreditSourceType.INVOICE_PAYMENT,
          description: `Deducted from invoice ${invoice.id}`,
          institutionId,
        })
        invoice.creditTransactionsId = creditTransaction.id
        invoice.payAmount = Math.max(0, invoice.payAmount - invoice.usedBalance)
        invoice.paymentState =
          invoice.payAmount <= 0 ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID
        invoice.amountPaid = 0
      } catch (error) {
        this.logger.error('Error deducting credit:', error)
      }
    }
    return invoice
  }

  calculateDiscountTotal(adminDiscounts: DiscountInvoices[], currentPrice: number) {
    const discounts: DiscountInvoices[] = adminDiscounts || []
    if (discounts.length <= 0)
      return {
        discountAmount: 0,
        additionalFee: 0,
        payAmount: currentPrice,
      }
    let totalAdditionalFee = 0
    const sortedDiscount = discounts.sort((a, b) => a.order - b.order)
    let totalDiscountTemp = 0
    ;(sortedDiscount || []).forEach((item) => {
      const { amount, discountType } = item
      // Fix: Bundle discounts with percentage type have amount already calculated
      // If type is BUNDLE and discountType is PERCENTAGE, use amount directly
      // Otherwise, calculate percentage normally
      let discountValue: number
      if (discountType === DiscountType.PERCENTAGE) {
        // Check if this is a bundle discount with pre-calculated amount
        if (item.type === PromotionType.BUNDLE) {
          // Bundle discounts have amount already calculated, use it directly
          discountValue = amount
        } else {
          // Regular percentage discount, calculate from percentage value
          discountValue = (amount / 100) * currentPrice
        }
      } else {
        // Fixed amount discount
        discountValue = amount
      }
      if (item.feeType === FeeModeType.ADD_FEE) {
        totalAdditionalFee += discountValue
        currentPrice += discountValue
      } else {
        totalDiscountTemp += discountValue
        currentPrice -= discountValue
      }
    })
    const finalPayAmount = currentPrice < 0 ? 0 : currentPrice
    return {
      discountAmount: totalDiscountTemp,
      additionalFee: totalAdditionalFee,
      payAmount: finalPayAmount,
    }
  }

  createEnrollCourse(
    studentData: { name: string; email: string; phone: string },
    multipleClassInfo: StudentMultipleClassInfo,
    multipleClassTotalPrice: number,
    userAlias: UserAlias,
    token: string,
    siteId: number,
    institutionId: number
  ) {
    const classes = multipleClassInfo.classes.filter((d) => d.meta?.userAliasId === userAlias.id)
    const enrollInto = classes.map((classes) => classes.enrollInto)
    const enrollCourseInstance = plainToInstance(EnrollCourse, {
      userId: userAlias.userId,
      enrollInto,
      // registrationForm: createEnrollCourseDto.registrationForm,
      token,
    })

    // manually map data for student name, email and phone
    const user = userAlias.user
    enrollCourseInstance.name = studentData?.name
    enrollCourseInstance.phone = studentData?.phone
    enrollCourseInstance.email = studentData?.email
    enrollCourseInstance.userId = user.id
    enrollCourseInstance.userAliasId = userAlias.id
    const meta0 = classes[0].meta
    enrollCourseInstance.courseId = meta0.courseId
    enrollCourseInstance.siteId = siteId
    enrollCourseInstance.institutionId = institutionId

    if (
      meta0?.billingStartDate &&
      meta0?.billingEndDate &&
      meta0?.billingNextDate &&
      meta0?.billingFormatId
    ) {
      enrollCourseInstance.billingStartDate = new Date(meta0.billingStartDate)
      enrollCourseInstance.billingEndDate = new Date(meta0.billingEndDate)
      enrollCourseInstance.billingNextDate = new Date(meta0.billingNextDate)
      enrollCourseInstance.billingFormatId = meta0.billingFormatId
    }

    enrollCourseInstance.currency = classes[0].pricingInfo.currency
    enrollCourseInstance.paymentAmount = multipleClassTotalPrice
    // This is for skipping the payment process if the total price is 0
    if (multipleClassTotalPrice > 0) {
      enrollCourseInstance.confirmState = EnrollConfirmStatus.PENDING
    } else {
      enrollCourseInstance.confirmState = EnrollConfirmStatus.ACCEPTED
    }
    return enrollCourseInstance
  }

  async pickClassWithRelations(classId: number) {
    return this.classRepository.findOne({
      where: {
        id: classId,
      },
      relations: {
        course: true,
        regularPeriods: true,
        regularScheduleV2: true,
        recurringSchedules: true,
        recurringFormat: true,
        studentSchedules: true,
        locationRoom: true,
        instructor: true,
        priceOptions: true,
      },
    })
  }

  async getOrCreateRecipient(
    channel: DocumentRecipientsChannel,
    documentCampaignId: number,
    uploadUrl: string,
    invoiceId: number,
    userAliasId: number,
    institutionId: number
  ) {
    let documentRecipient = await this.documentRecipientRepository.findOne({
      where: {
        channel,
        campaignId: documentCampaignId,
        invoiceId,
        studentId: userAliasId,
        institutionId,
      },
    })
    if (!documentRecipient)
      documentRecipient = await this.documentRecipientRepository.create({
        campaignId: documentCampaignId,
        studentId: userAliasId,
        channel,
        documentUrl: uploadUrl,
        status: DocumentCampaignRecipientsStatus.PENDING,
        institutionId,
        invoiceId,
      })
    else {
      // Keep link fresh in case we regenerated the PDF
      documentRecipient.documentUrl = uploadUrl
    }
    return documentRecipient
  }

  async buildContentWithVariable(content: string, userAlias: UserAlias, invoice: Invoice) {
    // Replace variables in the content with userAlias data
    const site = await this.sitesRepository.findOneById(invoice.siteId)
    const uploadPaymentUrl =
      buildUploadReceiptLink({
        institution: invoice.institution,
        invoice,
        customDomain: site?.customDomain,
        siteUrl: site?.url,
        coursePath: invoice.course?.path,
      }) || ''

    return content
      .replace(/{{studentName}}/g, userAlias.name || '')
      .replace(/{{invoiceNumber}}/g, invoice.id ? `INV#${invoice.id}` : '')
      .replace(
        /{{invoiceDate}}/g,
        invoice.createdAt ? dayjs(invoice.createdAt).format('YYYY-MM-DD') : ''
      )
      .replace(/{{payAmount}}/g, invoice.payAmount != null ? invoice.payAmount.toString() : '')
      .replace(
        /{{dueDate}}/g,
        invoice.createdAt ? dayjs(invoice.createdAt).add(30, 'day').format('YYYY-MM-DD') : ''
      )
      .replace(/{{uploadPaymentUrl}}/g, uploadPaymentUrl)
  }

  async sendViaWhatsapp(
    invoice: Invoice,
    uploadUrl: string,
    user: User,
    userAlias: UserAlias,
    documentCampaign?: DocumentCampaign
  ) {
    console.log('Sending WhatsApp to ', user?.phone)

    // Implement WhatsApp sending logic here
    let documentRecipient
    if (documentCampaign) {
      documentRecipient = await this.getOrCreateRecipient(
        DocumentRecipientsChannel.WhatsApp,
        documentCampaign.id,
        uploadUrl,
        invoice.id,
        userAlias.id,
        invoice.institutionId
      )
    }
    try {
      const whatsappContent = await this.buildContentWithVariable(
        documentCampaign.whatsappContent,
        userAlias,
        invoice
      )
      await this.whatsappWebService.sendMessage(
        documentCampaign.institutionId,
        user?.phone,
        whatsappContent
      )

      if (documentRecipient) documentRecipient.status = DocumentCampaignRecipientsStatus.DELIVERED
    } catch (error) {
      console.log('Error sending WhatsApp', error)
      if (documentRecipient) documentRecipient.status = DocumentCampaignRecipientsStatus.FAILED
    } finally {
      if (documentRecipient) await this.documentRecipientRepository.save(documentRecipient)
    }
  }

  async sendInvoiceViaEmail(
    invoice: Invoice,
    uploadUrl: string,
    userAlias: UserAlias,
    user: User,
    documentCampaign?: DocumentCampaign,
    pdfBuffer?: Buffer,
    jobId?: string,
    isSendToParent?: boolean
  ) {
    const result = { userAlias, error: null, uploadUrl }
    let buffer = pdfBuffer
    if (!buffer) {
      // Read buffer from uploadUrl
      buffer = await this.objectStorageProvider.getObjectBuffer(uploadUrl)
    }
    if (!jobId) return
    const reminderDataMap = this.mapStudentCreateEnrollCourse.get(jobId)
    if (!reminderDataMap) return
    const userAliasReminderData = reminderDataMap.get(userAlias.id.toString())
    if (!userAliasReminderData) return
    const { createEnrollCourseDto, reminderData, multipleClassInfo, successfulAccounts } =
      userAliasReminderData
    const { timeZone, contactPhone } = reminderData
    const enrollCourses = invoice.enrollCourses
    const enrollCourseStudentSchedules = enrollCourses.flatMap((ec) => ec.studentSchedule)

    const multipleClassMapping = enrollCourses.flatMap((ec) => ec.multipleClassMapping ?? [])

    let classDateTime = ''
    if (enrollCourseStudentSchedules && enrollCourseStudentSchedules.length > 0) {
      const studentScheduleWithUserAlias = await this.emailService.getStudentScheduleWithUserAlias(
        invoice.institutionId,
        enrollCourseStudentSchedules
      )
      classDateTime = studentScheduleToString(
        studentScheduleWithUserAlias,
        timeZone,
        multipleClassMapping
      )
    }
    const site = await this.sitesRepository.findOneById(invoice.siteId)
    // Ensure institution is loaded with name property for email sender
    let institution = invoice.institution
    if (!institution || !institution.name) {
      institution = await this.institutionRepository.findOneById(invoice.institutionId)
    }
    const enrollmentForm = await Promise.all(
      enrollCourses.map(async (ec) =>
        ec.registrationForm !== null
          ? await this.enrollCourseService.mapEnrollmentFormKeysToCustomFieldKeys(ec, timeZone)
          : []
      )
    )
    const paymentReceiptUploadLink = buildUploadReceiptLink({
      institution,
      invoice,
      customDomain: site.customDomain,
      siteUrl: site.url,
      coursePath: invoice.course?.path,
    })
    let documentRecipient
    if (documentCampaign) {
      documentRecipient = await this.getOrCreateRecipient(
        DocumentRecipientsChannel.Email,
        documentCampaign.id,
        uploadUrl,
        invoice.id,
        userAlias.id,
        documentCampaign.institutionId
      )
    }
    try {
      await this.enrollCourseService.sendEnrolledCourseStudentReminder({
        enrollCourses,
        invoice,
        createEnrollCourseDto,
        successfulAccounts: enrollCourses.map(
          (ec) =>
            ({
              studentAccount: ec.student,
              userAliasId: ec.userAliasId,
              name: ec.name,
              phone: ec.phone,
              email: ec.userAlias.email,
              userAlias: ec.userAlias,
            } as StudentEnrollCourseAlias)
        ),
        enrollmentForm: enrollmentForm.flat(),
        institution,
        site,
        multipleClassInfo,
        isSendEmail: true,
        classDateTime,
        paymentReceiptUploadLink,
        paymentLink: paymentReceiptUploadLink,
        token: successfulAccounts.token,
        classAdminPaymentConfirmation: null,
        contactPhone,
        studentPhone: user?.phone,
        attachments: [
          {
            content: buffer.toString('base64'),
            filename: `${documentCampaign?.type ?? 'invoice'}-${userAlias.name}.pdf`,
            disposition: 'attachment',
          },
        ],
        isSendToParent,
      })

      this.logger.log(`Email sent successfully to ${userAlias.name} (${userAlias.email})`)
      if (documentRecipient) documentRecipient.status = DocumentCampaignRecipientsStatus.DELIVERED
    } catch (err) {
      this.logger.error('sendEmail', JSON.stringify((err as any).body))
      if (documentRecipient) documentRecipient.status = DocumentCampaignRecipientsStatus.FAILED
      result.error = (err as any).body
      throw err
    } finally {
      if (documentRecipient) await this.documentRecipientRepository.save(documentRecipient)
    }
    return result
  }

  async createPdfBuffer(invoice: Invoice): Promise<Buffer> {
    const siteImage =
      invoice.institution?.logo &&
      (await this.objectStorageProvider.getObjectBuffer(invoice.institution?.logo))
    const parentInvoice = await this.getInvoiceById(invoice.invoiceParentId, invoice.institutionId)
    const site =
      invoice.site ??
      (invoice.siteId ? await this.sitesRepository.findOneById(invoice.siteId) : null)
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const timeZoneId = site?.timeZone?.id || 'Asia/Hong_Kong'
        const dueDate = dayjs(invoice.createdAt).tz(timeZoneId).format('MMMM D, YYYY')
        const invoiceInstallment = parentInvoice?.splitItems?.find(
          (d) => d.invoiceId === invoice.id
        )

        const paymentReceiptUploadLink = buildCmsUploadReceiptLink({
          proofToken: invoice.proofToken ?? '',
          institutionId: invoice.institutionId,
        })

        const doc = new PDFDocument({ margin: 50 })
        const buffers: Uint8Array[] = []
        // Load font from file system
        const fontPath = `src/assets/fonts/NotoSansTC-Regular.ttf`
        doc.registerFont('NotoSansTC', fontPath)
        doc.on('data', (buffer) => buffers.push(buffer))
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)

        // Page dimensions
        const pageHeight = doc.page.height
        const margin = 50
        const bottomMargin = 50
        const maxContentHeight = pageHeight - margin - bottomMargin

        // Helper function to check if content fits and add new page if needed
        const checkPageBreak = (requiredHeight: number, currentY: number): number => {
          if (currentY + requiredHeight > maxContentHeight) {
            doc.addPage()
            return margin
          }
          return currentY
        }

        // Helper function to draw table header (for new pages)
        const drawTableHeader = (yPos: number) => {
          const headerY = yPos
          const headerBottom = headerY + 35
          doc.moveTo(40, headerY).lineTo(555, headerY).strokeColor('#444').stroke()

          doc
            .fontSize(11)
            .fillColor('black')
            .font('NotoSansTC')
            .text('Description', 40, headerY + 7)
            .text('No. of\nLessons', 330, headerY + 4, {
              width: 60,
              align: 'center',
              lineGap: 2,
            })
            .text('Lesson Price', 390, headerY + 7, { width: 80, align: 'right' })
            .text('Class Total', 480, headerY + 7, { width: 75, align: 'right' })

          doc.moveTo(40, headerBottom).lineTo(555, headerBottom).stroke()
          return headerBottom + 15
        }

        // Header
        const blue = '#2466dd'

        // Logo rectangle (simulate logo, as svg/png placement may require more logic)
        if (siteImage) {
          doc.image(siteImage, 480, 35, { width: 60, height: 60 })
        } else {
          doc.rect(480, 35, 60, 60).fillAndStroke(blue, blue)
        }
        // Title
        doc.font('NotoSansTC').fontSize(32).fillColor('black').text('Invoice', 40, 60)

        // Invoice details
        let invoiceNumber = `#${invoice.id}`
        if (invoiceInstallment) {
          invoiceNumber += ` - ${invoiceInstallment.description}`
        }
        doc
          .fontSize(11)
          .font('NotoSansTC')
          .text('Invoice number', 40, 120)
          .font('NotoSansTC')
          .text(invoiceNumber, 150, 120)

        doc
          .font('NotoSansTC')
          .text('Date of issue', 40, 140)
          .font('NotoSansTC')
          .text(dayjs(invoice.createdAt).tz(timeZoneId).format('MMMM D, YYYY'), 150, 140)

        // Company address
        doc
          .font('NotoSansTC')
          .text(invoice.institution?.name, 40, 200)
          .font('NotoSansTC')
          .text(invoice.institution?.address?.addressLine1, 40, 215)
          .text(invoice.institution?.address?.addressLine2, 40, 230)
          .text(invoice.institution?.address?.area, 40, 245)
          .text(invoice.institution?.address?.state, 40, 260)
          .text(invoice.institution?.address?.country, 40, 275)
          .text(
            (() => {
              const phone = invoice.institution?.phone
              if (!phone || typeof phone !== 'string') return ''
              return parsePhoneNumberFromString(`+${phone}`)?.formatInternational() ?? ''
            })(),
            40,
            290
          )
        // Bill to
        doc
          .font('NotoSansTC')
          .text('Bill to', 270, 200)
          .font('NotoSansTC')
          .text(invoice.payBy, 270, 215)

        // Pay online link
        doc
          .fontSize(12)
          .fillColor(blue)
          .text('Pay online', 40, 340, { link: paymentReceiptUploadLink, underline: true })

        // Table header
        const tableHeaderTop = 420
        const tableHeaderBottom = tableHeaderTop + 35
        doc
          .moveDown()
          .moveTo(40, tableHeaderTop)
          .lineTo(555, tableHeaderTop)
          .strokeColor('#444')
          .stroke()

        doc
          .fontSize(11)
          .fillColor('black')
          .font('NotoSansTC')
          .text('Description', 40, tableHeaderTop + 7)
          .text('No. of\nLessons', 330, tableHeaderTop + 4, {
            width: 60,
            align: 'center',
            lineGap: 2,
          })
          .text('Lesson Price', 390, tableHeaderTop + 7, { width: 80, align: 'right' })
          .text('Class Total', 480, tableHeaderTop + 7, { width: 75, align: 'right' })

        doc.moveTo(40, tableHeaderBottom).lineTo(555, tableHeaderBottom).stroke()

        // Table rows — grouped by student. Mirrors SelectedCourseTable in
        // DialogSendInvoice: each student gets a header row, then a row per
        // class (with lessons listed), then a per-student subtotal row.
        let y = tableHeaderBottom + 15
        const enrollCourses = invoice.enrollCourses ?? []
        const courseNameX = 40
        const courseNameWidth = 260
        const courseNameOptions = { width: courseNameWidth, align: 'left' as const }
        const currencyLabel = invoice.site?.currency?.toUpperCase() ?? ''

        type StudentBucket = {
          key: string
          name: string
          rows: Array<{
            desc: string
            lessonCount: number
            unitPrice: number
            amount: number
          }>
          subtotal: number
        }

        // Bucket key prefers the enrollCourse's own userAlias (true on combined
        // invoices). Falls back to enrollCourse.name and finally to the invoice's
        // payer name so single-student legacy invoices still render correctly.
        const buckets: StudentBucket[] = []
        const bucketByKey = new Map<string, StudentBucket>()
        for (const enrollCourse of enrollCourses) {
          const studentName =
            enrollCourse.userAlias?.name ||
            enrollCourse.name ||
            invoice.userAlias?.name ||
            invoice.payBy ||
            'Student'
          const bucketKey = String(enrollCourse.userAlias?.id ?? `name:${studentName}`)
          let bucket = bucketByKey.get(bucketKey)
          if (!bucket) {
            bucket = { key: bucketKey, name: studentName, rows: [], subtotal: 0 }
            bucketByKey.set(bucketKey, bucket)
            buckets.push(bucket)
          }

          const enrollCourseSchedules = enrollCourse.studentSchedule || []
          const classMappings = enrollCourse.multipleClassMapping ?? []
          let scheduleIndex = 0
          for (const enrollInto of enrollCourse.enrollInto) {
            const { courseName, secondLevelName, ...rest } = enrollInto
            const studentSchedule = enrollCourseSchedules[scheduleIndex]

            // Exclude lessons that were moved to a different class.
            // Those lessons appear in the destination class's own row, so including them here
            // would double-count them in both the bullet list and the lesson count.
            const activeLessons = this.studentLessonRepository.filterActiveLessons(
              studentSchedule?.studentLessons ?? []
            )

            let desc = `${courseName} - ${secondLevelName}`
            if (activeLessons.length) {
              const lessonsText = activeLessons
                .map((o) => {
                  if (!o.startTime) return ''
                  const startDate = dayjs(o.startTime).tz(timeZoneId).format('YYYY/MM/DD')
                  const startTime = dayjs(o.startTime).tz(timeZoneId).format('HH:mm A')
                  return `  • ${startDate} ${startTime}`
                })
                .filter((text) => text !== '')
                .join('\n')
              if (lessonsText) desc += `\n${lessonsText}`
            }

            // Use the active (non-changed) lesson count. Fall back to enrollInto.lessonCount
            // for legacy invoices where studentLessons are not attached.
            const lessonCount = activeLessons.length || Math.max(1, Number(rest?.lessonCount) || 1)
            // Use the gross per-lesson price from the class mapping (pre-discount).
            // Fall back to enrollInto.price for enrollments without a mapping.
            const grossUnitPrice = Number(
              classMappings[scheduleIndex]?.lessonPrice ?? rest.price ?? 0
            )
            const amount = grossUnitPrice * lessonCount

            bucket.rows.push({ desc, lessonCount, unitPrice: grossUnitPrice, amount })
            bucket.subtotal += amount
            scheduleIndex++
          }
        }

        // Render each bucket
        for (const bucket of buckets) {
          // Student header row — like the gray section header in SelectedCourseTable
          y = checkPageBreak(24, y)
          if (y === margin) y = drawTableHeader(y)
          doc
            .fontSize(11)
            .font('NotoSansTC')
            .fillColor('black')
            .rect(40, y - 4, 515, 20)
            .fillOpacity(0.06)
            .fill('#000')
            .fillOpacity(1)
            .fillColor('black')
            .text(bucket.name, 46, y, { width: 500, align: 'left' })
          y += 22

          for (const row of bucket.rows) {
            const rowHeight = doc.heightOfString(row.desc, courseNameOptions)
            y = checkPageBreak(rowHeight + 10, y)
            if (y === margin) y = drawTableHeader(y)

            const rowY = y
            doc
              .font('NotoSansTC')
              .fillColor('black')
              .text(row.desc, courseNameX, rowY, courseNameOptions)
              .text(row.lessonCount.toString(), 335, rowY, {
                width: 50,
                align: 'center',
              })
              .text(`${currencyLabel}${Number(row.unitPrice).toFixed(2)}`, 380, rowY, {
                width: 80,
                align: 'right',
              })
              .text(`${currencyLabel}${Number(row.amount).toFixed(2)}`, 480, rowY, {
                width: 75,
                align: 'right',
              })
            y += rowHeight + 10
          }

          // Per-student subtotal row (only when more than one student — for
          // single-student invoices this would duplicate the grand-total below).
          if (buckets.length > 1) {
            y = checkPageBreak(22, y)
            doc
              .moveTo(40, y - 2)
              .lineTo(555, y - 2)
              .strokeColor('#ddd')
              .stroke()
            doc
              .fontSize(10)
              .font('NotoSansTC')
              .fillColor('#555')
              .text('Subtotal', 380, y + 2, { width: 80, align: 'right' })
              .text(`${currencyLabel}${Number(bucket.subtotal).toFixed(2)}`, 480, y + 2, {
                width: 75,
                align: 'right',
              })
              .fillColor('black')
            y += 22
          }
        }
        // Per-discount breakdown — mirrors AppliedDiscount in DialogSendInvoice
        // by listing every applied promotion with its calculated dollar amount.
        // Prefer the audit trail (invoicePromotionsUsed); fall back to the
        // configured adminDiscounts list, then to a single aggregate line so
        // legacy invoices without either still show their discount total.
        type SummaryLine = { name: string; amount: number; isFee: boolean }
        const summaryLines: SummaryLine[] = []
        const promotionsUsed = invoice.invoicePromotionsUsed ?? []
        const adminDiscountsList = invoice.adminDiscounts ?? []
        if (promotionsUsed.length > 0) {
          for (const p of promotionsUsed) {
            // adminDiscounts holds the feeType (add vs subtract); look it up by
            // promotion id so we can render '+' for fees and '-' for discounts.
            const configured = adminDiscountsList.find((d) => d.id === p.promotionId)
            summaryLines.push({
              name: p.name || 'Discount',
              amount: Math.abs(Number(p.amount ?? 0)),
              isFee: configured?.feeType === FeeModeType.ADD_FEE,
            })
          }
        } else if (adminDiscountsList.length > 0) {
          for (const d of adminDiscountsList) {
            summaryLines.push({
              name: d.name || (d.feeType === FeeModeType.ADD_FEE ? 'Additional Fee' : 'Discount'),
              amount: Math.abs(Number(d.amount ?? 0)),
              isFee: d.feeType === FeeModeType.ADD_FEE,
            })
          }
        } else if (Number(invoice.discountAmount ?? 0) > 0) {
          summaryLines.push({
            name: 'Total Discount',
            amount: Number(invoice.discountAmount ?? 0),
            isFee: false,
          })
        }

        // ✅ Add gap and separator before summary table
        // Height = subtotal (18) + per-discount lines + optional additional-fee
        // line + optional credit + optional installment + total row (22) + pad.
        const summaryTableHeight =
          60 +
          summaryLines.length * 18 +
          (invoice.usedBalance > 0 ? 18 : 0) +
          (invoiceInstallment ? 18 : 0)
        y = checkPageBreak(summaryTableHeight, y)
        y += 25
        // Draw separator line to separate items table from summary table
        doc.moveTo(40, y).lineTo(555, y).strokeColor('#444').stroke()
        y += 20

        // ✅ Summary table - separate from items table
        const summaryTableStartY = y
        const additionalFee = adminDiscountsList.find((d) => d.feeType === FeeModeType.ADD_FEE)

        // Summary table header (optional, or just start with subtotal)
        let summaryY = summaryTableStartY

        doc
          .fontSize(11)
          .font('NotoSansTC')
          .text('Subtotal', 380, summaryY, { width: 80, align: 'right' })
          .text(
            `${invoice.site?.currency.toUpperCase()}${Number(invoice.originalFee || 0).toFixed(2)}`,
            480,
            summaryY,
            {
              width: 75,
              align: 'right',
            }
          )

        for (const line of summaryLines) {
          summaryY += 18
          const sign = line.isFee ? '+' : '-'
          doc
            .fontSize(11)
            .font('NotoSansTC')
            .text(line.name, 200, summaryY, { width: 260, align: 'right' })
            .text(
              `${sign}${invoice.site?.currency.toUpperCase()}${Number(line.amount).toFixed(2)}`,
              480,
              summaryY,
              {
                width: 75,
                align: 'right',
              }
            )
        }

        // When the per-discount loop didn't already account for an aggregate
        // additionalFee column on the invoice, render it explicitly so the
        // visible total still reconciles.
        const additionalFeeAlreadyListed = summaryLines.some((l) => l.isFee)
        if (
          !additionalFeeAlreadyListed &&
          invoice.additionalFee &&
          Number(invoice.additionalFee) > 0
        ) {
          summaryY += 18
          const additionalFeeName = additionalFee?.name || 'Additional Fee'
          doc
            .text(additionalFeeName, 380, summaryY, { width: 80, align: 'right' })
            .text(
              `+${invoice.site?.currency.toUpperCase()}${Number(invoice.additionalFee || 0).toFixed(
                2
              )}`,
              480,
              summaryY,
              {
                width: 75,
                align: 'right',
              }
            )
        }

        if (invoice.usedBalance > 0) {
          summaryY += 18
          doc
            .fontSize(11)
            .font('NotoSansTC')
            .text('Credit Balance Usage', 300, summaryY, {
              width: 180,
              align: 'right',
            })
            .text(
              `-${invoice.site?.currency.toUpperCase()}${Number(invoice.usedBalance || 0).toFixed(
                2
              )}`,
              480,
              summaryY,
              {
                width: 75,
                align: 'right',
              }
            )
        }

        if (invoiceInstallment) {
          summaryY += 18
          doc
            .fontSize(11)
            .font('NotoSansTC')
            .text(`${invoiceInstallment.description}`, 300, summaryY, {
              width: 180,
              align: 'right',
            })
            .text(`${invoiceInstallment.percentage}%`, 480, summaryY, {
              width: 75,
              align: 'right',
            })
        }

        // ✅ Total row with separator line above
        summaryY += 22
        doc
          .moveTo(380, summaryY - 8)
          .lineTo(555, summaryY - 8)
          .strokeColor('#444')
          .stroke()

        doc
          .fontSize(11)
          .font('NotoSansTC')
          .text('Total', 380, summaryY, { width: 80, align: 'right' })
          .text(
            `${invoice.site?.currency.toUpperCase()}${Number(invoice.payAmount || 0).toFixed(2)}`,
            480,
            summaryY,
            {
              width: 75,
              align: 'right',
            }
          )

        y = summaryY + 20

        // let yInst = y + 62
        // if (parentInvoice?.splitItems?.length) {
        //   doc.moveDown().moveTo(40, yInst).lineTo(555, yInst).stroke()
        //   doc
        //     .fontSize(11)
        //     .text('Inst.', 40, yInst + 4)
        //     .text('Amount', 120, yInst + 4)
        //     .text('Due Date', 250, yInst + 4)
        //     .text('Status', 400, yInst + 4)
        //   doc
        //     .moveTo(40, yInst + 25)
        //     .lineTo(555, yInst + 25)
        //     .stroke()
        //   yInst += 35
        //   parentInvoice.splitItems.forEach((item, idx) => {
        //     const childInvoice = parentInvoice.childInvoices.find((d) => d.id === item.invoiceId)
        //     doc
        //       .text(`${idx + 1}`, 40, yInst)
        //       .text(`${invoice.site?.currency.toUpperCase()}${childInvoice.payAmount}`, 120, yInst)
        //       .text(dayjs(item.dueDate).format('MMM D, YYYY'), 250, yInst)
        //       .text(childInvoice.paymentState, 400, yInst)
        //     yInst += 20
        //   })
        // }

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  async duplicateInvoiceCampaign(
    documentCampaignId: number,
    institutionId: number
  ): Promise<DocumentCampaign> {
    const documentCampaign = await this.getOneInvoiceCampaign(documentCampaignId, institutionId)
    const metadata = documentCampaign.metadata || {}
    // Reset used balance to 0
    const invoices = (metadata.invoices ?? []).map((d) => ({
      ...d,
      usedBalance: 0,
    }))
    const newDocumentTemplate = this.documentCampaignRepository.create({
      ...documentCampaign,
      metadata: metadata ? { ...metadata, invoices } : {},
      id: undefined, // Reset ID for new entity
      title: `${documentCampaign.title} (Copy)`,
      invoiceIds: [],
      status: DocumentCampaignStatus.PENDING,
      updatedAt: new Date(),
    })
    await this.documentCampaignRepository.save(newDocumentTemplate)

    // Duplicate recipients
    for (const recipient of documentCampaign.recipientList) {
      const newRecipient = this.documentRecipientRepository.create({
        ...recipient,
        id: undefined, // Reset ID for new entity
        campaignId: newDocumentTemplate.id,
      })
      await this.documentRecipientRepository.save(newRecipient)
    }
    return newDocumentTemplate
  }

  async generateInvoicePdf(invoiceId: number, institutionId: number) {
    const invoice = await this.getInvoiceById(invoiceId, institutionId)
    if (!invoice) throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    // if (!invoice.pdfUrl) {
    const pdfBuffer = await this.createPdfBuffer(invoice)
    const uploadUrl = await this.uploadPdfToStorage(pdfBuffer)
    await this.invoiceRepository.update(invoice.id, {
      pdfUrl: uploadUrl,
    })
    return uploadUrl
    // }
    // return invoice.pdfUrl
  }
  async deleteInvoiceCampaign(institutionId: number, documentId: number): Promise<void> {
    await this.documentCampaignRepository.softRemove({
      id: documentId,
      institutionId,
    })
  }

  async resendDocument(
    recipientId: number,
    institutionId: number,
    resendDto: ResendInvoiceDto
  ): Promise<void> {
    const recipient = await this.documentRecipientRepository.findOne({
      where: {
        id: recipientId,
        institutionId,
      },
      relations: {
        campaign: true,
        invoice: true,
        student: {
          user: true,
        },
      },
    })
    if (!recipient) {
      throw new NotFoundException(`Recipient with ID ${recipientId} not found`)
    }
    const documentCampaign = recipient.campaign
    if (!documentCampaign) {
      throw new NotFoundException(`Document campaign not found for recipient ID ${recipientId}`)
    }
    if (!recipient?.student || !recipient.student?.user) {
      throw new NotFoundException(`Student not found for recipient ID ${recipientId}`)
    }
  }
  async sendInvoiceDirectly(dto: SendInvoiceDirectlyDto, institutionId: number) {
    const invoice = await this.getInvoiceById(dto.invoiceId, institutionId)
    if (!invoice) throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    const pdfBuffer = await this.createPdfBuffer(invoice)
    if (!invoice.pdfUrl) {
      const uploadUrl = await this.uploadPdfToStorage(pdfBuffer)
      await this.invoiceRepository.update(invoice.id, {
        pdfUrl: uploadUrl,
      })
      invoice.pdfUrl = uploadUrl
    }
    if (dto.sendViaEmail && dto.emailSubject) {
      await this.paymentEvidenceService.sendMailPaymentReminder({
        ids: [invoice.id],
        action: SendPaymentActions.SEND_MAIL_REMINDER,
        subject: dto.emailSubject,
        invoices: [{ invoiceId: invoice.id, proofToken: invoice.proofToken }],
        institutionId: invoice.institutionId,
        siteId: invoice.siteId,
      })
    }
    if (dto.sendViaWhatsapp) {
      if (!invoice.userAlias?.user?.phone) {
        throw new BadRequestException('User phone number is required for WhatsApp')
      }
      await this.sendViaWhatsapp(
        invoice,
        invoice.pdfUrl,
        invoice.userAlias?.user,
        invoice.userAlias
      )
    }
  }

  private getFirstLessonDate(
    studentScheduleList: StudentLesson[][],
    multipleClassInfo: StudentMultipleClassInfo
  ): Date | null {
    const allLessons = studentScheduleList.flat()
    if (allLessons.length > 0) {
      const sorted = allLessons.slice().sort((a, b) => {
        const aTime = (a.changeStartTime ?? a.startTime)?.getTime() ?? 0
        const bTime = (b.changeStartTime ?? b.startTime)?.getTime() ?? 0
        return aTime - bTime
      })
      const earliest = sorted[0].changeStartTime ?? sorted[0].startTime
      if (earliest) return earliest
    }
    const classStartTimes = multipleClassInfo.classes
      .map((c) => (c as any).startTime as Date | undefined)
      .filter(Boolean) as Date[]
    if (classStartTimes.length > 0) {
      return classStartTimes.sort((a, b) => a.getTime() - b.getTime())[0]
    }
    return null
  }
}
