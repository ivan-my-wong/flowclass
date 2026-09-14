import { expect, Locator, Page } from '@playwright/test'
import { BasePage } from './base.page'

export class WhatsappIntegrationPage extends BasePage {
  readonly connectWhatsappButton: Locator
  readonly signupModal: Locator
  readonly signupModalTitle: Locator
  readonly newNumberOption: Locator
  readonly businessAppOption: Locator
  readonly continueFbButton: Locator
  readonly cancelModalButton: Locator
  readonly tabsList: Locator
  readonly connectionTab: Locator
  readonly sendTestMessageTab: Locator
  readonly businessProfileTab: Locator
  readonly sendTestButton: Locator
  readonly saveProfileButton: Locator

  constructor(page: Page) {
    super(page)
    this.connectWhatsappButton = page.locator('button:has-text("Connect WhatsApp Business"), button:has-text("Reconnect / Manage Meta Account")')
    this.signupModal = page.locator('[role="dialog"]')
    this.signupModalTitle = page.locator('[role="dialog"] h2:has-text("Connect WhatsApp Business"), [role="dialog"] :text("Connect WhatsApp Business")')
    this.newNumberOption = page.locator('text="New or Existing Dedicated WhatsApp Number"')
    this.businessAppOption = page.locator('text="WhatsApp Business App (Coexistence)"')
    this.continueFbButton = page.locator('button:has-text("Continue with Facebook")')
    this.cancelModalButton = page.locator('[role="dialog"] button:has-text("Cancel")')
    this.tabsList = page.locator('[role="tablist"]')
    this.connectionTab = page.locator('[role="tab"]:has-text("Connection")')
    this.sendTestMessageTab = page.locator('[role="tab"]:has-text("Send Test Message")')
    this.businessProfileTab = page.locator('[role="tab"]:has-text("Business Profile")')
    this.sendTestButton = page.locator('button:has-text("Send Test Message")')
    this.saveProfileButton = page.locator('button:has-text("Save Profile")')
  }

  async gotoWhatsappIntegration() {
    await this.goto('/integrations/whatsapp')
    await this.page.waitForLoadState('networkidle')
  }

  async verifyPageLoaded() {
    await expect(this.page.locator('text=Meta WhatsApp Business Cloud API')).toBeVisible()
    await expect(this.tabsList).toBeVisible()
    await expect(this.connectionTab).toBeVisible()
    await expect(this.sendTestMessageTab).toBeVisible()
    await expect(this.businessProfileTab).toBeVisible()
  }

  async openEmbeddedSignupModal() {
    await expect(this.connectWhatsappButton).toBeVisible()
    await this.connectWhatsappButton.click()
    await expect(this.signupModal).toBeVisible()
    await expect(this.signupModalTitle.first()).toBeVisible()
  }

  async verifyModalJourneys() {
    // Verify Journey selection radio buttons and explanations
    await expect(this.newNumberOption).toBeVisible()
    await expect(this.businessAppOption).toBeVisible()
    await expect(this.continueFbButton).toBeVisible()
    await expect(this.cancelModalButton).toBeVisible()
  }

  async selectCoexistenceJourney() {
    await this.businessAppOption.click()
    await expect(this.page.locator('text=Keep using your WhatsApp Business App on your phone')).toBeVisible()
  }

  async selectNewNumberJourney() {
    await this.newNumberOption.click()
    await expect(this.page.locator('text=Best for new phone numbers')).toBeVisible()
  }

  async closeModal() {
    await this.cancelModalButton.click()
    await expect(this.signupModal).not.toBeVisible()
  }

  async verifyTestMessageTab() {
    await this.sendTestMessageTab.click()
    await expect(this.page.locator('text=Recipient Phone Number')).toBeVisible()
    await expect(this.page.locator('text=Select WhatsApp Template')).toBeVisible()
    await expect(this.sendTestButton).toBeVisible()
  }

  async verifyBusinessProfileTab() {
    await this.businessProfileTab.click()
    await expect(this.page.locator('text=WhatsApp Business Profile')).toBeVisible()
    await expect(this.page.locator('text=About / Tagline')).toBeVisible()
    await expect(this.page.locator('text=Address')).toBeVisible()
    await expect(this.page.locator('text=Websites (comma separated)')).toBeVisible()
    await expect(this.saveProfileButton).toBeVisible()
  }
}

export default WhatsappIntegrationPage
