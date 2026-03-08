import { Injectable, Logger } from '@nestjs/common'

import { SubmitQuoteDto } from '@/application/student/pricing-page/dto/submit-quote.dto'
import {
  EmailParams,
  NodemailerEmailTransport,
  Recipient,
  Sender,
} from '@/domain/external/email-transport.provider'

@Injectable()
export class PricingPageService {
  private readonly logger = new Logger(PricingPageService.name)
  private readonly emailTransport: NodemailerEmailTransport
  private readonly defaultSentFrom: Sender

  constructor() {
    this.emailTransport = new NodemailerEmailTransport()
    this.defaultSentFrom = new Sender('info@flowclass.ai', 'Flowclass')
  }

  /**
   * Process quote submission and send email to info@flowclass.io
   * @param quoteData - Quote data from frontend
   * @returns Promise<{ success: boolean; message: string }>
   */
  async submitQuote(quoteData: SubmitQuoteDto): Promise<{ success: boolean; message: string }> {
    try {
      // Convert quote data to HTML format
      const clientInfoHtml = this.formatQuoteDataToHtml(quoteData)

      // Send email via Nodemailer
      const isEmailSent = await this.sendQuoteRequestEmail(clientInfoHtml)

      if (isEmailSent) {
        this.logger.log(`Quote request email sent successfully for ${quoteData.email}`)
        return {
          success: true,
          message: 'Quote request submitted successfully! We will contact you soon.',
        }
      } else {
        this.logger.error(`Failed to send quote request email for ${quoteData.email}`)
        return {
          success: false,
          message: 'Failed to submit quote request. Please try again later.',
        }
      }
    } catch (error) {
      this.logger.error(`Error processing quote submission: ${error.message}`)
      return {
        success: false,
        message: 'An error occurred while processing your request. Please try again.',
      }
    }
  }

  /**
   * Send quote request email to info@flowclass.io using MailerSend
   * @param clientInfo - HTML formatted client information
   * @returns Promise<boolean> - Success status
   */
  private async sendQuoteRequestEmail(clientInfo: string): Promise<boolean> {
    try {
      const emailParams = new EmailParams()
        .setFrom(this.defaultSentFrom)
        .setTo([new Recipient('info@flowclass.io', 'Flowclass Team')])
        .setReplyTo(this.defaultSentFrom)
        .setSubject('New Quote Request from Pricing Calculator')
        .setHtml(clientInfo)

      const response = await this.emailTransport.email.send(emailParams)

      if (response.statusCode === 202) {
        this.logger.log('Quote request email sent successfully')
        return true
      } else {
        this.logger.error(`Failed to send email. Status: ${response.statusCode}`)
        return false
      }
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`)
      return false
    }
  }

  /**
   * Format quote data into HTML for email template
   * @param quoteData - Raw quote data from frontend
   * @returns Formatted HTML string
   */
  private formatQuoteDataToHtml(quoteData: SubmitQuoteDto): string {
    const formatArray = (arr: string[]): string => {
      if (!Array.isArray(arr) || arr.length === 0) return 'None selected'
      return arr.join(', ')
    }

    const formatOptional = (value: string | undefined): string => {
      return value || 'Not provided'
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Quote Request from Pricing Calculator
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${quoteData.name}</p>
          <p><strong>Email:</strong> ${quoteData.email}</p>
          <p><strong>Phone:</strong> ${quoteData.phone}</p>
          <p><strong>Company:</strong> ${formatOptional(quoteData.company)}</p>
          <p><strong>Website:</strong> ${formatOptional(quoteData.website)}</p>
        </div>

        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Pricing Details</h3>
          <p><strong>Total Price:</strong> ${quoteData.totalPrice}</p>
          <p><strong>Currency:</strong> ${quoteData.currency}</p>
          <p><strong>Duration:</strong> ${quoteData.duration}</p>
          <p><strong>Recommended Plan:</strong> ${quoteData.recommendedPlan}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Quiz Data</h3>
          <p><strong>Number of Students:</strong> ${quoteData.studentCount}</p>
          <p><strong>Number of Schools:</strong> ${quoteData.schoolCount}</p>
          <p><strong>Setup Assistance Required:</strong> ${
            quoteData.setupAssistance ? 'Yes' : 'No'
          }</p>
          <p><strong>Number of Admin Staff:</strong> ${quoteData.adminStaff}</p>
          <p><strong>Number of Tutors:</strong> ${quoteData.tutorCount}</p>
        </div>

        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Selected Features</h3>
          <p><strong>Class Types:</strong> ${formatArray(quoteData.classTypes)}</p>
          <p><strong>Premium Features:</strong> ${formatArray(quoteData.premiumFeatures)}</p>
          <p><strong>Notification Channels:</strong> ${formatArray(
            quoteData.notificationChannels
          )}</p>
          <p><strong>Promotion Features:</strong> ${formatArray(quoteData.promotionFeatures)}</p>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;">
            <strong>Note:</strong> This request was generated from the Flowclass Pricing Calculator.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 14px;">
            Sent via Flowclass API on ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `.trim()
  }
}
