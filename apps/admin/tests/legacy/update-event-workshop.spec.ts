import { expect, Page, test } from '@playwright/test'

import {
  createSessionData,
  testDescriptionVideo,
  testLogoImage,
} from '../const'
import { dismissTourIfVisible, login } from '../setup'

test.describe.skip('Testing Event Workshop Info', () => {
  let page: Page
  let eventWorkshopName: string
  let sessionName: string

  test.beforeAll(async ({ browser }) => {
    page = await login({ browser })
  })

  test.afterAll(async ({ browser }) => {
    await browser.close()
  })

  test('add event & workshop', async () => {
    eventWorkshopName = `event-workshop-test-${new Date().getTime()}`
    await page.locator('#teachingService').click()
    await page.getByRole('button', { name: 'Create course' }).click()
    await page.getByText('Event & workshop').first().click()

    await page.locator('#name').fill(eventWorkshopName)

    await page.locator('#path').press('Control+a')
    await page.locator('#path').fill(eventWorkshopName)
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
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator("button[class='ql-image']").click(),
    ])
    await fileChooser.setFiles([testLogoImage])
    await expect(page.getByText('Image uploaded successfully')).toBeVisible()

    await page.locator("button[class='ql-video']").click()
    await page.locator("input[data-video$='URL']").fill(testDescriptionVideo)
    await page.locator("a[class='ql-action']").click()

    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(
      page.getByText('Update Description successfully')
    ).toBeVisible()
  })

  test('create session', async () => {
    await page.getByText('Schedule').click()
    // await dismissTourIfVisible(page)
    await page.getByRole('button', { name: 'Create session' }).click()
    await page.locator('#name').fill(eventWorkshopName)
    for (let i = 0; i < createSessionData.length; i += 1) {
      sessionName = createSessionData[i].name ?? ''
      await page.locator('#name').fill(sessionName)
      await page.locator('#totalFee').fill(createSessionData[i].cost ?? '')
      await page.locator('#quota').fill(createSessionData[i].quota ?? '')
      await page.getByRole('button', { name: 'Save' }).click()

      switch (sessionName) {
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
              .filter({ hasText: 'Please enter a positive number.' })
              .first()
          ).toBeVisible()

          break
        case 'normal':
          await expect(
            page.getByText('Create session successfully')
          ).toBeVisible()
          await expect(page.locator('#name')).toHaveValue(
            createSessionData[i].name!
          )
          await expect(page.locator('#totalFee')).toHaveValue(
            createSessionData[i].cost!
          )
          await expect(page.locator('#quota')).toHaveValue(
            createSessionData[i].quota!
          )
          break
        default:
          break
      }
    }
  })

  test('add a new timeslot', async () => {
    await page.getByText('Add a new timeslot').click()
    // const startTime = await page.locator('#startTime').inputValue()
    const startTime = await page
      .locator('input[id*="startTime-"]')
      .first()
      .inputValue()
    const endTime = await page
      .locator('input[id*="endTime-"]')
      .first()
      .inputValue()
    const today = new Date().toISOString().split('T')[0]
    const startTimeResult =
      new Date(startTime).toISOString().split('T')[0] === today
    const endTimeResult =
      new Date(endTime).toISOString().split('T')[0] === today
    await expect(startTimeResult).toBe(true)
    await expect(endTimeResult).toBe(true)
    await page.locator('#delete-session').first().click()
    await page.getByText('Add a new timeslot').click()
    await page.getByText('Save changes').click()
  })

  // test('update enroll form', async () => {
  //   await page.getByText('Enrollment Form').click()
  //   await page.getByRole('button', { name: 'Edit form' }).click()
  //   await page.getByRole('button', { name: 'Create new form' }).click()
  //
  //   await page.locator('#enrollFormName').fill(testEnrolFormData.name)
  //   await page
  //     .locator('#enrolFormDescription')
  //     .fill(testEnrolFormData.description)
  //   await page.getByRole('button', { name: 'Select field' }).click()
  //   await page.getByLabel('D').check()
  //   await page.getByLabel('J').check()
  //   await page.getByRole('button', { name: 'Save' }).click()
  //   await page.getByRole('button', { name: 'Save' }).click()
  //   await expect(
  //     page.getByText('Update application form successfully')
  //   ).toBeVisible()
  // })

  test('publish course', async () => {
    await page.locator('#publish-course-button > div > button').click()
    await expect(
      page.getByText('Are you sure you want to publish this course?')
    ).toBeVisible()
    await page.getByText('Confirm').click()
    await expect(
      page.getByText('Published the course successfully')
    ).toBeVisible()
  })

  test('delete event workshop', async () => {
    await page.locator('#teachingService').click()
    await page.locator(`#${eventWorkshopName}-dropdown`).first().click()
    await page.getByText('Delete').click()
    await expect(
      page.getByText('Are you sure you want to delete this course?')
    ).toBeVisible()
    await page.getByText('Yes, delete course').click()
    await expect(
      page.getByText('Course is successfully deleted!')
    ).toBeVisible()
  })

  // const createSingleLesson = async () =>{
  //   await page.getByText('Add Single Lesson').click()
  // }
  //

  // test('add event & workshop', async () => {
  //   eventWorkshopName = `event-workshop-test-${new Date().getTime()}`
  //   await page.locator('#teachingService').click()
  //   await page.getByRole('button', { name: 'Create course' }).click()
  //   await page.getByText('Event & workshop').click()
  //
  //   await page.locator('#name').fill(eventWorkshopName)
  //
  //   await page.locator('#path').press('Control+a')
  //   await page.locator('#path').fill(eventWorkshopName)
  //   await page.getByRole('button', { name: 'Create' }).click()
  //   await page.getByLabel('Go to next step').click()
  //   await page.getByLabel('Go to next step').click()
  //   await page.getByText('3By clicking this button, we').click()
  //   await page
  //     .locator('div')
  //     .filter({ hasText: 'By clicking this button, we' })
  //     .nth(2)
  //     .click()
  //   await dismissTourIfVisible(page)
  // })

  // test('create session', async () => {
  //   await page.getByRole('button', { name: 'Create session' }).click()
  //   await page.locator('#name').fill(eventWorkshopName)
  //   await page.locator('#totalFee').fill(eventWorkshopName)
  //   for (let i = 0; i < createSessionData.length; i += 1) {
  //     sessionName = createSessionData[i].name
  //     await page.locator('#name').fill(sessionName ?? '')
  //     await page.locator('#totalFee').fill(createClassTestCase[i].cost ?? '')
  //     await page.locator('#quota').fill(createClassTestCase[i].quota ?? '')
  //     await page.getByRole('button', { name: 'Confirm' }).click()
  //
  //     switch (regularClassName) {
  //       case 'undefined-cost-quota':
  //         await expect(
  //           page
  //             .locator('div')
  //             .filter({ hasText: 'Please fill in this field' })
  //             .first()
  //         ).toBeVisible()
  //         break
  //       case 'negative':
  //         await expect(
  //           page
  //             .locator('div')
  //             .filter({ hasText: 'The data you have entered is invalid.' })
  //             .first()
  //         ).toBeVisible()
  //         break
  //       default:
  //         await expect(
  //           page.getByText('Create class successfully')
  //         ).toBeVisible()
  //     }
  //   }
  //
  // })

  // test('add event & workshop', async () => {
  //   await page.goto(`https://${rootDomain}/teaching-service`)
  //
  //   await page.getByRole('button', { name: 'Create course' }).click()
  //   await page.getByText('Event & workshop').click()
  //   await page.locator('#name').fill('Regular')
  //   await page.locator('#path').click()
  //   await page.locator('#path').press('Control+a')
  //   await page.locator('#path').fill('regular')
  //   await page.getByRole('button', { name: 'Create' }).click()
  //   await dismissTourIfVisible(page)
  //   await page.getByRole('button', { name: 'Upload Image' }).click()
  //   await page.getByRole('button', { name: 'Upload Image' }).click()
  //   await page
  //     .getByRole('button', { name: 'Upload Image' })
  //     .setInputFiles('Flag_of_Hong_Kong.svg.png')
  //   await page.getByRole('button', { name: 'Confirm' }).click()
  //   await page.getByRole('button', { name: 'Save changes' }).click()
  //   await page.getByText('+ Add a tag').click()
  //   await page.getByPlaceholder('Tag name').click()
  //   await page.getByPlaceholder('Tag name').fill('Campus')
  //   await page.locator('.css-19kh75g').click()
  //   await page.locator('#react-select-3-input').fill('Kwun Tong')
  //   await page.locator('#react-select-3-input').press('Enter')
  //   await page.locator('#react-select-3-input').fill('San Po Kong')
  //   await page.locator('#react-select-3-input').press('Enter')
  //   await page.getByText('+ Add a tag').click()
  //   await page
  //     .locator('div')
  //     .filter({
  //       hasText: /^EnabledYou can create multiple values for the tag$/,
  //     })
  //     .getByPlaceholder('Tag name')
  //     .click()
  //   await page
  //     .locator('div')
  //     .filter({
  //       hasText: /^EnabledYou can create multiple values for the tag$/,
  //     })
  //     .getByPlaceholder('Tag name')
  //     .fill('Levels')
  //   await page.locator('.css-hlgwow > .css-19kh75g').click()
  //   await page.locator('#react-select-4-input').fill('Beginner')
  //   await page.locator('#react-select-4-input').press('Enter')
  //   await page.locator('#react-select-4-input').fill('Intermediate')
  //   await page.locator('#react-select-4-input').press('Enter')
  //   await page
  //     .locator('div')
  //     .filter({ hasText: /^EnabledKwun TongSan Po Kong$/ })
  //     .getByRole('switch')
  //     .click()
  //   await page.getByLabel('Remove San Po Kong').click()
  //   await page.locator('#react-select-3-input').fill('CUHK')
  //   await page.locator('#react-select-3-input').press('Enter')
  //   await page.getByText('+ Add a tag').click()
  //   await page
  //     .locator('div')
  //     .filter({
  //       hasText: /^EnabledYou can create multiple values for the tag$/,
  //     })
  //     .getByRole('button')
  //     .click()
  //   await page.getByRole('button', { name: 'Save changes' }).click()
  //   await page.getByRole('tab', { name: 'Page Content' }).click()
  //   await page.getByRole('button', { name: '✨ Use AI to create' }).click()
  //   await page.getByPlaceholder('✨✨ Describe your course in a').click()
  //   await page
  //     .getByPlaceholder('✨✨ Describe your course in a')
  //     .fill('Write the description of a course about teaching Python')
  //   await page
  //     .getByText(
  //       'Step 1: Choose your languageChinese (Traditional) (繁體中文)Step 2: Tell us about'
  //     )
  //     .click()
  //   await page.locator('.css-1xc3v61-indicatorContainer').first().click()
  //   await page
  //     .getByText('English (Canada) (English (Canada))', { exact: true })
  //     .click()
  //   await page
  //     .locator('div')
  //     .filter({ hasText: /^Creativity$/ })
  //     .getByRole('slider')
  //     .click()
  //   await page
  //     .locator('div')
  //     .filter({ hasText: /^Creativity$/ })
  //     .getByRole('slider')
  //     .click()
  //   await page
  //     .locator('div')
  //     .filter({ hasText: /^Creativity$/ })
  //     .locator('span')
  //     .nth(1)
  //     .click()
  //   await page
  //     .locator('div')
  //     .filter({ hasText: /^Creativity$/ })
  //     .getByRole('slider')
  //     .click()
  //   await page
  //     .locator('div')
  //     .filter({ hasText: /^Creativity$/ })
  //     .locator('span')
  //     .nth(1)
  //     .click()
  //   await page
  //     .locator('div')
  //     .filter({ hasText: /^Output words$/ })
  //     .getByRole('slider')
  //     .click()
  //   await page
  //     .locator('div')
  //     .filter({ hasText: /^Output words$/ })
  //     .getByRole('slider')
  //     .click()
  //   await page.getByRole('button', { name: 'Create' }).click()
  //   await page.getByRole('button', { name: 'Try again' }).click()
  //   await page.getByRole('dialog').locator('svg').nth(2).click()
  //   await page.getByText('Japanese (日本語)', { exact: true }).click()
  //   await page.getByRole('button', { name: 'Create' }).click()
  //   await page.getByRole('button', { name: 'Submit' }).click()
  //   await page.getByRole('button', { name: 'Save changes' }).click()
  //   await page.getByLabel('COURSE_SYLLABUS').click()
  //   await page.getByRole('button', { name: '✨ Use AI to create' }).click()
  //   await page.getByRole('button', { name: 'Submit' }).click()
  //   await page.getByRole('button', { name: 'Save changes' }).click()
  //   await page.getByLabel('COURSE_SYLLABUS').click()
  //   await page.getByLabel('COURSE_SYLLABUS').click()
  //   await page.getByLabel('COURSE_SYLLABUS').click()
  //   await page.locator('div:nth-child(2) > .c-htRGRi').click()
  //   await page.locator('div:nth-child(2) > .c-htRGRi').click()
  //   await page.locator('div:nth-child(2) > .c-htRGRi').click()
  //   await page.getByRole('tab', { name: 'Schedule' }).click()
  //   await page.getByRole('button', { name: 'Create session' }).click()
  //   await page.locator('#name').fill('Monday Class')
  //   await page.locator('#totalFee').click()
  //   await page.locator('#totalFee').fill('100')
  //   await page.locator('#quota').click()
  //   await page.locator('#quota').fill('10')
  //   await page.getByRole('button', { name: 'Save' }).click()
  //   await page.getByText('+ Add a new timeslot').click()
  //   await page.getByRole('button', { name: 'Save changes' }).click()
  //   await page.getByText('+ Add a new timeslot').click()
  //   await page.getByText('+ Add a new timeslot').click()
  //   await page.locator('#startTime-1086').click()
  //   await page.getByText('4:00 PM').click()
  //   await page.locator('#endTime-1086').click()
  //   await page.getByText('6:00 PM').click()
  //   await page.locator('#startTime-undefined').first().click()
  //   await page.getByText('4:00 PM').click()
  //   await page.locator('#endTime-undefined').first().click()
  //   await page.getByText('6:00 PM').click()
  //   await page.locator('#startTime-undefined').nth(1).click()
  //   await page.getByText('4:00 PM').click()
  //   await page.locator('#endTime-undefined').nth(1).click()
  //   await page.getByText('6:00 PM').click()
  //   await page.getByRole('button', { name: 'Save changes' }).click()
  //   await page.getByLabel('739').click()
  // })
})
