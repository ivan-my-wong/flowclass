import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import { generateDataTestId } from '../../src/utils/data-testid.utils'
import StudentPage from './student.page'
import { playwrightDefaultFieldNames } from '../const'

export const enrollName = `enroll${dayjs().format('YYMMDD')}`
const fieldName = `field${dayjs().format('YYMMDD')}_1`
const labelFieldName = generateDataTestId('label', fieldName)

class StudentFormPage extends StudentPage {
  async addEnrollmentFormField() {
    await this.goToList()
    const students = await this.getStudents()
    const firstStudent = students[0]
    await this.goToStudentDetail(firstStudent['StudentName'])

    await this.page
      .getByRole('button', { name: 'Add Custom Data Field' })
      .click()
    await this.page.getByPlaceholder('i.e. parent contact').fill(enrollName)
    await this.page.getByRole('button', { name: 'Add' }).first().click()
    await this.delayAfterAction()
    expect(
      this.page.getByText('Add enrollment custom field successfully').first()
    ).toBeVisible()

    await this.reloadAndValidate(
      this.page.getByTestId(`text-field-${fieldName}`),
      enrollName,
      true
    )
  }

  async editEnrollmentFormField() {
    await this.goToList()
    const students = await this.getStudents()
    const firstStudent = students[0]

    await this.goToStudentDetail(firstStudent['StudentName'])
    const testId = labelFieldName
    const wrapperTestId = generateDataTestId('field-wrapper', fieldName)

    await this.page.waitForSelector(`[data-testid="${testId}"]`, {
      state: 'visible',
    })

    const form = this.page.getByTestId(testId)

    if (await form.isVisible({ timeout: 5000 })) {
      await this.page.getByRole('button', { name: 'Edit' }).click()

      const label = await form.textContent()
      const inputForm = this.page
        .getByTestId(wrapperTestId)
        .first()
        .locator('input')

      await inputForm.fill(`${enrollName} updated`)

      await this.page.getByRole('button', { name: 'Save' }).click()
      await this.delayAfterAction()
      await this.page.waitForSelector('.Toastify__toast--success', {
        state: 'visible',
      })
      expect(
        this.page
          .getByText('Update student information field successfully')
          .first()
      ).toBeVisible()

      // Reload page to check if the data is updated
      await this.delayAfterAction()

      await this.reloadAndValidate(
        this.page.getByTestId(wrapperTestId).first().locator('input'),
        `${enrollName} updated`
      )

      const textContent = await this.page
        .getByTestId(wrapperTestId)
        .first()
        .inputValue()

      // Check if the data is updated
      expect(textContent).toBe(`${enrollName} updated`)

      await this.reloadAndValidate(
        this.page.getByTestId(`text-field-${fieldName}`),
        `${enrollName} updated`,
        true
      )
    }
  }

  async deleteEnrollmentFormField() {
    await this.goToList()
    const students = await this.getStudents()
    const firstStudent = students[0]

    await this.goToStudentDetail(firstStudent['StudentName'])

    const form = this.page.getByText(labelFieldName)

    if (await form.isVisible()) {
      await this.page.getByRole('button', { name: 'Edit' }).click()

      const label = await form.textContent()
      await this.page
        .locator('div')
        .filter({ hasText: new RegExp(`^${label}$`) })
        .first()
        .getByRole('button')
        .click()

      expect(
        this.page
          .getByText('Delete enrollment custom field successfully')
          .first()
      ).toBeVisible()

      await this.page.getByRole('button', { name: 'Save' }).click()
      await this.delayAfterAction()

      expect(
        this.page
          .getByText('Update student information field successfully')
          .first()
      ).toBeVisible()

      await this.page.reload()
      await this.delayAfterAction()

      expect(
        this.page.getByTestId(playwrightDefaultFieldNames[0].name)
      ).not.toBeVisible()
    }
  }
}
export default StudentFormPage
