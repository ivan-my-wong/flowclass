import { expect, Page, Locator } from '@playwright/test'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import path from 'path'
import fs from 'fs'
import { generateDataTestId } from '../../src/utils/data-testid.utils'
import ApplicationFormPage from './application-form.page'
import ApplicationRecordPage from './application-record.page'
import { BasePage } from './base.page'
import {
  classPrice,
  FieldNameItem,
  fieldNames,
  getCurrencyFromRegionCode,
} from '../const'
import { formatCurrency, getCurrencySymbol } from '../../src/utils/currency'
import { playwrightDefaultFieldNames } from '../const'
dayjs.extend(customParseFormat)

type StudentImportCSV = {
  StudentName: string
  StudentEmail: string
  StudentPhone: string
  Hobby?: string
  Address?: string
}
type AddStudentParams = {
  studentName: string
  studentPhone: string
  studentEmail: string
}
type AddStudentParamsWithAdditionalInfo = AddStudentParams & {
  additionalInfo?: () => Promise<void>
}
type AddStudentWithCourseParams = {
  courseName: string
  className: string
} & AddStudentParams

class StudentPage extends BasePage {
  private applicationFormPage: ApplicationFormPage
  private applicationRecordPage: ApplicationRecordPage
  private initialCsvPath = '../template/import-student-data.csv'
  constructor(page: Page) {
    super(page)
    this.applicationFormPage = new ApplicationFormPage(page)
    this.applicationRecordPage = new ApplicationRecordPage(page)
  }
  async getStudents() {
    return await this.readCsv<StudentImportCSV>(this.initialCsvPath)
  }

  async goToList() {
    await this.goto('/student-record')
    await expect(this.page.getByText('Student Central').first()).toBeVisible()
    await this.delayAfterAction()
  }

  async viewDetailStudent(studentName: string) {
    await this.goToList()
    const students = await this.getStudents()
    const firstStudent = students[0]
    await this.goToStudentDetail(firstStudent['StudentName'])
    await expect(
      this.page.getByText('Personal Information').first()
    ).toBeVisible()
  }

  async bulkRemoveStudent() {
    // Assume we already at list page
    const table = await this.page.locator('.ag-center-cols-container > div')
    if ((await table.count()) === 0) {
      return
    }
    const checkAll = await this.page.getByRole('checkbox', {
      name: 'Column with Header Selection',
    })

    if (await checkAll.isVisible()) {
      await checkAll.click()
      await this.page.waitForTimeout(1000)
      const deleteButton = await this.page.getByTestId('delete-student-bulk')
      await deleteButton.click()
      const confirmButton = await this.page.getByTestId('confirm-btn')
      await confirmButton.click()
    }

    await this.delayAfterAction()

    await expect(
      this.page.getByText('Delete student successfully')
    ).toBeVisible()
  }

  async importStudentData(
    withDelete: boolean,
    importFilePath: string,
    thirdStepErrorMessage: string,
    pickCustomFields?: () => Promise<void>
  ) {
    await this.goToList()
    // delete old student test
    if (withDelete) {
      await this.bulkRemoveStudent()
    }
    await this.page.getByRole('button', { name: 'Import Data' }).click()
    await expect(this.page.getByText('Import Data').first()).toBeVisible()
    await expect(
      this.page
        .getByText('You can only upload .csv, .xlsx, .xls files.')
        .first()
    ).toBeVisible()

    const csvPath = path.join(__dirname, importFilePath)
    //check if the file exists
    if (!fs.existsSync(csvPath)) {
      throw new Error(`File ${importFilePath} does not exist`)
    }

    await this.page.locator('#dropzone-file').setInputFiles(csvPath)
    await this.page.getByTestId('next-to-confirm-import-btn').click()
    await this.delayAfterAction(3000)

    // This selects the trigger of the entire dropdown or select field
    await this.page.waitForSelector('[data-testid="select-field-trigger"]', {
      state: 'visible',
    })
    await this.page.getByTestId('select-field-trigger').nth(0).click()
    await this.page.getByLabel('Name').first().click()
    await this.page.getByTestId('select-field-trigger').nth(1).click()
    await this.page.getByLabel('Email').first().click()
    await this.page.getByTestId('select-field-trigger').nth(2).click()
    await this.page.getByLabel('Phone').first().click()

    if (pickCustomFields) {
      await pickCustomFields()
    }

    // Finish picking fields
    await this.page.getByTestId('next-btn').click()
    await this.delayAfterAction()

    // After checking the CSV file, the UI needs time to pre-process data before showing the next step
    await expect(this.page.getByText(thirdStepErrorMessage)).toBeVisible({
      timeout: 15000,
    })

    // Picking the data processing options should be done in the next step. The next step is to review the data.
  }

