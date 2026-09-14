import { test as baseTest } from '@playwright/test'
import FullCalendarPage from './pages/full-calendar.page'

const test = baseTest.extend<{ fullCalendarPage: FullCalendarPage }>({
  fullCalendarPage: async ({ page }, use) => {
    await use(new FullCalendarPage(page))
  },
})
test.use({
  storageState: './tests/auth.json',
})

test.describe('Scan QR Code', () => {
  test('Should be able to scan QR code', async ({ fullCalendarPage }) => {
    await fullCalendarPage.scanQRCode()
  })
})

test.describe('Switch View Calendar', () => {
  test('Should be able to switch calendar view type', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.switchView()
  })

  test('Should be able to switch some day in day view', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.switchDateInDayView()
  })

  test('Should be able to switch some day in n-day view', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.switchDateInNDaysView()
  })

  test('Should be able to adjust in n-day view', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.switchDateInNDaysView()
  })

  test('Should be able to switch week in week view', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.switchWeekInWeekView()
  })

  test('Should be able to switch month in month view', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.switchMonthInMonthView()
  })

  test('Should be able to switch year in year view', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.switchYearInYearView()
  })
})

test.describe('Filter Class Lesson', () => {
  test('Should be able to filter class lesson by student name', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.filterClassLessonByStudentName()
  })

  test('Should be able to filter class lesson by course and class', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.filterClassLessonByCourseAndClass()
  })

  test.skip('Should be able to filter class lesson by only show class with application', async ({
    fullCalendarPage,
  }) => {
    await fullCalendarPage.filterClassLessonByOnlyShowClassWithApplication()
  })
})

test.describe('Lesson Detail', () => {
  test('Should be able to search student inside lesson detail', async ({
    fullCalendarPage,
  }) => {
    // Verify that users can search and find students within a lesson's details
    await fullCalendarPage.searchStudentInsideStudentLesson()
  })

  test('Should be able to export CSV file from lesson detail', async ({
    fullCalendarPage,
  }) => {
    // Verify that users can export student data to CSV format from lesson details
    await fullCalendarPage.exportCSV()
  })

  test('Should be able to delete student lesson from lesson detail', async ({
    fullCalendarPage,
  }) => {
    // Verify that users can delete a student lesson from lesson details
    await fullCalendarPage.deleteStudentLessonFromDetail()
  })
})
