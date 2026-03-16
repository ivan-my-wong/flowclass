/* eslint-disable simple-import-sort/imports */
import { CreateDocumentCampaignDto } from '@/application/admin/template-management/dto/create-campaign.dto'
import { CreateDocumentTemplateDto } from '@/application/admin/template-management/dto/create-template.dto'
import { ObjectStorageProvider } from '@/config/storage/object-storage.provider'
import { ClassRepository } from '@/models/classes.repository'
import { CoursesRepository } from '@/models/courses.repository'
import { DocumentCampaignRecipientsStatus } from '@/models/document-campaign-recipients.entity'
import { DocumentCampaignRecipientsRepository } from '@/models/document-campaign-recipients.repository'
import { DocumentCampaign, DocumentCampaignStatus } from '@/models/document-campaign.entity'
import { DocumentCampaignRepository } from '@/models/document-campaign.repository'
import {
  DocumentTemplate,
  DocumentTemplateType,
  TemplateBackgroundProps,
  TemplateFieldData,
} from '@/models/document-template.entity'
import { DocumentTemplateRepository } from '@/models/document-template.repository'
import { Institution } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { UserAlias } from '@/models/user-aliases.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { User } from '@/models/user.entity'
import { Injectable, Logger } from '@nestjs/common'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import * as dayjs from 'dayjs'
import {
  EmailParams,
  NodemailerEmailTransport,
  Recipient,
  Sender,
} from '@/domain/external/email-transport.provider'

@Injectable()
export class TemplateManagementService {
  private readonly logger = new Logger(TemplateManagementService.name)
  private readonly emailTransport: NodemailerEmailTransport
  private readonly defaultSentFrom = new Sender('info@flowclass.ai', 'Flowclass')

  constructor(
    private readonly documentTemplatetRepository: DocumentTemplateRepository,
    private readonly documentCampaignRepository: DocumentCampaignRepository,
    private readonly documentCampaignRecipientsRepository: DocumentCampaignRecipientsRepository,
    private readonly coursesRepository: CoursesRepository,
    private readonly classRepository: ClassRepository,
    private readonly userAliasesRepository: UserAliasesRepository,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly objectStorageProvider: ObjectStorageProvider
  ) {
    this.emailTransport = new NodemailerEmailTransport()
  }

  async getAllDocumentTemplate(institutionId: number, type?: DocumentTemplateType) {
    return this.documentTemplatetRepository.find({
      where: { institutionId, ...(type ? { type } : {}) },
      order: { createdAt: 'DESC' },
      relations: {
        campaigns: true,
      },
    })
  }

  async getDocumentTemplateById(institutionId: number, templateId: number) {
    return this.documentTemplatetRepository.findOne({
      where: { institutionId, id: templateId },
    })
  }

  async createDocumentTemplate(
    institutionId: number,
    createDocumentTemplateDto: CreateDocumentTemplateDto
  ) {
    const newTemplate = this.documentTemplatetRepository.create({
      ...createDocumentTemplateDto,
      institutionId,
      background: createDocumentTemplateDto.background ?? {},
      fieldData: (createDocumentTemplateDto.fieldData ?? []).map((field) => ({
        ...field,
      })),
    })
    return this.documentTemplatetRepository.save(newTemplate)
  }

  async updateDocumentTemplate(
    institutionId: number,
    templateId: number,
    updateData: Partial<CreateDocumentTemplateDto>
  ) {
    const template = await this.getDocumentTemplateById(institutionId, templateId)
    if (!template) {
      throw new Error('Template not found')
    }
    Object.assign(template, updateData)
    return this.documentTemplatetRepository.save(template)
  }

  async deleteDocumentTemplate(institutionId: number, templateId: number) {
    const template = await this.getDocumentTemplateById(institutionId, templateId)
    if (!template) {
      throw new Error('Template not found')
    }
    await this.documentTemplatetRepository.softDelete({ id: templateId, institutionId })

    return true
  }

  async getAllDocumentCampaigns(institutionId: number) {
    return this.documentCampaignRepository.find({
      where: { institutionId },
      relations: {
        document: true,
        user: true,
      },
      order: { createdAt: 'DESC' },
    })
  }

  async getDocumentCampaignById(institutionId: number, campaignId: number) {
    return this.documentCampaignRepository.findOne({
      where: { institutionId, id: campaignId },
      relations: {
        document: true,
        user: true,
        recipientList: {
          student: true,
        },
      },
    })
  }

