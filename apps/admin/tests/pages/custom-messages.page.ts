import { expect } from '@playwright/test'
import { testWhatsappPhoneNumber } from '../const'
import { BasePage } from './base.page'

class CustomMessagesPage extends BasePage {
  async goToList(checkTitle?: boolean) {
    await this.goto('custom-messages')
    await this.delayAfterAction()
    if (checkTitle) {
      await expect(
        this.page.getByText('Notification Template').first()
      ).toBeVisible()
    }
  }

  get viewTypeOptionsTestIds(): Record<string, string> {
    return {
      'Notify Admin After Enrollment Submitted':
        'admin_notif_after_enrollment_submitted',
      'Notify Student After Enrollment Submitted':
        'student_notif_after_enrollment_submitted',
      'Notify Student After Payment Approved':
        'student_notif_after_payment_approved',
      'Notify Student After Payment Rejected':
        'student_notif_after_payment_rejected',
      'Notify Student After Application Confirmed':
        'student_notif_after_application_confirmed',
      'Notify Teacher After Application Submitted':
        'teacher_notif_after_application_submitted',
      'Notify Student After Add New Lesson':
        'student_notif_after_add_new_lesson',
      'Notify Teacher After Add New Class': 'teacher_notif_after_add_new_class',
      'Notify Student Payment Reminder': 'student_notif_payment_reminder',
      'Notify Student After Change Lesson Date':
        'student_notif_after_change_lesson_date',
      'Student Lesson Reminder': 'student_lesson_reminder',
      'Notify Student New Invoice Created': 'create_invoice',
    }
  }

  async updateCustomMessage() {
    await this.goToList()
    await this.page.waitForSelector('[data-testid="edit-custom-message"]')
    const count = await this.page
      .locator('[data-testid="edit-custom-message"]')
      .count()
    if (count > 0) {
      await this.page
        .locator('[data-testid="edit-custom-message"]')
        .first()
        .click()
      await this.page.waitForSelector('[data-testid="custom-message-form"]')
      const inputName = await this.page.getByTestId('custom-message-name')
      expect(inputName).toBeVisible()
      await inputName.fill('Test')
      // await this.page.getByTestId('custom-message-type').click()
      // await this.page.getByRole('option').first().click()

      const inputContent = await this.page.locator('[name="content"]')
      expect(inputContent).toBeVisible()
      const currentContent = await inputContent.inputValue()
      await inputContent.fill(`${currentContent} - Updated`)
      // Move pointer to last content text
      await inputContent.focus()
      await this.page.keyboard.press('End')

      const contentVariable = await this.page.getByTestId('content-variable')
      expect(contentVariable.first()).toBeVisible()
      await contentVariable.first().click()
      await this.delayAfterAction()
      const saveButton = await this.page.getByTestId('save-custom-message')
      expect(saveButton).toBeVisible()
      await saveButton.click()
      await this.delayAfterAction()
      await expect(
        this.page.getByText('Notification template updated successfully')
      ).toBeVisible()
    }
  }

  async prepareWhatsappPhoneNumber() {
    await this.goto('contact')
    await this.page.waitForSelector('[type="tel"]')
    const phoneNumberInput = this.page.locator('[type="tel"]')
    const currentPhoneNumber = await phoneNumberInput.inputValue()
    if (currentPhoneNumber.replaceAll(' ', '') !== testWhatsappPhoneNumber) {
      await phoneNumberInput.fill(testWhatsappPhoneNumber)
      const saveChangesBtn = this.page.getByText('Save changes', {
        exact: true,
      })
      expect(saveChangesBtn).toBeVisible()
      await saveChangesBtn.click()
      await this.delayAfterAction()
      await expect(
        this.page.getByText('School is successfully updated')
      ).toBeVisible()
    }
  }

  async checkWhatsappWebConnectionAlert() {
    await this.prepareWhatsappPhoneNumber()
    await this.goToList()

    await expect(
      this.page.getByTestId('whatsapp-web-connection-alert').first()
    ).toBeVisible()

    const whatsappNotConnected = await this.page
      .getByText('WhatsApp Not Connected')
      .isVisible()
    const whatsappConnected = await this.page
      .getByText('WhatsApp Connected')
      .isVisible()

    if (whatsappNotConnected) {
      await this.scanWhatsappWebQRCode()
    } else if (whatsappConnected) {
      await this.removeWhatsappWebConnection()
    } else {
      throw new Error('Whatsapp Web Connection Alert not found')
    }
  }

  async scanWhatsappWebQRCode() {
    const scanQRCodeBtn = this.page.getByTestId('click-to-scan-qr-code')
    expect(scanQRCodeBtn).toBeVisible()
    await scanQRCodeBtn.click()
    await this.delayAfterAction()
    const qrCode = this.page.getByTestId('qr-code')
    expect(qrCode).toBeVisible()
    await this.page.waitForTimeout(10000)
  }

  async removeWhatsappWebConnection() {
    const removeSessionBtn = this.page.getByTestId('remove-session-button')
    expect(removeSessionBtn).toBeVisible()
    await removeSessionBtn.click()
    // Should be show confirm dialog
    await this.page.getByTestId('remove-btn').click()
    await this.delayAfterAction()
    await expect(
      this.page.getByText('Whatsapp Session Removed Successfully')
    ).toBeVisible()
  }
}

export default CustomMessagesPage
