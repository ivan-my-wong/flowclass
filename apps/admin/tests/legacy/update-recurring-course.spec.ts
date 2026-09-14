import { expect, Page, test } from '@playwright/test'

import { createRecurClassData } from '../const'
import { dismissTourIfVisible, login } from '../setup'

test.describe.skip('Testing Recurring Course Info', () => {
  let page: Page
  let recurringCourse: string
  let className: string

  test.beforeAll(async ({ browser }) => {
    page = await login({ browser })
  })

  test.afterAll(async ({ browser }) => {
    await browser.close()
  })

  test('add recurring course', async () => {
    recurringCourse = `recurring-test-${new Date().getTime()}`
    await page.locator('#teachingService').click()
    await page.getByRole('button', { name: 'Create course' }).click()
    await page.getByText('Recurring Course').first().click()

    await page.locator('#name').fill(recurringCourse)

    await page.locator('#path').press('Control+a')
    await page.locator('#path').fill(recurringCourse)
    await page.getByRole('button', { name: 'Create' }).click()
    await page.getByLabel('Go to next step').click()
    await page.getByLabel('Go to next step').click()
    await page.getByText('3By clicking this button, we').click()
    await page
      .locator('div')
      .filter({ hasText: 'By clicking this button, we' })
      .nth(2)
      .click()

    await dismissTourIfVisible(page)
  })

  test('update page content manually', async () => {
    await page.getByText('Page Content').click()
    await page.getByText('Syllabus').click()
    await page.locator("div[data-gramm='false']").fill('syllabus')

    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(
      page.getByText('Update Description successfully')
    ).toBeVisible()
  })

  test('create recurring class', async () => {
    await page.getByText('Class').click()

    await dismissTourIfVisible(page)

    await page.getByText('Create class').click()

    for (let i = 0; i < createRecurClassData.length; i += 1) {
      className = createRecurClassData[i].name ?? ''
      await page.locator('#name').fill(className)
      await page.locator('#tuition').fill(createRecurClassData[i].cost ?? '')
      await page.locator('#quota').fill(createRecurClassData[i].quota ?? '')
      await page.locator('#times').fill(createRecurClassData[i].times ?? '')
      await page.getByRole('button', { name: 'Confirm' }).click()

      switch (className) {
        case undefined:
          await expect(
            page.locator('div').filter({ hasText: 'Please fill in this field' })
          ).toBe(3)
          break
        case 'undefined-cost-quota':
          await expect(
            page.locator('div').filter({ hasText: 'Please fill in this field' })
          ).toBe(2)
          break
        case 'negative':
          await expect(
            page
              .locator('div')
              .filter({ hasText: 'The data you have entered is invalid.' })
              .first()
          ).toBeVisible()
          break
        case 'normal':
          await expect(
            page.getByText('Create class successfully')
          ).toBeVisible()
          break
        default:
          break
      }
    }
  })

  test('create single weekly lesson', async () => {
    await page.getByRole('tab', { name: 'Class' }).click()
    await page.locator('#Sunday').click()
    await expect(page.getByText('Create timeslot')).toBeVisible()
    // await page.getByLabel('Create multiple class').check()
    // await page.locator("input[type='checkbox']").setChecked(false)
    await page.locator("input[type='checkbox']").dispatchEvent('click')
    await expect(page.getByText('Buffer/break between lesson')).toBeHidden()
    await expect(page.getByText('No. of lessons to generate')).toBeHidden()
    await page.fill('id=startTime', '2024-04-17 13:00:00')
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.getByRole('button', { name: 'Save changes' }).click()
  })

  test('create multiple weekly lessons', async () => {
    await page.locator('#Friday').click()
    await expect(page.getByText('Create timeslot')).toBeVisible()
    await page.locator("input[type='checkbox']").dispatchEvent('click')
    await expect(page.getByText('Buffer/break between lesson')).toBeVisible()
    await expect(page.getByText('No. of lessons to generate')).toBeVisible()
    await page.locator('#hours').first().click()
    await page.getByText('2', { exact: true }).click()
    await page.locator('#mins').first().click()
    await page.getByText('30').click()
    await page.locator('#numOfLessonGenerate').fill('4')
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.getByRole('button', { name: 'Save changes' }).click()
  })
})