  async importInitialStudentData() {
    await this.importStudentData(
      true,
      this.initialCsvPath,
      'The CSV data contains no errors. You can proceed with the import.'
    )

    // await this.page.getByTestId('import-data-option-skipErrorData').click()
    await this.page.getByTestId('next-btn').click()
    await this.delayAfterAction()
    await expect(
      this.page.getByText('Student data has been imported successfully.')
    ).toBeVisible({
      timeout: 15000,
    })
    await this.delayAfterAction()
    await this.page.getByRole('button', { name: 'Close' }).first().click()
  }

  async selectCustomField(startIndex: number, fieldNames: FieldNameItem[]) {
    const fieldCount = fieldNames.length
    console.log(
      `fieldCount: ${fieldCount}, startIndex: ${startIndex}, fieldNames: ${JSON.stringify(
        fieldNames
      )}`
    )
    for (let i = 0; i < fieldCount; i++) {
      console.log(`targeted: ${startIndex + i}, name: ${fieldNames[i].name}`)
      const selectField = this.page
        .getByTestId('select-field-trigger')
        .nth(startIndex + i)

      console.log(`selectField exist?: ${await selectField.isVisible()}`)
      if (!(await selectField.isVisible())) {
        return
      }
      await selectField.click()
      await this.page
        .getByTestId(generateDataTestId('optional-field', fieldNames[i].name))
        .click()
    }
  }

  async importStudentDataWithNewColumns(fieldNames: FieldNameItem[]) {
    const filePath = '../template/import_student_with_2_new_columns.csv'
    const students = await this.readCsv<StudentImportCSV>(filePath)
    const studentWithFilledCustomFieldValue = students.find(
      student => student['Hobby'] !== ''
    )
    const studentWithEmptyCustomFieldValue = students.find(
      student => student['Hobby'] === ''
    )

    await this.goto('/settings/student-information-field')
    await this.delayAfterAction(500)
    for (const fieldName of fieldNames) {
      const checkIfFieldExists = await this.page.getByText(fieldName.name)
      if (await checkIfFieldExists.isVisible()) {
        continue
      }

      await this.applicationFormPage.createCustomDataField(
        fieldName.name,
        fieldName.type,
        true
      )
    }

    await this.goToList()
    await this.importStudentData(
      false,
      filePath,
      'Please review the data as it either contains existing users or has errors.',
      async () => {
        await this.selectCustomField(3, fieldNames)
      }
    )

    // Review import data options
    await this.page.getByTestId('import-data-option-overwrite').click()
    await this.page.getByTestId('next-btn').click()

    await this.delayAfterAction()
    await expect(
      this.page.getByText('Student data has been imported successfully.')
    ).toBeVisible({
      timeout: 15000,
    })

    await this.delayAfterAction()

    await this.page.getByRole('button', { name: 'Close' }).first().click()

    await this.goToList()
    // Student with filled hobby value
    if (studentWithFilledCustomFieldValue) {
      await this.goToStudentDetail(
        studentWithFilledCustomFieldValue['StudentName']
      )

      await this.delayAfterAction()

      // Get input value
      const inputHobbyValue = await this.page
        .getByTestId(generateDataTestId('text-field', fieldNames[0].name))
        .inputValue()

      expect(inputHobbyValue).toBe(studentWithFilledCustomFieldValue['Hobby'])

      const inputAddressValue = await this.page
        .getByTestId(generateDataTestId('text-field', fieldNames[1].name))
        .inputValue()

      expect(inputAddressValue).toBe(
        studentWithFilledCustomFieldValue['Address']
      )
    }
    // Go back to list page
    await this.goToList()
    // Student with empty hobby value
    if (studentWithEmptyCustomFieldValue) {
      await this.goToStudentDetail(
        studentWithEmptyCustomFieldValue['StudentName']
      )
      const inputHobbyEmptyValue = await this.page.getByTestId(
        generateDataTestId('text-field', fieldNames[0].name)
      )
      expect(await inputHobbyEmptyValue.isVisible()).toBe(false)
    }
  }

