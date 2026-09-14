import { test as base } from '@playwright/test'

import dayjs from 'dayjs'
import ApplicationFormPage from './pages/application-form.page'
import {
  playwrightDefaultFieldNames,
  PlaywrightFieldTypesTranslation,
} from './const'

export const formName = `form${dayjs().format('YYMMDD')}`

const test = base.extend<{ applicationFormPage: ApplicationFormPage }>({
  applicationFormPage: async ({ page }, use) => {
    const applicationFormPage = new ApplicationFormPage(page)
    await use(applicationFormPage)
  },
})

test.use({ storageState: './tests/auth.json' })

test.describe.serial('Application Form & Field', () => {
  test('Should be able to delete old application form', async ({
    applicationFormPage,
  }) => {
    try {
      await applicationFormPage.deleteAllApplicationForm()
    } catch (error) {
      console.error('Error deleting application form:', error)
    }
  })
  test('Should successfully create a new custom data field with valid name', async ({
    applicationFormPage,
  }) => {
    try {
      await applicationFormPage.deleteAllFields()
    } catch (error) {
      console.error('Error deleting field:', error)
    }
  })

  test('Should be able to add new field', async ({ applicationFormPage }) => {
    // i 0 -> 10
    for (let i = 0; i < 11; i++) {
      const fieldName = `field${dayjs().format('YYMMDD')}_${i + 1}`
      const fieldType = playwrightDefaultFieldNames[i].type
      const isRequired = false
      await applicationFormPage.createCustomDataField(
        fieldName,
        fieldType,
        isRequired
      )
    }
  })
})

test.describe.serial('CRUD Application Form', () => {
  test('Should successfully create a new form with custom field', async ({
    applicationFormPage,
  }) => {
    // `field${dayjs().format('YYMMDD')}_${i+1}`,  0 -> 11
    const fieldNameList: string[] = []
    for (let i = 0; i < 11; i++) {
      fieldNameList.push(`field${dayjs().format('YYMMDD')}_${i + 1}`)
    }
    await applicationFormPage.createForm(fieldNameList, formName)
  })
})
