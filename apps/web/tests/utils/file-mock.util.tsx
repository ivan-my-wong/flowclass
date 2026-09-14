import { Page } from '@playwright/test'

export const createMockFile = (
  name: string,
  mimeType: string,
  buffer: Buffer
): {
  name: string
  mimeType: string
  buffer: Buffer
} => {
  const imageBuffer = buffer || Buffer.from('mock image content')
  const mockFile = {
    name: name || 'mock-image.png',
    mimeType: mimeType || 'image/png',
    buffer: imageBuffer,
  }

  return mockFile
}

export const delayAfterAction = async (page: Page, delay = 1000) => {
  await page.waitForTimeout(delay)
  await page.waitForLoadState('networkidle')
}

export const selectAllTextAndDelete = async (page: Page) => {
  // Select all text (works on all platforms)
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')

  // Backspace to delete selected text
  await page.keyboard.press('Backspace')
}
