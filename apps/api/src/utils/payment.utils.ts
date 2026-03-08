import { EnrollCourse } from '@/models/enroll-courses.entity'
import { Institution } from '@/models/institutions.entity'
import { Invoice } from '@/models/invoice.entity'
import { Site } from '@/models/site.entity'

import { validateDomain } from './validate/validate.utils'

export const createPaymentLink = (invoice: Invoice): string => {
  const { institution, course, enrollCourses, site } = invoice
  const enrollCourse = enrollCourses.at(0)
  if (!course.path) {
    return ''
  }
  if (!enrollCourse) {
    return ''
  }
  const domain = validateDomain(site.customDomain) ? site.customDomain : site.url
  return `https://${domain}/enrol/upload-receipt?school=${
    institution.url
  }&enrolId=${enrollCourse.id.toString()}&token=${invoice.proofToken}`
}

export const createSuccessPaymentLink = ({
  invoice,
  institution,
  enrollCourse,
  site,
}: {
  invoice: Invoice
  institution: Institution
  enrollCourse: EnrollCourse
  site: Site
}) => {
  const paymentReceiptUploadLinkParams = new URLSearchParams({
    school: encodeURIComponent(institution.url ?? ''),
    schoolId: institution.id.toString(),
    course: encodeURIComponent(invoice.course.path),
    enrolId: enrollCourse.id.toString(),
    token: invoice.proofToken,
  })

  return `https://${
    validateDomain(site.customDomain) ? site.customDomain : site.url
  }/enrol/success-payment?${paymentReceiptUploadLinkParams.toString()}`
}
