// eslint-disable-next-line simple-import-sort/imports
import getSymbolFromCurrency from 'currency-symbol-map'
import currency from 'currency.js'

import { DEFAULT_CURRENCY } from '@/constants/invoices'

export const getCurrencySymbol = (currency: string) => {
  if (!currency || currency === '') {
    return ''
  }
  return getSymbolFromCurrency(currency)
}

export const formatCurrency = (
  price: number,
  currencyCode?: string
): string => {
  return currency(price, {
    symbol: getCurrencySymbol(currencyCode ?? DEFAULT_CURRENCY),
    precision: 2,
  }).format()
}

export const getCurrencyPrefix = (
  currency: string | null | undefined
): string => {
  switch (currency?.toLowerCase()) {
    case 'hkd':
      return 'HK'
    case 'usd':
      return 'US'
    default:
      return ''
  }
}

export const formatCurrencyWithName = (price: number, currencyCode: string) => {
  return `${currencyCode}${formatCurrency(price, currencyCode)}`
}
