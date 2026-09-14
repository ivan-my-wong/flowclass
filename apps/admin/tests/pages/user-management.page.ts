import { expect, Page } from '@playwright/test'
import { generateDataTestId } from '../../src/utils/data-testid.utils'
import {
  testAccount,
  testLogoImage,
  testTeacherUser,
  timestamp,
  updatedPassword,
} from '../const'
import { BasePage } from './base.page'
import CoursePage from './course.page'
type TestUser = {
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
}

const inviteUserTest: TestUser = {
  email: `test-${timestamp}@flowclass.com`,
  firstName: `Test User ${timestamp}`,
  lastName: `Test User ${timestamp}`,
  phone: `+852132${timestamp}`,
  role: 'instructor',
}

class UserManagementPage extends BasePage {
  private coursePage: CoursePage
  constructor(page: Page) {
    super(page)
    this.coursePage = new CoursePage(page)
  }
  async goToUsersManagement(checkTitle?: boolean) {
    await this.goto('/settings/users')
    await this.delayAfterAction()
    if (checkTitle) {
      expect(
        await this.page.getByText('Staff Management').first()
      ).toBeVisible()
    }
  }

  async goToInviteUser() {
    await this.goToUsersManagement()
    await this.page.getByTestId('invite-new-user').click()
    await this.delayAfterAction()
  }

  async inviteUser() {
    await this.goToInviteUser()
    await this.page
      .locator('input[data-testid="input-email"]')
      .fill(inviteUserTest.email)
    await this.page
      .locator('input[data-testid="input-name"]')
      .fill(`${inviteUserTest.firstName} ${inviteUserTest.lastName}`)
    await this.page
      .locator('input[data-testid="input-phone"]')
      .fill(inviteUserTest.phone)
    await this.page.locator(`label[for="${inviteUserTest.role}"]`).click()
    await this.page.getByTestId('invite-user-button').click()
    await this.delayAfterAction()
    await expect(
      this.page.getByText('Invitation sent successfully.').first()
    ).toBeVisible()
    const copyInviteLinkButton = this.page
      .getByTestId('copy-invite-link-button')
      .first()
    await expect(copyInviteLinkButton).toBeVisible()
    await copyInviteLinkButton.click()
    await this.delayAfterAction()
    await expect(copyInviteLinkButton).toHaveText('Copied!')
  }

  async goToDetailUser(userName?: string) {
    await this.goToUsersManagement()
    let actionButtonLocator = this.page.getByTestId(
      generateDataTestId(
        'action-button',
        userName ??
          [
            testTeacherUser.firstName.toLowerCase(),
            testTeacherUser.lastName.toLowerCase(),
          ].join('-')
      )
    )

    // Check if the actionButton exists, if not, try another selector
    if (!(await actionButtonLocator.isVisible().catch(() => false))) {
      actionButtonLocator = this.page.getByTestId(
        generateDataTestId('action-button', testTeacherUser.firstName)
      )
    }

    await actionButtonLocator.click()
    await this.page.getByRole('menuitem', { name: 'Edit' }).click()
    await this.delayAfterAction()
    expect(await this.page.getByText('Edit Profile').first()).toBeVisible()
  }

  async goToViewUser(userName?: string) {
    await this.goToDetailUser(userName)
    await this.page.getByTestId('back-button').nth(1).click()
    await this.delayAfterAction()
    await expect(
      this.page.getByText('Personal Information').first()
    ).toBeVisible()
  }

  async goToUpdateUser() {
    await this.goToDetailUser()
    await this.updateUser(
      `${testTeacherUser.firstName}-updated`,
      `${testTeacherUser.lastName}-updated`
    )
    // Revert back to original name
    await this.goToDetailUser(`${testTeacherUser.firstName}-updated`)
    await this.updateUser(testTeacherUser.firstName, testTeacherUser.lastName)
  }

  async updateUser(firstName: string, lastName: string) {
    const inputFirstName = await this.page
      .locator('input[name="user.firstName"]')
      .first()
    const inputLastName = await this.page
      .locator('input[name="user.lastName"]')
      .first()
    const saveButton = await this.page.getByTestId('save-button').first()

    expect(inputFirstName).toBeVisible()
    expect(inputLastName).toBeVisible()
    expect(saveButton).toBeVisible()

    await inputFirstName.fill(firstName)
    await inputLastName.fill(lastName)

    // update phone as well
    const inputPhone = await this.page
      .getByTestId('teacher-phone-input')
      .first()
    expect(inputPhone).toBeVisible()
    // await inputPhone.fill(testTeacherUser.phone)

    await saveButton.click()

    await this.delayAfterAction()

    expect(
      await this.page.getByText('User updated successfully').first()
    ).toBeVisible()

    await this.goToViewUser(firstName)

    expect(await this.page.getByTestId('user-name').textContent()).toBe(
      `${firstName} ${lastName}`
    )
  }

