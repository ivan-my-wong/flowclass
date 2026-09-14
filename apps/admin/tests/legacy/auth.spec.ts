import { expect, test } from '@playwright/test'

import { rootDomain, testAccount } from '../const'

test.describe.configure({ mode: 'serial' })

test.describe.skip('Test Flowclass Backend', () => {
  test('register new account', async ({ page }) => {
    await page.goto(`${rootDomain}/register`)

    await expect(page).toHaveTitle(/Flowclass:/)
    // Expect a title "to contain" a substring.

    await page.goto(`${rootDomain}/register`)

    await page
      .getByPlaceholder('example@gmail.com')
      .fill('flowclasstest@gmail.com')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await page.getByPlaceholder('John Smith').fill('John Doe')

    await page.locator('#password').fill('Flow')
    await expect(page.getByText('Password is too short. Please')).toBeVisible()

    await page.locator('#password').fill('FlowclassTest')
    await expect(page.getByText('Your password must include at')).toBeVisible()

    await page.locator('#password').fill('FlowclassTest123')

    await page.locator('#confirm-password').fill('Flow')
    await expect(page.getByText('Password is not the same.')).toBeVisible()

    await page.locator('#confirm-password').fill('FlowclassTest123')
    await page.getByRole('button').first().click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await page.getByPlaceholder('John Smith').fill('John Doe')

    await page.getByRole('button', { name: 'Register' }).click()

    await expect(page.getByText('A user already exists with')).toBeVisible()
  })

  test('login', async ({ page }) => {
    // create a new todo locator
    await page.goto(`${rootDomain}/login`)
    await page.locator('#email').fill(testAccount.email)

    await page.locator('#password').fill(testAccount.password)
    // Create 1st todo.

    const submitButton = await page.getByRole('button', { name: /login/i })
    await expect(submitButton).toBeEnabled()
  })
})
