import { formatCurrencyWithName } from './currency'

export const convertCreditToCurrency = (
  currency: string,
  credit = 0,
  conversionRate = 1
): string => {
  const amount = credit * conversionRate
  return formatCurrencyWithName(amount, currency)
}
