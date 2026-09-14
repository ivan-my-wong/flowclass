// tests/pages/onboarding.page.ts
import { Page, Locator, expect } from '@playwright/test'
import { delayTimeout, rootDomain } from '../const'
import { className, classPrice, timestamp, detailedTimestamp } from '../const'
import path from 'path'
export class OnboardingPage {
  readonly page: Page
  readonly nextButton: Locator
  readonly manuallyCreateStudentButton: Locator
  readonly schoolNameInput: Locator
  readonly siteNameInput: Locator
  readonly emailInput: Locator
  readonly phoneInput: Locator
  readonly countrySelect: Locator
  readonly logoUploadInput: Locator
  readonly colorPicker: Locator
  readonly bannerUploadInput: Locator
  readonly textEditorContainer: Locator
  readonly confirmButton: Locator
  readonly courseNameInput: Locator
  readonly courseLinkInput: Locator
  readonly qrCodeSwitch: Locator
  readonly classTypeOptions: Locator
  readonly classNameInput: Locator
  readonly classTuitionInput: Locator
  readonly classQuotaInput: Locator
  readonly priceOptionButton: Locator
  readonly stripeConnectSwitch: Locator
  readonly paymentMethodNameInput: Locator
  readonly paymentInstructionsInput: Locator
  readonly applicationFormNameInput: Locator
  readonly applicationFormDescriptionInput: Locator
  readonly skipButton: Locator
  readonly setUpNowButton: Locator
  readonly skipForNowButton: Locator
  readonly resumeOnboardingButton: Locator

  constructor(page: Page) {
    this.page = page
    this.nextButton = page.getByTestId('next-button')
    this.manuallyCreateStudentButton = page.getByRole('button', {
      name: 'Manually Create Student Later',
    })
    this.schoolNameInput = page.getByRole('textbox', { name: 'School Name' })
    this.siteNameInput = page.locator('input[name="siteName"]')
    this.emailInput = page.locator('input[name="email"]')
    this.phoneInput = page.locator('#phone')
    this.countrySelect = page.getByTestId('country-select')
    this.logoUploadInput = page.locator('input[type="file"]').first()
    this.colorPicker = page.getByTestId('color-picker')
    this.textEditorContainer = page.locator('.ql-container')
    this.confirmButton = page.getByRole('button', { name: 'Confirm' })
    this.courseNameInput = page.locator('input[name="courseName"]')
    this.courseLinkInput = page.locator('input[name="courseLink"]')
    this.bannerUploadInput = page.locator('input[type="file"]').first()
    this.qrCodeSwitch = page.locator('button[role="switch"][aria-checked]')
    this.classTypeOptions = page.locator('[role="radiogroup"]').first()
    this.classNameInput = page.locator('input[name="className"]')
    this.classTuitionInput = page.locator('input[name="classTuition"]')
    this.classQuotaInput = page.locator('input[name="classQuota"]')
    this.priceOptionButton = page
      .locator('button[role="combobox"]')
      .filter({
        hasText: /Per class|Per lesson/,
      })
      .first()
    this.stripeConnectSwitch = page.locator('button[role="switch"]').first()
    this.paymentMethodNameInput = page.getByRole('textbox', {
      name: 'Method Name',
    })
    this.paymentInstructionsInput = page.getByRole('textbox', {
      name: 'Payment Instructions',
    })
    this.applicationFormNameInput = page.getByRole('textbox', {
      name: 'Form Name',
    })
    this.applicationFormDescriptionInput = page.getByRole('textbox', {
      name: 'Form Description',
    })
    this.skipButton = page.getByText('Skip', { exact: true })
    this.setUpNowButton = page.getByRole('radio', {
      name: 'Yes, set up now',
    })
    this.skipForNowButton = page.getByRole('radio', {
      name: 'No, skip for now',
    })
    this.resumeOnboardingButton = page.getByRole('button', {
      name: 'Resume Onboarding',
    })
  }

  async navigateToSetup() {
    await this.page.goto(`${rootDomain}/welcome/set-up`)
  }

  async proceedToStep(step: number) {
    for (let i = 1; i < step; i++) {
      await this.nextButton.click()
      await this.page.waitForTimeout(500)
    }
  }

  async delayAfterAction(timeout: number = delayTimeout) {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(timeout)
  }

  async fillSchoolInfo(
    schoolName: string,
    siteName: string,
    phone: string,
    country: string
  ) {
    await this.schoolNameInput.fill(schoolName)
    await this.siteNameInput.fill(siteName)
    await this.phoneInput.fill(phone)
    await this.countrySelect.click()
    await this.page
      .locator('[data-testid="country-select"] input[role="combobox"]')
      .fill(country)
    await this.page.waitForTimeout(300)
    await this.page
      .locator('[data-testid="country-select"] input[role="combobox"]')
      .press('Enter')
  }

