import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import {
  className,
  classPrice,
  courseName,
  createRecurClassPriceOptionData,
} from '../const'
import { dismissTourIfVisible } from '../setup'
import { BasePage } from './base.page'

class CoursePage extends BasePage {
  async goToList() {
    await this.goto('teaching-service')
    await this.delayAfterAction()
  }
  async addCourseToStudent({
    courseName: courseNameParam,
    className: classNameParam,
    periodName: periodNameParam,
    classLessonDate: classLessonDateParam,
    skipCourseSelection,
    skipClassSelection,
    addNewCourse,
    hasMultiplePriceOptions,
  }: {
    courseName?: string
    className?: string
    periodName?: string
    classLessonDate?: string
    skipCourseSelection?: boolean
    skipClassSelection?: boolean
    addNewCourse?: boolean
    hasMultiplePriceOptions?: boolean
  }) {
    const addCourseBtn = await this.page.getByTestId('add-course-btn')
    if (await addCourseBtn.isVisible()) {
      await addCourseBtn.click()
    }

    const finalCourseName = courseNameParam ?? courseName
    const finalClassName = classNameParam ?? className
    const finalPeriodName =
      periodNameParam ?? dayjs().add(1, 'day').format('YYYY/MM/DD')
    const finalClassLessonDate =
      classLessonDateParam ?? dayjs().add(1, 'day').format('YYYY-MM-DD')

    if (addNewCourse) {
      await this.page.getByRole('button', { name: 'Add', exact: true }).click()
      await this.delayAfterAction()
    }

    if (!skipCourseSelection) {
      await this.selectOption(
        this.page.getByTestId('courseId').getByRole('combobox').first(),
        {
          text: finalCourseName,
        }
      )
    }

    if (!skipClassSelection) {
      await this.selectOption(
        this.page.getByTestId('classId').getByRole('combobox').first(),
        {
          text: finalClassName,
        }
      )
    }

    await this.selectOption(
      this.page.getByTestId('periodId').getByRole('combobox').first(),
      {
        text: finalPeriodName,
      }
    )

    await this.page
      .getByTestId('classLessonDate')
      .first()
      .fill(finalClassLessonDate)

    if (hasMultiplePriceOptions) {
      await this.page.getByTestId('priceOptionId').getByRole('combobox').click()
      await this.page.getByTestId('select-option').nth(2).click()
    }

    await this.page.getByTestId('save-button').click()
  }
  async removeCourseFromStudent() {
    const maxRetries = 3
    let retryCount = 0

    const courseCount = await this.page.getByTestId('enroll-status').count()
    for (let i = 0; i < courseCount; i++) {
      try {
        while (retryCount < maxRetries) {
          try {
            await this.page.getByTestId('enroll-status').first().click()
            await this.page.getByRole('menuitem', { name: 'Delete' }).click()
            await this.page.getByTestId('confirm-btn').click()
            await this.delayAfterAction()
            expect(
              this.page
                .getByText('Delete teaching service successfully')
                .first()
            ).toBeVisible()
            break
          } catch (e) {
            retryCount++
            if (retryCount === maxRetries) throw e
            await this.delayAfterAction()
          }
        }
      } catch (e) {
        console.error(`Failed to remove course ${i + 1}/${courseCount}:`, e)
        throw e
      }
    }
  }
  async deleteAllCourses() {
    await this.goToList()

    const courses = await this.page.getByTestId('course-card').count()

    for (let i = 0; i < courses; i++) {
      const dropdown = this.page
        .getByTestId('toggle-dropdown')
        .first()
        .getByRole('img')
        .first()
      if (await dropdown.isVisible()) {
        await dropdown.click()
        await this.page
          .getByRole('menuitem', { name: 'Delete' })
          .first()
          .click()
        await this.page.getByText('Yes, delete course').first().click()
        await this.delayAfterAction()
      }
    }

    return this.page
  }

