import { test as baseTest, expect } from '@playwright/test'
import WhatsappIntegrationPage from './pages/whatsapp-integration.page'

const test = baseTest.extend<{ whatsappIntegrationPage: WhatsappIntegrationPage }>({
  whatsappIntegrationPage: async ({ page }, use) => {
    await use(new WhatsappIntegrationPage(page))
  },
})

test.use({
  storageState: './tests/auth.json',
})

test.describe('WhatsApp Meta Integration & Embedded Signup Modal', () => {
  test.beforeEach(async ({ whatsappIntegrationPage }) => {
    await whatsappIntegrationPage.gotoWhatsappIntegration()
  })

  test('Should load WhatsApp Meta Integration settings page correctly', async ({
    whatsappIntegrationPage,
  }) => {
    await whatsappIntegrationPage.verifyPageLoaded()
  })

  test('Should pop up Meta Embedded Signup Modal when clicking Connect/Reconnect', async ({
    whatsappIntegrationPage,
  }) => {
    await whatsappIntegrationPage.openEmbeddedSignupModal()
    await whatsappIntegrationPage.verifyModalJourneys()
  })

  test('Should switch between New Dedicated Number and Coexistence onboarding modes', async ({
    whatsappIntegrationPage,
  }) => {
    await whatsappIntegrationPage.openEmbeddedSignupModal()
    await whatsappIntegrationPage.selectCoexistenceJourney()
    await whatsappIntegrationPage.selectNewNumberJourney()
    await whatsappIntegrationPage.closeModal()
  })

  test('Should switch tabs and display Send Test Message & Business Profile configuration', async ({
    whatsappIntegrationPage,
  }) => {
    await whatsappIntegrationPage.verifyTestMessageTab()
    await whatsappIntegrationPage.verifyBusinessProfileTab()
  })
})
