import { IRowNode } from 'ag-grid-community'
import { formatPhoneNumberIntl } from 'react-phone-number-input'

import { bgQuotaAvailability } from '@/constants/course'

export const msSleep = (ms: number): Promise<TimerHandler> =>
  new Promise(resolve => setTimeout(resolve, ms))

export const noFalsyJoin = (data: Array<unknown>, separator: string) => {
  return data.filter(el => el).join(separator)
}

export const randomCode = (length: number) => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

export const isNullOrUndefined = (val: unknown): val is null | undefined => {
  return val === null || val === undefined
}

export const downloadFile = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()

  window.URL.revokeObjectURL(url)
  anchor.remove()
}

export const formatPhoneNumber = (phone: string): string => {
  if (!phone || phone === '') {
    return ''
  }
  if (phone.includes('+')) {
    return formatPhoneNumberIntl(phone)
  }
  return formatPhoneNumberIntl(`+${phone}`)
}

export const formatNumber = (num: number): string => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

/**
 * getRowId is a function that returns the unique identifier for each row in the grid.
 * It is used by the grid to identify each row uniquely, especially when performing operations
 * such as selection, sorting, and filtering. In this case, it returns the 'id' property of the data object.
 * This function is passed to the AgGridReact component as a prop to specify how to generate the row id.
 * @param identifier - The identifier of the data object to use as the row id.
 * @param params - The params object from the AgGridReact component.
 * @returns The unique identifier for the row.
 */
export const getRowId = <T extends Record<string, any>>(
  identifier: string,
  params: IRowNode<T>
): string => {
  if (!params.data?.[identifier]) return crypto.randomUUID()
  return params.data?.[identifier].toString()
}

/**
 * Generates a random UUID (Universally Unique Identifier) using the Web Crypto API.
 * This is a cryptographically secure way to generate unique identifiers.
 * @returns {string} A random UUID string
 */
export const generateUUID = (): string => {
  return crypto.randomUUID()
}

/**
 * Generates a custom unique identifier combining timestamp and random string.
 * Format: YYMMDDHHmmss-XXXXX (where X is random alphanumeric)
 * Example: 240315143022-A7B9C
 * @returns {string} A custom unique identifier string
 */
export const generateCustomUUID = (): string => {
  const now = new Date()
  const timestamp =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')

  const randomStr = randomCode(5)
  return `${timestamp}-${randomStr}`
}

export const quotaToBgString = (quota: number): string => {
  if (quota >= 100) return bgQuotaAvailability.full
  if (quota >= 90 && quota < 100) return bgQuotaAvailability.limited
  return bgQuotaAvailability.available
}