  async createDocumentCampaign(
    institutionId: number,
    createDocumentCampaignDto: CreateDocumentCampaignDto,
    user: User
  ) {
    if (
      !createDocumentCampaignDto.recipientIds ||
      createDocumentCampaignDto.recipientIds.length === 0
    ) {
      throw new Error('Recipient IDs are required to create a campaign')
    }

    const document = await this.documentTemplatetRepository.findOne({
      where: { institutionId, id: createDocumentCampaignDto.documentId },
    })
    const courseDetail = await this.coursesRepository.findOne({
      where: { id: createDocumentCampaignDto.courseId, institutionId },
    })
    const classDetail = await this.classRepository.findOne({
      where: { id: createDocumentCampaignDto.classId, institutionId },
    })

    if (!document || !courseDetail || !classDetail) {
      throw new Error('Document, course, or class not found')
    }

    const newCampaign = await this.documentCampaignRepository.save(
      this.documentCampaignRepository.create({
        ...createDocumentCampaignDto,
        institutionId,
        userId: user.id,
        status: DocumentCampaignStatus.COMPLETED,
      })
    )

    const todayDate = dayjs().format('MMMM D, YYYY')

    for (const recipientId of createDocumentCampaignDto.recipientIds) {
      const student = await this.userAliasesRepository.findOne({
        where: { id: recipientId, institutionId },
        relations: { user: true },
      })

      const { uploadedUrl, buffer } = await this.generateAndUploadCertificate(
        {
          ...document,
          fieldData: (document.fieldData || []) as TemplateFieldData[],
        },
        {
          studentName: student.name,
          courseName: courseDetail.name,
          className: classDetail.name,
          todayDate,
        }
      )

      // Send email to each recipient
      try {
        const result = await this.sendCampaignEmail(newCampaign, document, {
          ...student,
          imageBuffer: buffer,
        })

        await this.documentCampaignRecipientsRepository.save(
          this.documentCampaignRecipientsRepository.create({
            institutionId,
            campaignId: newCampaign.id,
            studentId: recipientId,
            documentUrl: uploadedUrl,
            status: result.error
              ? DocumentCampaignRecipientsStatus.FAILED
              : DocumentCampaignRecipientsStatus.DELIVERED,
          })
        )
      } catch (error) {
        this.logger.error(`Failed to send email to ${student.name} (${student.user.email})`, error)
      }
    }

    return newCampaign
  }

  async getAllDocumentCampaignRecipients(institutionId: number, campaignId: number) {
    return this.documentCampaignRecipientsRepository.find({
      where: { institutionId, campaignId },
      relations: {
        student: true,
        campaign: true,
      },
      order: { createdAt: 'DESC' },
    })
  }

  async resendDocumentCampaignEmail(institutionId: number, recipientId: number) {
    const recipient = await this.documentCampaignRecipientsRepository.findOne({
      where: { institutionId, id: recipientId },
      relations: {
        student: { user: true },
        campaign: { document: true },
      },
    })

    if (!recipient) throw new Error('Recipient not found')
    if (!recipient.student) throw new Error('Student not found')

    const imageBuffer = await this.getBufferFromUrl(recipient.documentUrl)

    return this.sendCampaignEmail(recipient.campaign, recipient.campaign.document, {
      ...recipient.student,
      imageBuffer,
    })
  }

  private getSenderFromInstitution(institution: Institution | null): Sender {
    if (!institution?.email) return this.defaultSentFrom
    return new Sender(institution.email, institution.name ?? 'Institution')
  }

  private async getBufferFromUrl(url: string): Promise<Buffer> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return buffer
  }

  private async sendCampaignEmail(
    campaign: DocumentCampaign,
    document: DocumentTemplate,
    student: UserAlias & { imageBuffer: Buffer }
  ) {
    const result = { student, error: null }

    const institution = await this.institutionsRepository.findOne({
      where: { id: campaign.institutionId },
    })
    const sender = this.getSenderFromInstitution(institution)

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo([new Recipient(student.user.email, student.name)])
      .setReplyTo(sender)
      .setSubject(campaign.emailSubject)
      .setHtml(campaign.emailBody)
      .setAttachments([
        {
          content: student.imageBuffer.toString('base64'),
          filename: `${document.type}-${student.name}.png`,
          disposition: 'attachment',
        },
      ])

    await this.emailTransport.email
      .send(emailParams)
      .then(async () => {
        this.logger.log(`Email sent successfully to ${student.name} (${student.user.email})`)
        await this.documentCampaignRecipientsRepository.update(
          { campaignId: campaign.id, studentId: student.id },
          { status: DocumentCampaignRecipientsStatus.DELIVERED }
        )
      })
      .catch(async (err) => {
        this.logger.error('sendEmail', JSON.stringify(err.body))
        await this.documentCampaignRecipientsRepository.update(
          { campaignId: campaign.id, studentId: student.id },
          { status: DocumentCampaignRecipientsStatus.FAILED }
        )
        result.error = err.body
      })

    return result
  }

  private async generateCertificate(
    background: TemplateBackgroundProps,
    fieldData: TemplateFieldData[],
    values: Record<string, string>
  ): Promise<Buffer> {
    try {
      const canvas = createCanvas(background.width, background.height)
      const ctx = canvas.getContext('2d')

      // Load background image
      const bg = await loadImage(background.url)
      ctx.drawImage(bg, 0, 0, background.width, background.height)

      // Render each field
      for (const field of fieldData) {
        ctx.font = `${field.fontSize}px Arial`
        ctx.fillStyle = field.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const value = values[field.field] || ''
        const width = ctx.measureText(field.name).width
        const centerX = field.x + width / 2

        ctx.fillText(value, centerX, field.y)
      }

      // Return as PNG buffer
      return canvas.toBuffer('image/png')
    } catch (error) {
      console.error('Error generating certificate:', error)
      throw new Error('Failed to generate certificate')
    }
  }

  private async generateAndUploadCertificate(
    templateData: CreateDocumentTemplateDto,
    fieldValues: Record<string, string>
  ): Promise<{ uploadedUrl: string; buffer: Buffer }> {
    const buffer = await this.generateCertificate(
      templateData.background,
      templateData.fieldData,
      fieldValues
    )

    const uploadedUrl = await this.objectStorageProvider.uploadObject('certificates', buffer, {
      isPrivateBucket: false,
      contentType: 'image/png',
    })

    return { uploadedUrl, buffer }
  }
}
