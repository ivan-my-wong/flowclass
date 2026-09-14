import { test as baseTest } from '@playwright/test'
import CustomMessagesPage from './pages/custom-messages.page'

const test = baseTest.extend<{ customMessagesPage: CustomMessagesPage }>({
  customMessagesPage: async ({ page }, use) => {
    await use(new CustomMessagesPage(page))
  },
})

test.use({
  storageState: './tests/auth.json',
})

test.describe('Custom Messages', () => {
  test('Should successfully fetch all custom messages', async ({
    customMessagesPage,
  }) => {
    await customMessagesPage.goToList()
  })

  test('Should successfully update a custom message', async ({
    customMessagesPage,
  }) => {
    await customMessagesPage.updateCustomMessage()
  })

  test('Should show whatsapp web connection alert and scan qr code if no session and remove session if session is connected', async ({
    customMessagesPage,
  }) => {
    await customMessagesPage.checkWhatsappWebConnectionAlert()
  })
})
