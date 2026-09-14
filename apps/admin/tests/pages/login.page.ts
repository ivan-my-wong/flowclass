import { expect, Page } from '@playwright/test'
import { testAccount } from '../const'
import { BasePage } from './base.page'
import dayjs from 'dayjs'
import fs from 'fs'

class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  // private async screenshotNow() {
  //   if (!fs.existsSync('tests/screenshots')) {
  //     fs.mkdirSync('tests/screenshots')
  //   }
  //   await this.page.screenshot({
  //     path: `tests/screenshots/login-${dayjs().format(
  //       'YYYY-MM-DD-HH-mm-ss'
  //     )}.png`,
  //   })
  // }

  async login() {
    await this.goto(`login`)
    await this.page.waitForSelector('#email', { state: 'visible' })
    // await this.screenshotNow()
    await this.page.locator('#email').fill(testAccount.email)
    // await this.screenshotNow()
    await this.page.locator('#password').fill(testAccount.password)
    // await this.screenshotNow()
    const submitButton = await this.page.getByRole('button', { name: /login/i })
    await expect(submitButton).toBeEnabled()
    // await this.screenshotNow()

    await submitButton.click()

    const element = this.page.getByText('Dashboard')
    await element.waitFor({ state: 'visible', timeout: 10000 })
    await this.page.waitForLoadState('networkidle')
  }
}

export default LoginPage