  async importStudentDataWithUpdateCustomField(fieldNames: FieldNameItem[]) {
    const oldCsvfilePath = '../template/import_student_with_2_new_columns.csv'
    const students = await this.readCsv(oldCsvfilePath)

    const studentWithFilledCustomFieldValue = students[0]
    if (!studentWithFilledCustomFieldValue) {
      throw new Error('No student with filled custom field value found')
    }
    await this.goToList()
    // Get Old Data from detail page
    await this.delayAfterAction(5000)
    await this.goToStudentDetail(
      studentWithFilledCustomFieldValue['StudentName']
    )
    const oldInputHobbyValue = await this.page
      .getByTestId(generateDataTestId('text-field', fieldNames[0].name))
      .inputValue()
    const oldInputAddressValue = await this.page
      .getByTestId(generateDataTestId('text-field', fieldNames[1].name))
      .inputValue()

    const filePath = '../template/import_student_with_update_custom_field.csv'
    await this.importStudentData(
      false,
      filePath,
      'Please review the data as it either contains existing users or has errors.',
      async () => {
        await this.selectCustomField(3, fieldNames)
      }
    )

    // Review import data options
    await this.page.getByTestId('import-data-option-keepOriginalData').click()
    await this.page.getByTestId('next-btn').click()
    await this.delayAfterAction()

    await expect(
      this.page.getByText('Student data has been imported successfully.')
    ).toBeVisible({
      timeout: 15000,
    })
    await this.delayAfterAction()

    await this.page.getByRole('button', { name: 'Close' }).first().click()

    await this.goToList()
    await this.goToStudentDetail(
      studentWithFilledCustomFieldValue['StudentName']
    )

    await this.page.reload()
    await this.page.waitForLoadState('networkidle')

    const inputHobbyValue = await this.page
      .getByTestId(generateDataTestId('text-field', fieldNames[0].name))
      .inputValue()
    expect(inputHobbyValue).not.toBe(oldInputHobbyValue)
    const inputAddressValue = await this.page
      .getByTestId(generateDataTestId('text-field', fieldNames[1].name))
      .inputValue()
    expect(inputAddressValue).not.toBe(oldInputAddressValue)
  }

  async importNewStudentWithUpdateExistingStudent(fieldNames: FieldNameItem[]) {
    const newStudentName = 'Cristiano Ronaldo'
    const oldCsvfilePath = '../template/import_student_with_2_new_columns.csv'
    const students = await this.readCsv(oldCsvfilePath)

    const studentWithFilledCustomFieldValue = students[0]
    if (!studentWithFilledCustomFieldValue) {
      throw new Error('No student with filled custom field value found')
    }
    await this.goToList()
    await this.delayAfterAction()
    // Get Old Data from detail page
    await this.goToStudentDetail(
      studentWithFilledCustomFieldValue['StudentName']
    )
    const oldInputHobbyValue = await this.page
      .getByTestId(generateDataTestId('text-field', fieldNames[0].name))
      .inputValue()
    const oldInputAddressValue = await this.page
      .getByTestId(generateDataTestId('text-field', fieldNames[1].name))
      .inputValue()
    const filePath =
      '../template/import_new_student_with_update_existing_student.csv'

    await this.importStudentData(
      false,
      filePath,
      'Please review the data as it either contains existing users or has errors.',
      async () => {
        await this.selectCustomField(3, fieldNames)
      }
    )

    await this.page.getByTestId('import-data-option-skipErrorData').click()
    await this.page.getByTestId('next-btn').click()
    await this.delayAfterAction()
    await expect(
      this.page.getByText('Student data has been imported successfully.')
    ).toBeVisible({
      timeout: 15000,
    })
    await this.delayAfterAction()
    await this.page.getByRole('button', { name: 'Close' }).first().click()
    await this.goToList()
    await this.delayAfterAction()
    await this.goToStudentDetail(
      studentWithFilledCustomFieldValue['StudentName']
    )
    // Check old student data should be not updated
    const inputHobbyValue = await this.page
      .getByTestId(generateDataTestId('text-field', fieldNames[0].name))
      .inputValue()
    expect(inputHobbyValue).toBe(oldInputHobbyValue)
    const inputAddressValue = await this.page
      .getByTestId(generateDataTestId('text-field', fieldNames[1].name))
      .inputValue()
    expect(inputAddressValue).toBe(oldInputAddressValue)
    // New student should be created
    await this.goToList()
    await this.delayAfterAction()
    expect(
      this.page.getByTestId(generateDataTestId('action-button', newStudentName))
    ).toBeVisible()
  }

