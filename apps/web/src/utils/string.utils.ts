import getSymbolFromCurrency from 'currency-symbol-map'

import { Course, School, Site } from '@/types'

const whatsappBaseUrl = 'https://api.whatsapp.com'
const defaultPhone = '+85257225763'

export const getWhatsappLink = (phone: string, text?: string): URL => {
  if (!phone || phone === '') {
    phone = defaultPhone
  }

  const param = new URLSearchParams({
    phone: /^\+?(?:[0-9] ?){6,14}[0-9]$/.test(phone) ? phone : defaultPhone,
    text: text ?? '',
  })

  const url = new URL(`/send?${param.toString()}`, whatsappBaseUrl)
  return url
}

export const getPriceWithCurrency = (currency: string | undefined, price: number): string => {
  return `${currency ?? ''}  ${getSymbolFromCurrency(currency ?? '')}${formatIfDecimal(price)}`
}

export const getAlphaNumericString = (data: string): string => {
  return data.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
}

export const getBaseSiteUrl = ({
  site,
  school,
  course,
  language,
}: {
  site: Site
  school: School
  course?: Course
  language?: string
}): string => {
  if (course) {
    return `https://${course.site.url}${language ? `/${language}` : ''}/@${school.url ?? ''}/${
      course.path
    }`
  }
  return `https://${site.url}${language ? `/${language}` : ''}/@${school.url ?? ''}`
}

export const formatIfDecimal = (value: number): number => {
  if (typeof value === 'number' && value % 1 !== 0) {
    return Number(value.toFixed(2))
  }
  return value
}

export const capitalizeString = (str: string): string => {
  if (str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const generateDataTestId = (prefix: string, key: string): string => {
  return `${prefix}-${key?.toLowerCase().replaceAll(' ', '-')}`
}
