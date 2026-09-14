import { test as baseTest, expect } from '@playwright/test'
import { rootDomain } from './const'
import dayjs from 'dayjs'
import CoursePage from './pages/course.page'

// 3. Fill in the schedule name and create
const today = new Date()
const scheduleName = `ScheduleTest-${dayjs(today).format(
  'YYYY-MM-DD'
)}`

const test = baseTest.extend<{ coursePage: CoursePage }>({
  coursePage: async ({ page }, use) => {
    await use(new CoursePage(page))
  },
})

test.describe('Schedule Management', () => {
  test('Create a schedule and enable all weekdays as working hours with default time', async ({
    page,
  }) => {
    // 1. Go to the Availability Schedules page
    await page.goto(`${rootDomain}/availability`) // Change to your actual URL

    // 2. Click "Create New Schedule"
    await page
      .getByRole('button', { name: 'Create New Schedule' })
      .first()
      .click()

    await page.getByPlaceholder('Enter schedule name').fill(scheduleName)
    // The "Create & Continue" button is disabled until input, so after typing, it becomes enabled
    const createBtn = page.getByRole('button', { name: /Create & Continue/i })
    await expect(createBtn).toBeEnabled()
    await createBtn.click()

    // 4. Wait for the "Save" button to appear, indicating schedule details page loaded
    await page.getByRole('button', { name: 'Save' }).waitFor()

    // 5. For each weekday, enable and add default time slot (Forzen)
    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]

    for (const day of weekdays) {
      // Find the switch for the day (use the button with role switch and next sibling with text)
      const switchBtn = page.getByTestId(`add-time-button-${day}`)

      // If not already checked, enable it
      if ((await switchBtn.getAttribute('aria-checked')) !== 'true') {
        await switchBtn.click()

        await page.waitForTimeout(300)
      }

      // Wait for the timeslot dialog
      await page.getByRole('dialog', { name: /Create timeslot/i }).waitFor()

      // Confirm with default time and save
      await page.getByRole('button', { name: 'Confirm' }).click()

      // Wait for the dialog to close
      await expect(
        page.getByRole('dialog', { name: /Create timeslot/i })
      ).toBeHidden()

      await page.waitForTimeout(300)
    }

    // 6. Save the schedule
    await page.getByRole('button', { name: 'Save' }).click()

    await page.getByRole('alertdialog', { name: /Apply to Class/i }).waitFor()
    await page.getByRole('button', { name: 'No' }).click()

    await page.getByRole('button', { name: 'Availability Schedules' }).click()

    // 7. (Optional) Assert the new schedule is listed as expected
    await expect(page.locator('h3', { hasText: scheduleName })).toBeVisible()
  })

  test('change class availability', async ({ coursePage }) => {
    // 1. Go to the Availability Schedules page
    await coursePage.pickAvailabilityAtClass(scheduleName)
  })

  test('Delete a schedule', async ({ page }) => {
    // 1. Go to the Availability Schedules page
    await page.goto(`${rootDomain}/availability`) // Change to your actual URL

    // Get last availability-list-card(data-testid="availability-list-card") warpped in availability-list-container(data-testid="availability-list-container")
    await page.getByTestId('availability-list-container').waitFor()
    const scheduleContainer = page
      .locator('[data-testid="availability-list-container"]')
      .first()
    const lastAvailabilityListCard = scheduleContainer
      .locator('.availability-list-card')
      .last()

    // Click on aria-haspopup="menu" the availability-list-card
    await lastAvailabilityListCard
      .locator('button[aria-haspopup="menu"]')
      .click()

    // Locate the menu (optionally, you can wait for it to be visible)
    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible()

    // Locate the "Delete" button inside the open menu (by text)
    const deleteButton = menu.getByRole('menuitem', { name: 'Delete' })

    // Click the Delete button
    await deleteButton.click()

    // Wait for the delete dialog to appear
    const deleteDialog = page.getByRole('dialog', {
      name: 'Delete Availability',
    })
    await deleteDialog.waitFor({ state: 'visible' })
    await expect(deleteDialog).toBeVisible()

    // Click the Delete button
    await deleteDialog.getByRole('button', { name: 'Delete' }).click()

    // Wait for the delete dialog to disappear
    await deleteDialog.waitFor({ state: 'hidden' })
  })
})
