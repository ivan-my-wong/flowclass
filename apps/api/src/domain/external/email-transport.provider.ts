import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import type { Transporter } from 'nodemailer'
import * as path from 'path'

// Use require for reliable CommonJS interop in pnpm workspace
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require('nodemailer') as typeof import('nodemailer')

export type Attachment = {
  content: string
  filename: string
  disposition?: string
}

export type Variable = {
  email: string
  substitutions: Array<{ var: string; value: string }>
}

export type Personalization = {
  email: string
  data: Record<string, unknown>
}

export type APIResponse = {
  statusCode: number
  headers?: Record<string, string>
  body?: unknown
}

export class SenderEntity {
  constructor(public readonly email: string, public readonly name?: string) {}
}

export class RecipientEntity {
  constructor(public readonly email: string, public readonly name?: string) {}
}

export class EmailParams {
  from?: SenderEntity
  to: RecipientEntity[] = []
  replyTo?: SenderEntity
  subject = ''
  html?: string
  templateId?: string
  variables?: Variable[]
  personalization?: Personalization[]
  attachments?: Attachment[]
  tags?: string[]

  setFrom(from: SenderEntity) {
    this.from = from
    return this
  }

  setTo(to: RecipientEntity[]) {
    this.to = to
    return this
  }

  setReplyTo(replyTo: SenderEntity) {
    this.replyTo = replyTo
    return this
  }

  setSubject(subject: string) {
    this.subject = subject
    return this
  }

  setHtml(html: string) {
    this.html = html
    return this
  }

  setTemplateId(templateId: string) {
    this.templateId = templateId
    return this
  }

  setVariables(variables?: Variable[]) {
    this.variables = variables
    return this
  }

  setPersonalization(personalization?: Personalization[]) {
    this.personalization = personalization
    return this
  }

  setAttachments(attachments?: Attachment[]) {
    this.attachments = attachments
    return this
  }

  setTags(tags?: string[]) {
    this.tags = tags
    return this
  }
}

export class NodemailerEmailTransport {
  public readonly email: { send: (params: EmailParams) => Promise<APIResponse> }
  private readonly smtpTransporter: Transporter
  private readonly sendmailTransporter: Transporter
  // null = not yet tested, true = SMTP OK, false = SMTP unavailable (use sendmail)
  private smtpAvailable: boolean | null = null

  constructor() {
    this.smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      secure: (process.env.SMTP_SECURE || 'false') === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      connectionTimeout: 3000,
      greetingTimeout: 3000,
    })

    this.sendmailTransporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',
    } as any)

    this.email = {
      send: async (params: EmailParams) => this.send(params),
    }
  }

  private async resolveTransporter(): Promise<Transporter> {
    if (this.smtpAvailable === null) {
      try {
        await this.smtpTransporter.verify()
        this.smtpAvailable = true
        console.log('[Email] SMTP connection verified — using SMTP transport')
      } catch {
        this.smtpAvailable = false
        console.warn('[Email] SMTP unavailable — falling back to sendmail transport')
      }
    }
    return this.smtpAvailable ? this.smtpTransporter : this.sendmailTransporter
  }

  private async send(params: EmailParams): Promise<APIResponse> {
    if (!params.from || !params.to.length) {
      return { statusCode: 400, body: { message: 'Invalid email params' } }
    }

    const transporter = await this.resolveTransporter()
    const firstRecipient = params.to[0]
    const context = this.resolveTemplateContext(firstRecipient.email, params)
    const html = params.html || this.renderTemplate(params.templateId, context)

    const result: any = await transporter.sendMail({
      from: this.formatSender(params.from),
      to: params.to.map((recipient) => this.formatSender(recipient)).join(', '),
      replyTo: params.replyTo ? this.formatSender(params.replyTo) : undefined,
      subject: params.subject,
      html,
      attachments: (params.attachments || []).map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content, 'base64'),
        contentDisposition: (attachment.disposition || 'attachment') as 'attachment' | 'inline',
      })),
    })

    return {
      statusCode: 202,
      headers: {
        'x-message-id': result.messageId,
      },
      body: result,
    }
  }

  private resolveTemplateContext(email: string, params: EmailParams): Record<string, string> {
    const context: Record<string, string> = {}
    const variableRow = params.variables?.find((item) => item.email === email)
    const personalizationRow = params.personalization?.find((item) => item.email === email)

    ;(variableRow?.substitutions || []).forEach((entry) => {
      context[entry.var] = entry.value || ''
    })

    Object.entries(personalizationRow?.data || {}).forEach(([key, value]) => {
      context[key] = value == null ? '' : String(value)
    })

    return context
  }

  private renderTemplate(
    templateName: string | undefined,
    context: Record<string, string>
  ): string {
    if (templateName) {
      const baseDir = path.join(__dirname, '../../common/email-templates')
      for (const ext of ['.hbs', '.html']) {
        try {
          const source = fs.readFileSync(path.join(baseDir, `${templateName}${ext}`), 'utf-8')
          return Handlebars.compile(source)(context)
        } catch {
          // try next extension
        }
      }
    }
    return '<h1>Notification</h1><p>This is a default notification email.</p>'
  }

  private formatSender(sender: { email: string; name?: string }) {
    return sender.name ? `"${sender.name}" <${sender.email}>` : sender.email
  }
}

export { RecipientEntity as Recipient, SenderEntity as Sender }
