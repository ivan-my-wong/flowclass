import { expect, Response } from '@playwright/test'
import dayjs from 'dayjs'
import { BasePage } from './base.page'
import { paymentProof } from '../../src/locales/en/student.json'

class ApplicationRecordPage extends BasePage {
  invoices: any[] = []

  getResponseData() {
    const responseListener = async (response: Response) => {
      if (response.url().includes('/admin/invoices/all')) {
        this.invoices = await this.getInvoices(response)
      }
    }
    this.page.on('response', responseListener)
  }

  async getInvoices(res: Response) {
    try {
      const { data } = await res.json()
      if (!data || !Array.isArray(data.content)) {
        return []
      }
      return data.content
    } catch (err) {
      console.error('Error parsing invoices response:', err)
      return []
    }
  }

  async checkFirstDate() {
    await this.goto('/application')
    this.getResponseData()
    await this.delayAfterAction()

    await expect(
      this.page.getByRole('heading', { name: 'Application Record' })
    ).toBeVisible()

    const firstData = this.invoices.sort((a, b) => a.id - b.id)?.[0]

    if (firstData) {
      await expect(
        this.page.getByText(dayjs(firstData.createdAt).format('MMMM D, YYYY'))
      ).toBeVisible()
    }
  }

  async approvePayment() {
    await this.goto('/application')
    await this.getResponseData()
    await this.delayAfterAction()
    await this.page.getByTestId('payment-receipt-status-cell').nth(0).click()

    await this.delayAfterAction()

    expect(
      await this.page.getByText('Set Payment Status').first()
    ).toBeVisible()

    await this.page.getByTestId('confirm-button').click()

    await this.delayAfterAction(3000)

    expect(await this.page.getByText('Approved').first()).toBeVisible()
  }

  async deleteApplicationRecord() {
    await this.goto('/application')
    await this.getResponseData()
    await this.delayAfterAction()

    await this.page.locator('button[role="combobox"]').click()
    await this.page.getByRole('option', { name: '100', exact: true }).click()

    // select-all-checkbox =  aria-label="Column with Header Selection"[0]
    await this.page.getByLabel('Column with Header Selection').first().click()

    await this.page.getByLabel('Delete').click()

    await this.page.getByTestId('confirm-btn').click()

    await this.delayAfterAction(3000)

    expect(
      await this.page.getByText(paymentProof.deleteSuccess, { exact: true })
    ).toBeVisible()
  }

  async searchApplicationRecord(searchTerm: string = 'test-search-term') {
    await this.goto('/application')
    await this.getResponseData()
    await this.delayAfterAction()

    const searchBox = await this.page.locator('#filter-text-box')
    await searchBox.fill(searchTerm)

    const rows = await this.page
      .locator('.ag-center-cols-container > div')
      .count()
    expect(rows).toBeGreaterThan(0)

    await this.delayAfterAction()
  }
}

export default ApplicationRecordPage
