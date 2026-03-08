import { useEffect, useMemo, useRef, useState } from 'react'

import { useRecoilValue } from 'recoil'

import moment from 'moment'
import useTranslation from 'next-translate/useTranslation'
import { UseMutateAsyncFunction, useMutation } from 'react-query'
import { toast } from 'sonner'

import { reCreateClientSecret, updateEnrollmentPayment, updateInvoicePayment } from '@/api/enrolApi'
import { EnrolErrorMessage, ServerErrorMessage } from '@/api/error/errorMessage'
import { invoicesState } from '@/stores/enrol'
import { Course } from '@/types/course'
import {
  EnrolCourseData,
  EnrolCourseResponse,
  PaymentMethods,
  PaymentState,
  ReCreateStripeClientSecret,
  UpdateEnrolCourseResponse,
  UpdateInvoicePaymentData,
} from '@/types/enrol'
import { GtmEvent, setGtmEvent } from '@/types/gtmEvent'
import { InvoiceResponse } from '@/types/receipt'
import { School } from '@/types/school'

import { useGlobalError } from './useGlobalError'

type ReturnTypeUseEnrollPaymentLogic = {
  clientSecret: string | undefined
  setClientSecret: React.Dispatch<React.SetStateAction<string | undefined>>
  fetchClientSecret: () => Promise<string>
  isLoading: boolean
  payInvoice: UseMutateAsyncFunction<
    InvoiceResponse,
    Error,
    { id: number; payload: UpdateInvoicePaymentData },
    InvoiceResponse
  >
  updateEnrollPayment: UseMutateAsyncFunction<
    UpdateEnrolCourseResponse | UpdateEnrolCourseResponse[],
    Error,
    {
      id: number
      payload: EnrolCourseData
    },
    UpdateEnrolCourseResponse | UpdateEnrolCourseResponse[]
  >
}
type TypeUseEnrollPaymentLogicParams = {
  course: Course
  school: School
  invoice: InvoiceResponse
  enrollPayload: UpdateInvoicePaymentData
  enrollmentDetail: EnrolCourseResponse
  onPaymentPaid?: (urlReceipt: URLSearchParams, invoice: InvoiceResponse) => void
}
const useEnrollPaymentLogic = ({
  course,
  school,
  onPaymentPaid,
  enrollPayload,
  invoice,
  enrollmentDetail,
}: TypeUseEnrollPaymentLogicParams): ReturnTypeUseEnrollPaymentLogic => {
  const { t } = useTranslation()
  const invoicesData = useRecoilValue(invoicesState)
  const invoiceData = useMemo(
    () => invoicesData.find(inv => inv.id === invoice.id),
    [invoicesData, invoice.id]
  )
  const [clientSecret, setClientSecret] = useState<string | undefined>(undefined)
  const { setError } = useGlobalError()
  const createSuccessUrl = (enrollId: string): URLSearchParams => {
    return new URLSearchParams({
      enrolId: enrollId,
      token: invoice.proofToken,
      school: school?.url ?? '',
      schoolId: school?.id?.toString() ?? '',
      course: course?.path ?? '',
    })
  }
  const { mutateAsync: reCreateStripeClientSecret, isLoading: isLoadingClientSecret } = useMutation(
    {
      mutationFn: ({ id, payload }: { id: number; payload: ReCreateStripeClientSecret }) =>
        reCreateClientSecret(id, payload),
      onSuccess: (clientSecret: Record<string, string>) => {
        if (typeof clientSecret === 'object') {
          setClientSecret(clientSecret.clientSecret || '')
        }
      },
    }
  )
  const { mutateAsync: updateEnrollPayment, isLoading } = useMutation<
    UpdateEnrolCourseResponse | UpdateEnrolCourseResponse[],
    Error,
    { id: number; payload: EnrolCourseData },
    UpdateEnrolCourseResponse | UpdateEnrolCourseResponse[]
  >({
    mutationFn: ({ id, payload }: { id: number; payload: EnrolCourseData }) =>
      updateEnrollmentPayment(id, payload),
    onSuccess: (data: UpdateEnrolCourseResponse | UpdateEnrolCourseResponse[]) => {
      const finalData = Array.isArray(data) ? data[0] : data
      const invoice = finalData.invoice

      setGtmEvent({
        userId: finalData.userId,
        value: finalData.paymentAmount,
        currency: finalData.currency,
        coupon: invoiceData?.couponCode,
        payment_type: invoice.paymentMethod ?? PaymentMethods.PAY_NOW,
        items: [
          {
            item_id: course?.id ?? 0,
            item_name: course?.name ?? '',
            item_brand: school?.name ?? '',
            coupon: invoiceData?.couponCode,
            discount: invoiceData?.totalDiscount,
            price: invoiceData?.paymentAmount,
            quantity: 1,
          },
        ],
        event: GtmEvent.addPaymentInfo,
      })
      if (
        invoice.paymentState === PaymentState.PAID ||
        invoice.paymentState === PaymentState.SUBMITTED
      ) {
        toast.success(t('enrol:payment.success') as string)

        onPaymentPaid && onPaymentPaid(createSuccessUrl(finalData.id.toString()), invoice)
      }
    },
    onError: (e: any) => {
      let message = ''
      if (e.statusCode === 422) {
        message = t('errors:ENROL.INCORRECT_DATA_FORMAT')
      } else if (e.statusCode === 404) {
        message = t('errors:ENROL.ONLINE_PAYMENT_NOT_AVAILABLE')
      } else if (e.statusCode === 400) {
        // No need show error message if stripe connect not found
        if (e.message.includes(EnrolErrorMessage.STRIPE_CONNECT_NOT_FOUND)) {
          return
        }
        message = t('errors:ENROL.PAYMENT_AMOUNT_TOO_LOW')
      } else if (e.statusCode === 500) {
        // TODO: business logic error should not be represented by statusCode
        message = t('errors:PAYMENT.serverError')
        setError({ isError: true, statusCode: e.statusCode, message: e })
      } else if (e.message) {
        if (e.message.includes(EnrolErrorMessage.COURSE_RECRUITMENT_NOT_STARTED)) {
          const startDate = e.message.split(': ')[1]
          message = `${t('errors:ENROL.COURSE_RECRUITMENT_NOT_STARTED')}. Start date is ${moment(
            startDate
          ).format('YYYY-MM-DD h:mm a')}`
        } else if (e.message.includes(EnrolErrorMessage.DATE_PICKED_IS_IN_THE_PAST)) {
          message = t('errors:ENROL.DATE_PICKED_IS_IN_PAST')
        } else if (e.message.includes(ServerErrorMessage.FAILED_TO_FETCH)) {
          message = t('errors:NETWORK')
        }
      }
      toast.error(message)
    },
  })
  const handleError = (): string => {
    return ''
  }

  const { mutateAsync: payInvoice, isLoading: isPayInvoiceLoading } = useMutation<
    InvoiceResponse,
    Error,
    { id: number; payload: UpdateInvoicePaymentData },
    InvoiceResponse
  >({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateInvoicePaymentData }) =>
      updateInvoicePayment(id, payload),
    onSuccess: (invoice: InvoiceResponse) => {
      setGtmEvent({
        userId: invoice.userId,
        value: invoice.payAmount,
        currency: invoice.currency,
        coupon: invoiceData?.couponCode,
        payment_type: invoice.paymentMethod ?? PaymentMethods.PAY_NOW,
        items: [
          {
            item_id: course?.id ?? 0,
            item_name: course?.name ?? '',
            item_brand: school?.name ?? '',
            coupon: invoiceData?.couponCode,
            discount: invoiceData?.totalDiscount,
            price: invoiceData?.paymentAmount,
            quantity: 1,
          },
        ],
        event: GtmEvent.addPaymentInfo,
      })

      if (!invoice.enrollCourses.length) {
        console.warn('Invoice payment succeeded but no enrollCourses found:', invoice.id)
        return
      }

      const firstEnrollCourse = invoice.enrollCourses.at(0)
      if (
        (invoice.paymentState === PaymentState.PAID ||
          invoice.paymentState === PaymentState.SUBMITTED) &&
        firstEnrollCourse
      ) {
        toast.success(t('enrol:payment.success') as string)

        onPaymentPaid && onPaymentPaid(createSuccessUrl(firstEnrollCourse.id.toString()), invoice)
      }
    },
    onError: (e: any) => {
      let message = ''
      if (e.statusCode === 422) {
        message = t('errors:ENROL.INCORRECT_DATA_FORMAT')
      } else if (e.statusCode === 404) {
        message = t('errors:ENROL.ONLINE_PAYMENT_NOT_AVAILABLE')
      } else if (e.statusCode === 400) {
        // No need show error message if stripe connect not found
        if (e.message.includes(EnrolErrorMessage.STRIPE_CONNECT_NOT_FOUND)) {
          return
        }
        message = t('errors:ENROL.PAYMENT_AMOUNT_TOO_LOW')
      } else if (e.statusCode === 500) {
        // TODO: business logic error should not be represented by statusCode
        message = t('errors:PAYMENT.serverError')
        setError({ isError: true, statusCode: e.statusCode, message: e })
      } else if (e.message) {
        if (e.message.includes(EnrolErrorMessage.COURSE_RECRUITMENT_NOT_STARTED)) {
          const startDate = e.message.split(': ')[1]
          message = `${t('errors:ENROL.COURSE_RECRUITMENT_NOT_STARTED')}. Start date is ${moment(
            startDate
          ).format('YYYY-MM-DD h:mm a')}`
        } else if (e.message.includes(EnrolErrorMessage.DATE_PICKED_IS_IN_THE_PAST)) {
          message = t('errors:ENROL.DATE_PICKED_IS_IN_PAST')
        } else if (e.message.includes(ServerErrorMessage.FAILED_TO_FETCH)) {
          message = t('errors:NETWORK')
        }
      }
      toast.error(message)
    },
  })

  const { couponCode, paymentAmount } = useMemo(
    () => ({
      couponCode: invoiceData?.couponCode,
      paymentAmount: invoiceData?.paymentAmount,
    }),
    [invoiceData?.couponCode, invoiceData?.paymentAmount]
  )
  const prevPaymentAmount = useRef(paymentAmount)
  const fetchClientSecret = async (): Promise<string> => {
    try {
      const paymentAmount = Number(invoiceData?.paymentAmount ?? 0)
      if (invoice.payAmount > 0 && paymentAmount > 0) {
        const res = await reCreateStripeClientSecret({
          id: enrollmentDetail.id,
          payload: {
            institutionId: school.id,
            invoiceId: invoice.id,
            paymentAmount,
            courseId: invoice.course?.id || invoice?.courseId,
            redirectUrl: enrollPayload.redirectUrl,
          },
        })
        if (Array.isArray(res)) {
          return handleError()
        }

        if (res) {
          return res.clientSecret
        }

        return ''
      }
      return handleError()
    } catch (error: any) {
      // setSelectedPayment(p)
      return handleError()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }
  // This only should rerender when coupon code or payment amount changes
  useEffect(() => {
    if (
      couponCode &&
      paymentAmount &&
      +paymentAmount > -1 &&
      +paymentAmount !== +invoice.payAmount &&
      +paymentAmount !== prevPaymentAmount.current
    ) {
      fetchClientSecret()
      prevPaymentAmount.current = paymentAmount
    }
  }, [couponCode, paymentAmount, invoice.payAmount])

  return {
    clientSecret,
    setClientSecret,
    updateEnrollPayment,
    payInvoice,
    fetchClientSecret,
    isLoading: isLoading || isLoadingClientSecret || isPayInvoiceLoading,
  }
}

export { useEnrollPaymentLogic }