  async importStudentWithExceedMaxStudentLimit() {
    await this.goToList()
    const filePath = '../template/import_student_with_1000_data.csv'
    await this.importStudentData(
      false,
      filePath,
      'The imported data exceeds the',
      async () => {
        await this.selectCustomField(3, fieldNames)
      }
    )

    await this.page.getByRole('button', { name: 'Close' }).first().click()
  }

  async goToStudentDetail(studentName: string) {
    const testId = `view-detail-button-${studentName
      .toLowerCase()
      .replace(/\s+/g, '-')}`

    const viewDetailButton = await this.page.waitForSelector(
      `[data-testid="${testId}"]`,
      {
        state: 'visible',
      }
    )
    await viewDetailButton.click()
    await this.delayAfterAction(5000)
  }

  async removeAllStudent() {
    await this.goToList()
    await this.delayAfterAction()
    await this.bulkRemoveStudent()
  }

  async addStudent({
    studentName,
    studentPhone,
    studentEmail,
    additionalInfo,
  }: AddStudentParamsWithAdditionalInfo) {
    await this.goToList()
    expect(this.page.getByText('Student Central').first()).toBeVisible()
    // create a new student
    await this.page.getByTestId('create-student-btn').click()
    await this.page.locator('#alias').fill(studentName)
    await this.page.getByPlaceholder('1 (702) 123-').fill(studentPhone)
    await this.page.locator('#email').fill(studentEmail)

    await this.delayAfterAction()
    const saveButton = await this.page.getByRole('button', { name: 'Save' })
    await saveButton.scrollIntoViewIfNeeded()
    await saveButton.click()
    await this.delayAfterAction()

    const studentSuccessMessage = this.page.getByText(
      'Created student successfully'
    )
    const studentAlreadyExistsMessage = this.page.getByText(
      'Student already exists'
    )

    await expect(
      studentSuccessMessage.first().or(studentAlreadyExistsMessage)
    ).toBeVisible()

    if (additionalInfo) {
      expect(
        this.page.getByText('Created teaching service successfully').first()
      ).toBeVisible()
    }

    await additionalInfo?.()
  }

  async addStudentWithCourse({
    studentName,
    studentPhone,
    studentEmail,
    courseName,
    className,
  }: AddStudentWithCourseParams) {
    await this.addStudent({
      studentName,
      studentPhone,
      studentEmail,
    })

    await this.page.getByText('Assign Course Now').click()

    await this.page
      .getByTestId('courseId')
      .getByRole('combobox')
      .first()
      .click()
    await this.page.getByLabel(courseName).first().click()
    await this.page.getByTestId('classId').getByRole('combobox').first().click()
    await this.page.getByLabel(className).first().click()
    await this.page
      .getByTestId('periodId')
      .getByRole('combobox')
      .first()
      .click()
    await this.page.getByRole('option').first().click()
    await this.page
      .getByTestId('classLessonDate')
      .fill(dayjs().add(1, 'day').format('YYYY-MM-DD'))

    const saveButton = await this.page.getByRole('button', { name: 'Save' })
    await saveButton.scrollIntoViewIfNeeded()
    await saveButton.click()
    await this.delayAfterAction()
    await this.applicationRecordPage.approvePayment()
  }

  async searchStudent(studentName: string) {
    await this.goToList()
    await this.page
      .getByPlaceholder('Search by name / email / phone number')
      .fill(studentName)
    await this.delayAfterAction()
    const rows = await this.page
      .locator('.ag-center-cols-container > div')
      .count()
    expect(rows >= 1).toBe(true)
  }

  async searchStudentWithCourseName(courseName: string) {
    await this.goToList()
    await this.page.locator('#filter-course-selector').click()
    await this.page
      .locator('.country-option', { hasText: courseName })
      .first()
      .click()
    await this.delayAfterAction()
    const count = await this.page
      .locator('.ag-center-cols-container > div')
      .count()
    expect(count).toBeGreaterThan(0)
  }

