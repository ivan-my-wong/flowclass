import { expect, Page, test } from '@playwright/test'

import dayjs from 'dayjs'

import {
  className,
  classPrice,
  classTag,
  courseName,
  currency,
  fixCoupon,
  largestFixedCoupon,
  largestFixedCouponCode,
  studentEmail,
  studentEmail2,
  studentName,
  studentName2,
  studentPhone,
  studentPhone2,
  testUrl,
  timestamp,
  trialLessonPrice,
} from './testData/data'
import { ApplicationFormData, ConfirmationData } from './testData/types'
import { selectAllTextAndDelete } from './utils/file-mock.util'

test.describe.configure({ mode: 'serial' })

test.describe.serial('Verify course', () => {
  test('Verify course listing page', async ({ page }) => {
    await page.goto(`${testUrl}/#courses`)
    await page.waitForTimeout(3000)

    const card = page.getByTestId(`course-card-${courseName}`)

    await expect(card).toBeVisible()
    await expect(card.locator('h3').filter({ hasText: courseName })).toBeVisible()

    // const startDate = moment().add(1, 'days').format('YYYY/MM')
    // await expect(card.getByText(`Start at ${startDate}`).first()).toBeVisible()
    await expect(card.getByText((Number(classPrice) * 2).toString())).toBeVisible()
    await expect(card.getByText(classTag)).toBeVisible()
    await expect(page.getByTestId('link-instagram').first()).toBeVisible()

    // Test filtering
    const countMultiGroupedSelect = await page.locator(`#multi-grouped-select-${timestamp}`).count()
    if (countMultiGroupedSelect > 0) {
      const formFilter = page.locator(`#multi-grouped-select-${timestamp}`).first()
      await formFilter.click()
      await formFilter.locator('div').getByText(classTag).first().click()
      await page.getByTestId('search-courses-btn').first().click()
    }
    await expect(card.locator('h3').filter({ hasText: courseName })).toBeVisible()
  })
})