  async uploadLogo(logoPath: string) {
    await this.logoUploadInput.setInputFiles(logoPath)
    await this.confirmButton.waitFor({ state: 'visible' })
    await this.confirmButton.click()
    // Wait for upload to complete
    await this.page.waitForTimeout(1000)
    await expect(
      this.page.getByText('Image uploaded successfully')
    ).toBeVisible({
      timeout: 5000,
    })
  }

  async selectThemeColor(hexColor: string = '3498db') {
    // Remove # if it exists
    const colorValue = hexColor.replace('#', '')

    // Click to open the color picker popover
    await this.colorPicker.click()

    // Wait for the popover to be visible
    await this.page
      .getByTestId('color-picker-popover')
      .waitFor({ state: 'visible' })

    // Enter the hex value directly in the input field (without the #)
    await this.page
      .getByTestId('color-picker-popover')
      .getByRole('textbox')
      .fill(colorValue)

    // Click outside to close the popover and apply the color
    await this.page
      .getByTestId('color-picker-popover')
      .locator('svg')
      .first()
      .click()

    // Verify the color was applied by checking the color picker display
    await expect(this.colorPicker).toContainText(colorValue.toUpperCase())
  }

  async fillSchoolDescription(description: string) {
    // Click into the editor to focus it
    await this.textEditorContainer.locator('.ql-editor').click()

    // Clear existing content
    await this.page.click('.ql-editor', { clickCount: 3 })
    await this.page.keyboard.press('Delete')

    // Type the new description
    await this.page.keyboard.type(description)
  }

  async toggleQRCode(enable: boolean = true) {
    // Check current state
    const isCurrentlyEnabled =
      (await this.qrCodeSwitch.getAttribute('aria-checked')) === 'true'

    // Only click if the current state doesn't match the desired state
    if (isCurrentlyEnabled !== enable) {
      await this.qrCodeSwitch.click()

      // Verify the switch changed to the expected state
      const expectedState = enable ? 'true' : 'false'
      await expect(this.qrCodeSwitch).toHaveAttribute(
        'aria-checked',
        expectedState,
        {
          timeout: 2000,
        }
      )
    }
  }

  async fillCourseInfo(
    courseName: string,
    courseLink: string,
    imagePath: string,
    description: string
  ) {
    await this.courseNameInput.fill(courseName)
    await this.courseLinkInput.fill(courseLink)
    await this.bannerUploadInput.setInputFiles(imagePath)

    if (
      await this.confirmButton.isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      await this.confirmButton.click()
    }

    // Wait for upload to complete
    await this.page.waitForTimeout(1000)

    // Verify toast notification for successful upload (supports both English and Chinese)
    await expect(
      this.page.getByText('Image uploaded successfully').first()
    ).toBeVisible({
      timeout: 8000,
    })

    // Click into the editor to focus it
    await this.textEditorContainer.locator('.ql-editor').click()

    // Clear existing content
    await this.page.click('.ql-editor', { clickCount: 3 })
    await this.page.keyboard.press('Delete')

    // Type the new description
    await this.page.keyboard.type(description)

    await this.toggleQRCode(true)
  }

  async createClass(config: {
    multiple?: boolean
    dropin?: boolean
    i?: number
    type?: 'regular' | 'workshop' | 'recurring' | 'subscription'
  }) {
    const { multiple, dropin, type = 'regular' } = config
    await this.page.getByTestId(type).click()
    await this.delayAfterAction()

    await this.classNameInput.fill(className)

    await this.classTuitionInput.fill(classPrice)

    await this.priceOptionButton.click()

    const listboxSelector = '[role="listbox"][data-state="open"]'
    await this.page.waitForSelector(listboxSelector, {
      state: 'visible',
      timeout: 5000,
    })
    await this.page
      .locator(`${listboxSelector} [role="option"]`)
      .first()
      .click()

    await this.priceOptionButton.click()

    await this.page.waitForSelector(listboxSelector, {
      state: 'visible',
      timeout: 5000,
    })
    await this.page.locator(`${listboxSelector} [role="option"]`).nth(1).click()

    await this.classQuotaInput.fill('30')

    if (await this.page.getByTestId('add-lesson-btn').isVisible()) {
      await this.page.getByTestId('add-lesson-btn').click()
    }

    if (
      await this.page.getByRole('heading', { name: 'Weekly hours' }).isVisible()
    ) {
      await this.page.locator('#Sunday').click()
      await this.page.getByRole('button', { name: 'Confirm' }).click()
      await this.delayAfterAction()
      await this.page.locator('#Monday').click()
      await this.page.getByRole('button', { name: 'Confirm' }).click()
      await this.delayAfterAction()
      await this.page.locator('#Tuesday').click()
      await this.page.getByRole('button', { name: 'Confirm' }).click()
      await this.delayAfterAction()
      await this.page.locator('#Wednesday').click()
      await this.page.getByRole('button', { name: 'Confirm' }).click()
      await this.delayAfterAction()
      await this.page.locator('#Thursday').click()
      await this.page.getByRole('button', { name: 'Confirm' }).click()
      await this.delayAfterAction()
      await this.page.locator('#Friday').click()
      await this.page.getByRole('button', { name: 'Confirm' }).click()
      await this.delayAfterAction()
      await this.page.locator('#Saturday').click()
      await this.page.getByRole('button', { name: 'Confirm' }).click()
      await this.delayAfterAction()
    }

    if (multiple) {
      await this.page
        .getByTestId('multiple-classes-switch')
        .locator('button')
        .first()
        .click()
    }
    if (dropin) {
      await this.page.getByTestId('dropin-switch').locator('button').click()
    }
  }