  async searchStudentWithStatus(status: string) {
    await this.goToList()
    await this.page.locator('#filter-payment-status-selector').click()
    await this.page
      .locator('.country-option', { hasText: status })
      .first()
      .click()

    await this.delayAfterAction()

    const rows = await this.page
      .locator('.ag-center-cols-container > div')
      .count()

    expect(rows >= 1).toBe(true)
  }

  async searchStudentWithClassName(className: string) {
    await this.goToList()
    await this.page.locator('#filter-class-selector').click()
    await this.page
      .locator('.country-option', { hasText: className })
      .first()
      .click()
    const count = await this.page
      .locator('.ag-center-cols-container > div')
      .count()
    expect(count).toBeGreaterThan(0)
  }

  async searchStudentWithCustomField(fieldKey: string, fieldValue: string) {
    await this.goToList()
    await this.page.getByTestId('filter-custom-field-btn').click()

    await this.page.getByTestId('add-filter-rule-btn').click()
    //
    // await this.page.getByTestId('custom-field-selector').click()

    // Select the custom field
    // await this.page.getByRole('option', { name: fieldKey }).click()

    // Select the operator
    // await this.page.getByRole('option', { name: 'contains' }).click()

    // Select the value
    await this.page.getByTestId('custom-field-answer-input').fill(fieldValue)

    // Click the search button
    await this.page.getByTestId('search-btn').click()

    // Verify the result
    const rows = await this.page
      .locator('.ag-center-cols-container > div')
      .count()
    expect(rows >= 1).toBe(true)
  }

  private async selectFutureDate(form: Locator) {
    const now = new Date()
    const lessonDateInput = form.getByTestId('classLessonDate')
    await lessonDateInput.click()
    const days = form.locator(
      '.react-datepicker__day:not(.react-datepicker__day--disabled)'
    )
    const count = await days.count()
    let picked = false

    for (let i = 0; i < count; i++) {
      const dayEl = days.nth(i)
      const ariaLabel = await dayEl.getAttribute('aria-label')
      if (ariaLabel) {
        const dateStr = ariaLabel.replace('Choose ', '').replace(/(\w+), /, '')
        const dayJsParsed = dayjs(dateStr, 'MMMM Do, YYYY', 'en').toDate()
        const parsed = dayJsParsed.getTime()

        if (!isNaN(parsed)) {
          if (parsed > now.getTime()) {
            await dayEl.click()
            picked = true
            return picked
          }
        }
      }
    }
    if (!picked && count > 0) {
      await days.first().click()

      return true
    }

    return false
  }

  private periodTimeExtractor(
    timeSlotText: string,
    isDateTime: boolean = false
  ): number[] {
    // Corrected format: 'hh' is used for 12-hour format time which matches the 'pm' in the input.
    const fmt = isDateTime ? 'YYYY/MM/DD hh:mm a (dddd)' : 'hh:mm a'

    // The third parameter 'true' enables strict parsing.
    const parsed = dayjs(timeSlotText.replace('Starts at ', ''), fmt, true)

    // If parsing fails, return a default value.
    if (!parsed.isValid()) {
      // This path is taken when the input string does not match the format.
      return [0, 0]
    }

    // If parsing is successful, return the extracted components.
    if (isDateTime) {
      return [
        parsed.year(), // 2025
        parsed.month() + 1, // 6 (dayjs months are 0-indexed, so we add 1)
        parsed.date(), // 12
        parsed.hour(), // 13 (dayjs.hour() returns the 24-hour format)
        parsed.minute(), // 51
      ]
    } else {
      return [parsed.hour(), parsed.minute()]
    }
  }

