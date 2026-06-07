import router from 'next/router'
import { SetStateAction, useEffect, useMemo, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { useQuery } from 'react-query'

import { getPaymentDetail, getSchoolStripeConnection } from '@/api/enrolApi'
import { getDivitConnection } from '@/api/divitApi'
import { QUERY_KEY } from '@/constants/queryKey'
import { useEnrollPaymentLogic } from '@/hooks/useEnrollPaymentLogic'
import { Course, School } from '@/types'
import {
  EnrolCourseResponse,
  PaymentDetailType,
  PaymentMethods,
  StripeConnectStatus,
  UpdateInvoicePaymentData,
} from '@/types/enrol'
import { InvoiceResponse } from '@/types/receipt'

import CustomPaymentDetail from './CustomPaymentDetail'
import PaymentMethodItem from './PaymentMethodItem'
import StripeEmbeddedForm from './StripeEmbeddedForm'
import DivitPaymentOption from '../DivitPayment/DivitPaymentOption'

type PropsType = {
  school: School
  invoice: InvoiceResponse
  course: Course
  enrollmentDetail: EnrolCourseResponse
  onChange: (value: PaymentMethods) => void
  enrollData: UpdateInvoicePaymentData
  setPayLaterMethod: React.Dispatch<SetStateAction<PaymentDetailType | undefined>>
  invoiceToken?: string
}
const PaymentMethodsSelector = ({
  invoice,
  school,
  enrollmentDetail,
  course,
  onChange,
  enrollData,
  setPayLaterMethod,
  invoiceToken,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()
  const [selectedPayment, setSelectedPayment] = useState<string | undefined>(undefined)

  const [hasNoPayLaterMethod, setHasNoPayLaterMethod] = useState(false)

  const { data: stripeConnectionData, isFetched: isStripeFetched } = useQuery(
    [QUERY_KEY.getSchoolStripeConnectionKey, school.id],
    () => getSchoolStripeConnection(school.id.toString()),
    {
      enabled: !!school.id,
    }
  )

  const { data: divitConnectionData, isFetched: isDivitFetched } = useQuery(
    ['divitConnection', school.id],
    () => getDivitConnection(school.id),
    { enabled: !!school.id }
  )

  const isDivitEnabled = !!divitConnectionData?.enabled
  const isDivitSelected = selectedPayment === 'DIVIT'

  const { data, isFetched: isPaymentDetailFetched } = useQuery({
    queryKey: [QUERY_KEY.currentPaymentDetailSchoolKey, school.id],
    queryFn: () => getPaymentDetail(school.id),
    enabled: !!school.id,
  })

  const onSelectPaymentMethods = (selectedValue: string, paymentMethod: PaymentMethods) => {
    setSelectedPayment(selectedValue)
    setPayLaterMethod(data?.find(item => item.id?.toString() === selectedValue))
    onChange(paymentMethod)
  }

  const { clientSecret, fetchClientSecret } = useEnrollPaymentLogic({
    course,
    school,
    enrollmentDetail,
    enrollPayload: {
      ...enrollData,
      invoiceId: invoice.id,
    },
    invoice,
    onPaymentPaid: (urlReceipt: URLSearchParams) => {
      router.push('/enrol/success-payment?' + urlReceipt)
    },
  })

  const isStripeValid = useMemo(() => {
    return (
      stripeConnectionData?.enabled &&
      stripeConnectionData?.stripeAccountId &&
      stripeConnectionData?.status === StripeConnectStatus.COMPLETE
      // && clientSecret
    )
  }, [stripeConnectionData])

  const customPaymentMethod = useMemo(() => {
    return data?.find(item => item.id?.toString() === selectedPayment) || undefined
  }, [selectedPayment, data])

  useEffect(() => {
    // Only set default selection once when selectedPayment is not yet initialized (undefined)
    if (selectedPayment !== undefined) return

    // Wait until all queries are fetched
    if (!isDivitFetched || !isStripeFetched || !isPaymentDetailFetched) {
      return
    }

    if (isDivitEnabled) {
      setSelectedPayment('DIVIT')
      setPayLaterMethod(undefined)
      onChange(PaymentMethods.PAY_NOW)
    } else if (isStripeValid && stripeConnectionData?.stripeAccountId) {
      setSelectedPayment(stripeConnectionData.stripeAccountId)
      onChange(PaymentMethods.PAY_NOW)
    } else if (data && data.length > 0) {
      setSelectedPayment(data[0].id?.toString() as string)
      setPayLaterMethod(data[0])
      onChange(PaymentMethods.PAY_LATER)
    } else {
      setHasNoPayLaterMethod(true)
    }
  }, [
    selectedPayment,
    isDivitFetched,
    isStripeFetched,
    isPaymentDetailFetched,
    isDivitEnabled,
    stripeConnectionData,
    isStripeValid,
    data,
    onChange,
    setPayLaterMethod,
  ])

  return (
    <div className="flex w-full flex-col items-start justify-start gap-y-4">
      <div className="bg-background w-full rounded-sm p-4">
        <h2 className="text-left text-xl font-bold">{t('enrol:paymentDetail.pickPayment')}</h2>
        <div className="mt-3 flex w-full flex-col lg:flex-row lg:space-x-8">
          <ul className="mb-4 max-h-[40rem] w-full space-y-4 overflow-y-auto lg:mb-0 lg:w-1/2">
            {isStripeValid && (
              <PaymentMethodItem
                title={t('enrol:paymentDetail.onlinePayment')}
                selected={
                  enrollData.paymentMethod === PaymentMethods.PAY_NOW &&
                  selectedPayment === stripeConnectionData?.stripeAccountId
                }
                onClick={() => {
                  if (stripeConnectionData?.stripeAccountId)
                    onSelectPaymentMethods(
                      stripeConnectionData.stripeAccountId,
                      PaymentMethods.PAY_NOW
                    )
                }}
              >
                {/* <Image
                  src={'/images/payments/payment-methods.png'}
                  alt=""
                  width={1400}
                  height={1400}
                  className="h-6 w-full md:w-fit"
                /> */}
              </PaymentMethodItem>
            )}
            {isDivitEnabled && (
              <PaymentMethodItem
                title="FPS by divit"
                selected={isDivitSelected}
                onClick={() => {
                  setSelectedPayment('DIVIT')
                  setPayLaterMethod(undefined)
                  onChange(PaymentMethods.PAY_NOW)
                }}
              >
                <p className="w-full flex flex-row items-center justify-between h-6">
                  fast and secure payment by divit
                  <img src="http://static.divit.com.hk/fps/fps-by-divit.svg" alt="" />
                </p>
              </PaymentMethodItem>
            )}
            {data?.map(item => (
              <PaymentMethodItem
                title={item.methodName as string}
                key={`payment-method-${item.id}`}
                selected={selectedPayment === (item.id?.toString() as string)}
                onClick={() =>
                  onSelectPaymentMethods(item.id?.toString() as string, PaymentMethods.PAY_LATER)
                }
              />
            ))}
          </ul>
          <div className="flex w-full lg:w-1/2">
            {isDivitSelected ? (
              <DivitPaymentOption
                invoiceId={invoice.id}
                invoiceToken={invoiceToken ?? ''}
                selected={isDivitSelected}
                onClick={() => {}}
              />
            ) : (
              <>
                {enrollData.paymentMethod === PaymentMethods.PAY_NOW && isStripeValid && (
                  <StripeEmbeddedForm
                    clientSecret={clientSecret}
                    stripeAccount={stripeConnectionData?.stripeAccountId}
                    fetchClientSecret={fetchClientSecret}
                  />
                )}
                {enrollData.paymentMethod === PaymentMethods.PAY_LATER && customPaymentMethod && (
                  <CustomPaymentDetail data={customPaymentMethod} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodsSelector
