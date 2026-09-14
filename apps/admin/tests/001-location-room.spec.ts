import { test as baseTest } from '@playwright/test'
import LocationRoomPage from './pages/location-room.page'

const test = baseTest.extend<{
  locationRoomPage: LocationRoomPage
}>({
  locationRoomPage: async ({ page }, use) => {
    await use(new LocationRoomPage(page))
  },
})

test.use({
  storageState: './tests/auth.json',
})

test.describe('Delete All Locations', () => {
  test('Should successfully delete all location', async ({
    locationRoomPage,
  }) => {
    await locationRoomPage.deleteAllLocationRooms()
  })
})

test.describe('Create Location', () => {
  test('Should successfully create a new location', async ({
    locationRoomPage,
  }) => {
    await locationRoomPage.createLocationRoom()
  })
  test('Should successfully filter location by room name', async ({
    locationRoomPage,
  }) => {
    await locationRoomPage.filterLocationByRoomName()
  })
  test('Should successfully filter location by location group', async ({
    locationRoomPage,
  }) => {
    await locationRoomPage.filterLocationByLocationGroup()
  })
  test('Should successfully filter location by capacity', async ({
    locationRoomPage,
  }) => {
    await locationRoomPage.filterLocationByCapacity()
  })
  test('Should successfully filter location by equipment', async ({
    locationRoomPage,
  }) => {
    await locationRoomPage.filterLocationByEquipment()
  })
})

test.describe('Update Location', () => {
  test('Should successfully update a location', async ({
    locationRoomPage,
  }) => {
    await locationRoomPage.updateLocationRoom()
  })
})
