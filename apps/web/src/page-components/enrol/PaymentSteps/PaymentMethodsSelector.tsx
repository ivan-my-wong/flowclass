import router from 'next/router'
import { SetStateAction, useEffect, useMemo, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { useQuery } from 'react-query'

import { getPaymentDetail, getSchoolStripeConnection } from '@/api/enrolApi'
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

type PropsType = {
  school: School
  invoice: InvoiceResponse
  course: Course
  enrollmentDetail: EnrolCourseResponse
  onChange: (value: PaymentMethods) => void
  enrollData: UpdateInvoicePaymentData
  setPayLaterMethod: React.Dispatch<SetStateAction<PaymentDetailType | undefined>>
}
const PaymentMethodsSelector = ({
  invoice,
  school,
  enrollmentDetail,
  course,
  onChange,
  enrollData,
  setPayLaterMethod,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()
  const [selectedPayment, setSelectedPayment] = useState<string | undefined>(undefined)

  const [hasNoPayLaterMethod, setHasNoPayLaterMethod] = useState(false)

  const { data: stripeConnectionData } = useQuery(
    [QUERY_KEY.getSchoolStripeConnectionKey, school.id],
    () => getSchoolStripeConnection(school.id.toString()),
    {
      enabled: !!school.id,
    }
  )

  const { data } = useQuery({
    queryKey: [QUERY_KEY.currentPaymentDetailSchoolKey, school.id],
    queryFn: () => getPaymentDetail(school.id),
    onSuccess: (data: PaymentDetailType[]) => {
      if (data.length > 0 && !isStripeValid) {
        setSelectedPayment(data[0].id?.toString() as string)
        setPayLaterMethod(data[0])
        onChange(PaymentMethods.PAY_LATER)
      } else {
        setHasNoPayLaterMethod(true)
      }
    },
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
    // If stripe is valid, then set the default payment method to stripe
    // If stripe is not valid, then set the default payment method to custom with the first payment method
    if (isStripeValid && stripeConnectionData?.stripeAccountId) {
      setSelectedPayment(stripeConnectionData.stripeAccountId)
      onChange(PaymentMethods.PAY_NOW)
    }
  }, [stripeConnectionData, onChange, isStripeValid])

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
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodsSelector
