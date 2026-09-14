import { expect, Page } from '@playwright/test'
import { locationRoomNames, updatedLocationRoomName } from '../const'
import { BasePage } from './base.page'
import CoursePage from './course.page'

class LocationRoomPage extends BasePage {
  private coursePage: CoursePage
  constructor(page: Page) {
    super(page)
    this.coursePage = new CoursePage(page)
  }
  async goToLocationRoomPage() {
    await this.goto('/locations')
    expect(await this.page.getByText('Locations').first()).toBeVisible()
    await this.delayAfterAction(3000)
  }

  get locationGroupOptions() {
    return ['Location Group 1', 'Location Group 2']
  }
  get equipments() {
    return [
      'Projector',
      'Whiteboard',
      'Air Conditioner',
      'Fan',
      'Lamp',
      'Table',
      'Chair',
    ]
  }

  async deleteAllLocationRooms() {
    await this.goToLocationRoomPage()
    const count = await this.page
      .locator('[data-testid="location-action-button"]')
      .count()
    for (let i = 0; i < count; i++) {
      await this.page.getByTestId('location-action-button').first().click()
      await this.waitForMenuVisibility('Delete')
      // Confirmation dialog will be shown, click on delete button
      await this.page.waitForSelector('[data-testid="delete-btn"]', {
        state: 'visible',
      })
      await this.page.getByTestId('delete-btn').click()
      await this.delayAfterAction(3000)
      expect(
        await this.page.getByText('Location deleted successfully').first()
      ).toBeVisible()
    }
  }

  async createLocationRoom() {
    await this.goToLocationRoomPage()
    for (const locationRoomName of locationRoomNames) {
      await this.page.getByTestId('add-location-button').click()
      await this.page.waitForSelector('[data-testid="location-room-name"]', {
        state: 'visible',
      })
      await this.page.getByTestId('location-room-name').fill(locationRoomName)
      // use random location group
      const randomLocationGroup =
        this.locationGroupOptions[
          Math.floor(Math.random() * this.locationGroupOptions.length)
        ]
      await this.page
        .locator('#locationGroupSelector')
        .first()
        .fill(randomLocationGroup)
      await this.page.locator('#locationGroupSelector').first().press('Enter')
      await this.page.getByTestId('location-room-capacity').fill('10')
      await this.page
        .getByTestId('location-room-description')
        .fill('Test Description')
      // use random equipment
      const randomEquipment =
        this.equipments[Math.floor(Math.random() * this.equipments.length)]
      await this.page
        .locator('#equipmentSelector')
        .first()
        .fill(randomEquipment)
      await this.page.locator('#equipmentSelector').first().press('Enter')
      await this.page.getByTestId('save-location-btn').click()
      await this.delayAfterAction()
      expect(
        await this.page.getByText('Location created successfully').first()
      ).toBeVisible({
        timeout: 5000,
      })
    }
  }

  async filterLocationByRoomName() {
    await this.goToLocationRoomPage()
    // Filter by location name
    await this.page.locator('#filter-text-box').fill(locationRoomNames[0])
    await this.page.locator('#filter-text-box').press('Enter')
    await this.delayAfterAction(3000)
    expect(
      await this.page.getByText(locationRoomNames[0]).count()
    ).toBeGreaterThan(0)
  }

  async filterLocationByLocationGroup() {
    await this.goToLocationRoomPage()
    // Filter by location group
    await this.page
      .locator('#locationGroupFilterSelector')
      .fill(this.locationGroupOptions[0])
    await this.page.locator('#locationGroupFilterSelector').press('Enter')
    await this.delayAfterAction(3000)
    expect(
      await this.page.getByText(this.locationGroupOptions[0]).count()
    ).toBeGreaterThan(0)
  }

  async filterLocationByCapacity() {
    await this.goToLocationRoomPage()
    // Filter by capacity
    await this.page.locator('#capacityFilterSelector').fill('10')
    await this.page.locator('#capacityFilterSelector').press('Enter')
    await this.delayAfterAction(3000)
    expect(await this.page.getByText('10').count()).toBeGreaterThan(0)
  }

  async filterLocationByEquipment() {
    await this.goToLocationRoomPage()
    // Filter by equipment
    await this.page.locator('#equipmentFilterSelector').fill(this.equipments[0])
    await this.page.locator('#equipmentFilterSelector').press('Enter')
  }

  async updateLocationRoom() {
    await this.goToLocationRoomPage()
    await this.page.waitForSelector('[data-testid="location-action-button"]', {
      state: 'visible',
    })
    await this.page.getByTestId('location-action-button').first().click()
    await this.waitForMenuVisibility('Edit')
    await this.page.waitForSelector('[data-testid="location-room-name"]', {
      state: 'visible',
    })
    await this.page
      .getByTestId('location-room-name')
      .fill(updatedLocationRoomName)
    // use random location group
    const randomLocationGroup =
      this.locationGroupOptions[
        Math.floor(Math.random() * this.locationGroupOptions.length)
      ]
    await this.page.locator('#locationGroupSelector').fill(randomLocationGroup)
    await this.page.locator('#locationGroupSelector').press('Enter')
    await this.page.getByTestId('location-room-capacity').fill('100')
    await this.page
      .getByTestId('location-room-description')
      .fill('Test Description Updated')
    // use random equipment
    const randomEquipment =
      this.equipments[Math.floor(Math.random() * this.equipments.length)]
    await this.page.locator('#equipmentSelector').fill(randomEquipment)
    await this.page.locator('#equipmentSelector').press('Enter')
    await this.page.getByTestId('save-location-btn').click()
    await this.delayAfterAction(3000)
    expect(
      await this.page.getByText('Location updated successfully').first()
    ).toBeVisible()

    await this.page.reload()
    await this.delayAfterAction()

    await this.page.getByTestId('location-action-button').last().click()

    await this.page.getByRole('menuitem', { name: 'Edit' }).click()

    await this.delayAfterAction(1000)

    const inputValue = await this.page
      .getByTestId('location-room-name')
      .inputValue()

    expect(
      [...locationRoomNames, updatedLocationRoomName].some(name =>
        inputValue.includes(name)
      )
    ).toBe(true)
  }
}

export default LocationRoomPage
