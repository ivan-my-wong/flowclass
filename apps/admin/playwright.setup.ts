/* eslint-disable */
import { chromium, FullConfig } from '@playwright/test'
import LoginPage from './tests/pages/login.page'

const globalSetup = async (config: FullConfig) => {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  const page = await context.newPage()

  const loginPage = new LoginPage(page)
  await loginPage.login()

  await context.storageState({ path: './tests/auth.json' })

  await browser.close()
}

export default globalSetup
