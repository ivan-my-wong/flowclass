import { expect, Page, test } from '@playwright/test'

import { login } from '../setup'

test.describe.skip('Coupon', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await login({ browser })
  })

  test.afterAll(async ({ browser }) => {
    await browser.close()
  })

  test('Create & Delete Coupon', async () => {
    // create a new todo locator
    await page.locator('#promotion').click()
    await page.getByText('Coupon').click()
    await page.getByRole('button', { name: 'Add' }).click()
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(
      page.getByText('You have created coupon code successfully')
    ).toBeVisible()

    await page.locator('#dropdownMenu > svg').first().nth(0).click()

    await page.getByRole('menuitem', { name: 'View detail' }).click()
    await page.getByRole('button', { name: 'Set as Inactive' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText('Update coupon successfully')).toBeVisible()

    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText('Delete coupon successfully')).toBeVisible()
  })
})
