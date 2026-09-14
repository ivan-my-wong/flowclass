import { expect } from '@playwright/test'

import { Page } from '@playwright/test'
import dayjs from 'dayjs'
import { generateDataTestId } from '../../src/utils/data-testid.utils'
import { timestamp } from '../const'
import CouponPage from './coupon.page'
import CoursePage from './course.page'
import StudentPage from './student.page'

export const formatUnixTime = (timeStampPair: string): string => {
  const dateStrings = timeStampPair.split(' ')
  const timestamp1 = dateStrings[0]
  const timestamp2 = dateStrings[1]

  const dateTime1 = dayjs(timestamp1).unix()
  const dateTime2 = dayjs(timestamp2).unix()
  const formatedTimeRange = `${dateTime1}-${dateTime2}`

  return formatedTimeRange
}
const aliasName = 'New user alias ' + dayjs().format('YYMMDD')
const dateToBeFilledIn = dayjs().add(1, 'day').format('YYYY-MM-DD')

type GenerateApplicationLinkParams = {
  courseName: string
  className: string
}
class StudentDetailPage extends StudentPage {
  private couponPage: CouponPage
  private coursePage: CoursePage
  constructor(page: Page) {
    super(page)
    this.couponPage = new CouponPage(page)
    this.coursePage = new CoursePage(page)
  }
  async generateApplicationLink({
    courseName,
    className,
  }: GenerateApplicationLinkParams) {
    await this.goToList()
    const students = await this.getStudents()
    const student = students[0]
    const lessonDate = dayjs().add(1, 'day').format('YYYY-MM-DD')

    let classId = ''
    let firstLessonDateUnix = ''
    let recurLessonTimeId = ''

    this.page.on('response', async res => {
      if (res.url().includes('/teaching-service-opt')) {
        const { data } = await res.json()
        const courseData = data.find((o: any) => o.name.includes(courseName))
        if (courseData.classes) {
          const classData = courseData.classes.find((o: any) =>
            o.name.includes(className)
          )
          if (classData?.periods) {
            classId = classData.id
            const key = Object.keys(classData?.periods)[0]
            firstLessonDateUnix = formatUnixTime(classData?.periods[key][0])
            recurLessonTimeId = key
          }
        }
      }
    })

    await this.page
      .getByTestId(generateDataTestId('action-button', student['StudentName']))
      .click()
    await this.waitForMenuVisibility('Generate Application Link')
    await this.page
      .getByTestId('courseId')
      .getByRole('combobox')
      .first()
      .click()
    await this.page.getByLabel(courseName).first().click()
    await this.page.getByTestId('classId').getByRole('combobox').first().click()

    const haveClass = this.page.getByLabel(className).first()
    // If class is not visible, it means the class is not available. Skip the test
    if (!(await haveClass.isVisible())) return

    await haveClass.click()

    const havePeriod = await this.page.getByText('Choose period').isVisible()
    if (havePeriod) {
      await this.page
        .getByTestId('periodId')
        .getByRole('combobox')
        .first()
        .click()
      await this.page.getByRole('option').first().click()
      await this.page.getByTestId('classLessonDate').click()
      await this.page
        .locator(
          '.react-datepicker__day:not(.react-datepicker__day--disabled):not(.react-datepicker__day--outside-month)'
        )
        .first()
        .click()
    }

    await this.page.getByRole('button', { name: 'Generate' }).click()
    await this.page.waitForLoadState('networkidle')

    expect(
      this.page.getByRole('link', { name: 'localhost:4000/enrol' })
    ).toBeVisible()
    expect(this.page.getByText(`classId=${classId}`)).toBeVisible()

    const haveRecurLessonTimeId = await this.page
      .getByText('recurLessonTimeId')
      .isVisible()
    if (haveRecurLessonTimeId) {
      expect(
        this.page.getByText(`recurLessonTimeId=${recurLessonTimeId}`)
      ).toBeVisible()
    }

    const haveFirstLessonDateUnix = await this.page
      .getByText(`firstLessonDateUnix`)
      .isVisible()
    if (haveFirstLessonDateUnix) {
      expect(
        this.page.getByText(`firstLessonDateUnix=${firstLessonDateUnix}`)
      ).toBeVisible()
    }

    await this.page.locator('form').getByRole('button').first().click()
  }

