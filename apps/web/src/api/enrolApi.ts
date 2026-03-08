import {
  CheckEnrollCompleted,
  CheckQuotaDto,
  CheckQuotaResponse,
  EnrolCourseData,
  EnrolCourseResponse,
  EnrollCompletedResponse,
  EnrollmentRecord,
  EnrollTriggerData,
  GetEnrolPriceData,
  GetEnrolPriceResponse,
  PaymentDetailType,
  ReCreateStripeClientSecret,
  StripeConnectionResponse,
  StudentLesson,
  UpdateEnrolCourseResponse,
  UpdateInvoicePaymentData,
} from '@/types/enrol'
import { InvoiceResponse, uploadReceiptData, uploadReceiptResponse } from '@/types/receipt'

import customFetch from './baseClient'

export const enrolCourse = async (data: EnrolCourseData): Promise<EnrollTriggerData> => {
  const { data: result } = await customFetch<EnrollTriggerData>('/student/enroll-courses', {
    method: 'POST',
    body: data,
  })
  return result
}

export const enrolCourseMultiple = async (
  data: EnrolCourseData[]
): Promise<EnrollTriggerData[]> => {
  const { data: result } = await customFetch<EnrollTriggerData[]>(
    '/student/enroll-courses/multiple',
    {
      method: 'POST',
      body: data,
    }
  )
  return result
}

export const retrieveSession = async (institution_id: number, session_id: string): Promise<any> => {
  const { data: result } = await customFetch<any>('/admin/stripe-connects/session-status', {
    method: 'GET',
    query: { institution_id: String(institution_id), session_id },
  })
  return result
}

export const enrolRecord = async (
  data: EnrollmentRecord,

  institutionId?: number
): Promise<EnrolCourseData> => {
  const { data: result } = await customFetch<EnrolCourseData>(
    '/student/enroll-courses/enrollment-record',
    {
      method: 'POST',
      query: {
        ...(institutionId && { institutionId: institutionId.toString() }),
        courseId: data.courseId.toString(),
      },
      body: data,
    }
  )
  return result
}

// Get the price after applying coupon

export const getEnrolPrice = async (data: GetEnrolPriceData): Promise<GetEnrolPriceResponse> => {
  const { data: result } = await customFetch<GetEnrolPriceResponse>(
    '/student/enroll-courses/before-payment',
    {
      method: 'POST',
      body: data,
    }
  )
  return result
}

export const getInvoice = async (token: string): Promise<InvoiceResponse> => {
  const { data: result } = await customFetch<InvoiceResponse>('/student/enroll-courses/invoice', {
    method: 'GET',
    query: { token },
  })
  return result
}

export const getInvoices = async (token: string): Promise<InvoiceResponse[]> => {
  const { data: result } = await customFetch<InvoiceResponse[]>(
    '/student/enroll-courses/invoices',
    {
      method: 'GET',
      query: { token },
    }
  )
  return result
}

export const getEnrollStudentLesson = async (enrollIds: string): Promise<StudentLesson[]> => {
  const { data: result } = await customFetch<StudentLesson[]>(
    '/student/enroll-courses/student-lessons',
    {
      method: 'POST',
      body: { enrollIds },
    }
  )
  return result
}

export const uploadPaymentProof = async ({
  siteId,
  institutionId,
  token,
  enrollId,
  invoiceId,
  file,
  payLaterMethod,
}: uploadReceiptData): Promise<uploadReceiptResponse> => {
  const formData = new FormData()
  formData.append('enrollId', enrollId)
  formData.append('invoiceId', invoiceId.toString())
  formData.append('payLaterMethod', JSON.stringify(payLaterMethod))
  formData.append('file', file)

  const { data: result } = await customFetch<uploadReceiptResponse>(
    '/student/payment-evidence/token',
    {
      method: 'POST',
      query: { siteId, institutionId, token },
      body: formData,
    }
  )
  return result
}

export const getEnrollmentDetailByToken = async (token: string): Promise<EnrolCourseResponse> => {
  const { data: result } = await customFetch<EnrolCourseResponse>(
    '/student/enroll-courses/detail/token',
    {
      method: 'GET',
      query: { token },
    }
  )
  return result
}

export const getSchoolStripeConnection = async (
  institutionId: string
): Promise<StripeConnectionResponse> => {
  const { data: result } = await customFetch<StripeConnectionResponse>(
    '/student/enroll-courses/stripe-connection',
    {
      method: 'GET',
      query: { institutionId },
    }
  )

  return result
}

export const getPaymentDetail = async (institutionId: number): Promise<PaymentDetailType[]> => {
  const { data: result } = await customFetch<PaymentDetailType[]>('/student/payout-methods', {
    method: 'GET',
    query: { institutionId: institutionId.toString(), getEnabledOnly: 'true' },
  })

  return result
}

export const updateEnrollmentPayment = async (
  id: number,
  data: EnrolCourseData
): Promise<UpdateEnrolCourseResponse | UpdateEnrolCourseResponse[]> => {
  const { data: result } = await customFetch<
    UpdateEnrolCourseResponse | UpdateEnrolCourseResponse[]
  >(
    '/student/enroll-courses',

    {
      method: 'PATCH',
      query: { id: id.toString() },
      body: data,
    }
  )
  return result
}

export const updateInvoicePayment = async (
  invoiceId: number,
  data: UpdateInvoicePaymentData
): Promise<InvoiceResponse> => {
  const { data: result } = await customFetch<InvoiceResponse>(
    '/student/enroll-courses',

    {
      method: 'PATCH',
      query: { id: invoiceId.toString() },
      body: data,
    }
  )
  return result
}

export const reCreateClientSecret = async (
  id: number,
  data: ReCreateStripeClientSecret
): Promise<Record<string, string>> => {
  const { data: result } = await customFetch<Record<string, string>>(
    '/student/enroll-courses/client-secret',

    {
      method: 'PATCH',
      query: { id: id.toString() },
      body: data,
    }
  )
  return result
}

export const checkCourseCompleted = (
  data: CheckEnrollCompleted
): Promise<EnrollCompletedResponse[]> => {
  return customFetch<EnrollCompletedResponse[]>('/student/prerequisites-courses/check', {
    method: 'POST',
    body: data,
  }).then(res => res.data)
}

export const checkQuota = async (data: CheckQuotaDto): Promise<CheckQuotaResponse[]> => {
  const { data: result } = await customFetch<CheckQuotaResponse[]>(
    '/student/enroll-courses/check-quota',
    {
      method: 'POST',
      body: data,
    }
  )
  return result
}
