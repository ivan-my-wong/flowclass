import { test as base } from '@playwright/test'

import CoursePage from './pages/course.page'

const test = base.extend<{ coursePage: CoursePage }>({
  coursePage: async ({ page }, use) => {
    const coursePage = new CoursePage(page)
    await use(coursePage)
    await page.waitForLoadState('networkidle')
  },
})

test.use({ storageState: './tests/auth.json' })

test.describe.configure({ mode: 'serial' })

test.describe.serial('Courses & Classes', () => {
  test('Should be delete old courses & classes', async ({ coursePage }) => {
    await coursePage.deleteAllCourses()
  })

  test('Should be create courses & classes', async ({ coursePage }) => {
    await coursePage.createCourses()
  })

  test('Should be create classes', async ({ coursePage }) => {
    const courseTypeList = [
      'regular',
      'workshop',
      'recurring',
      'subscription',
      'appointment',
    ]
    for (const courseType of courseTypeList) {
      let multiple = courseType === 'appointment' ? false : true
      await coursePage.createClass({
        multiple: multiple,
        i: 0,
        type: courseType as
          | 'regular'
          | 'workshop'
          | 'recurring'
          | 'subscription'
          | 'appointment',
      })
      await coursePage.createClass({
        multiple: multiple,
        i: 1,
        type: courseType as
          | 'regular'
          | 'workshop'
          | 'recurring'
          | 'subscription'
          | 'appointment',
        free: true,
      })
    }
  })
})

test.describe('Edit & Update Class', () => {
  test('Update one recurring class to multiple price options', async ({
    coursePage,
  }) => {
    await coursePage.updateOneRecurringClassToMultiplePriceOptions()
  })

  test('Change class location', async ({ coursePage }) => {
    await coursePage.pickLocationAtClass()
  })

  test('Change class instructor', async ({ coursePage }) => {
    await coursePage.pickInstructorAtClass()
  })

  test('Should be able to edit class', async ({ coursePage }) => {
    await coursePage.editClass()
  })
  test('Should be able to bulk edit class', async ({ coursePage }) => {
    await coursePage.bulkEditClass()
  })
})