  async createClass(config: {
    multiple?: boolean
    dropin?: boolean
    free?: boolean
    i?: number
    type?: 'regular' | 'workshop' | 'recurring' | 'subscription' | 'appointment'
  }) {
    const { multiple, dropin, free, i, type = 'regular' } = config
    await this.goToList()

    await this.page.waitForSelector('[data-testid="course-card"]', {
      state: 'visible',
    })

    await this.page.getByTestId('course-card').first().click()

    await this.page.getByRole('tab', { name: 'Class' }).click()

    const steps = this.page.locator('.reactour__close-button')
    if (await steps.isVisible()) await steps.click()

    await this.page.getByTestId('toggle-group-add-btn').click()

    await this.page.getByTestId(type).click()
    await this.page.locator('#tuition').fill(classPrice)

    const fullClassName = `${type}${i ?? ''}${className}`

    await this.page.locator('#name').fill(fullClassName)
    await this.page.locator('#quota').fill('100')

    const times = this.page.locator('#times')
    if (await times.isVisible()) await times.fill('1')

    await this.page.getByTestId('confirm-class-btn').click()
    await this.delayAfterAction()

    if (await this.page.getByTestId('noLessonYet-txt').isVisible()) {
      await this.page.getByTestId('add-lesson-btn').click()
    }

    if (
      await this.page.getByRole('heading', { name: 'Weekly hours' }).isVisible()
    ) {
      const weekdays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]

      for (const weekday of weekdays) {
        await this.page.locator(`#${weekday}`).click()
        await this.page.getByRole('button', { name: 'Confirm' }).click()
        await this.delayAfterAction()
      }

      // Change the pricing option for recurring for the second round
    }

    if (multiple) {
      await this.page
        .getByTestId('multiple-classes-switch')
        .locator('button')
        .first()
        .click()
    }
    if (dropin) {
      await this.page.getByTestId('dropin-switch').locator('button').click()
    }
    if (free) {
      await this.page
        .getByTestId('free-lesson-switch')
        .locator('button')
        .click()
    }

    if (type !== 'appointment') {
      await this.page.getByTestId('save-changes-btn').click()
    }

    await this.reloadAndValidate(
      this.page.getByRole('textbox', { name: 'Class name' }),
      fullClassName,
      true
    )
    await this.delayAfterAction()

