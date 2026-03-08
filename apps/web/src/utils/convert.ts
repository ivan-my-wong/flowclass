import { API_BASE_URL } from '@/lib/config'

export const getMediaFileUrl = (key: string | undefined) => {
  if (!key) return ''
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key
  }

  const baseUrl = API_BASE_URL.replace(/\/+$/, '')
  const encodedKey = key
    .split('/')
    .filter(Boolean)
    .map(segment => encodeURIComponent(segment))
    .join('/')
  return `${baseUrl}/media/file/${encodedKey}`
}

export const rearrangeOrder = <T extends { id: number }>(data: T[], order: number[]): T[] => {
  if (!data || !order || order.length <= 1) return data

  const sortedData = [...data].sort((a, b) => {
    const aIndex = order.indexOf(a.id)
    const bIndex = order.indexOf(b.id)
    if (aIndex === -1) {
      return 1
    }
    if (bIndex === -1) {
      return -1
    }
    return aIndex - bIndex
  })
  return sortedData
}
