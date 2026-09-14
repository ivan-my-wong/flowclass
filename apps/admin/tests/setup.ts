import { Browser, expect, Page } from '@playwright/test';
import csv from 'csv-parser';
import dayjs from 'dayjs';
import * as fs from 'fs';
import path from 'path';
import { generateDataTestId } from '../src/utils/data-testid.utils';
import {
    className,
    classPrice,
    courseName,
    rootDomain,
    testAccount
} from './const';


export const login = async ({ browser }: { browser: Browser }) => {
  // const context = await browser.newContext()
  const page = await browser.newPage()
  await page.waitForTimeout(3000)
  await page.goto(`${rootDomain}/login`)
  await page.locator('#email').fill(testAccount.email)

  await page.locator('#password').fill(testAccount.password)
  // Create 1st todo.

  const submitButton = await page.getByRole('button', { name: /login/i })
  await expect(submitButton).toBeEnabled()

  await submitButton.click()

  const element = page.getByText('Dashboard')
  await element.waitFor({ state: 'visible', timeout: 10000 })
  await page.waitForTimeout(3000)
  return page
}

export const bulkRemoveStudent = async ({ page }: { page: Page }) => {
  // Check if table has data
  const table = await page.locator('.ag-center-cols-container > div')
  if (await table.count() === 0) {
    return;
  }

  const checkAll = await page.getByRole('checkbox', { name: 'Column with Header Selection' })
  if (await checkAll.isVisible()) {
    await checkAll.click()
    await page.waitForTimeout(1000)
    const deleteButton = await page.getByTestId('delete-student-bulk')
    await deleteButton.click()

    const confirmButton = await page.getByTestId('confirm-btn')
    await confirmButton.click()
  }

}
export const deleteStudentTest = async ({ page, importFilePath }: { page: Page, importFilePath: string }) => {
  // const rows = await page.locator('.ag-center-cols-container > div').count()

  const students = await readCsv(importFilePath)
  for (const student of students) {
    const studentName = student["StudentName"]
    const studentEmail = student["StudentEmail"]
    const studentPhone = student["StudentPhone"]

    const actionButton = await page.getByTestId(generateDataTestId('action-button', studentName))
    if (!await actionButton.isVisible()) {
      return;
    }

    await actionButton.click()

    const menuInactive = page.getByRole('menuitem', {
      name: "Set as 'Inactive'",
    })

    if (await menuInactive.isVisible()) await menuInactive.click()

    const menuDelete = page.getByRole('menuitem', {
      name: 'Delete',
    })

    if (await menuDelete.isVisible()) {
      await menuDelete.click()
      await page.getByTestId('confirm-btn').first().click()
    }

    await page.waitForTimeout(3000)
  }
  return page
}
export const deleteCourses = async ({ page }) => {
  await page.locator('#teachingService').click()
  await page.waitForTimeout(3000)

  const courses = await page.getByTestId('course-card').count()

  for (let i = 0; i < courses; i++) {
    const dropdown = page
      .getByTestId('toggle-dropdown')
      .first()
      .getByRole('img')
      .first()
    if (await dropdown.isVisible()) {
      await dropdown.click()
      await page.getByRole('menuitem', { name: 'Delete' }).first().click()
      await page.getByText('Yes, delete course').first().click()
      await page.waitForTimeout(3000)
    }
  }

  return page
}

export const createCourses = async ({ page }) => {
  await page.locator('#teachingService').click()
  await page.waitForTimeout(3000)

  await page.getByRole('button', { name: 'Create course' }).click()
  await page.locator('#name').fill(courseName)
  await page.getByRole('button', { name: 'Create' }).click()
  await page.waitForTimeout(1000)

  await dismissTourIfVisible(page)

  await page.getByTestId('publish').click()
  await page.waitForTimeout(1000)
  await page.getByTestId('confirm-btn').click()

  return page
}

export const createClass = async ({
  page,
  multiple = false,
  dropin = false,
  free = false,
  i = 0,
}) => {
  await page.locator('#teachingService').click()
  await page.waitForTimeout(3000)

  await page.getByTestId('course-card').first().click()

  await page.getByRole('tab', { name: 'Class' }).click()

  const steps = page.locator('.reactour__close-button')
  if (await steps.isVisible()) await steps.click()

  await page.getByTestId('toggle-group-add-btn').click()
  await page.getByTestId('regular').click()
  await page.locator('#tuition').fill(classPrice)
  await page.locator('#name').fill(`regular${i}${className}`)
  await page.locator('#quota').fill('100')
  await page.getByTestId('confirm-class-btn').click()
  await page.waitForTimeout(3000)

  if (await page.getByTestId('noLessonYet-txt').isVisible()) {
    await page.getByTestId('add-lesson-btn').click()
  }

  if (multiple) {
    await page
      .getByTestId('multiple-classes-switch')
      .locator('button')
      .first()
      .click()
  }
  if (dropin) {
    await page.getByTestId('dropin-switch').locator('button').click()
  }
  if (free) {
    await page.getByTestId('free-lesson-switch').locator('button').click()
  }

  await page.getByTestId('save-changes-btn').click()
  await page.waitForTimeout(1000)

  return page
}

