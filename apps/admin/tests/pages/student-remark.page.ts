import { expect } from '@playwright/test'
import StudentPage from './student.page'

class StudentRemarkPage extends StudentPage {
  async openRemarkMenu(studentName: string) {
    await this.goToList()
    await this.page
      .getByPlaceholder('Search by name / email / phone number')
      .fill(studentName)

    await this.delayAfterAction()

    await this.page.getByTestId(`action-button-${studentName}`).click()
    // Wait for library to update the ui, because the menu is not visible immediately
    await this.waitForMenuVisibility('Add remark')
    const remarkTriggerButton = this.page.getByTestId('remark-trigger-button')
    if (await remarkTriggerButton.isVisible({ timeout: 10000 })) {
      await remarkTriggerButton.click()
    }
  }

  async addOrEditRemark(studentName: string, value: string) {
    await this.openRemarkMenu(studentName)
    await this.page
      .getByPlaceholder('please type your remarks here')
      .fill(value)
    await this.page.getByRole('button', { name: 'Confirm' }).click()
    await this.delayAfterAction()
    expect(this.page.getByText('Memo add successfully!').first()).toBeVisible()
  }

  async deleteRemark(studentName: string) {
    await this.openRemarkMenu(studentName)
    await this.page.getByRole('button', { name: 'Delete' }).click()
    await this.delayAfterAction()
    expect(
      this.page.getByText('Memo delete successfully!').first()
    ).toBeVisible()
  }
}

export default StudentRemarkPage
