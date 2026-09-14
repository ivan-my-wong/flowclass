import { test as baseTest } from '@playwright/test'
import SchoolPage from './pages/school.page'

const test = baseTest.extend<{ schoolPage: SchoolPage }>({
  schoolPage: async ({ page }, use) => {
    await use(new SchoolPage(page))
  },
})
test.use({
  storageState: './tests/auth.json',
})

test.describe('School Page', () => {
  test('Should be able to update logo', async ({ schoolPage }) => {
    await schoolPage.updateLogo()
  })

  test('Should be able to update banner', async ({ schoolPage }) => {
    await schoolPage.updateBanner()
  })

  test('Should be able to upload gallery', async ({ schoolPage }) => {
    await schoolPage.uploadGallery()
  })

  // test('Should be able to change primary identifier', async ({
  //   schoolPage,
  // }) => {
  //   await schoolPage.changePrimaryIdentifier()
  // })
})
