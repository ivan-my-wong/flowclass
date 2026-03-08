import { toNumber } from 'lodash-es'

import { isNullOrUndefined } from './validate'

const numberFormatter = new Intl.NumberFormat('en-US')

/**
 * Add thousand separator (e.g. 123456789 => 123,456,789)
 */
export const thousandSeparate = (value: number): string => {
  return numberFormatter.format(value)
}

/**
 * Convert number into short form (i.e. end with ['K','M','B']) and round with precision
 * e.g. 123456789 => 123M, 1500 => 1.50K
 */
export const convertToShortForm = (
  value: number | string,
  precision = 3
): string | null => {
  if (isNullOrUndefined(value) || value === '') {
    return null
  }
  const numValue = typeof value === 'string' ? toNumber(value) : value
  // Nine Zeroes for Billions
  if (Math.abs(Number(value)) >= 1.0e9) {
    return `${(numValue / 1.0e9).toPrecision(precision)}B`
  }
  if (Math.abs(Number(value)) >= 1.0e6) {
    return `${(numValue / 1.0e6).toPrecision(precision)}M`
  }
  if (Math.abs(Number(value)) >= 1.0e3) {
    return `${(numValue / 1.0e3).toPrecision(precision)}K`
  }

  return numValue.toPrecision(precision)
}

/**
 * Convert number to percent representation in string
 * e.g. 0.0001 => 0.01%
 */
export const toPercentStr = (bps: number): string => {
  return `${Math.floor(bps * 10000) / 100}%`
}