  async assignCoupon(couponCode: string) {
    await this.couponPage.deleteOldCoupon()
    await this.goToList()
    const students = await this.getStudents()
    const student = students[0]
    await this.page
      .getByPlaceholder('Search by name / email / phone number')
      .fill(student['StudentName'])

    await this.delayAfterAction()
    await this.page
      .getByTestId(generateDataTestId('action-button', student['StudentName']))
      .click()
    await this.waitForMenuVisibility('Assign coupon')
    await this.page.getByTestId('tag-customize').first().click()
    await this.page.locator('#amount').fill(couponCode)
    await this.page.getByTestId('save-coupon-btn').click()
    await this.delayAfterAction()
    expect(
      this.page.getByText('You have created coupon code successfully').first()
    ).toBeVisible()
  }

  async editAlias(aliasValue: string) {
    await this.page.getByRole('button', { name: 'Edit' }).click()
    await this.page.locator('#alias').click()
    await this.page.locator('#alias').fill(aliasValue)
    await this.page.getByRole('button', { name: 'Save' }).click()
    await this.delayAfterAction()
    await this.reloadAndValidate(this.page.locator('#alias'), aliasValue, true)
  }

  async updateStudentAlias() {
    await this.goToList()
    await this.goToStudentDetail(`student${timestamp}`)
    // This test case is to test the alias can be updated multiple times with different values
    // And the alias value will be updated to the latest value
    const aliasValues = [aliasName, aliasName + ' with update']
    for (const aliasValue of aliasValues) {
      await this.editAlias(aliasValue)
    }
  }

  async useFirstStudentGoToDetail() {
    await this.goToList()
    const students = await this.getStudents()
    const firstStudent = students[0]
    await this.goToStudentDetail(firstStudent['StudentName'])
  }

  async assignNewCourse(courseName: string) {
    await this.useFirstStudentGoToDetail()
    await this.coursePage.removeCourseFromStudent()
    await this.delayAfterAction()
    await expect(this.page.getByText(courseName).first()).toBeHidden()

    await this.coursePage.addCourseToStudent({})
    await this.delayAfterAction()
    await expect(this.page.getByText(courseName).first()).toBeVisible()
    await expect(
      this.page.getByText('Created teaching service successfully').first()
    ).toBeVisible()
  }

  async assignRecurringCourseWithPriceOptionSelected() {
    await this.useFirstStudentGoToDetail()
    await this.coursePage.addCourseToStudent({
      className: `recurring1class${timestamp}`,
    })
  }

  async changeClass() {
    await this.useFirstStudentGoToDetail()

    const courseCount = await this.page.getByTestId('enroll-status').count()

    if (courseCount === 0) {
      await this.delayAfterAction()
      await this.coursePage.addCourseToStudent({})

      await this.delayAfterAction()
    }

    await this.page.getByRole('button', { name: 'Change class' }).click()

    await this.delayAfterAction()

    await this.coursePage.addCourseToStudent({
      className: `workshop0class${timestamp}`,
    })

    await expect(
      this.page.getByText('Changing the class for this student')
    ).toBeVisible()

    await this.page.getByTestId('confirm-btn').click()

    await this.delayAfterAction()

    await this.page.getByRole('button', { name: 'Close' }).click()
    expect(
      this.page.getByText('Created teaching service successfully').first()
    ).toBeVisible()
  }

  async addLesson() {
    await this.useFirstStudentGoToDetail()

    const courseCount = await this.page.getByTestId('enroll-status').count()
    if (courseCount === 0) {
      await this.delayAfterAction()
      this.coursePage.addCourseToStudent({})
      await this.delayAfterAction()
    }

    await this.page.getByRole('button', { name: 'Add lesson' }).first().click()
    await this.page.waitForSelector('[data-testid="feePerLesson"]', {
      state: 'visible',
    })

    await this.page.getByTestId('feePerLesson').fill('1')

    await this.delayAfterAction()

    await this.coursePage.addCourseToStudent({
      // skipClassSelection: true,
      skipCourseSelection: true,
      classLessonDate: dateToBeFilledIn,
    })

    await this.delayAfterAction()

    await this.page.getByText('Copy').first().waitFor({ timeout: 10000 })

    await this.page.getByTestId('return-to-student-central').click()
  }

  async changeLesson() {
    await this.useFirstStudentGoToDetail()
    const courseCount = await this.page.getByTestId('enroll-status').count()
    if (courseCount === 0) {
      await this.delayAfterAction()
      this.coursePage.addCourseToStudent({})
      await this.delayAfterAction()
    }

    const change = this.page.getByTestId('changeLesson').first()

    if (await change.isVisible()) {
      await this.page.getByTestId('changeLesson').first().click()

      await this.coursePage.addCourseToStudent({
        skipCourseSelection: true,
        classLessonDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      })

      expect(
        this.page.getByText('Change lesson successfully').first()
      ).toBeVisible()
    }
  }
}

export default StudentDetailPage