  /**
   * Shared helper to select course, class, period, date, and optionally toggle free lesson.
   * Returns the derived dateStart for further assertions.
   */
  private async pickCourseAndClassAndDate(
    form: Locator,
    options: {
      courseName: string
      className: string
      classType: string
      toggleFreeLesson?: boolean
    }
  ): Promise<{ dateStart: Date }> {
    const { courseName, className, classType, toggleFreeLesson } = options
    // Select Course
    await this.selectOption(
      this.page.getByTestId('courseId').getByRole('combobox').first(),
      {
        text: courseName,
      }
    )

    // Select Class
    await this.selectOption(
      this.page.getByTestId('classId').getByRole('combobox').first(),
      {
        text: className,
      }
    )

    let dateStart = new Date()

    if (classType !== 'subscription') {
      // Select Period
      await this.selectOption(
        this.page.getByTestId('periodId').getByRole('combobox').first(),
        {
          text: dayjs().add(1, 'day').format('YYYY/MM/DD'),
        }
      )
      const rawTimeSlotText = await this.page
        .getByTestId('periodId')
        .innerText()

      // Select nearest future date
      let isDateClicked = await this.selectFutureDate(form)
      await expect(isDateClicked).toBe(true)

      const rawDateText = await form.getByTestId('classLessonDate').inputValue()
      const dateData = rawDateText.split('-').map(Number)

      if (classType !== 'recurring') {
        const [year, month, day, hours, minutes] = this.periodTimeExtractor(
          rawTimeSlotText,
          true
        )
        console.log([year, month - 1, day, hours, minutes])
        dateStart = new Date(year, month - 1, day, hours, minutes)
      } else {
        console.log('rawTimeSlotText', rawTimeSlotText)
        const [hours, minutes] = this.periodTimeExtractor(
          rawTimeSlotText,
          false
        )
        console.log([dateData[0], dateData[1] - 1, dateData[2], hours, minutes])
        dateStart = new Date(
          dateData[0],
          dateData[1] - 1,
          dateData[2],
          hours,
          minutes
        )
      }
    }

    // Toggle Free Lesson if needed
    if (toggleFreeLesson) {
      const freeButton = this.page.getByTestId('free-lesson-switch').first()
      const freeState = await freeButton.getAttribute('aria-checked')
      if (freeState !== 'true') {
        await freeButton.click()

        await this.delayAfterAction()
        await expect(freeButton).toHaveAttribute('aria-checked', 'true')
      }
    }

    return { dateStart }
  }

  private getNearestFutureDateWithWeekday(weekday: number) {
    const now = new Date()
    let daysUntilWeekday = (weekday - now.getDay() + 7) % 7
    if (daysUntilWeekday === 0) {
      daysUntilWeekday = 7
    }
    const nearestFutureDate = new Date(now)
    nearestFutureDate.setDate(now.getDate() + daysUntilWeekday)
    return nearestFutureDate
  }

