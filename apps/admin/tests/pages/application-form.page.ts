import { expect } from '@playwright/test'

import { generateDataTestId } from '../../src/utils/data-testid.utils'

import { PlaywrightFieldTypes, PlaywrightFieldTypesTranslation } from '../const'
import { BasePage } from './base.page'

class ApplicationFormPage extends BasePage {
  async goToList() {
    await this.goto('/settings/application-form')
    await this.page.waitForLoadState('networkidle')
  }

  async deleteAllApplicationForm() {
    await this.goToList()
    const forms = await this.page
      .getByTestId('application-card')
      .locator('path')
      .count()

    for (let i = 0; i < forms; i++) {
      await this.page
        .getByTestId('application-card')
        .locator('path')
        .first()
        .click()
      await this.page.getByRole('menuitem', { name: 'Delete' }).first().click()
      await this.page.getByTestId('confirm-btn').click()
      await expect(
        this.page.getByText('Delete application form successfully').first()
      ).toBeVisible({ timeout: 10000 })
      await this.page.waitForLoadState('networkidle')
    }
  }

  async deleteAllFields() {
    await this.goto('/settings/student-information-field')
    await this.page.waitForLoadState('networkidle')

    const fields = await this.page.getByTestId('delete').count()

    for (let i = 0; i < fields; i++) {
      await this.page.getByTestId('delete').first().click()
      await this.page.getByTestId('confirm-btn').click()
      expect(
        this.page.getByText('Delete student custom field successfully').first()
      ).toBeVisible()
      await this.page.waitForTimeout(3000)
    }
  }

  async createCustomDataField(
    fieldName: string,
    fieldType: PlaywrightFieldTypes = PlaywrightFieldTypes.SHORT_ANSWER,
    withDelete: boolean = true,
    isChoice: boolean = false
  ) {
    await this.goto('/settings/student-information-field')
    // Find the field name in the table
    if (withDelete) {
      // Delete the field if it exists
      const deleteButton = this.page.locator(
        `[id="${generateDataTestId('delete-field', fieldName)}"]`
      )
      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        await this.page.getByTestId('confirm-btn').click()
        await this.page.waitForLoadState('networkidle')
      }
    }

    await this.page.getByRole('button', { name: 'Create new field' }).click()
    // If fieldType is provided, select it from the dropdown
    if (fieldType) {
      await this.page.locator('#fieldTypeCombo').click()
      await this.page
        .getByRole('option', {
          name: PlaywrightFieldTypesTranslation[fieldType],
          exact: true,
        })
        .click()
    }
    // Fill the field name
    await this.page
      .getByRole('textbox', { name: 'i.e. parent contact' })
      .fill(fieldName)

    const choiceFieldTypes = [
      PlaywrightFieldTypes.MULTIPLE_CHOICE,
      PlaywrightFieldTypes.SINGLE_CHOICE,
      PlaywrightFieldTypes.DROPDOWN_LIST,
    ]

    if (choiceFieldTypes.includes(fieldType as PlaywrightFieldTypes)) {
      await this.page.getByTestId('add-option').click()
      // Fill the first option
      await this.page.getByRole('textbox').nth(1).fill('Option 1')
    }

    if (fieldType === PlaywrightFieldTypes.DESCRIPTION) {
      await this.page.locator('textarea').fill('Description')
    }

    if (fieldType === PlaywrightFieldTypes.IMAGE) {
      await this.page
        .locator('input[type="file"]')
        .setInputFiles('tests/fixtures/logo.png')
    }

    await this.page.getByRole('button', { name: 'Create', exact: true }).click()
    await this.delayAfterAction(2000)
    await expect(
      this.page.getByText('Create student custom field successfully').first()
    ).toBeVisible()
  }

  async createForm(fieldNames: string[], formName: string) {
    await this.goto('/settings/application-form')
    await this.page.waitForLoadState('networkidle')

    await this.page.getByRole('button', { name: 'Create new form' }).click()
    await this.page
      .getByRole('button', { name: 'Add Custom Data Field' })
      .click()

    for (const name of fieldNames) {
      await this.page
        .locator('div')
        .filter({ hasText: new RegExp(`^${name}$`) })
        .locator('div')
        .first()
        .click()
    }

    await this.page.getByRole('button', { name: 'Save' }).nth(1).click()
    await this.page.waitForLoadState('networkidle')
    await this.page.locator('#enrollFormName').fill(formName)
    await this.page.locator('#enrolFormDescription').fill(formName)

    await this.page.getByRole('button', { name: 'Save' }).click()

    await this.page.waitForLoadState('networkidle')

    expect(
      this.page.getByText('application form successfully').first()
    ).toBeVisible()
  }
}

export default ApplicationFormPage