  async createPaymentMethod() {
    await this.page
      .getByTestId('payment-method-name-input')
      .fill(`Method${timestamp}`)
    await this.page
      .getByTestId('payment-instructions-input')
      .fill(`Test ${timestamp}`)
    await this.uploadLogo(path.join(process.cwd(), 'tests/fixtures/logo.png'))
    await this.delayAfterAction(3000)
  }

  async fillApplicationForm(
    formName: string = `Form${detailedTimestamp}`,
    description: string = `Description${detailedTimestamp}`
  ) {
    await this.page.getByTestId('application-form-name-input').fill(formName)
    await this.page
      .getByTestId('application-form-description-input')
      .fill(description)
  }

  async createNewField(
    questionText: string = `Field${detailedTimestamp}`,
    fieldType: number = 0,
    required: boolean = false
  ) {
    await this.page.getByTestId('create-new-field-btn').click()
    await this.delayAfterAction(500)

    if (fieldType > 0) {
      await this.page.locator('#fieldTypeCombo').click()
      await this.delayAfterAction(300)
      await this.page.getByRole('option').nth(fieldType).click()
      await this.delayAfterAction(300)
    }

    if (required) {
      const switchEl = this.page.getByRole('switch').first()
      await switchEl.click()
      await this.delayAfterAction(300)
    }

    await this.page.getByTestId('question').fill(questionText)
    await this.delayAfterAction(300)

    await this.page.getByRole('button', { name: 'Create' }).click()
    await this.delayAfterAction(1000)

    await expect(
      this.page.getByText('Create student custom field successfully').first()
    ).toBeVisible({
      timeout: 5000,
    })
  }

  async addCustomDataField(fieldNames?: string | string[]) {
    await this.page.getByTestId('add-custom-data-field-btn').click()
    await this.delayAfterAction(500)

    if (fieldNames) {
      const fieldItems = this.page.getByTestId('field-item')
      const count = await fieldItems.count()
      const namesToFind = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
      const foundNames: string[] = []

      for (let i = 0; i < count; i++) {
        const item = fieldItems.nth(i)
        const text = await item.getByTestId('field-label').textContent()

        if (namesToFind.includes(text || '')) {
          await item.locator('label').click()
          foundNames.push(text || '')
          await this.delayAfterAction(100)
        }
      }

      const notFoundNames = namesToFind.filter(
        name => !foundNames.includes(name)
      )
      if (notFoundNames.length > 0) {
        console.warn(`Fields not found: ${notFoundNames.join(', ')}`)
        if (foundNames.length === 0) {
          await fieldItems.first().locator('label').click()
        }
      }
    } else {
      await this.page.getByTestId('field-item').first().locator('label').click()
    }

    await this.delayAfterAction(300)
    await this.page.getByRole('button', { name: 'Save' }).click()
    await this.delayAfterAction(1000)
  }

  async setupCompleteApplicationForm() {
    await this.fillApplicationForm()
    const shortAnswerFieldName = `ShortAnswer${detailedTimestamp}`
    const paragraphFieldName = `Paragraph${detailedTimestamp}`
    await this.createNewField(shortAnswerFieldName)
    await this.createNewField(paragraphFieldName, 1)

    await this.addCustomDataField([shortAnswerFieldName, paragraphFieldName])

    await this.delayAfterAction(1000)
    await expect(
      this.page.locator('div').filter({ hasText: shortAnswerFieldName }).first()
    ).toBeVisible({ timeout: 5000 })

    await expect(
      this.page.locator('div').filter({ hasText: paragraphFieldName }).first()
    ).toBeVisible({ timeout: 5000 })
  }

  async skipCurrentStep() {
    await this.skipButton.click()
    await this.confirmButton.click()
  }

  async waitForSuccess() {
    await expect(this.page.getByText('Success!')).toBeVisible({
      timeout: 30000,
    })
  }
}
