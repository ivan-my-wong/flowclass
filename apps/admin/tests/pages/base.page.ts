import { expect, Locator, type Page } from '@playwright/test'
import csv from 'csv-parser'
import dayjs from 'dayjs'
import fs from 'fs'
import path from 'path'
import { delayTimeout, rootDomain } from '../const'

type GenerateDateReturnType = {
  currentDate: dayjs.Dayjs
  previousDate: dayjs.Dayjs
  nextDate: dayjs.Dayjs
  fourDayAgo: dayjs.Dayjs
  currentDateFormatted: string
  fourDayAgoFormatted: string
  currentDateLocaleDate: string
  previousDateLocaleDate: string
  nextDateLocaleDate: string
  fourDayAgoLocaleDate: string
}
export class BasePage {
  rootDomain: string
  constructor(public page: Page) {
    this.rootDomain = rootDomain
  }

  async goto(path: string) {
    const serializePath = path.startsWith('/') ? path.slice(1) : path
    await this.page.goto(`${this.rootDomain}/${serializePath}`)
  }

  async selectOption(selector, criteria?: { text?: string; value?: string }) {
    await selector.click()
    await this.delayAfterAction()

    const options = await this.page.getByRole('option')

    for (let i = 0; i < (await options.count()); i++) {
      const option = options.nth(i)
      if ((await option.isEnabled()) && !!criteria) {
        if (criteria.text) {
          if ((await option.textContent())?.includes(criteria.text)) {
            await option.click()
            break
          }
        }

        if (criteria.value) {
          if ((await option.getAttribute('value'))?.includes(criteria.value)) {
            await option.click()
            break
          }
        }
      }
    }
  }

  async readCsv<T>(filePath: string, separator: string = ';'): Promise<T[]> {
    const csvData: T[] = []
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, filePath))
        .pipe(
          csv({
            separator: separator,
          })
        )
        .on('data', (row: T) => {
          csvData.push(row)
        })
        .on('end', resolve)
        .on('error', reject)
    })
    return csvData
  }

  async delayAfterAction(timeout: number = delayTimeout) {
    await this.page.waitForTimeout(timeout ?? 100)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Reloads the page, waits for network idle, and validates that the selector has the expected value after refresh.
   * @param selector - The selector to check after reload
   * @param expectedValue - The value to expect (textContent or input value)
   * @param isInput - If true, checks input value, otherwise checks textContent
   */
  async reloadAndValidate(
    selector: Locator,
    expectedValue: string[] | string,
    isInput: boolean = false
  ) {
    await this.page.reload()
    await this.delayAfterAction()

    await selector.waitFor({ state: 'visible', timeout: 5000 })

    const actualValue = isInput
      ? await selector.inputValue()
      : await selector.textContent()

    if (isInput) {
      if (typeof expectedValue === 'string') {
        expect(actualValue).toBe(expectedValue)
      } else {
        expect(
          expectedValue.some(val => (actualValue || '').includes(val))
        ).toBe(true)
      }
    } else {
      if (typeof expectedValue === 'string') {
        expect(actualValue).toBe(expectedValue)
      } else {
        expect(
          expectedValue.some(val => (actualValue || '').includes(val))
        ).toBe(true)
      }
    }
  }

  async waitForMenuVisibility(menuName: string) {
    const maxAttempts = 3
    let attempts = 0
    const menu = this.page.getByRole('menuitem', { name: menuName })
    while (!(await menu.isVisible({ timeout: 10000 }))) {
      if (attempts >= maxAttempts) {
        throw new Error('Menu not visible after maximum attempts')
      }

      await this.page
        .locator(
          '.ag-center-cols-container > div:nth-child(1) > div:nth-child(2) > div'
        )
        .first()
        .click()
      attempts++
    }
    await menu.click()
  }

  get longLocaleDateOptions(): Intl.DateTimeFormatOptions {
    return { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  }

  get shortLocaleDateOptions(): Intl.DateTimeFormatOptions {
    return { year: 'numeric', month: 'long', day: 'numeric' }
  }

  generateDateData(formatType: 'long' | 'short'): GenerateDateReturnType {
    const currentDate = dayjs(new Date())
    const previousDate = currentDate.subtract(1, 'day')
    const nextDate = currentDate.add(1, 'day')
    const fourDayAgo = currentDate.subtract(4, 'day')
    const currentDateFormatted = currentDate.format('YYYY-MM-DD')
    const fourDayAgoFormatted = fourDayAgo.format('YYYY-MM-DD')
    const localeDateOptions =
      formatType === 'long'
        ? this.longLocaleDateOptions
        : this.shortLocaleDateOptions
    const currentDateLocaleDate = currentDate
      .toDate()
      .toLocaleDateString('en-US', localeDateOptions)
    const previousDateLocaleDate = previousDate
      .toDate()
      .toLocaleDateString('en-US', localeDateOptions)
    const nextDateLocaleDate = nextDate
      .toDate()
      .toLocaleDateString('en-US', localeDateOptions)
    const fourDayAgoLocaleDate = fourDayAgo
      .toDate()
      .toLocaleDateString('en-US', localeDateOptions)
    return {
      currentDate,
      previousDate,
      nextDate,
      fourDayAgo,
      currentDateFormatted,
      fourDayAgoFormatted,
      currentDateLocaleDate,
      previousDateLocaleDate,
      nextDateLocaleDate,
      fourDayAgoLocaleDate,
    }
  }
}
