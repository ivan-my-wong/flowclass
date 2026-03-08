import { AddressDetail, LongDescription } from '@/types'

export const longDescriptionToString = (longDescription?: LongDescription[]): string => {
  if (!longDescription || longDescription.length === 0) return ''

  if (Array.isArray(longDescription)) {
    return longDescription.map(section => section.content).join('')
  } else {
    return longDescription
  }
}

export const addressObjectToString = (address?: AddressDetail) => {
  if (!address) return ''
  const addressArray = Object.values(address).filter(
    value => value !== '' || value !== null || value !== undefined
  )
  return addressArray.join(', ')
}

export const nonFalsyJoin = (elements: any[], separator = ', '): string => {
  if (Array.isArray(elements) && elements.length) {
    return elements.filter(el => !!el).join(separator)
  } else {
    return ''
  }
}

export const objectValueToString = (data: Record<string, any>): Record<string, string> => {
  const newObject: Record<string, any> = {}
  if (data && typeof data === 'object') {
    Object.keys(data).map((record: string) => {
      if (data[record] && data[record] !== null && typeof data[record] !== 'string') {
        newObject[record] = data[record].toString()
      } else {
        newObject[record] = data[record]
      }
    })
  }
  return newObject
}
