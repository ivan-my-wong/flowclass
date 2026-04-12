import { studentLinksBaseUrl } from '@/constants/enrollmentFormFieldNames'
import { API_BASE_URL, getBaseUrl } from '@/lib/config'
import { Site } from '@/stores/siteData'
import { Invoice, PaymentProofTableItem } from '@/types/enrollCourse'
import { School } from '@/types/school'

import { siteDomainIfCustom } from './string'

export const getDomainFromUrl = (url: string): string => {
  return url.slice(url.indexOf('.') + 1)
}

export const generatePathFromName = (name: string): string => {
  if (name && name !== '') {
    return encodeURI(name.replace(/[^a-zA-Z0-9\s]+/g, '').replace(/\s+/g, '-'))
  }
  return ''
}

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

export const getCmsOrigin = (): string => getBaseUrl()

export const generatePaymentLink = (
  invoice: PaymentProofTableItem | Invoice | null,
  coursePath: string,
  currentSchool: School | null,
  currentSite: Site | null
): string => {
  const siteUrl = siteDomainIfCustom(
    currentSite?.customDomain,
    currentSite?.url
  )

  if (!invoice || !invoice.enrollCourses || !currentSchool || !currentSite) {
    return ''
  }

  const safeParams = new URLSearchParams({
    schoolId: String(invoice.institutionId),
    school: encodeURIComponent(currentSchool?.url ?? ''),
    course: encodeURIComponent(coursePath ?? ''),
    enrolId: String(invoice.enrollCourses[0]?.id ?? 0),
    enrollIds: invoice.enrollCourses.map(ec => ec.id?.toString()).join(','),
    token: encodeURIComponent(invoice.proofToken ?? ''),
  })
  return `https://${siteUrl}${studentLinksBaseUrl.uploadReceipt}?${safeParams}`
}
