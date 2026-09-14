import { expect } from '@playwright/test'
import { testLogoImage } from '../const'
import { BasePage } from './base.page'

class SchoolPage extends BasePage {
  async goToSchoolPage() {
    await this.goto('/school')
    await this.delayAfterAction()
  }

  async uploadImage() {
    try {
      expect(this.page.getByText('Select an image to upload')).toBeVisible()
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser'),
        this.page.getByLabel('ImageUpload.selectImageButton').click(),
      ])
      await fileChooser.setFiles([testLogoImage])
      await this.page.waitForSelector(
        'button[data-testid="confirm-upload-btn"]',
        { state: 'visible' }
      )
      await this.page.getByRole('button', { name: 'Confirm' }).click()
      await this.delayAfterAction()
      expect(this.page.getByText('Image uploaded successfully')).toBeVisible()
      await this.page.getByRole('button', { name: 'Save changes' }).click()
      await this.delayAfterAction()
      expect(
        this.page.getByText('School is successfully updated!')
      ).toBeVisible()
    } catch (error) {
      console.error('Error uploading image:', error.message)
    }
  }
  async updateImage(selector: string) {
    await this.goToSchoolPage()
    await this.page
      .locator(selector)
      .getByRole('button', { name: 'Upload Image' })
      .click()
    await this.uploadImage()
  }
  async updateLogo() {
    await this.updateImage('#schoolLogoBox')
  }

  async updateBanner() {
    await this.updateImage('#bannerImage')
  }

  async uploadGallery() {
    await this.goToSchoolPage()
    await this.page.getByTestId('tab-gallery').click()
    await this.page.getByRole('button', { name: 'Add Image' }).click()
    await this.uploadImage()
  }

  async changePrimaryIdentifier() {
    await this.goToSchoolPage()
    await this.page.getByTestId('tab-primary-identifier').click()
    await this.page
      .getByRole('button', { name: 'Change Primary Identifier' })
      .click()
    await this.page.getByRole('button', { name: 'Save changes' }).click()
    await this.delayAfterAction()
    expect(this.page.getByText('School is successfully updated!')).toBeVisible()
  }
}

export default SchoolPage
