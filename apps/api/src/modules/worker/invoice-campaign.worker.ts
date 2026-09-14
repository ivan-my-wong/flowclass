import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { InvoiceCampaignService } from '@/domain/service/invoice-campaign.service'
import { AutomationSettingsType } from '@/models/automation-settings.entity'
import { AutomationSettingsRepository } from '@/models/automation-settings.repository'

@Injectable()
export class InvoiceCampaignWorker {
  private readonly logger = new Logger(InvoiceCampaignWorker.name)

  constructor(
    private readonly automationSettingsRepository: AutomationSettingsRepository,
    private readonly invoiceCampaignService: InvoiceCampaignService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDuplicateInvoiceCampaigns() {
    this.logger.log('Running daily invoice campaign duplication job')
    try {
      const today = new Date().getDate()
      const settings = await this.automationSettingsRepository.find({
        where: {
          type: AutomationSettingsType.INVOICE_CAMPAIGN_DUPLICATION,
        },
      })

      for (const setting of settings) {
        if (!setting.settings) continue

        const {
          enableInvoiceCampaignDuplication,
          invoiceCampaignDuplicationDay,
          invoiceCampaignTemplateId,
        } = setting.settings

        if (
          enableInvoiceCampaignDuplication &&
          invoiceCampaignDuplicationDay === today &&
          invoiceCampaignTemplateId
        ) {
          this.logger.log(
            `Duplicating campaign ${invoiceCampaignTemplateId} for institution ${setting.institutionId}`
          )
          try {
            await this.invoiceCampaignService.duplicateInvoiceCampaign(
              invoiceCampaignTemplateId,
              setting.institutionId
            )
          } catch (error) {
            this.logger.error(
              `Failed to duplicate campaign ${invoiceCampaignTemplateId} for institution ${setting.institutionId}:`,
              error
            )
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in handleDuplicateInvoiceCampaigns cron job', error)
    }
  }
}
