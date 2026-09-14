import { expect, Page, test } from '@playwright/test'

import moment from 'moment'

import { testAdminUrl, testLoginPayload } from './testData/admin'
import {
  className,
  classPrice,
  classTag,
  courseName,
  createRecurClassPriceOptionData,
  fixCoupon,
  fixCouponCode,
  largestFixedCoupon,
  largestFixedCouponCode,
  linkSocialMedia,
  timestamp,
} from './testData/data'
import { delayAfterAction } from './utils/file-mock.util'

test.describe.serial('Admin Course Management', () => {
  test.beforeEach(async ({ page }) => {
    // Admin login
    await page.goto(`${testAdminUrl}/login`)
    await page.locator('#email').fill(testLoginPayload.email)
    await page.locator('#password').fill(testLoginPayload.password)
    await page.getByRole('button', { name: 'Login' }).click()
  })

  test('Delete old test courses', async ({ page }) => {
    await page.locator('#teachingService').click()
    await page.waitForTimeout(3000)

    const courses = await page.getByTestId('course-card').count()

    for (let i = 0; i < courses; i++) {
      const dropdown = page.getByTestId('toggle-dropdown').first().getByRole('img').first()
      if (await dropdown.isVisible()) {
        await dropdown.click()
        await page.getByRole('menuitem', { name: 'Delete' }).first().click()
        await page.getByText('Yes, delete course').first().click()
        await page.waitForTimeout(3000)
      }
    }
  })

  test('Create new course and tag', async ({ page }) => {
    await page.locator('#teachingService').click()

    // Create course
    await page.getByRole('button', { name: 'Create course' }).click()
    await page.locator('#name').fill(courseName)
    await page.getByRole('button', { name: 'Create' }).click()
    await page.waitForTimeout(1000)

    // Create tag
    const steps = page.locator('.reactour__close-button')
    if (await steps.isVisible()) await steps.click()

    await page.getByTestId('tab-settings').click()
    await page.getByText('Tags').click()
    await page.getByTestId('add-tag-btn').click()
    await page.getByTestId('input-tag-name-0').fill(timestamp)
    await page.locator('#tagSelector').locator('input').first().fill(classTag)
    await page.keyboard.press('Enter')
    await page.getByTestId('save-changes-btn').click()
  })

  async function selectCourse(page: Page, courseName: string) {
    await page.getByTestId('course-card').first().click()
    const steps = page.locator('.reactour__close-button')
    if (await steps.isVisible()) await steps.click()
    await page.getByRole('tab', { name: 'Class' }).click()
  }

  async function selectRecurringSchedule(page: Page) {
    await page.locator('#Sunday').click()
    await page.fill(
      'id=startTime',
      moment().add(1, 'day').startOf('day').add(7, 'h').format('YYYY-MM-DD HH:mm:ss')
    )
    await page.locator('#mins').click()
    await page.getByRole('option').locator('span').getByText('30').click()
    await page.getByRole('button', { name: 'Confirm' }).click()
  }

  test('Create recurring class', async ({ page }) => {
    await page.locator('#teachingService').click()
    await selectCourse(page, courseName)

    await page.getByTestId('toggle-group-add-btn').click()
    await page.getByTestId('recurring').click()
    await page.locator('#tuition').fill(classPrice)
    await page.locator('#name').fill(`recurring${className}`)
    await page.locator('#quota').fill('100')
    await page.locator('#times').fill('1')
    await page.getByTestId('confirm-class-btn').click()
    await page.waitForTimeout(3000)
    await page.locator('#times').fill('1')

    await selectRecurringSchedule(page)

    await page.getByTestId('multiple-classes-switch').locator('button').first().click()
    await page.getByTestId('save-changes-btn').click()
  })

  test('Create recurring class with multiple price options', async ({ page }) => {
    await page.locator('#teachingService').click()
    await selectCourse(page, courseName)

    const thisClassName = `recurring1${className}`

    await page.getByTestId('toggle-group-add-btn').click()
    await page.getByTestId('recurring').click()

    await page.locator('#name').fill(thisClassName)
    await page.locator('#quota').fill('100')

    await page
      .locator('div')
      .filter({ hasText: /^Price per lesson$/ })
      .nth(2)
      .click()
    await page.getByRole('option', { name: 'Multiple price options' }).click()

    await page.getByRole('button', { name: 'Add option' }).click()

    for (let index = 0; index < createRecurClassPriceOptionData.length; index++) {
      const option = createRecurClassPriceOptionData[index]

      const isFreeChageCheckbox = await page.getByText('Free of charge').nth(index)

      if (await isFreeChageCheckbox.isChecked()) {
        await isFreeChageCheckbox.click()
      }

      await page
        .getByTestId(`price-option-${index}-numberOfLessons`)
        .fill(option.numberOfLessons.toString())
      await page.getByTestId(`price-option-${index}-amount`).fill(option.amount.toString())

      if (index !== createRecurClassPriceOptionData.length - 1) {
        await page.getByRole('button', { name: 'Add option' }).click()
      }
    }

    await page.getByTestId('confirm-class-btn').click()
    await delayAfterAction(page)

    await expect(page.getByText(thisClassName).first()).toBeVisible()

    await page.getByText(thisClassName).first().click()

    await selectRecurringSchedule(page)

    await page.getByTestId('multiple-classes-switch').locator('button').first().click()
    await page.getByTestId('save-changes-btn').click()
  })

  test('Create regular classes', async ({ page }) => {
    await page.locator('#teachingService').click()
    await selectCourse(page, courseName)

    for (let i = 0; i < 5; i++) {
      await page.getByTestId('toggle-group-add-btn').click()
      await page.getByTestId('regular').click()
      await page.locator('#tuition').fill(classPrice)
      await page.locator('#name').fill(`regular${i}${className}`)
      await page.locator('#quota').fill('100')
      await page.getByTestId('confirm-class-btn').click()
      await page.waitForTimeout(3000)

      await page.getByText(`regular${i}${className}`).first().click()

      if (await page.getByTestId('noLessonYet-txt').isVisible()) {
        await page.getByTestId('add-lesson-btn').click()
      }

      if (i < 3) {
        await page.getByTestId('multiple-classes-switch').locator('button').first().click()
        // Temporarily disable multiple applicant switch because it's not working
        // await page.getByTestId('multiple-applicant-switch').getByRole('switch').click()
      } else if (i === 3) {
        await page.getByTestId('dropin-switch').locator('button').click()
        await page.getByText('Add new period').click()
      } else if (i === 4) {
        await page.getByTestId('free-lesson-switch').locator('button').click()
      }

      await page.getByTestId('save-changes-btn').click()
      await page.waitForTimeout(1000)
    }
  })

  test('Create event/workshop classes', async ({ page }) => {
    await page.locator('#teachingService').click()
    await selectCourse(page, courseName)

    for (let i = 0; i < 2; i++) {
      await page.getByTestId('toggle-group-add-btn').click()
      await page.getByTestId('workshop').click()
      await page.locator('#tuition').fill(classPrice)
      await page.locator('#name').fill(`event${i}${className}`)
      await page.locator('#quota').fill('100')
      await page.getByTestId('confirm-class-btn').click()
      await page.waitForTimeout(3000)

      await page.getByText(`event${i}${className}`).click()

      if (await page.getByTestId('noSessionYet-txt').isVisible()) {
        await page.getByTestId('add-session-btn').click()
      }

      if (i < 1) {
        await page.getByTestId('multiple-classes-switch').locator('button').first().click()
      } else if (i === 1) {
        await page.getByTestId('free-lesson-switch').locator('button').click()
      }

      await page.getByTestId('save-changes-btn').click()
      await page.waitForTimeout(1000)
    }
  })

  test('Create subscription class', async ({ page }) => {
    await page.locator('#teachingService').click()
    await selectCourse(page, courseName)

    await page.getByTestId('toggle-group-add-btn').click()

    await page.getByTestId('subscription').click()
    await page.locator('#tuition').fill(classPrice)
    await page.locator('#name').fill(`subscription${className}`)
    await page.locator('#quota').fill('100')
    await page.getByTestId('confirm-class-btn').click()
    await page.waitForTimeout(3000)
    if (await page.locator('#cycle').isVisible()) {
      await page.locator('#cycle').fill('1')
      await page.locator('#every').fill('1')
    }
    await page.getByTestId('multiple-classes-switch').locator('button').first().click()
    await page.getByTestId('save-changes-btn').click()
  })

  test('Publish course', async ({ page }) => {
    await page.locator('#teachingService').click()
    await selectCourse(page, courseName)

    await page.getByTestId('publish').click()
    await page.getByTestId('confirm-btn').click()
  })

  test('Create coupons', async ({ page }) => {
    await page.locator('#promotion').click()
    await page.getByTestId('promotion-coupon').click()
    await page.waitForTimeout(5000)

    // Delete old coupons
    const coupons = await page.getByTestId('coupon-card').count()
    for (let i = 0; i < coupons; i++) {
      const coupon = page.getByTestId('coupon-card').first()
      const dropdown = coupon.getByTestId('toggle-dropdown').getByRole('img').first()
      if (await dropdown.isVisible()) {
        await dropdown.click()
        await page.getByRole('menuitem', { name: 'Delete Coupon' }).first().click()
        await page.getByTestId('confirm-btn').first().click()
        await page.waitForTimeout(3000)
      }
    }

    // Create new coupons
    for (let i = 0; i < 2; i++) {
      await page.getByTestId('add-coupon-btn').click()
      await page.locator('#code').fill(`${timestamp}${i}`)
      if (i === 1) {
        await page.getByText('%').first().click()
      }
      await page.getByTestId('tag-customize').first().click()
      await page.locator('#amount').fill(fixCoupon)
      await page.getByTestId('save-coupon-btn').click()
      await page.waitForTimeout(3000)
    }
  })
  const createFixedCoupon = async (page: Page, code: string, amount: string) => {
    await page.getByTestId('add-coupon-btn').click()
    await page.waitForSelector('[data-testid="tag-customize"]', {
      state: 'visible',
    })

    await page.getByTestId('tag-customize').first().click()
    await page.locator('#code').fill(code)
    await page.locator('#amount').fill(amount)
    await page.getByTestId('save-coupon-btn').click()
    await page.waitForTimeout(3000)
  }
  test('Add coupon within fixed amount', async ({ page }) => {
    await page.locator('#promotion').click()
    await page.waitForTimeout(3000)
    await page.getByTestId('promotion-coupon').click()
    await page.waitForTimeout(3000)
    await createFixedCoupon(page, fixCouponCode, fixCoupon)
    await createFixedCoupon(page, largestFixedCouponCode, largestFixedCoupon)
  })

  test('Create trial lesson', async ({ page }) => {
    await page.locator('#promotion').click()
    await page.getByTestId('promotion-trial-lesson').click()
    await page.waitForTimeout(3000)

    // Delete old trial lessons
    const trialLessons = await page.getByTestId('trial-lesson-card').count()
    for (let i = 0; i < trialLessons; i++) {
      await page.getByTestId('delete-trial-lesson-btn').first().click()
      await page.getByTestId('yes-btn').first().click()
      await page.waitForTimeout(1000)
    }

    // Create new trial lesson
    await page.getByTestId('add-trial-btn').click()

    await page.getByTestId('course-selector').click()
    await page.getByText(`recurringclass${timestamp}`, { exact: true }).click()
    await page.getByTestId('course-selector').click()
    await page.getByText(`regular0class${timestamp}`, { exact: true }).click()
    await page.getByTestId('course-selector').click()
    await page.getByText(`regular1class${timestamp}`, { exact: true }).click()
    await page.getByTestId('course-selector').click()
    await page.getByText(`regular2class${timestamp}`, { exact: true }).click()
    await page.getByTestId('course-selector').click()
    await page.getByText(`regular3class${timestamp}`, { exact: true }).click()
    await page.getByTestId('course-selector').click()
    await page.getByText(`regular4class${timestamp}`, { exact: true }).click()

    await page.getByTestId('save-trial-lesson-btn').click()
  })

  test('Create social media link', async ({ page }) => {
    await page.locator('#contact').click()
    await page.getByRole('tab', { name: 'Social Media Links' }).click()
    await page.waitForTimeout(3000)

    // Delete old social media links
    const sosialMedia = await page.getByTestId('social-media-card').count()
    for (let i = 0; i < sosialMedia; i++) {
      await page.getByTestId('delete-icon').first().click()
      await page.waitForTimeout(1000)
    }

    // Create new social media link
    await page.getByTestId('add-social-media-btn').click()
    await page.getByTestId('input-link-social-media').first().fill(linkSocialMedia)
    await page.getByTestId('check-icon').first().click()

    const saveButton = page.getByRole('button', { name: 'Save changes' })

    expect(saveButton).not.toBeDisabled()
    await saveButton.click()

    await page.waitForTimeout(1000)
    await page.waitForLoadState('networkidle')
    expect(page.getByText('You have updated social media link')).toBeVisible()
  })
})
