import { expect, Page, test } from '@playwright/test'

import {
  createClassTestCase,
  testDescriptionVideo,
  testLogoImage,
  testPhaseName,
} from '../const'
import { dismissTourIfVisible, login } from '../setup'

test.describe.skip('Testing Course Info', () => {
  let page: Page
  let regularCourseName: string
  let regularClassName: string
  // let sessionName: string

  test.beforeAll(async ({ browser }) => {
    page = await login({ browser })
  })

  test.afterAll(async ({ browser }) => {
    await browser.close()
  })

  test('adding a new teaching service', async () => {
    regularCourseName = `playwright-test-${new Date().getTime()}`
    await page.locator('#teachingService').click()
    await page.getByRole('button', { name: 'Create course' }).click()

    await page.locator('#name').fill(regularCourseName)

    await page.locator('#path').press('Control+a')
    await page.locator('#path').fill(regularCourseName)
    await page.getByRole('button', { name: 'Create' }).click()
    // await page.getByLabel('Go to next step').click()
    // await page.getByLabel('Go to next step').click()
    // await page.getByText('3By clicking this button, we').click()
    // await page
    //   .locator('div')
    //   .filter({ hasText: 'By clicking this button, we' })
    //   .nth(2)
    //   .click()
    // await dismissTourIfVisible(page)
    await expect(page.getByText('The course has been created')).toBeVisible()
  })

  test('upload course image', async () => {
    // create a new todo locator
    // await expect(page.getByText(regularCourseName)).toBeVisible()
    await page.locator('#teachingService').click()
    await page.getByText(regularCourseName).click()
    await page.getByRole('button', { name: 'Upload Image' }).click()
    await expect(page.getByText('Select an image to upload')).toBeVisible()

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: 'Upload Image' }).click(),
    ])

    await fileChooser.setFiles([testLogoImage])
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByText('Image uploaded successfully')).toBeVisible()
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Update Basic successfully')).toBeVisible()
  })

  test('create course tag', async () => {
    // create a new todo locator
    await page.getByText('Add a tag').click()
    await page.locator('#tag').fill('tag name')
    await page.locator("input[id='tagSelector']").fill('tag value')
    await page.keyboard.press('Enter')
    await page.getByText('Add a tag').click()
    await page.locator('#tag').nth(1).fill('tag name')
    await page.locator("input[id='tagSelector']").nth(1).fill('tag value')
    await page.keyboard.press('Enter')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(
      page.getByText('Tags name cannot be duplicate. Please check again.')
    ).toBeVisible()
    await page.locator('#deleteTag').nth(1).click()
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(
      page.getByText('You have updated course tags successfully.')
    ).toBeVisible()
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

  test('create regular class', async () => {
    await page.getByText('Class').click()

    await dismissTourIfVisible(page)
    
    await page.getByText('Create class').click()
    await page
      .getByText('Each class consists of a fixed number of lessons')
      .click()

    for (let i = 0; i < createClassTestCase.length; i += 1) {
      regularClassName = createClassTestCase[i].name
      await page.locator('#name').fill(regularClassName)
      await page.locator('#tuition').fill(createClassTestCase[i].cost ?? '')
      await page.locator('#quota').fill(createClassTestCase[i].quota ?? '')
      await page.getByRole('button', { name: 'Confirm' }).click()

      switch (regularClassName) {
        case 'undefined-cost-quota':
          await expect(
            page
              .locator('div')
              .filter({ hasText: 'Please fill in this field' })
              .first()
          ).toBeVisible()
          break
        case 'negative':
          await expect(
            page
              .locator('div')
              .filter({ hasText: 'The data you have entered is invalid.' })
              .first()
          ).toBeVisible()
          break
        default:
          await expect(
            page.getByText('Create class successfully')
          ).toBeVisible()
      }
    }
  })

  // test('duplicate class', async () => {
  //   await page.locator('#dropdownMenu').click()
  //   await page.locator('#option-0').click()
  //   // await page.getByText('Duplicate Class').click()
  //   await expect(page.getByText('Duplicate class successfully')).toBeVisible()
  // })
  //
  // test('edit duplicated class', async () => {
  //   await page.locator('#name').fill(`${regularClassName}_copied`)
  //   await page.locator('#tuition').fill('2000')
  //   await page.locator('#quota').fill('300')
  //   await page.getByRole('button', { name: 'Save changes' }).click()
  //   await expect(page.getByText('Update class successfully')).toBeVisible()
  // })
  test('add new period', async () => {
    await page.getByText('Add new period').click()
    await page.locator('#editPeriodName').click()
    await page.locator('#periodName').fill(testPhaseName)
    await page.locator('#savePeriodName').click()
    await expect(page.getByText(testPhaseName)).toBeVisible()

    // await page.getByText('Generate multiple lessons').click()
    // await page.getByTestId('durationSelector').click()
    // await page.getByText('02:00').click()
    // await page
    //   .getByRole('button', { name: 'Generate multiple lessons' })
    //   .click()

    await page.getByText('Add Single Lesson').click()
    await page.getByText('Add Single Lesson').click()
    await page.getByText('Add Single Lesson').click()
    await page.getByText('Add Single Lesson').click()
    // await expect(page.locator('[class="singleDate"]').count()).toBe(4)
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

  test('update message after registration', async () => {
    // await page.getByText('Settings').click()
    await page.getByText('Enrollment Form').click()
    await page
      .locator("div[data-gramm='false']")
      .fill('Message after registration')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(
      page.getByText('Update registration message successfully')
    ).toBeVisible()
  })

  test('publish course', async () => {
    await page.locator('#publish').click()
    await expect(
      page.getByText('Are you sure you want to publish this course?')
    ).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(
      page.getByText('Published the course successfully')
    ).toBeVisible()
  })

  test('duplicate course', async () => {
    await page.locator('#teachingService').click()
    await page.locator(`#${regularCourseName}-dropdown`).click()
    await page.getByText('Duplicate').click()

    await expect(
      page.locator('div').filter({ hasText: 'Successfully Duplicated' }).first()
    ).toBeVisible()
    // await expect(page.getByText('Successfully Duplicated')).toBeVisible()
  })

  test('delete course', async () => {
    await page.locator('#teachingService').click()

    await page.locator(`#${regularCourseName}-dropdown`).first().click()
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
})