export const removeCourseFromStudent = async ({ page }) => {
  const courseCount = await page.getByTestId('enroll-status').count()
  for (let i = 0; i < courseCount; i++) {
    try {
      await page.getByTestId('enroll-status').first().click()
      await page.getByRole('menuitem', { name: 'Delete' }).click()
      await page.getByTestId('confirm-btn').click()
    } catch (e) {
      console.error(`Failed to remove course ${i + 1}/${courseCount}:`, e)
      throw e
    }
  }
}

export const selectOption = async ({ page }) => {
  const options = await page.getByRole('option')
  for (let i = 0; i < (await options.count()); i++) {
    const option = options.nth(i)
    if (await option.isEnabled()) {
      await option.click()
      break
    }
  }
}

export const addCourseToStudent = async ({ page }) => {
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.waitForTimeout(1000)

  await page.getByTestId('courseId').getByRole('combobox').first().click()
  await selectOption({ page })

  await page.getByTestId('classId').getByRole('combobox').first().click()
  await selectOption({ page })

  await page.getByTestId('periodId').getByRole('combobox').first().click()
  await selectOption({ page })

  await page
    .getByTestId('classLessonDate')
    .locator('input')
    .first()
    .fill(dayjs().add(1, 'day').format('YYYY-MM-DD'))

  await page.getByRole('button', { name: 'Save' }).click()
}


export const goToStudentCentral = async (page: Page) => {
  await page.locator('#teachingService').first().click()
  await page.waitForTimeout(3000)

  await page.locator('#studentRecord').click()
  await page.waitForTimeout(3000)
}

export const readCsv = async (filePath: string, separator: string = ';') => {
  const csvData: any[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, filePath))
      .pipe(csv({
        separator: separator
      }))
      .on('data', (row: any) => {
        csvData.push(row)
      })
      .on('end', resolve)
      .on('error', reject)
  })
  return csvData
}


export const waitForMenuVisibility = async (page: Page, menuName: string) => {
  const maxAttempts = 3
  let attempts = 0

  const menu = page.getByRole('menuitem', { name: menuName })
  while (!(await menu.isVisible())) {
    if (attempts >= maxAttempts) {
      throw new Error('Menu not visible after maximum attempts')
    }

    await page
      .locator(
        '.ag-center-cols-container > div:nth-child(1) > div:nth-child(2) > div'
      )
      .first()
      .click()
    attempts++
  }
  await menu.click()
}

export const dismissTourIfVisible = async (page: Page) => {
  const tour = page.getByLabel('Close Tour')
  if (await tour.isVisible()) {
    await tour.click()
  }
}


export const createCustomDataField = async (page: Page, fieldName: string, withDelete: boolean = true) => {
  await page.goto(`${rootDomain}/settings/student-information-field`)
  // Find the field name in the table
  if (withDelete) {
    // Delete the field if it exists
    const deleteButton = page.locator(`[id="${generateDataTestId('delete-field', fieldName)}"]`)
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      await page.getByTestId('confirm-btn').click()
      await page.waitForTimeout(3000)
    }
  }

  await page.getByRole('button', { name: 'Create new field' }).click()
  await page
    .getByRole('textbox', { name: 'i.e. parent contact' })
    .fill(fieldName)
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await page.waitForTimeout(3000)
  expect(
    page.getByText('Create student custom field successfully').first()
  ).toBeVisible()
}

export const createForm = async (page: Page, fieldName: string, formName: string) => {
  await page.locator('#teachingService').first().click()
  await page.waitForTimeout(3000)

  await page.locator('#applicationForm').first().click()
  await page.waitForTimeout(3000)

  await page.getByRole('button', { name: 'Create new form' }).click()
  await page.getByRole('button', { name: 'Add Custom Data Field' }).click()

  await page
    .locator('div')
    .filter({ hasText: new RegExp(`^${fieldName}$`) })
    .locator('div')
    .first()
    .click()

  await page.getByRole('button', { name: 'Save' }).nth(1).click()
  await page.waitForTimeout(3000)
  await page.locator('#enrollFormName').fill(formName)
  await page.locator('#enrolFormDescription').fill(formName)

  await page.getByRole('button', { name: 'Save' }).click()

}