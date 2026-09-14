import { expect, Page, test } from '@playwright/test'

import {
  className,
  courseName,
  studentEmail,
  studentName,
  studentPhone,
  testUrl,
} from './testData/data'
import { delayAfterAction, selectAllTextAndDelete } from './utils/file-mock.util'

test.describe.configure({ mode: 'serial' })

test.describe.serial('Student Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${testUrl}`)
    await page.waitForTimeout(3000)
  })

  const loginData = { name: studentName, email: studentEmail, phone: studentPhone }
  const editLoginData = {
    name: `${studentName}edited`,
    email: `crssultontest+${studentName}edited@gmail.com`,
    phone: studentPhone,
  }

  const loginForm = async (page: Page, payload: { name: string; email: string; phone: string }) => {
    const loginBtn = page.getByTestId('login-btn')
    if (!(await loginBtn.isVisible())) return

    await loginBtn.click()
    await page.waitForTimeout(1000)

    const nameField = page.getByTestId('login-name-field')

    // this is no need when email is the primary identifier
    if (await nameField.isVisible()) {
      await nameField.fill(payload.name)
    }

    // Check if there is the email field
    const emailField = page.getByTestId('login-email-field')
    if (await emailField.isVisible()) {
      await emailField.fill(payload.email)
    }

    // highlight the phone field first, and then fill the phone number
    await page.getByTestId('login-phone-field').click()

    // Select all text (works on all platforms)
    await selectAllTextAndDelete(page)
    await page.getByTestId('login-phone-field').fill(`${payload.phone}`)

    await page.getByTestId('find-my-profile-btn').click()

    await page.waitForTimeout(1000)

    const notFound = page.getByText('Please verify that the following information is entered')

    if (await notFound.isVisible()) {
      // return failure
      return test.fail()
    } else {
      const modal = page.getByText('Access your student profile')
      expect(modal).toBeVisible()

      // expect(page.getByTestId('visit-profile-btn')).toBeVisible()
      await page.getByTestId('visit-profile-btn').click()
    }

    await page.waitForTimeout(3000)
  }

  test('Should be able to update profile', async ({ page }) => {
    await loginForm(page, loginData)

    const nameField = await page.getByLabel('Name')
    if (await nameField.isVisible()) {
      await nameField.fill(editLoginData.name)
    }

    const emailField = await page.getByLabel('Email')
    if (await emailField.isVisible()) {
      await emailField.fill(editLoginData.email)
    }

    await page.getByTestId('save-btn').click()

    const successfulMessage = page.getByText('Profile updated successfully')
    await page.waitForTimeout(3000)
    if (!(await successfulMessage.isVisible())) return

    expect(successfulMessage).toBeVisible()

    await page.getByTestId('logout-btn').click()

    await page.goto(testUrl)

    await page.waitForLoadState('networkidle')

    // relogin to check if the data is saved
    await loginForm(page, editLoginData)

    const saveBtn = page.getByTestId('save-btn')
    expect(saveBtn).toBeVisible()

    // check if the data is saved
    expect(page.getByTestId('profile-name-field')).toHaveValue(editLoginData.name)
    expect(page.getByTestId('profile-email-field')).toHaveValue(editLoginData.email)
    await page.waitForTimeout(3000)

    // update again to previous data
    await page.getByTestId('profile-name-field').fill(loginData.name)
    await page.getByTestId('profile-email-field').fill(loginData.email)

    await page.getByTestId('save-btn').click()
    expect(page.getByText('Profile updated successfully')).toBeVisible()
  })

  test('Should be able to visit receipt page', async ({ page }) => {
    await loginForm(page, loginData)

    const saveBtn = page.getByTestId('save-btn')
    expect(saveBtn).toBeVisible()

    await delayAfterAction(page)

    await page.getByTestId('menu-upcoming').click()

    // Wait for the course/class dropdown to have text (options loaded)
    // await expect(page.getByTestId('class-dropdown')).not.toHaveText('')

    const visitReceiptBtn = page.getByRole('button', { name: 'Visit Receipt Page' }).first()

    expect(visitReceiptBtn).toBeVisible()
    // when click, it should open a new tab
    await visitReceiptBtn.click()
    await page.waitForTimeout(3000)

    // check if the new tab is opened
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.getByRole('button', { name: 'Visit Receipt Page' }).first().click(),
    ])
    await newPage.waitForTimeout(3000)

    if (newPage.url().includes('receipt')) {
      expect(newPage.getByText('Contact Information')).toBeVisible()
      expect(newPage.getByText('Invoice ID:')).toBeVisible()
    } else {
      expect(newPage.url()).toContain('course=course')
      expect(newPage.getByText('Contact Information')).toBeVisible()
      expect(newPage.getByText('The payment has been completed.')).toBeVisible()
    }
  })

  test('Should be able to send question', async ({ page }) => {
    await loginForm(page, loginData)

    const saveBtn = page.getByTestId('save-btn')
    if (!(await saveBtn.isVisible())) return

    await page.getByTestId('menu-upcoming').click()
    await page.waitForTimeout(1000)

    const sendBtn = page.getByRole('button', { name: 'Send Question' }).first()

    expect(sendBtn).toBeVisible()
    await sendBtn.click()
    await page.waitForTimeout(1000)

    const confirmBtn = page.getByText('Confirm')
    await confirmBtn.isDisabled()
    await page.locator('textarea').first().fill('This is a test question')
    await confirmBtn.isEnabled()

    await confirmBtn.click()
    await page.waitForTimeout(3000)
    const successfulMessage = page.getByText('Send question successfully').first()
    if (!(await successfulMessage.isVisible())) {
      expect(
        page.getByText('You can only ask a question every 5 minutes on the same lesson').first()
      ).toBeVisible()
      return
    }

    expect(successfulMessage).toBeVisible()
  })

  test('Should be able to request time change', async ({ page }) => {
    // --- Login and Navigation ---
    await loginForm(page, loginData)

    await page.getByTestId('menu-upcoming').click()
    await page.waitForTimeout(1000)

    // --- Check Send Button Visibility when No Class/Period ---
    // Try to open the request time change modal without a class/period
    const requestTimeChangeBtn = page.getByRole('button', { name: 'Request Time Change' }).first()

    await requestTimeChangeBtn.click()

    // wait until the options are loaded
    await page.waitForTimeout(1000)

    const courseDropdown = page.getByTestId('course-dropdown')
    expect(await courseDropdown.isVisible())
    const courseOptions = await courseDropdown.locator('option').allTextContents()
    expect(courseOptions.some(option => option.includes(courseName)))

    // If there are no class or period options, the sendBtn should not be visible
    const classDropdown = page.locator('#classId')
    await classDropdown.click()

    await page
      .locator('[id*="react-select"][id*="option"]')
      .filter({ hasText: `regular1${className}` })
      .click()

    const periodDropdown = page.locator('#periodId')
    await periodDropdown.click()
    await page.getByText('Starts at').nth(2).click()

    // await page.locator('#classLessonDate').click()

    await page.getByLabel('Reason').fill('This is a test reason')

    const confirmBtn = page.getByText('Confirm')
    expect(confirmBtn).toBeVisible()
    await confirmBtn.isEnabled()

    await confirmBtn.click()
    await page.waitForTimeout(3000)

    const successfulMessage = page.getByText('Request time change successfully').first()
    if (!(await successfulMessage.isVisible())) {
      expect(
        page
          .getByText('You can only request a time change every 5 minutes on the same lesson')
          .first()
      ).toBeVisible()
      return
    }
  })

  test('Should be able to send reminder', async ({ page }) => {
    await loginForm(page, loginData)

    const saveBtn = page.getByTestId('save-btn')
    if (!(await saveBtn.isVisible())) return

    await page.getByTestId('menu-upcoming').click()
    await page.waitForTimeout(1000)

    const sendBtn = page.getByRole('button', { name: 'Action' }).first()
    if (!(await sendBtn.isVisible())) return

    expect(sendBtn).toBeVisible()
    await sendBtn.click()
    await page.waitForTimeout(1000)

    await page.getByText('Send Lesson Reminder Email').click()

    expect(page.getByText('Are you sure you want to send')).toBeVisible()

    await page.getByText('Yes, Send').click()
    await page.waitForTimeout(3000)

    expect(page.getByText('Send payment reminder successfully')).toBeVisible()
  })

  test('Should be able to update notification preferences', async ({ page }) => {
    await loginForm(page, loginData)

    const saveBtn = page.getByTestId('save-btn')
    if (!(await saveBtn.isVisible())) return

    await page.getByTestId('menu-notification').click()
    await page.waitForTimeout(1000)

    await page.getByTestId('notification-student_notif_after_enrollment_submitted').click()
    await page.getByTestId('notification-student_notif_payment_reminder').click()

    await page.getByTestId('save-notification').click()
    await page.waitForTimeout(1000)

    expect(page.getByText('Notification updated successfully')).toBeVisible()

    await page.reload()
    await delayAfterAction(page)

    expect(page.getByTestId('notification-student_notif_after_enrollment_submitted')).toBeChecked()
    expect(page.getByTestId('notification-student_notif_payment_reminder')).toBeChecked()
  })
})
