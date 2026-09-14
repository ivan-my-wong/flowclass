import { expect, Response } from '@playwright/test'
import { timestamp } from '../const'
import { BasePage } from './base.page'
class PaymentMethodPage extends BasePage {
  payoutMethods: any[] = []
  isStripeActive = false
  isOtherMethodActive = false

  getResponseData() {
    const responseListener = async (response: Response) => {
      console.log('response', response.url())
      try {
        if (response.url().includes('/admin/payout-methods')) {
          this.payoutMethods = await this.getPayoutMethodStatus(response)
          this.isOtherMethodActive = this.payoutMethods.some(
            (o: { enabled: boolean }) => o.enabled
          )
        }

        if (response.url().includes('/stripe-connect-detail')) {
          this.isStripeActive = await this.getStripeStatus(response)
        }
      } catch (err) {
        console.error('Error parsing response:', err)
      } finally {
        this.page.removeListener('response', responseListener)
      }
    }
    this.page.on('response', responseListener)
  }
  async goToPaymentMethodPage() {
    await this.goto('/settings/payments')
    // Wait for the payout-methods response and take all data
    this.getResponseData()
  }

  async getStripeStatus(res: Response) {
    try {
      const { data } = await res.json()
      if (!data || typeof data.stripeAccountId === 'undefined') {
        return false
      }
      return data?.stripeAccountId && data?.enabled
    } catch (err) {
      console.error('Error parsing Stripe response:', err)
      return false
    }
  }

  async getPayoutMethodStatus(res: Response) {
    try {
      const { data } = await res.json()
      if (!data || !Array.isArray(data.content)) {
        return []
      }
      console.log('data.content', data.content)
      return data.content
    } catch (err) {
      //   console.error('Error parsing payout methods response:', err)
      return []
    }
  }
  async deletePaymentMethod() {
    await this.goToPaymentMethodPage()

    await this.delayAfterAction(2000)

    const actionBtn = this.page.getByTestId('action-btn')

    for (let i = 0; i < (await actionBtn.count()); i++) {
      await actionBtn.first().click()
      // Get the payment method name of each action button
      await this.page.getByRole('menuitem', { name: 'Delete' }).first().click()
      await this.page.waitForSelector('[data-testid="confirm-btn"]', {
        state: 'visible',
        timeout: 10000,
      })
      await this.page.getByRole('button', { name: 'Confirm' }).click()
      await this.delayAfterAction()
      expect(
        this.page
          .getByText('You have successfully deleted a payment method!')
          .first()
      ).toBeVisible()
    }
  }

  async checkPaymentMethod() {
    await this.goToPaymentMethodPage()
    const message =
      'You do not have any enabled payment method. Students will not be able to complete the application process.'

    if (!this.isStripeActive || !this.isOtherMethodActive) {
      expect(this.page.getByText(message).first()).toBeVisible()
    } else {
      expect(this.page.getByText(message).first()).not.toBeVisible()
    }
  }

  async createPaymentMethod() {
    await this.goToPaymentMethodPage()
    await this.page.getByRole('button', { name: 'Add payment method' }).click()

    await this.page.getByTestId('method-name-input').fill(`Method${timestamp}`)
    await this.page.getByTestId('instruction-input').fill(`Test ${timestamp}`)

    await this.page.getByRole('button', { name: 'Save' }).click()
    await this.delayAfterAction()

    expect(
      this.page
        .getByText('You have successfully created a payment method!')
        .first()
    ).toBeVisible()

    expect(
      this.page.getByRole('heading', { name: `Method${timestamp}` }).first()
    ).toBeVisible()

    await this.reloadAndValidate(
      this.page.getByText(`Method${timestamp}`).first(),
      `Method${timestamp}`
    )
  }

  async editPaymentMethod() {
    await this.goToPaymentMethodPage()

    const actionBtn = this.page.getByTestId('action-btn').first()
    if (await actionBtn.isVisible()) {
      await actionBtn.click()
      await this.page
        .getByRole('menuitem', { name: 'Edit payment method' })
        .first()
        .click()

      await this.page
        .getByTestId('method-name-input')
        .fill(`Method${timestamp} Updated`)
      await this.page
        .getByTestId('instruction-input')
        .fill(`Test ${timestamp} Updated`)

      await this.page.getByRole('button', { name: 'Save' }).click()
      await this.delayAfterAction()
      expect(
        this.page
          .getByText('You have successfully updated a payment method!')
          .first()
      ).toBeVisible()

      expect(
        this.page
          .getByRole('heading', { name: `Method${timestamp} Updated` })
          .first()
      ).toBeVisible()

      await this.reloadAndValidate(
        this.page.getByTestId('method-name-input'),
        `Method${timestamp} Updated`
      )
    }
  }

  async enableAndDisablePaymentMethod() {
    await this.goToPaymentMethodPage()
    await this.page.waitForSelector('[data-testid="switch-btn"]', {
      state: 'visible',
      timeout: 10000,
    })
    const switchBtn = this.page.getByTestId('switch-btn').first()

    if (await switchBtn.isVisible()) {
      let oldStatus = await switchBtn.getAttribute('data-state')
      await switchBtn.click()
      await this.page.getByTestId('confirm-btn').click()
      await this.delayAfterAction()
      let currentStatus = await switchBtn.getAttribute('data-state')
      expect(currentStatus).not.toBe(oldStatus)
      expect(
        this.page
          .getByText('You have successfully updated a payment method!')
          .first()
      ).toBeVisible()
      oldStatus = await switchBtn.getAttribute('data-state')
      await switchBtn.click()
      await this.page.getByTestId('confirm-btn').click()
      await this.delayAfterAction()
      currentStatus = await switchBtn.getAttribute('data-state')
      expect(currentStatus).not.toBe(oldStatus)
      expect(
        this.page
          .getByText('You have successfully updated a payment method!')
          .first()
      ).toBeVisible()
    }
  }
}

export default PaymentMethodPage
