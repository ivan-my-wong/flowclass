import { useState } from 'react'

import { useQuery } from 'react-query'
import { useTranslation } from 'react-i18next'
import { LuPencil } from 'react-icons/lu'
import { MdSave } from 'react-icons/md'

import { getDivitConfig } from '@/api/divit'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { PaymentMethodsEnum } from '@/constants/payment'
import useConfirm from '@/hooks/useGlobalConfirm'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import usePayoutData from '@/hooks/usePayoutData'
import useSchoolData from '@/hooks/useSchoolData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Invoice, PayLaterMethod } from '@/types/enrollCourse'
import { StripeConnectStatus } from '@/types/stripe-connect'

type PaymentAmountCellProps = {
  data: Invoice
  refetch: () => void
}

const UpdatePayLeterMethod = (props: PaymentAmountCellProps): JSX.Element => {
  const { data, refetch } = props

  const { t } = useTranslation()

  const { useFetchPayoutMethodsNew, useFetchStripeConnectDetail } =
    usePayoutData()
  const { data: stripeDetail } = useFetchStripeConnectDetail()
  const { data: payoutMethods } = useFetchPayoutMethodsNew({
    num: 20,
  })

  const showStripe =
    stripeDetail?.status === StripeConnectStatus.COMPLETE &&
    stripeDetail.enabled

  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id || 0
  const { data: divitConfig } = useQuery(
    ['divitConfig', currentInstitutionId],
    () => getDivitConfig(currentInstitutionId),
    { enabled: !!currentInstitutionId }
  )
  const showDivit = !!divitConfig?.enabled

  const [isOpen, setIsOpen] = useState(false)
  const [payMethod, setPayMethod] = useState<string>()

  const { usePayLaterMethodUpdate } = usePaymentEvidenceData()
  const { mutateAsync: handleUpdate, isLoading } = usePayLaterMethodUpdate()
  const { setConfirm, closeConfirm } = useConfirm(isLoading)

  let methodId = data?.payLaterMethod?.id?.toString() || ''
  let methodName = data?.payLaterMethod?.methodName
  if (data?.paymentMethod === PaymentMethodsEnum.PAY_NOW) {
    methodId = 'stripe'
    methodName = 'Stripe'
  } else if (data?.paymentMethod === PaymentMethodsEnum.PAY_NOW_DIVIT) {
    methodId = 'divit'
    methodName = 'Divit'
  }

  return (
    <>
      <div className="!flex !items-center group h-full">
        <div className="text-sm">{methodName}</div>
        <button
          type="button"
          className="ml-2"
          onClick={() => {
            setIsOpen(true)
            setPayMethod(methodId)
          }}
        >
          <LuPencil className="text-primary hover:text-blue-600" />
        </button>
      </div>
      <ModalDialog
        open={isOpen}
        title={t('student:paymentProof.editPayLaterMethod') as string}
        onOpenChange={() => setIsOpen(false)}
        className="max-w-md"
      >
        <div className="mb-4">
          <Select
            onValueChange={v => setPayMethod(v)}
            value={payMethod?.toString()}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {showStripe && (
                <SelectItem value="stripe">
                  {t('student:paymentProof.stripe')}
                </SelectItem>
              )}
              {showDivit && <SelectItem value="divit">Divit</SelectItem>}
              {payoutMethods?.content
                ?.filter(o => o.enabled)
                ?.map(option => (
                  <SelectItem
                    key={option.id}
                    value={option.id?.toString() || ''}
                  >
                    {option.methodName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            className="mt-4 w-full"
            iconBefore={<MdSave />}
            onClick={() => {
              setIsOpen(false)
              setConfirm({
                title: t(
                  'student:paymentProof.updatePayLaterMethodTitle'
                ).toString(),
                description: t(
                  'student:paymentProof.updatePayLaterMethodDescription'
                ).toString(),
                alertType: AlertTypes.WARN,
                cancelText: t('common:action.cancel').toString(),
                confirmText: t('common:action.confirm').toString(),
                onConfirm: async () => {
                  let method: PayLaterMethod | undefined

                  if (payMethod === 'stripe') {
                    method = {
                      id: stripeDetail?.id ?? 0,
                      enabled: true,
                      methodName: 'Stripe',
                      institutionId: stripeDetail?.institutionId ?? 0,
                      description: 'Pay Now with Stripe',
                      siteId: stripeDetail?.siteId ?? 0,
                      methodType: PaymentMethodsEnum.PAY_NOW,
                    } as PayLaterMethod
                  } else if (payMethod === 'divit') {
                    method = {
                      id: divitConfig?.id ?? 0,
                      enabled: true,
                      methodName: 'Divit',
                      institutionId: divitConfig?.institutionId ?? 0,
                      description: 'Pay Now with Divit',
                      siteId: divitConfig?.siteId ?? 0,
                      methodType: PaymentMethodsEnum.PAY_NOW_DIVIT,
                    } as PayLaterMethod
                  } else {
                    method = payoutMethods?.content?.find(
                      item => item.id?.toString() === payMethod
                    ) as unknown as PayLaterMethod
                  }

                  await handleUpdate({
                    invoiceId: data.id,
                    payLaterMethod: method,
                  }).then(() => {
                    refetch()
                    closeConfirm()
                  })
                },
              }).open()
            }}
          >
            {t('common:action.update')}
          </Button>
        </div>
      </ModalDialog>
    </>
  )
}

export default UpdatePayLeterMethod
