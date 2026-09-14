import { test as baseTest } from '@playwright/test'
import ClassSchedulePage from '../pages/class-schedule.page'

const test = baseTest.extend({
  classSchedulePage: async ({ page }, use) => {
    await use(new ClassSchedulePage(page))
  },
})
test.use({
  storageState: './tests/auth.json',
})
test.describe.skip('Lesson Detail', () => {
  test('Should be able to search student inside lesson detail', async ({ classSchedulePage }) => {
    // Verify that users can search and find students within a lesson's details
    await classSchedulePage.searchStudentInsideStudentLesson()
  })

  test('Should be able to export CSV file from lesson detail', async ({ classSchedulePage }) => {
    // Verify that users can export student data to CSV format from lesson details
    await classSchedulePage.exportCSV()
  })
})
