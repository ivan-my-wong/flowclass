import { test as baseTest } from '@playwright/test'
import ApplicationRecordPage from './pages/application-record.page'

const test = baseTest.extend<{ applicationPage: ApplicationRecordPage }>({
  applicationPage: async ({ page }, use) => {
    await use(new ApplicationRecordPage(page))
  },
})

test.use({
  storageState: './tests/auth.json',
})

test.describe('Application Record', () => {
  test('should the earliest start date be set correctly', async ({
    applicationPage,
  }) => {
    await applicationPage.checkFirstDate()
  })

  test('should search the application record', async ({ applicationPage }) => {
    await applicationPage.searchApplicationRecord()
  })

  test('should delete the application record', async ({ applicationPage }) => {
    await applicationPage.deleteApplicationRecord()
  })
  
})