  async generateCourseLink(classType: string = 'recurring') {
    const regionCode = process.env.VITE_REGION_CODE ?? 'ID'
    const currencyCode = getCurrencyFromRegionCode(regionCode)

    await this.goToList()

    // 0. Variables
    const now = new Date()
    const courseName = `course${dayjs(now).format('YYMMDD')}`

    // If you see the class names are different, it's because they are created from the front end flowclass-web tests instead of in flowclass-connect
    const className = `${classType}0class${dayjs(now).format('YYMMDD')}`

    // 1. Select the first student row
    const oldForm = this.page.locator('[data-testid="teaching-service-form"]')

    if (await oldForm.isVisible()) {
      await oldForm.locator('[data-testid="return-to-student-central"]').click()
    }

    expect(await oldForm.isVisible()).toBe(false)

    const studentRow = this.page.locator('[role="row"]').last()
    const name = (
      await studentRow.locator('[col-id="name"]').innerText()
    ).trim()
    const phone = (
      await studentRow.locator('[col-id="phone"]').innerText()
    ).trim()
    const email = (
      await studentRow.locator('[col-id="user.email"]').innerText()
    ).trim()

    // 2. Click menu
    await studentRow.locator('[data-testid^="action-button"]').click()

    // 3. Select "Generate application link"
    await this.page
      .getByRole('menuitem', { name: 'Generate application link' })
      .click()

    // 4. Wait for form to appear
    const form = this.page.getByTestId('teaching-service-form')
    await expect(form.getByText('Student name')).toBeVisible()

    // 5-8. Use shared helper for course/class/period/date
    let { dateStart } = await this.pickCourseAndClassAndDate(form, {
      courseName,
      className,
      classType,
    })

    if (classType === 'recurring') {
      // Override the dateStart to the next day
      // Use the nearest future date
      dateStart = this.getNearestFutureDateWithWeekday(1)
      await form
        .locator('input[data-testid="classLessonDate"]')
        .fill(dayjs(dateStart).format('YYYY-MM-DD'))
    }

    // 9. Click Generate
    await form.getByRole('button', { name: 'Generate' }).click()

    // 10. Verify generated link
    const linkWrapper = this.page.locator('a[href*="/enrol?"]')
    await expect(linkWrapper).toBeVisible()
    // Extract href
    const href = await linkWrapper.getAttribute('href')
    if (!href) throw new Error('enrol link not found')

    // 11. Go to enrollment link page
    await this.page.goto(href)

    const confirmButton = this.page.getByRole('button', { name: /confirm/i })

    await confirmButton.click()

    const proceedPaymentButton = this.page.getByRole('button', {
      name: /register and proceed to payment/i,
    })
    await proceedPaymentButton.click()
    await this.page.waitForTimeout(5000)

    // 13. Verify payment page keywords
    await expect(
      this.page.getByText('Please complete the payment to secure the seat.')
    ).toBeVisible()

    // === Verify page content below ===

    // Contact Info
    const nameText = await this.page.locator('p#Name').innerText()
    const emailText = await this.page.locator('p#Email').innerText()
    const phoneText = await this.page.locator('p#Phone').innerText()

    // Course name
    const rawCourseName = await this.page
      .getByTestId('course-name')
      .first()
      .innerText()
    let rawClassName = ''
    let timeSlot = ''

    if (classType !== 'subscription') {
      // Time slot info (class, date time)
      rawClassName = await this.page
        .getByTestId('class-name')
        .first()
        .innerText()
      timeSlot = await this.page.getByTestId('lesson-date').first().innerText()
    }
    // Amount price-cell
    const amount = await this.page
      .getByTestId('payment-amount-price')
      .first()
      .innerText()

    // Check if the name, email, phone are correct
    console.log({ nameText, name, emailText, email, phoneText, phone })
    await expect(this.page.getByText(nameText)).toHaveText(name)
    await expect(this.page.getByText(emailText)).toHaveText(email)
    await expect(this.page.getByText(phoneText)).toHaveText(phone)

    // Check if the amount is correct
    await expect(
      this.page.getByTestId('payment-amount-price').first()
    ).toContainText(
      `${currencyCode} ${formatCurrency(
        Number(classPrice),
        getCurrencySymbol(currencyCode) ?? 'Rp'
      )}`
    )

    // Check if the course name and the class name are correct
    await expect(this.page.getByText(rawCourseName)).toHaveText(courseName)

    if (classType !== 'subscription') {
      // Check if the time slot is correct
      const invoiceTimeStart = timeSlot.split(' - ')[0]
      // The fmt of Start Time is "2025/05/17 12:03 pm", deserialize it to date object by dayjs
      const invoiceTimeStartDate = dayjs(
        invoiceTimeStart,
        'YYYY/MM/DD HH:mm a',
        true
      ).toDate()
      console.log(dateStart)
      await expect(this.page.getByText(invoiceTimeStart)).toHaveText(
        dayjs(dateStart).format('YYYY/MM/DD hh:mm a')
      )
    }
  }