  async goToUpdatePassword() {
    await this.goToDetailUser()
    await this.page.getByTestId('change-password-button').click()
    await this.delayAfterAction()
    expect(await this.page.getByText('Change Password').first()).toBeVisible()
    const newPasswordInput = await this.page
      .getByTestId('new-password-input')
      .first()
    const confirmPasswordInput = await this.page
      .getByTestId('confirm-password-input')
      .first()
    const saveButton = await this.page.getByTestId('save-button').first()
    expect(newPasswordInput).toBeVisible()
    expect(confirmPasswordInput).toBeVisible()
    expect(saveButton).toBeVisible()
    await newPasswordInput.fill(updatedPassword)
    await confirmPasswordInput.fill(updatedPassword)
    await saveButton.click()
    await this.delayAfterAction()
    expect(
      await this.page.getByText('Password updated successfully').first()
    ).toBeVisible()

    await this.page.getByRole('button', { name: 'Close' }).click()

    await this.page.getByTestId('account-top-right-menu').click()
    await this.page.getByRole('menuitem', { name: /logout/i }).click()
    await this.goto('/login')
    await this.page.waitForSelector('#email', { state: 'visible' })
    await this.page.locator('#email').fill(testAccount.email)
    await this.page.locator('#password').fill(testAccount.password)
    const submitButton = await this.page.getByRole('button', { name: /login/i })
    await expect(submitButton).toBeEnabled()
    await this.delayAfterAction()
    await this.goToDetailUser()
    await this.page.getByTestId('change-password-button').click()
    await this.delayAfterAction()

    expect(await this.page.getByText('Change Password').first()).toBeVisible()
    await newPasswordInput.fill('Password@123')
    await confirmPasswordInput.fill('Password@123')
    await saveButton.click()

    await submitButton.click()
  }

  async deleteUser() {
    await this.goToDetailUser()
    await this.page.getByTestId('delete-user-button').click()
    await this.delayAfterAction()
    await expect(this.page.getByText('Delete Account').first()).toBeVisible()
    const deleteButton = this.page.getByTestId('delete-user-button').first()
    await expect(deleteButton).toBeVisible()
    // I don't want to delete the user
  }

  async deleteButtonFromTable() {
    await this.goToUsersManagement()
    await this.page
      .getByTestId(
        generateDataTestId('action-button', testTeacherUser.firstName)
      )
      .click()
    await this.page.getByRole('menuitem', { name: 'Delete' }).click()
    await this.delayAfterAction()
    expect(await this.page.getByText('Delete Account').first()).toBeVisible()
  }

  async uploadAvatar() {
    await this.goToDetailUser()

    await this.delayAfterAction()
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      await this.page.getByTestId('avatar-input').click(),
    ])
    await fileChooser.setFiles([testLogoImage])
    await this.page.getByRole('button', { name: 'Confirm' }).click()
    await this.delayAfterAction()
    await expect(
      this.page.getByText('Image uploaded successfully')
    ).toBeVisible()
    await this.page.getByTestId('save-button').click()
    await this.delayAfterAction()
    await expect(
      this.page.getByText('User updated successfully').first()
    ).toBeVisible()
  }

  async pickInstructorAtClass() {
    await this.coursePage.goToDetailCourse()
    await this.coursePage.goToClassTab()
    await this.delayAfterAction()
    const classLocator = this.page
      .locator(`[data-testid="toggle-group-item"]`)
      .first()
    await classLocator.click()
    const instructorSelector = await this.page.locator('#instructor-selector')
    await instructorSelector.click()
    await instructorSelector.fill(testTeacherUser.firstName)
    await instructorSelector.press('Enter')
    await this.coursePage.getSaveBtn.click()
    await this.delayAfterAction()
    await expect(
      this.page.getByText('Updated class successfully').first()
    ).toBeVisible()
  }

  async loginWithInviteLink() {
    await this.inviteUser()

    const link = await this.page.getByRole('link').textContent()
    if (!link) return

    const newUrl = new URL(link)

    await this.goto(link.replace(newUrl.origin, ''))
    await this.delayAfterAction()

    expect(
      this.page.getByText('You are currently logged in.').first()
    ).toBeVisible()

    await this.page.getByRole('button', { name: 'Logout' }).click()
    await this.delayAfterAction()

    await this.goto(link.replace(newUrl.origin, ''))
    await this.delayAfterAction()

    expect(
      await this.page.locator('input[name="firstName"]').inputValue()
    ).toBe(`${inviteUserTest.firstName} ${inviteUserTest.lastName}`)

    await this.page
      .locator('input[name="firstName"]')
      .fill(inviteUserTest.firstName)

    await this.page.locator('input[name="password"]').fill(testAccount.password)
    await this.page
      .locator('input[name="confirmPassword"]')
      .fill(testAccount.password)

    await this.page.getByRole('button', { name: 'Continue' }).click()
    await this.delayAfterAction()

    // try to login with new password
    await this.page.locator('#email').fill(inviteUserTest.email)
    await this.page.locator('#password').fill(testAccount.password)
    await this.page.getByRole('button', { name: 'Login' }).click()
    await this.delayAfterAction()

    // check if the user is landed on the user profile page
    expect(this.page.getByText('User Profile').first()).toBeVisible()

    expect(
      this.page.getByText('You have now accepted the').first()
    ).toBeVisible()
  }
}

export default UserManagementPage