    return this.page
  }

  async createCourses() {
    await this.goToList()
    await this.page.getByRole('button', { name: 'Create course' }).click()
    await this.page.locator('#name').fill(courseName)
    await this.page.getByRole('button', { name: 'Create' }).click()
    await this.page.waitForTimeout(1000)

    await dismissTourIfVisible(this.page)

    await this.page.getByTestId('publish').click()
    await this.page.waitForTimeout(1000)
    await this.page.getByTestId('confirm-btn').click()

    return this.page
  }

  async goToDetailCourse() {
    await this.goToList()
    await this.page.waitForSelector('[data-testid="course-card"]', {
      state: 'visible',
    })

    await this.page.getByTestId('course-card').first().click()
  }

  async goToClassTab() {
    await this.page.getByRole('tab', { name: 'Class' }).click()
  }

  async editClass() {
    await this.goToDetailCourse()
    await this.goToClassTab()
    await this.delayAfterAction()

    const classLocator = this.page.getByTestId('toggle-group-item').first()

    await classLocator.click()

    const oldClassName = await this.page
      .getByRole('textbox', {
        name: 'Class name',
      })
      .inputValue()
    const testClassName = `test-${oldClassName}`
    // Have to wait until the save button is disabled
    await this.delayAfterAction()

    // check if save button is disabled
    const saveBtn = await this.page.getByTestId('save-changes-btn')

    // check if input name is visible
    await this.delayAfterAction()

    await expect(saveBtn).toBeDisabled()

    // check if input name is visible
    await this.page.waitForSelector('input[name="name"]', { state: 'visible' })
    const inputNameLocator = this.page.locator('input[name="name"]')
    // check if input name is filled with old class name

    expect(await inputNameLocator.getAttribute('value')).toBe(oldClassName)
    await inputNameLocator.fill(testClassName)

    await this.delayAfterAction()
    // Save button should be enabled after any change
    await expect(saveBtn).toBeEnabled()

    // Trigger save button
    await saveBtn.click()
    await this.delayAfterAction()

    // Check if the class name is updated
    expect(
      await this.page.getByText('Updated class successfully').first()
    ).toBeVisible()

    await this.reloadAndValidate(
      this.page.getByRole('textbox', { name: 'Class name' }),
      testClassName,
      true
    )
    await this.delayAfterAction()

    // Class name at sidebar should be updated
    const firstLocatorTextAfterEdit = await this.page.getByRole('textbox', {
      name: 'Class name',
    })
    await expect(firstLocatorTextAfterEdit).toHaveValue(testClassName)
    // Revert back to old class name
    await inputNameLocator.fill(oldClassName)
    await this.delayAfterAction()
    await saveBtn.click()

    await this.delayAfterAction()
    await expect(
      this.page.getByText('Updated class successfully').first()
    ).toBeVisible()

    await this.reloadAndValidate(
      this.page.getByRole('textbox', { name: 'Class name' }),
      oldClassName,
      true
    )
  }

  get getClassLocator() {
    return this.page.locator(`[data-testid="toggle-group-item"]`)
  }

  get getSaveBtn() {
    return this.page.getByTestId('save-changes-btn')
  }

  _classNameMemo: Record<string, string> = {}

  get classNameMemo() {
    return this._classNameMemo
  }

  set classNameMemo(memo: Record<string, string>) {
    this._classNameMemo = memo
  }

  async updateOneRecurringClassToMultiplePriceOptions() {
    await this.goToDetailCourse()
    await this.goToClassTab()
    await this.delayAfterAction()
    await this.page
      .locator('div')
      .filter({ hasText: 'recurring1class' })
      .first()
      .click()
    await this.delayAfterAction()

    await this.page
      .locator('div')
      .filter({ hasText: /^Price per lesson$/ })
      .nth(2)
      .click()
    await this.page
      .getByRole('option', { name: 'Multiple price options' })
      .click()

    for (
      let index = 0;
      index < createRecurClassPriceOptionData.length;
      index++
    ) {
      const option = createRecurClassPriceOptionData[index]

      const isFreeChageCheckbox = await this.page
        .getByText('Free of charge')
        .nth(index)

      if (await isFreeChageCheckbox.isChecked()) {
        await isFreeChageCheckbox.click()
      }

      await this.page
        .getByTestId(`price-option-${index}-numberOfLessons`)
        .fill(option.numberOfLessons.toString())
      await this.page
        .getByTestId(`price-option-${index}-amount`)
        .fill(option.amount.toString())
      await this.page.getByRole('button', { name: 'Add option' }).click()
    }

    await this.page.getByTestId('save-changes-btn').click()
  }

  async pickLocationAtClass() {
    await this.goToDetailCourse()
    await this.goToClassTab()
    await this.delayAfterAction()
    const classLocator = this.page
      .locator(`[data-testid="toggle-group-item"]`)
      .first()
    await classLocator.click()
    const locationSelector = await this.page.locator('#location-selector-value')

    const currentLocation = await locationSelector.textContent()

    // id location-selector get aria-controls
    const locationSelectorBox = await this.page.locator('#location-selector')
    await locationSelectorBox.click()
    await this.delayAfterAction(3000)
    const menuId = await locationSelectorBox.getAttribute('aria-controls')
    if (!menuId) {
      throw new Error('location-selector: aria-controls attribute is missing')
    }
    const menu = await this.page.locator(`#${menuId}`).first()

    // react-select-31-listbox -> react-select-31-option-1
    const option = await menu
      .locator(`#${menuId.replace('listbox', 'option')}-1`)
      .first()

    const finalLocation = await option.textContent()
    await expect(finalLocation).not.toBeNull()

    await option.click()

    await this.getSaveBtn.click()
    await this.delayAfterAction(3000)

    await expect(
      this.page.getByText('Updated class successfully').first()
    ).toBeVisible()

    const locationSelectorValue = await this.page.locator(
      '#location-selector-value'
    )

    await this.reloadAndValidate(locationSelectorValue, finalLocation ?? '')
  }

  async pickInstructorAtClass() {
    await this.goToDetailCourse()
    await this.goToClassTab()
    await this.delayAfterAction()
    const classLocator = this.page
      .locator(`[data-testid="toggle-group-item"]`)
      .first()
    await classLocator.click()

    const instructorSelector = await this.page.locator('#instructor-selector')
    await instructorSelector.click()
    await this.delayAfterAction(3000)

    const menuId =
      (await instructorSelector.getAttribute('aria-controls')) ?? ''
    const menu = await this.page.locator(`#${menuId}`).first()

    const option = await menu
      .locator(`#${menuId.replace('listbox', 'option')}-1`)
      .first()
    const finalInstructor = await option.textContent()

    await expect(finalInstructor).not.toBeNull()
    await option.click()
    await this.delayAfterAction(3000)

    await this.getSaveBtn.click()
    await this.delayAfterAction(3000)

    expect(
      await this.page.getByText('Updated class successfully').first()
    ).toBeVisible()

    const instructorSelectorValue = await this.page.locator(
      '#instructor-selector-value'
    )

    await this.reloadAndValidate(instructorSelectorValue, finalInstructor ?? '')
  }

  async pickAvailabilityAtClass(scheduleName: string) {
    await this.goToDetailCourse()
    await this.goToClassTab()
    await this.delayAfterAction()
    const classLocator = this.page
      .locator(`[data-testid="toggle-group-item"]`)
      .first()
    await classLocator.click()
    const availabilitySelector = await this.page.locator(
      '#availability-selector'
    )
    await availabilitySelector.click()

    await this.page.getByText(scheduleName, { exact: true }).nth(1).click()

    await this.getSaveBtn.click()

    await this.delayAfterAction()

    await expect(
      this.page.getByText('Updated class successfully').first()
    ).toBeVisible()

    await this.reloadAndValidate(
      this.page.locator('#availability-selector'),
      scheduleName,
      true
    )
  }

  async bulkEditClass() {
    await this.goToDetailCourse()
    await this.goToClassTab()
    await this.delayAfterAction()
    const count = await this.getClassLocator.count()
    // edit all classes with additional test prefix for each class name
    for (let i = 0; i < count; i++) {
      await this.editClassAtIndex(i, false)
    }
    await this.getSaveBtn.click()

    await this.delayAfterAction()
    expect(
      await this.page.getByText('Updated class successfully').first()
    ).toBeVisible()

    // revert all classes to original name
    for (let i = 0; i < count; i++) {
      await this.editClassAtIndex(i, true)
    }
    await this.getSaveBtn.click()

    await this.delayAfterAction()
    expect(
      await this.page.getByText('Updated class successfully').first()
    ).toBeVisible()
  }

  async editClassAtIndex(index: number, isRevertMode: boolean = false) {
    const locator = this.getClassLocator.nth(index)
    const oldClassName =
      (await locator.getByTestId('toggle-group-item-label').textContent()) ?? ''
    const classNameTest = `test-${oldClassName}`

    const newClassName = this.classNameMemo[oldClassName] || classNameTest

    await locator.click()
    expect(await this.getSaveBtn.isDisabled()).toBe(index <= 0)
    // check if input name is visible
    await this.page.waitForSelector('input[name="name"]', { state: 'visible' })
    const inputNameLocator = this.page.locator('input[name="name"]')
    // if useOriginalName is true, the input name should be the old class name
    // otherwise, the input name should be the test class name
    expect(await inputNameLocator.getAttribute('value')).toBe(oldClassName)
    // fill the input name with the test class name if useOriginalName is false
    // otherwise, fill the input name with the old class name
    await inputNameLocator.fill(newClassName)
    await this.delayAfterAction()
    // save button should be enabled after any change
    await expect(this.getSaveBtn).toBeEnabled()
    // dirty indicator should be visible
    const dirtyIndicator = await this.page
      .getByTestId('dirty-indicator')
      .nth(index)
    await expect(dirtyIndicator).toBeVisible()

    // Memoize the old class name and new class name
    this.classNameMemo = {
      ...this.classNameMemo,
      [classNameTest]: oldClassName,
    }
  }
}

export default CoursePage
