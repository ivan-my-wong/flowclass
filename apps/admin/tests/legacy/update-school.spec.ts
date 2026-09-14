import { expect, Page, test } from '@playwright/test'

import { testBannerImage, testLogoImage } from '../const'
import { dismissTourIfVisible, login } from '../setup'

test.describe.skip('Testing School Info', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await login({ browser })
  })

  test.afterAll(async ({ browser }) => {
    await browser.close()
  })

  test('Update School Information', async () => {
    await page.locator('#homepage').click()

    await dismissTourIfVisible(page)

    await page.locator('#name').click()

    await page.locator('#name').fill('Playwright Test')
    await page
      .locator('#schoolLogoBox')
      .getByRole('button', { name: 'Upload Image' })
      .click()

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: 'Upload Image' }).click(),
    ])

    await fileChooser.setFiles([testLogoImage])

    await page
      .getByLabel('Use the arrow keys to move the crop selection area')
      .click()

    await page.getByRole('button', { name: 'Confirm' }).click()
    await page
      .locator('#bannerImage')
      .getByRole('button', { name: 'Upload Image' })
      .click()

    const [fileChooser2] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: 'Upload Image' }).click(),
    ])

    await fileChooser2.setFiles([testBannerImage])

    await page.getByRole('button', { name: 'Confirm' }).click()

    // await page.getByPlaceholder('Choose a short and easy-to-').click()
    // await page
    //   .getByPlaceholder('Choose a short and easy-to-')
    //   .fill(`testing-link${Math.random().toString(36).substring(7)}`)

    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText('School is successfully')).toBeVisible()

    const page3Promise = page.waitForEvent('popup')
    await page.getByRole('button', { name: 'View your site' }).click()
    const page3 = await page3Promise

    await expect(page.getByText('School is successfully')).toBeVisible()

    await expect(page3).toHaveTitle(/Online Application/)
  })

  test('Update School Contact Info', async () => {
    await page.locator('#contact').click()
    await page.getByPlaceholder('1 (702) 123-').fill('+852 1234 5678')
    await page.locator('#email').fill('flowclasstest@gmail.com')

    await page.locator('#email').fill('flowclasstest3@gmail.com')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await page.locator('#state').fill('Hong Kong')

    await page.locator('#area').fill('San Po Kong')
    await page.locator('#addressLine1').fill('Unit A16')
    await page
      .locator('#addressLine2')
      .fill(`Chiap King Industrial Building${Date.now()}`)
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(
      page.locator(':text("School is successfully")').first()
    ).toBeVisible()
  })

  test('Update Site Theme Color', async () => {
    await page.locator('#homepage').click()
    await page.getByRole('button', { name: 'Update website branding' }).click()
    await page.locator('#themeColorPick').click()
    await page
      .locator('main')
      .filter({ hasText: 'SettingsSaveSite BrandingSite' })
      .getByRole('img')
      .nth(2)
      .click()
    await page.locator('#themeColorPick').fill('#3bba94')
    await page.locator('button').filter({ hasText: 'Hero' }).click()
    await page.getByLabel('Vertical').click()
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('You have updated the site')).toBeVisible()
  })
})
