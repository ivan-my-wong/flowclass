import { expect, Page, test } from '@playwright/test'

import { testLogoImage } from '../const'
import { login } from '../setup'

test.describe.skip('Payment Methods', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await login({ browser })
  })

  test.afterAll(async ({ browser }) => {
    await browser.close()
  })

  test('Add and delete payment method', async () => {
    await page.locator('#payment').click()

    // wait until the page is loaded
    // await page
    //   .getByRole('heading', { name: 'Create a Stripe Account' })
    //   .waitFor({ state: 'visible' })
    await page
      .getByRole('heading', { name: 'Online Payment Methods' })
      .waitFor({ state: 'visible' })

    await page
      .getByRole('button', { name: '+ Register new payment method' })
      .click()
    await page.locator('#paymentMethodName').fill('Bank')
    await page.locator('#accountName').click()
    await page.locator('#accountName').fill('123')
    await page.locator('#accountNumber').click()
    await page.locator('#accountNumber').fill('123')
    await page.locator('#bankName').click()
    await page.locator('#bankName').fill('123')
    await page.locator('#bankBranch').click()
    await page.locator('#bankBranch').fill('123')
    await page.locator('textarea').click()
    await page.locator('textarea').fill('Test')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(
      page.getByText('You have successfully created a payment method!')
    ).toBeVisible()

    await page
      .getByRole('button', { name: '+ Register new payment method' })
      .click()
    await page.getByRole('combobox').click()
    await page.getByLabel('Other').getByText('Other').click()
    await page.locator('#paymentMethodName').click()
    await page.locator('#paymentMethodName').fill('Other')
    await page.locator('#accountName').click()
    await page.locator('#accountName').fill('123')
    await page.locator('#paymentDetails').click()
    await page.locator('#paymentDetails').fill('123')
    await page.locator('#payoutUrl').click()
    await page.locator('#payoutUrl').fill('123')

    // Start waiting for file chooser before clicking. Note no await.
    await page.getByRole('button', { name: 'Upload Image' }).click()
    const fileChooserPromise = page.waitForEvent('filechooser')

    // Uploading a file
    await page.getByRole('button', { name: 'Upload Image' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(testLogoImage)

    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByText('image uploaded successfully')).toBeVisible()
    await page.locator('textarea').click()
    await page.locator('textarea').fill('Test')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(
      page.getByText('You have successfully created a payment method!').nth(0)
    ).toBeVisible()

    const switchElement = page.getByRole('switch').nth(2)
    switchElement.waitFor({ state: 'visible' })
    await switchElement.click()

    await expect(
      page.getByText('view this payment option when enrolling in the course.')
    ).toBeVisible()

    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(
      page.getByText('You have successfully updated a payment method!')
    ).toBeVisible()

    await page.getByRole('button', { name: 'Manage' }).nth(3).click()
    await page.locator('#paymentMethodName').click()
    await page.locator('#paymentMethodName').fill('Other Changed')
    await page.locator('#accountName').click()
    await page.locator('#accountName').fill('123123')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(
      page.getByText('You have successfully updated a payment method!')
    ).toBeVisible()
    await page.getByRole('button', { name: 'Delete' }).nth(2).click()
    await expect(page.getByText('Delete Payment Method')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(
      page.getByText('You have successfully deleted a payment method!')
    ).toBeVisible()
    await page.getByRole('button', { name: 'Delete' }).nth(2).click()
    await expect(page.getByText('Delete Payment Method')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()
  })
})
