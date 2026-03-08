import * as Handlebars from 'handlebars'
import type { Transporter } from 'nodemailer'

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

const TEMPLATE_CONTENT_BY_ID: Record<string, string> = {
  pr9084z3r38lw63d:
    '<h1>Coupon Assigned</h1><p>Hello {{studentName}}, your coupon <strong>{{couponCode}}</strong> is ready.</p>',
  pq3enl6nye742vwr:
    '<h1>Admin Invitation</h1><p>Hello {{name}}, you are invited to {{institutionName}}.</p><p><a href="{{registrationLink}}">Join now</a></p>',
  vywj2lpo8mp47oqz:
    '<h1>New Student Registration</h1><p>{{studentName}} enrolled in {{courseName}}.</p>',
  o65qngk091w4wr12:
    '<h1>Payment Confirmed</h1><p>{{studentName}} payment was confirmed for {{courseName}}.</p>',
  x2p03478z5ylzdrn:
    '<h1>Payment Submitted</h1><p>{{studentName}} submitted payment proof for {{courseName}}.</p><p>{{paymentReceipt}}</p>',
  z3m5jgr87odldpyo:
    '<h1>Upload Payment Receipt</h1><p>Hello {{studentName}}, upload your receipt here: <a href="{{paymentReceiptUploadLink}}">{{paymentReceiptUploadLink}}</a></p>',
  '3z0vklonew147qrx':
    '<h1>Payment Rejected</h1><p>Hello {{studentName}}, payment for {{courseName}} was rejected.</p><p><a href="{{reUploadPaymentUrl}}">Upload again</a></p>',
  '3zxk54v7z5x4jy6v':
    '<h1>Payment Pending</h1><p>Hello {{studentName}}, complete payment for {{courseName}}: <a href="{{paymentLink}}">{{paymentLink}}</a></p>',
  zr6ke4n9dnylon12:
    '<h1>Enrollment Confirmed</h1><p>Hello {{studentName}}, your enrollment for {{courseName}} is confirmed.</p>',
  '0r83ql3xpzzlzw1j':
    '<h1>Course Reminder</h1><p>Hello {{studentName}}, reminder for {{courseName}}.</p>',
  z86org8567zgew13:
    '<h1>Course Assignment</h1><p>Hello {{studentName}}, you were assigned to {{courseName}}.</p><p><a href="{{applicationLink}}">Open application</a></p>',
  '3z0vklor69vl7qrx':
    '<h1>New Lesson Added</h1><p>Hello {{studentName}}, a new lesson was added to {{courseName}}.</p>',
  '0r83ql3rp1zlzw1j':
    '<h1>Lesson Changed</h1><p>Hello {{studentName}}, your lesson schedule was changed for {{courseName}}.</p>',
  '351ndgwwmyrgzqx8':
    '<h1>Lesson Postponed</h1><p>Hello {{studentName}}, your lesson has been postponed.</p><p>Original: {{originalDateTime}}</p><p>New: {{newDateTime}}</p>',
  '7dnvo4d25mnl5r86':
    '<h1>Payment Reminder (T+4)</h1><p>Hello {{studentName}}, payment for {{courseName}} is overdue.</p><p><a href="{{paymentLink}}">Pay now</a></p>',
  z3m5jgr866oldpyo:
    '<h1>Payment Reminder (T+0)</h1><p>Hello {{studentName}}, please complete payment for {{courseName}}.</p><p><a href="{{paymentLink}}">Pay now</a></p>',
  '3vz9dle1eyn4kj50':
    '<h1>Reset Password</h1><p>Reset your password using this link: <a href="{{resetLink}}">{{resetLink}}</a></p>',
  pq3enl6ykm8g2vwr:
    '<h1>Application Link</h1><p>Hello {{studentName}}, open your application: <a href="{{applicationLink}}">{{applicationLink}}</a></p>',
  jy7zpl9xk5ol5vx6:
    '<h1>Teacher Feedback Uploaded</h1><p>Hello {{studentName}}, new feedback is available for {{className}}.</p>',
  '0r83ql327104zw1j':
    '<h1>Verification Email</h1><p>Hello {{firstName}}, verify your account: <a href="{{verificationLink}}">{{verificationLink}}</a></p>',
  x2p034785w9lzdrn:
    '<h1>Course Confirmation</h1><p>Hello {{studentName}}, your course has been confirmed.</p>',
  k68zxl2pp6e4j905:
    '<h1>AI Credit Request</h1><p>Institution {{institutionName}} requested {{aiCreditDeposit}} additional AI attempts.</p>',
  jy7zpl9wvj545vx6:
    '<h1>Student Question</h1><p>{{studentName}} submitted a question for {{courseName}}.</p><p>{{question}}</p>',
  jy7zpl9wpr345vx6:
    '<h1>Request Time Change</h1><p>Hello {{studentName}}, your time-change status is {{status}} for {{courseName}}.</p>',
  jy7zpl9xxvpl5vx6:
    '<h1>Class Materials Uploaded</h1><p>Hello {{studentName}}, new materials were uploaded for {{courseName}} / {{className}}.</p><p><a href="{{siteLink}}">Open site</a></p>',
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
  private readonly transporter: Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      secure: (process.env.SMTP_SECURE || 'false') === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    })

    this.email = {
      send: async (params: EmailParams) => this.send(params),
    }
  }

  private async send(params: EmailParams): Promise<APIResponse> {
    if (!params.from || !params.to.length) {
      return { statusCode: 400, body: { message: 'Invalid email params' } }
    }

    const firstRecipient = params.to[0]
    const context = this.resolveTemplateContext(firstRecipient.email, params)
    const html = params.html || this.renderTemplate(params.templateId, context)

    const result: any = await this.transporter.sendMail({
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

  private renderTemplate(templateId: string | undefined, context: Record<string, string>): string {
    const template =
      (templateId && TEMPLATE_CONTENT_BY_ID[templateId]) ||
      '<h1>Notification</h1><p>This is a default notification email.</p>'
    return Handlebars.compile(template)(context)
  }

  private formatSender(sender: { email: string; name?: string }) {
    return sender.name ? `"${sender.name}" <${sender.email}>` : sender.email
  }
}

export { RecipientEntity as Recipient, SenderEntity as Sender }
