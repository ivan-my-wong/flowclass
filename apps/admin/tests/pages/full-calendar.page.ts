import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import fs from 'fs'
import path from 'path'
import {
  anotherStudentEmail,
  anotherStudentName,
  studentEmail,
  studentName,
} from '../const'
import { BasePage } from './base.page'

type StudentDetail = { name: string; email: string; phone: string }

class FullCalendarPage extends BasePage {
  async goToCalendarPage() {
    await this.goto('/full-calendar')
    await this.delayAfterAction()
  }

  async scanQRCode() {
    await this.goToCalendarPage()
    await this.page.getByRole('button', { name: 'Scan QR code' }).click()
    expect(this.page.getByText('Scan QR code').first()).toBeVisible()
    expect(
      this.page.getByText('Please grant access right to camera').first()
    ).toBeVisible()
    await this.page.getByLabel('Close', { exact: true }).click()
  }

  get views(): string[] {
    return ['Day', 'Month', 'N Days', 'Week', 'Year', 'Schedule']
  }

  get viewDataTestIds(): Record<string, string> {
    return {
      Day: 'day-view',
      Month: 'month-view',
      'N Days': 'n-day-view',
      Week: 'week-view',
      Year: 'year-view',
      Schedule: 'schedule-view',
    }
  }

  async switchView() {
    await this.goToCalendarPage()
    for (let i = 0; i < this.views.length; i++) {
      const view = this.views[i]
      await this.selectView(view, true)
    }
  }

  async selectView(view: string, withExpect?: boolean) {
    await this.page.getByTestId('calendar-view-select').click()
    await this.page.getByRole('option', { name: view, exact: true }).click()
    await this.page.waitForSelector(
      `[data-testid="${this.viewDataTestIds[view]}"]`
    )
    if (withExpect) {
      await expect(
        this.page.getByTestId(this.viewDataTestIds[view])
      ).toBeVisible()
    }
  }

  async clickDate(date: string) {
    const dayNumber = dayjs(date).format('DD')
    const todayDayNumber = dayjs().format('DD')

    if (dayNumber > todayDayNumber) {
      await this.page
        .getByRole('button', { name: 'Go to previous month' })
        .click()
    }

    await this.page
      .getByRole('gridcell', { name: dayNumber, exact: true })
      .last()
      .click()
  }

  async switchDateInDayView() {
    await this.goToCalendarPage()
    await this.goToCalendarPage()
    const {
      fourDayAgoFormatted,
      currentDateLocaleDate,
      previousDateLocaleDate,
      nextDateLocaleDate,
      fourDayAgoLocaleDate,
      currentDateFormatted,
    } = this.generateDateData('long')
    await this.selectView('Day', false)

    await this.clickDate(fourDayAgoFormatted)

    const dateHeader = this.page.getByTestId('current-date-header')
    await expect(dateHeader).toHaveText(fourDayAgoLocaleDate)

    // Back go current date
    const goToCurrentDate = async () => {
      await this.clickDate(currentDateFormatted)

      await expect(dateHeader).toHaveText(currentDateLocaleDate)
    }

    await goToCurrentDate()
    // Go to previous date
    await this.page.getByTestId('previous-date-button').click()
    await expect(dateHeader).toHaveText(previousDateLocaleDate)
    // Back go current date
    await goToCurrentDate()
    // Go to next date
    await this.page.getByTestId('next-date-button').click()
    await expect(dateHeader).toHaveText(nextDateLocaleDate)

    // Go to today
    await this.page.getByTestId('today-button').click()
    await expect(dateHeader).toHaveText(currentDateLocaleDate)
  }

  async switchDateInNDaysView() {
    await this.goToCalendarPage()
    const {
      currentDateFormatted,
      currentDateLocaleDate,
      fourDayAgoFormatted,
      fourDayAgoLocaleDate,
      previousDateLocaleDate,
      nextDateLocaleDate,
    } = this.generateDateData('short')
    await this.selectView('N Days', false)

    await this.clickDate(currentDateFormatted)
    const dateHeader = this.page.getByTestId('current-date-header')
    await expect(dateHeader).toHaveText(currentDateLocaleDate)

    // Back go 4 days ago
    await this.clickDate(fourDayAgoFormatted)
    await expect(dateHeader).toHaveText(fourDayAgoLocaleDate)

    // Back go current date
    const goToCurrentDate = async () => {
      await this.clickDate(currentDateFormatted)
      await expect(dateHeader).toHaveText(currentDateLocaleDate)
    }

    await goToCurrentDate()
    // Go to previous date
    await this.page.getByTestId('previous-date-button').click()
    await expect(dateHeader).toHaveText(previousDateLocaleDate)
    // Back go current date
    await goToCurrentDate()
    // Go to next date
    await this.page.getByTestId('next-date-button').click()
    await expect(dateHeader).toHaveText(nextDateLocaleDate)

    // Change number of days
    const nDayViewDaysLocator = '[data-testid="n-day-view-days"]'
    const changeNumberOfDays = async (numberOfDays: number) => {
      await this.page
        .getByTestId('n-day-view-input')
        .fill(numberOfDays.toString())

      await this.page.waitForSelector(nDayViewDaysLocator)
      const days = await this.page.locator(nDayViewDaysLocator).count()
      await expect(days).toBe(numberOfDays)
    }
    await changeNumberOfDays(3)
    await this.page.waitForTimeout(3000)
    await changeNumberOfDays(5)
    await this.page.getByTestId('n-day-view-reset-button').click()
    await this.page.waitForTimeout(1000)
    await expect(this.page.getByTestId('n-day-view-input')).toHaveValue('3')
    const days = await this.page.locator(nDayViewDaysLocator).count()
    await expect(days).toBe(3)
  }

