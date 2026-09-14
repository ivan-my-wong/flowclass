import { test as baseTest } from '@playwright/test'
import UserManagementPage from './pages/user-management.page'

const test = baseTest.extend<{ userManagementPage: UserManagementPage }>({
  userManagementPage: async ({ page }, use) => {
    await use(new UserManagementPage(page))
  },
})

test.use({
  storageState: './tests/auth.json',
})

test.describe.configure({
  mode: 'serial',
})

test.describe.serial('Staff Management', () => {
  test('Should successfully fetch all users', async ({
    userManagementPage,
  }) => {
    await userManagementPage.goToUsersManagement(true)
  })
  test('Should successfully invite user', async ({ userManagementPage }) => {
    await userManagementPage.inviteUser()
  })
})

test.describe.serial('User Management', () => {
  test('Should go to detail user page', async ({ userManagementPage }) => {
    await userManagementPage.goToDetailUser()
  })
  test('Should successfully update user', async ({ userManagementPage }) => {
    await userManagementPage.goToUpdateUser()
  })
  test('Should successfully update password', async ({
    userManagementPage,
  }) => {
    await userManagementPage.goToUpdatePassword()
  })
  test('Should successfully upload avatar', async ({ userManagementPage }) => {
    await userManagementPage.uploadAvatar()
  })
  test('Should successfully delete user', async ({ userManagementPage }) => {
    await userManagementPage.deleteUser()
  })
  test('Should successfully delete user from table', async ({
    userManagementPage,
  }) => {
    await userManagementPage.deleteButtonFromTable()
  })
  test('Should successfully pick instructor at class', async ({
    userManagementPage,
  }) => {
    await userManagementPage.pickInstructorAtClass()
  })
  test('Should successfully logged in with the invite link', async ({
    userManagementPage,
  }) => {
    await userManagementPage.loginWithInviteLink()
  })
})