test.describe.serial('Student Course Enrollment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${testUrl}/@/${courseName}`)
    await page.waitForTimeout(3000)

    await PageActions.verifyInitialEnrollState(page)
  })

  // Helper functions for page interactions
  const PageActions = {
    async verifyInitialEnrollState(page: Page) {
      await expect(page.getByTestId('enroll-btn').first()).not.toBeEmpty()
      await expect(page.locator('h1').filter({ hasText: courseName })).not.toBeEmpty()
      await page.getByTestId('enroll-btn').first().click()
      await page.waitForTimeout(3000)
    },

    async fillApplicationForm(
      page: Page,
      { name, email, phone }: ApplicationFormData,
      applicantIndex: number,
      totalApplicants: number
    ): Promise<{ alreadyRegistered: boolean }> {
      await page.locator(`input[name='applicant[${applicantIndex}].Name']`).fill(name)
      await page.locator(`input[name='applicant[${applicantIndex}].Email']`).fill(email)
      await page.locator(`input[id='phone']`).click()

      await selectAllTextAndDelete(page)
      await page.locator(`input[id='phone']`).fill(phone)

      if (applicantIndex === totalApplicants - 1) {
        await page.getByRole('button', { name: 'Next Step' }).click()
      }

      await page.waitForTimeout(2000)

      const alreadyRegistered = await page
        .getByRole('heading', { name: 'You have already registered in this class before.' })
        .isVisible()

      if (alreadyRegistered) {
        // If already registered, back to last step and select the paid option
        await page.getByRole('button', { name: 'Back to last step' }).click()
        await page.locator('button#option').first().click()
        await this.fillApplicationForm(
          page,
          { name, email, phone },
          applicantIndex,
          totalApplicants
        )
      }

      return { alreadyRegistered }
    },

    async selectRecurringLesson(page: Page) {
      expect(await page.getByTestId('next-step-btn').first()).toBeDisabled()

      await page.waitForLoadState('networkidle')
      await page.locator('.available-days').first().click()
      // Should show recurring time slot button after click available days
      expect(await page.getByTestId('recurring-time-slot').first()).toBeVisible()
      await page.getByTestId('recurring-time-slot').first().click()
      // Should remove recurring time slot available after click recurring time slot button
      expect(await page.getByTestId('remove-recurring-time-slot').first()).toBeVisible()
      // Test remove recurring time slot
      await page.getByTestId('remove-recurring-time-slot').first().click()
      // Should hidden remove button after click remove button
      expect(await page.getByTestId('remove-recurring-time-slot').first()).not.toBeVisible()
      // Should show recurring time slot button after click available days
      await page.getByTestId('recurring-time-slot').first().click()
      // Should show remove button after click recurring time slot button
      expect(await page.getByTestId('remove-recurring-time-slot').first()).toBeVisible()

      // wait for half a second
      await page.waitForTimeout(500)

      // await page.getByTestId('remove-recurring-time-slot').first().click()
      // Should enable next step button after select recurring time slot
      expect(await page.getByTestId('next-step-btn').first()).toBeEnabled()
      await page.getByTestId('next-step-btn').first().click()
    },

    async selectClass(
      page: Page,
      {
        className,
        type,
        options = [],
        useFilterDefaultPriceClass = false,
      }: {
        className: string
        type: 'Regular' | 'Event' | 'Recurring' | 'Subscription'
        options?: string[]
        useFilterDefaultPriceClass?: boolean
      }
    ): Promise<void> {
      let classSelector = page
        .locator('button#option')
        .filter({ hasText: className })
        .filter({ hasText: type })
      if (useFilterDefaultPriceClass) classSelector = classSelector.filter({ hasText: classPrice })
      classSelector = classSelector.first()
      await expect(classSelector).not.toBeDisabled()
      await classSelector.click()

      // Options is basically equal to the number of courses that is picked
      for (const option of options) {
        if (option === 'timeslot') {
          if (type === 'Event') {
            await expect(
              page.getByText('Select the time slot of the event which you are applying for')
            ).toBeVisible()
            await page.locator('button#option').first().click()
          } else if (type === 'Regular') {
            await expect(
              page.getByText('Select the first lesson for the class you are going to apply for')
            ).toBeVisible()
            await page.locator('button#option').first().click()
          } else if (type === 'Recurring') {
            const multiplePriceOptionButton = await page.getByTestId(
              `selection-button-idr--rp${Number(classPrice)}`
            )

            const isMultiplePriceOptionSelection = await multiplePriceOptionButton.isVisible()

            if (isMultiplePriceOptionSelection) {
              await multiplePriceOptionButton.click()
              // await page.getByTestId('next-step-btn').click()
            }

            // await page.locator('button#option').filter({ hasText: 'Available' }).first().click()
            await this.selectRecurringLesson(page)

            // The original recurring class tuition option is after picking the time slots
            if (!isMultiplePriceOptionSelection) {
              await expect(page.getByText('Pick a tuition option')).toBeVisible()

              // Check if the trial lesson is available
              await expect(page.locator('button#option').filter({ hasText: `Free` })).toBeVisible()
              await expect(page.locator('button#option').filter({ hasText: `25000` })).toBeVisible()
              await page.locator('button#option').first().click()
            }

            return
          }
        } else if (option == 'trialLesson') {
          await page.locator('button#option').filter({ hasText: 'Trial Lesson' }).first().click()
        } else {
          await page.locator('button#option').first().click()
        }
      }
    },

    async applyCoupon(page: Page, couponCode: string): Promise<void> {
      await page.locator('#couponCode').fill(couponCode)
      await page.getByTestId('check-coupon-btn').click()
      await page.waitForTimeout(1000)
      await expect(
        page.getByText(`The coupon is successfully applied: ${couponCode}`).first()
      ).toBeVisible()
    },

    async checkCalculateTotalToPay(page: Page, totalDiscount: number) {
      const totalPayAmount = await page.getByTestId('payment-amount-price').first()
      const originalFeePrice = await page.getByTestId('original-fee-price').first()

      const totalPayAmountValue = await totalPayAmount.getAttribute('aria-placeholder')
      const originalFeePriceValue = await originalFeePrice.getAttribute('aria-placeholder')
      const adjustedTotalDiscount = Math.min(totalDiscount, Number(originalFeePriceValue))
      const totalToPay = Number(originalFeePriceValue) - Number(adjustedTotalDiscount)
      expect(totalPayAmountValue).toEqual(totalToPay.toString())
    },

    async uploadPaymentProof(page: Page): Promise<void> {
      // await page.getByRole('button', { name: 'Upload Image' }).click();

      // check if price is not zero
      const isFreePrice = await page.locator('#price-0').first().isVisible()
      if (!isFreePrice) {
        await page
          .locator('input[id="image-upload"]')
          .setInputFiles('./tests/files/payment-proof-tiny.png')
      }

      await page.getByRole('button', { name: 'Proceed' }).click()
      await page.waitForTimeout(2000)

      if (!isFreePrice) {
        await expect(
          page.getByRole('heading', { name: 'Your payment proof has been uploaded successfully.' })
        ).toBeVisible()
      }
    },
  }

  // Helper functions for verification
  const Verifications = {
    async verifyConfirmationAndPayment(
      page: Page,
      { price, name, email, courseName, totalPrice = price }: ConfirmationData
    ): Promise<void> {
      await expect(page.getByText('The price is not final yet.')).toBeVisible()
      await expect(page.getByText(`${currency}${price}`).first()).toBeVisible()
      if (totalPrice !== price) {
        await expect(page.getByText(totalPrice).first()).toBeVisible()
      }
      await page.getByTestId('submit-payment-btn').click()
      await page.waitForTimeout(5000)

      const paymentFailed = await page
        .getByRole('button', { name: 'Enrollment failed' })
        .isVisible()
      if (paymentFailed) {
        test.fail('Payment failed', async () => {
          await page.close()
        })
      } else {
        if (price === '0') {
          await Verifications.verifyFreeConfirmation(page, { name, email, courseName })
        } else {
          const selectPayment = page.getByText('Select Method & Complete Payment')
          if (await selectPayment.isVisible()) {
            await this.verifyPaymentScreen(page, { price, name, email, courseName, totalPrice })
          }
        }
      }
    },

    async verifyPaymentScreen(
      page: Page,
      { price, name, email, courseName, totalPrice }: ConfirmationData
    ): Promise<void> {
      await expect(page.getByText('Please complete the payment to secure the seat.')).toBeVisible()
      await expect(page.getByText(name).first()).toBeVisible()
      await expect(page.getByText(email)).toBeVisible()
      await expect(page.getByText(courseName).first()).toBeVisible()
      await expect(page.getByText(price).first()).toBeVisible()
      if (totalPrice !== price) {
        await expect(page.getByText(totalPrice || price).first()).toBeVisible()
      }
    },

    async verifyFreeConfirmation(
      page: Page,
      { name, email, courseName }: Omit<ConfirmationData, 'price' | 'totalPrice'>
    ): Promise<void> {
      await expect(page.getByText('Your application is successful.').first()).toBeVisible()
      await expect(page.getByText(name).first()).toBeVisible()
      await expect(page.getByText(email).first()).toBeVisible()
      await expect(page.getByText(courseName).first()).toBeVisible()
    },
  }

  const handleEnrollRegularCourse = async (page: Page, payload: ApplicationFormData) => {
    await PageActions.selectClass(page, {
      className: `regular1${className}`,
      type: 'Regular',
      options: ['timeslot', 'price'],
    })

    await PageActions.fillApplicationForm(page, payload, 0, 1)
    await Verifications.verifyConfirmationAndPayment(page, {
      price: classPrice,
      name: studentName,
      email: studentEmail,
      courseName,
    })
    await PageActions.uploadPaymentProof(page)
  }

  test.describe.serial('Enroll courses with a single class', () => {
    test('Enroll recurring course with single class', async ({ page }) => {
      await PageActions.selectClass(page, {
        className,
        type: 'Recurring',
        options: ['timeslot', 'price'],
      })

      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )
      await Verifications.verifyConfirmationAndPayment(page, {
        price: classPrice,
        name: studentName,
        email: studentEmail,
        courseName,
      })
    })

    test('Enroll regular course with single class', async ({ page }) => {
      await handleEnrollRegularCourse(page, {
        name: studentName,
        email: studentEmail,
        phone: studentPhone,
      })
    })

    test('Enroll event course with single class', async ({ page }) => {
      await PageActions.selectClass(page, {
        className: `event0${className}`,
        type: 'Event',
        options: ['timeslot'],
      })

      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )
      await Verifications.verifyConfirmationAndPayment(page, {
        price: classPrice,
        name: studentName,
        email: studentEmail,
        courseName,
      })
    })

    test('Enroll subscription course with single class', async ({ page }) => {
      await PageActions.selectClass(page, { className, type: 'Subscription' })
      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )
      await Verifications.verifyConfirmationAndPayment(page, {
        price: classPrice,
        name: studentName,
        email: studentEmail,
        courseName,
      })
    })
  })

  // Temporarily skip this test because it's not working
  test.skip('Enroll Course with multiple student', async ({ page }) => {
    await PageActions.selectClass(page, {
      className: `regular0${className}`,
      type: 'Regular',
      options: ['timeslot'],
    })

    await page.locator('#numberOfApplicant').fill('2')
    await page.locator('button#option').first().click()

    await PageActions.fillApplicationForm(
      page,
      {
        name: studentName,
        email: studentEmail,
        phone: studentPhone,
      },
      0,
      2
    )
    await page.getByTestId('next-applicant').first().click()
    await PageActions.fillApplicationForm(
      page,
      {
        name: studentName2,
        email: studentEmail2,
        phone: studentPhone2,
      },
      1,
      2
    )

    const totalPrice = `${Number(classPrice) * 2}`
    await Verifications.verifyConfirmationAndPayment(page, {
      price: classPrice,
      name: studentName,
      email: studentEmail,
      courseName,
      totalPrice,
    })
  })

  test.describe.serial('Enroll courses with multiple classes', () => {
    test('Enroll Course with multiple class: 3 regular classes', async ({ page }) => {
      await expect(page.locator('#selected-multi-class')).not.toBeVisible()
      await page.getByTestId('multiple-class-switch').locator('button').click()
      await expect(page.locator('#selected-multi-class')).toBeVisible()

      for (let i = 0; i < 3; i++) {
        await PageActions.selectClass(page, {
          className: `regular${i}${className}`,
          type: 'Regular',
          options: ['timeslot', 'price'],
          useFilterDefaultPriceClass: true,
        })
      }

      await page.getByTestId('proceed-btn').click()
      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )

      const totalPrice = `${Number(classPrice) * 3}`
      await Verifications.verifyConfirmationAndPayment(page, {
        price: classPrice,
        name: studentName,
        email: studentEmail,
        courseName,
        totalPrice,
      })
    })

    test('Enroll Course with multiple class: regular, event, recurring + coupon', async ({
      page,
    }) => {
      await expect(page.locator('#selected-multi-class')).not.toBeVisible()
      await page.getByTestId('multiple-class-switch').locator('button').click()
      await expect(page.locator('#selected-multi-class')).toBeVisible()

      await PageActions.selectClass(page, {
        className,
        type: 'Regular',
        options: ['timeslot', 'price'],
        useFilterDefaultPriceClass: true,
      })
      await PageActions.selectClass(page, {
        className,
        type: 'Recurring',
        options: ['timeslot', 'price'],
        useFilterDefaultPriceClass: true,
      })
      await PageActions.selectClass(page, {
        className,
        type: 'Event',
        options: ['timeslot'],
        useFilterDefaultPriceClass: true,
      })

      await page.getByTestId('proceed-btn').click()
      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )

      const totalPrice = `${Number(classPrice) * 3}`
      await Verifications.verifyConfirmationAndPayment(page, {
        price: classPrice,
        name: studentName,
        email: studentEmail,
        courseName,
        totalPrice,
      })

      await PageActions.applyCoupon(page, `${timestamp}1`)
      await expect(page.locator('#price-0').first()).toBeVisible()
      await PageActions.uploadPaymentProof(page)
    })

    test('Enroll Course with multiple class: regular, event, recurring + fixed coupon', async ({
      page,
    }) => {
      await expect(page.locator('#selected-multi-class')).not.toBeVisible()
      await page.getByTestId('multiple-class-switch').locator('button').click()
      await expect(page.locator('#selected-multi-class')).toBeVisible()

      await PageActions.selectClass(page, {
        className,
        type: 'Regular',
        options: ['timeslot', 'price'],
        useFilterDefaultPriceClass: true,
      })
      await PageActions.selectClass(page, {
        className,
        type: 'Event',
        options: ['timeslot'],
        useFilterDefaultPriceClass: true,
      })
      await PageActions.selectClass(page, {
        className,
        type: 'Recurring',
        options: ['timeslot', 'price'],
        useFilterDefaultPriceClass: true,
      })

      await page.getByTestId('proceed-btn').click()
      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )

      const totalPrice = `${Number(classPrice) * 3}`
      await Verifications.verifyConfirmationAndPayment(page, {
        price: classPrice,
        name: studentName,
        email: studentEmail,
        courseName,
        totalPrice,
      })

      await PageActions.applyCoupon(page, largestFixedCouponCode)
      await PageActions.checkCalculateTotalToPay(page, Number(largestFixedCoupon))
      // await expect(page.locator('#price-0').first()).toBeVisible()
      // await PageActions.uploadPaymentProof(page)
    })
  })

  test.describe.serial('Enroll regular and event courses with no price option', () => {
    test('Enroll Course: Regular Course + Drop In', async ({ page }) => {
      await PageActions.selectClass(page, {
        className: `regular3${className}`,
        type: 'Regular',
        options: ['timeslot', 'price'],
      })
      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )
      await Verifications.verifyConfirmationAndPayment(page, {
        price: classPrice,
        name: studentName,
        email: studentEmail,
        courseName,
      })
      await PageActions.uploadPaymentProof(page)
    })

    test('Enroll Course: Free Regular Course', async ({ page }) => {
      await PageActions.selectClass(page, {
        className: `regular4${className}`,
        type: 'Regular',
        options: ['timeslot'],
      })

      // await expect(page.getByText('Pick a tuition option')).toBeVisible()
      // await expect(page.locator('button#option').filter({ hasText: `0` })).toBeVisible()
      // await page.locator('button#option').first().click()
      const tuitionOptionPage = page.getByText('Pick a tuition option')
      if (await tuitionOptionPage.isVisible()) {
        const freeOption = page.locator('button#option').filter({ hasText: '0' }).first()
        if (await freeOption.isVisible()) {
          await freeOption.click()
        } else {
          await page.getByTestId('tuition-option-paid').click()
        }
      }

      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )
      await expect(page.getByText('The price is not final yet.')).toBeVisible()
      await page.getByRole('button', { name: 'Complete application' }).click()
      await page.waitForTimeout(5000)

      await Verifications.verifyFreeConfirmation(page, {
        name: studentName,
        email: studentEmail,
        courseName,
      })
    })

    test('Enroll Course: Free Event', async ({ page }) => {
      await page.evaluate(() => {
        sessionStorage.removeItem('custom-form')
      })

      await PageActions.selectClass(page, {
        className: `event1${className}`,
        type: 'Event',
        options: ['timeslot'],
      })

      await page.waitForTimeout(2000)

      const currentUrl = page.url()
      if (currentUrl.includes('/@/course')) {
        await page.goto(`${testUrl}/enrol`)
        await page.waitForTimeout(2000)

        await PageActions.selectClass(page, {
          className: `event1${className}`,
          type: 'Event',
          options: ['timeslot'],
        })
      }

      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )

      await expect(page.getByText('The price is not final yet.')).toBeVisible()
      await page.getByRole('button', { name: 'Complete application' }).click()
      await page.waitForTimeout(5000)

      await Verifications.verifyFreeConfirmation(page, {
        name: studentName,
        email: studentEmail,
        courseName,
      })
    })
  })

  test.describe.serial('Enroll regular class with coupon', () => {
    test('Enroll Course: Regular class + coupon', async ({ page }) => {
      await PageActions.selectClass(page, {
        className: `regular0${className}`,
        type: 'Regular',
        options: ['timeslot', 'price'],
      })
      await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )
      await Verifications.verifyConfirmationAndPayment(page, {
        price: classPrice,
        name: studentName,
        email: studentEmail,
        courseName,
      })

      await PageActions.applyCoupon(page, `${timestamp}0`)
      await expect(
        page.getByText(`${Number(classPrice) - Number(fixCoupon)}`).first()
      ).toBeVisible()
    })

    test('Enroll Course: Regular class + trial lesson (if not registered) + coupon + payment proof', async ({
      page,
    }) => {
      await PageActions.selectClass(page, {
        className: `regular0${className}`,
        type: 'Regular',
        options: ['timeslot', 'trialLesson'],
      })
      const { alreadyRegistered } = await PageActions.fillApplicationForm(
        page,
        {
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
        },
        0,
        1
      )

      await Verifications.verifyConfirmationAndPayment(page, {
        price: alreadyRegistered ? classPrice : trialLessonPrice,
        name: studentName,
        email: studentEmail,
        courseName,
      })
      const selectPayment = page.getByText('Select Method & Complete Payment')
      if (await selectPayment.isVisible()) {
        await PageActions.uploadPaymentProof(page)
      }
    })
  })

  test('Should be able to retrieve application record', async ({ page }) => {
    const payload = {
      name: studentName,
      email: studentEmail,
      phone: studentPhone,
    }

    await handleEnrollRegularCourse(page, payload)

    await page.goto(`${testUrl}/@/${courseName}`)
    await page.waitForTimeout(3000)

    await PageActions.verifyInitialEnrollState(page)

    await page.evaluate(() => {
      sessionStorage.removeItem('custom-form')
    })

    await PageActions.selectClass(page, {
      className: `regular0${className}`,
      type: 'Regular',
      options: ['timeslot', 'price'],
    })
  })

  test('Should be able to sort periods by latest first', async ({ page }) => {
    const classSelector = page
      .locator('button#option')
      .filter({ hasText: `regular3${className}` })
      .filter({ hasText: 'Regular' })
      .first()

    if (await classSelector.isDisabled()) return

    await classSelector.click()

    await expect(
      page.getByText('Select the first lesson for the class you are going to apply for')
    ).toBeVisible()

    const nextPage = page.getByLabel('Next page').getByRole('button')

    if (!(await nextPage.isVisible())) return

    const firstPeriod = await page.locator('button#option').first().textContent()
    const firstPeriodStart = firstPeriod?.split(' ')[1]
    const firstPeriodDate = new Date(`${firstPeriod?.split(' ')[0]} ${firstPeriodStart} pm`)

    await nextPage.click()

    const secondPeriod = await page.locator('button#option').first().textContent()
    const secondPeriodStart = secondPeriod?.split(' ')[1]
    const secondPeriodDate = new Date(`${secondPeriod?.split(' ')[0]} ${secondPeriodStart} pm`)

    expect(firstPeriodDate.getTime()).toBeGreaterThan(secondPeriodDate.getTime())
  })

  test('Should be able to selecting separate lessons', async ({ page }) => {
    const classSelector = page.locator('button#option').filter({ hasText: 'Recurring' }).first()

    await expect(classSelector).toBeVisible()

    await classSelector.click()
    await page.waitForTimeout(3000)
    // await page.locator('button#option').first().click()
    // await page.waitForTimeout(3000)

    await page.getByRole('switch').first().click()

    await page.getByLabel('Go to the Next Month').click()
    const activeCells = []
    const gridcells = await page.getByRole('gridcell').all()
    for (const cell of gridcells) {
      const className = await cell.getAttribute('class')
      if (className?.includes('text-primary')) {
        activeCells.push(cell)
      }
    }

    if (activeCells.length === 0) return

    const lessons = await page.getByText('Lessons Chosen').textContent()
    let maxLessons = +(lessons?.split(' ')[2] ?? 0)

    if (maxLessons > activeCells.length) {
      maxLessons = activeCells.length
    }

    const lessonTimes: string[] = []

    for (let i = 0; i < maxLessons; i++) {
      const btn = activeCells[i].getByRole('button')
      const date = await btn.textContent()
      await btn.click()
      await page.waitForTimeout(1000)
      await page.getByTestId('recurring-time-slot').first().click()
      await page.waitForTimeout(1000)

      const selectedDate = dayjs(dayjs())
        .add(1, 'month')
        .set('date', +(date ?? 0))
        .format('YYYY/MM/DD')
      const lessonTime = page.getByText(selectedDate).first()
      expect(lessonTime).toBeVisible()

      const time = await lessonTime.textContent()
      lessonTimes.push(time ?? '')
    }

    await page.getByTestId('next-step-btn').first().click()
    await page.waitForTimeout(3000)

    await PageActions.fillApplicationForm(
      page,
      {
        name: studentName,
        email: studentEmail,
        phone: studentPhone,
      },
      0,
      1
    )

    await page.waitForTimeout(3000)
    for (let i = 0; i < lessonTimes.length; i++) {
      expect((await page.getByText(lessonTimes[i]).all()).length).toBe(2)
    }
  })
})