  async switchWeekInWeekView() {
    await this.goToCalendarPage()
    const generateWeekHeaderText = (date: Date) => {
      const firstDayOfWeek = dayjs(date).startOf('week').toDate()
      const lastDayOfWeek = dayjs(date).endOf('week').toDate()
      return `${firstDayOfWeek.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })} - ${lastDayOfWeek.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`
    }
    await this.selectView('Week', false)
    const dateHeader = this.page.getByTestId('current-date-header')
    await expect(dateHeader).toHaveText(generateWeekHeaderText(new Date()))
    await this.page.waitForTimeout(1000)
    // Navigate to previous week
    await this.page.getByTestId('previous-date-button').click()
    const previousWeek = dayjs(new Date()).subtract(1, 'week').toDate()
    await expect(dateHeader).toHaveText(generateWeekHeaderText(previousWeek))
    await this.page.waitForTimeout(1000)
    // Back to current week
    await this.page.getByTestId('today-button').click()
    await expect(dateHeader).toHaveText(generateWeekHeaderText(new Date()))
    await this.page.waitForTimeout(1000)
    // Navigate to next week
    const nextWeek = dayjs(new Date()).add(1, 'week').toDate()
    await this.page.getByTestId('next-date-button').click()
    await expect(dateHeader).toHaveText(generateWeekHeaderText(nextWeek))
  }