  async assignCourse(free: boolean = false, classType: string = 'workshop') {
    await this.goToList()

    // 0. Variables
    const now = new Date()
    const courseName = `course${dayjs(now).format('YYMMDD')}`
    const className = `${classType}0class${dayjs(now).format('YYMMDD')}`

    // 1. Select the first student row
    const studentRow = this.page.locator('[role="row"]').nth(1)

    // 2. Click action menu
    await studentRow.locator('[data-testid^="action-button"]').click()

    // 3. Select "Add Course Directly"
    await this.page
      .getByRole('menuitem', { name: 'Add Course Directly' })
      .click()

    // 4. Wait for form to appear
    const form = this.page.getByTestId('teaching-service-form')
    await expect(
      form.locator('h2', { hasText: 'Add Course Directly' })
    ).toBeVisible()

    // 5-8. Use shared helper for course/class/period/date
    const { dateStart } = await this.pickCourseAndClassAndDate(form, {
      courseName,
      className,
      classType,
      toggleFreeLesson: free,
    })

    // 9. Click Save
    await form.getByTestId('save-button').click()
    await this.delayAfterAction()

    // 10. Verify result
    const toast = this.page
      .locator('div', { hasText: 'Created teaching service successfully' })
      .first()
    await expect(toast).toBeVisible()

    // list all div with data-testid="enroll-course-id" and get the text of them, transform to number
    const enrollCourseIds = await this.page
      .locator('[data-testid="enroll-course-id"]')
      .all()
    const enrollCourseIdsText = await Promise.all(
      enrollCourseIds.map(
        async enrollCourseId => await enrollCourseId.textContent()
      )
    )
    const enrollCourseIdsNumber = enrollCourseIdsText
      .map(Number)
      .filter(n => !Number.isNaN(n) && n > 0)

    // get the max number
    const maxEnrollCourseId = Math.max(...enrollCourseIdsNumber)

    // teaching-service-item-{maxEnrollCourseId}
    const teachingServiceItem = this.page.locator(
      `[data-testid="teaching-service-item-${maxEnrollCourseId}"]`
    )
    await expect(teachingServiceItem).toBeVisible()

    const rawCourseName = await teachingServiceItem
      .getByTestId('course-name')
      .textContent()
    const rawClassName = await teachingServiceItem
      .getByTestId('class-name')
      .textContent()

    await expect(rawCourseName).toBe(courseName)
    await expect(rawClassName).toBe(className)

    // check the lesson time slotlesson-time-slot
    if (classType !== 'subscription') {
      const rawLessonTimeSlot =
        (await teachingServiceItem
          .getByTestId('lesson-time-slot')
          .first()
          .textContent()) ?? ''
      const startTime = rawLessonTimeSlot.split(' - ')[0]

      const startTimeObj = dayjs(
        startTime,
        'YYYY/MM/DD HH:mm a',
        false
      ).toDate()

      expect(startTimeObj.getTime()).toBe((dateStart ?? new Date()).getTime())
    }
  }

  // async assignCoupon(couponCode: string, isPercentage: boolean = false) {
  //   //import { test, expect } from '@playwright/test';

  //   // 1. Go to student list
  //   await this.goToList()

  //   const tableBody = this.page.locator('.ag-body-viewport')

  //   const firstRow = tableBody.getByRole('rowgroup').first()

  //   const openMenuButton = firstRow.locator('[aria-label="Open Menu"]').first()
  //   await openMenuButton.click()

  //   const menuList = this.page
  //     .locator('div[data-radix-popper-content-wrapper]')
  //     .first()
  //   await menuList.getByRole('menuitem', { name: 'Assign coupon' }).click()
  //   //wait for 3 seconds
  //   await this.delayAfterAction(3000)

  //   const form = this.page.locator('form')

  //   await form.locator('input#code').fill(couponCode)

  //   if (isPercentage) {
  //     await form.locator('div[data-testid="percentage-btn"]').click()
  //   } else {
  //     await form.locator('div[data-testid="fixed-amount-btn"]').click()
  //   }

  //   await this.page.getByTestId('save-coupon-btn').click()
  //   await expect(
  //     this.page.getByText('You have created coupon code')
  //   ).toBeVisible()

  //   await this.page.getByText('Student Central').click()
  //   await this.page
  //     .getByTestId('action-button-student250609')
  //     .locator('path')
  //     .click()
  //   await this.page.getByRole('menuitem', { name: 'Assign coupon' }).click()
  //   await this.page
  //     .locator('form div')
  //     .filter({ hasText: 'Discount AmountFixed%$100$200' })
  //     .getByTestId('tag-customize')
  //     .click()
  //   await this.page.getByPlaceholder('Fill in number only, i.e.').click()
  //   await this.page.getByPlaceholder('Fill in number only, i.e.').fill('201')
  //   await this.page
  //     .locator('div')
  //     .filter({
  //       hasText:
  //         /^The coupon will expire after1 month3 monthHalf yearCustomize$/,
  //     })
  //     .getByTestId('tag-customize')
  //     .click()
  //   await this.page.getByTestId('tag-3 month').click()
  //   await this.page.getByTestId('tag-1 month').click()
  //   await this.page.getByTestId('tag-1').click()
  //   await this.page.getByTestId('tag-10').click()
  //   await this.page.getByTestId('save-coupon-btn').click()
  //   await this.page.getByText('You have created coupon code').click()
  // }
}

export default StudentPage
