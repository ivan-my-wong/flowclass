import { EnrollCourse } from '@/models/enroll-courses.entity'
import { Institution } from '@/models/institutions.entity'
import { Invoice } from '@/models/invoice.entity'
import { Site } from '@/models/site.entity'

import { validateDomain } from './validate/validate.utils'

const buildApplicationLink = ({
  siteUrl,
  institutionUrl,
  coursePath,
  email,
}: {
  siteUrl: string
  institutionUrl: string
  coursePath: string
  email?: string
}) => {
  if (!siteUrl || !validateDomain(siteUrl)) {
    throw new Error('Site URL is required')
  }
  const environment = process.env.NODE_ENV

  const domain =
    environment === 'local' || environment === 'development'
      ? 'http://localhost:3001'
      : `https://${siteUrl}`

  const baseUrl = `${domain}/enrol`
  const url = new URL(baseUrl)
  url.searchParams.set('school', institutionUrl ?? '')
  url.searchParams.set('course', coursePath ?? '')

  if (email) {
    url.searchParams.set('email', email ?? '')
  }
  const applicationLink = url.toString()
  return applicationLink
}

const buildUploadReceiptLink = ({
  institution,
  invoice,
  customDomain,
  siteUrl,
  coursePath,
}: {
  institution: Institution
  invoice: Partial<Invoice>
  customDomain: string
  siteUrl: string
  coursePath: string
}) => {
  const enrollCourses = invoice.enrollCourses || []
  const enrollIds = enrollCourses.map((ec) => ec.id.toString())
  const courseIds = enrollCourses.map((ec) => ec.courseId?.toString())
  const uploadPaymentReceiptLinkParams = new URLSearchParams({
    school: institution.url ?? '',
    course: coursePath ?? '',
    enrolId: enrollIds.at(0) ?? '',
    enrollIds: enrollIds?.join(',') ?? '',
    courseIds: courseIds?.join(',') ?? '',
    token: invoice.proofToken,
  })
  const uploadLink = `https://${
    customDomain !== undefined && validateDomain(customDomain) ? customDomain : siteUrl
  }/enrol/upload-receipt?${uploadPaymentReceiptLinkParams.toString()}`
  return uploadLink
}

const buildSuccessPaymentLink = ({
  institution,
  invoice,
  enrollCourse,
  site,
}: {
  institution: Institution
  invoice: Partial<Invoice>
  enrollCourse: EnrollCourse
  site: Site
}) => {
  const enrollCourses = invoice.enrollCourses || []
  const linkParams = new URLSearchParams({
    school: institution.url || '',
    schoolId: institution.id.toString(),
    course: enrollCourse.course?.path || '',
    enrolId: enrollCourse.id.toString(),
    enrolIds: enrollCourses.map((ec) => ec.id.toString()).join(','),
    courseIds: enrollCourses.map((ec) => ec.courseId.toString()).join(','),
    token: invoice.proofToken || '',
  })
  const successPaymentLink = `https://${
    validateDomain(site.customDomain) ? site.customDomain : site.url
  }/enrol/success-payment?${linkParams.toString()}`
  return successPaymentLink
}

/**
 * Upload-receipt link pointing to the CMS app (LINK_FLOWCLASS_CMS).
 * Matches the copy-link button in PaymentProofTable — the page only reads
 * `token` and `institutionId`.
 */
const buildCmsUploadReceiptLink = ({
  proofToken,
  institutionId,
}: {
  proofToken: string
  institutionId: number
}): string => {
  const cmsHost = process.env.LINK_FLOWCLASS_CMS ?? ''
  const base = process.env.APP_ENV === 'local' ? 'http://localhost:5173' : `https://${cmsHost}`
  const params = new URLSearchParams({ token: proofToken, institutionId: String(institutionId) })
  return `${base}/pay/upload-receipt?${params.toString()}`
}

export { buildApplicationLink, buildCmsUploadReceiptLink, buildSuccessPaymentLink, buildUploadReceiptLink }