  generateMonthHeaderText(date: Date) {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  async switchMonthInMonthView() {
    await this.goToCalendarPage()
    await this.selectView('Month', false)
    const dateHeader = this.page.getByTestId('current-date-header')
    await expect(dateHeader).toHaveText(
      this.generateMonthHeaderText(new Date())
    )
    await this.page.waitForTimeout(1000)
    // Navigate to previous month
    await this.page.getByTestId('previous-date-button').click()
    await expect(dateHeader).toHaveText(
      this.generateMonthHeaderText(
        dayjs(new Date()).subtract(1, 'month').toDate()
      )
    )
    await this.page.waitForTimeout(1000)
    // Back to current month
    await this.page.getByTestId('today-button').click()
    await expect(dateHeader).toHaveText(
      this.generateMonthHeaderText(new Date())
    )
    await this.page.waitForTimeout(1000)
    // Navigate to next month
    await this.page.getByTestId('next-date-button').click()
    await expect(dateHeader).toHaveText(
      this.generateMonthHeaderText(dayjs(new Date()).add(1, 'month').toDate())
    )
  }

  async switchYearInYearView() {
    await this.goToCalendarPage()
    await this.selectView('Year', false)
    const currentYear = new Date().getFullYear()
    const dateHeader = this.page.getByTestId('current-date-header')
    await expect(dateHeader).toHaveText(currentYear.toString())
    await this.page.waitForTimeout(1000)
    // Navigate to previous year
    await this.page.getByTestId('previous-date-button').click()
    await expect(dateHeader).toHaveText(
      dayjs(new Date()).subtract(1, 'year').year().toString()
    )
    await this.page.waitForTimeout(1000)
    // Back to current year
    await this.page.getByTestId('today-button').click()
    await expect(dateHeader).toHaveText(currentYear.toString())
    await this.page.waitForTimeout(1000)
    // Navigate to next year
    await this.page.getByTestId('next-date-button').click()
    await expect(dateHeader).toHaveText(
      dayjs(new Date()).add(1, 'year').year().toString()
    )
  }

  async searchByStudent(keyword: string) {
    await this.page.getByTestId('search-by-student').fill(keyword)
    await this.waitForClassLessonRequest()
  }
  async filterClassLessonByStudentName() {
    await this.goToCalendarPage()
    await this.searchByStudent(studentEmail)
    const count1 = await this.page.getByRole('contentinfo').count()
    expect(count1).toBeGreaterThan(0)
    await this.searchByStudent(studentName)
    const count2 = await this.page.getByRole('contentinfo').count()
    expect(count2).toBeGreaterThan(0)
  }

  async filterClassLessonByCourseAndClass() {
    await this.goToCalendarPage()
    const countBeforFilter = await this.page.getByRole('contentinfo').count()
    await this.page.locator('#filter-by-course-and-class').click()
    await this.page.waitForSelector('.country-option', { state: 'visible' })
    // Pilih opsi berdasarkan teks
    await this.page.locator('.country-option').nth(0).click()
    await this.waitForClassLessonRequest()
    expect(await this.page.getByRole('contentinfo').count()).toBeLessThan(
      countBeforFilter
    )
  }

  async waitForClassLessonRequest() {
    await this.page.waitForRequest(request =>
      request.url().includes('/class-lesson')
    )
    await this.delayAfterAction(5000)
  }

  async filterClassLessonByOnlyShowClassWithApplication() {
    await this.goToCalendarPage()
    const countBeforeFilter = await this.page.getByRole('contentinfo').count()
    await this.page.getByTestId('show-only-classes-with-applications').click()
    await this.waitForClassLessonRequest()
    await this.delayAfterAction()
    expect(await this.page.getByRole('contentinfo').count()).toBeLessThan(
      countBeforeFilter
    )
  }
  get studentDetail() {
    return { name: anotherStudentName, email: anotherStudentEmail }
  }
  async searchStudentInsideStudentLesson() {
    await this.goToCalendarPage()
    const event = this.page.getByTestId('draggable-event-item').first()
    if (await event.isVisible()) {
      await this.page.getByTestId('draggable-event-item').first().click()
      await this.delayAfterAction()

      const { email, name } = this.studentDetail

      await this.page.getByPlaceholder('Search student by typing').fill(name)
      await this.delayAfterAction()
      await expect(this.page.getByText(email).first()).toBeVisible()
      await expect(this.page.getByText(name).first()).toBeVisible()

      await this.page
        .getByPlaceholder('Search student by typing')
        .fill(name + '1')
      await this.delayAfterAction()
      await expect(this.page.getByText(name).first()).toBeHidden()
    }

    // close detail
    await this.page
      .locator('header')
      .filter({ hasText: 'Lesson Detail' })
      .getByRole('img')
      .click()
  }

  async createDownloadDir() {
    const downloadDir = path.resolve(__dirname, '../downloads')
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir)
    }
    // Register cleanup
    const closeListener = () => {
      try {
        if (fs.existsSync(downloadDir)) {
          fs.rmSync(downloadDir, { recursive: true, force: true })
        }
        this.page.removeListener('close', closeListener)
      } catch (err) {
        console.error('Error', err)
        this.page.removeListener('close', closeListener)
      }
    }
    this.page.on('close', closeListener)
    return downloadDir
  }

  async deleteStudentLessonFromDetail() {
    await this.goToCalendarPage()
    const event = this.page.getByTestId('draggable-event-item').first()
    if (await event.isVisible()) {
      await event.click()
      await this.delayAfterAction()
      // Click the first student dropdown menu (3-dot menu)
      const menuButton = this.page.locator('div[aria-haspopup="menu"]').first()
      await menuButton.click()
      // Click the 'Delete class' menu item
      await this.page.getByText('Delete class', { exact: true }).click()
      // Optionally, confirm the dialog if it appears
      const confirmButton = this.page.getByRole('button', { name: /confirm/i })
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }
      await this.delayAfterAction()
    }
  }

  async exportCSV() {
    const downloadDir = await this.createDownloadDir()
    await this.goToCalendarPage()

    await this.delayAfterAction()

    const event = this.page.getByTestId('draggable-event-item').first()

    if (await event.isVisible()) {
      await this.page.getByTestId('draggable-event-item').first().click()
      await this.page.waitForTimeout(3000)
      const { email, name } = this.studentDetail

      await new Promise<void>(resolve => {
        this.page.on('download', async download => {
          const filePath = path.join(downloadDir, download.suggestedFilename())
          await download.saveAs(filePath)

          expect(fs.existsSync(filePath)).toBeTruthy()

          const fileContent = fs.readFileSync(filePath, 'utf8')
          expect(fileContent.includes(name)).toBeTruthy()
          expect(fileContent.includes(email)).toBeTruthy()
        })
        resolve()
      })

      await this.page.getByTestId('export-csv-btn').click()
    }

    // close detail
    await this.page
      .locator('header')
      .filter({ hasText: 'Lesson Detail' })
      .getByRole('img')
      .click()
  }
}

export default FullCalendarPage
