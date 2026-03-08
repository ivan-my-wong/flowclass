import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuPencil } from 'react-icons/lu'
import { MdSave } from 'react-icons/md'

import Label from '@/components/Inputs/Label'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import ModalDialog from '@/components/ui/ModalDialog'
import useConfirm from '@/hooks/useGlobalConfirm'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import useSiteData from '@/hooks/useSiteData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Invoice } from '@/types/enrollCourse'
import { formatCurrencyWithName } from '@/utils/currency'

type PaymentAmountCellProps = {
  data: Invoice
  refetch: () => void
}

const UpdatePayAmount = (props: PaymentAmountCellProps): JSX.Element => {
  const { data, refetch } = props
  const { currentSite } = useSiteData()
  const currency = data?.enrollCourse?.currency ?? currentSite?.currency
  const paymentAmount = data?.payAmount

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [payAmount, setPayAmount] = useState(0)

  const { usePaymentAmountUpdate } = usePaymentEvidenceData()
  const { mutateAsync: handleUpdate, isLoading } = usePaymentAmountUpdate()
  const { setConfirm, closeConfirm } = useConfirm(isLoading)

  return (
    <>
      <div className="!flex !items-center group h-full">
        <div className="text-lg text-blue-600">
          {currency && formatCurrencyWithName(Number(paymentAmount), currency)}
        </div>
        <button
          type="button"
          className="ml-2"
          onClick={() => {
            setIsOpen(true)
            setPayAmount(+paymentAmount)
          }}
        >
          <LuPencil className="text-primary hover:text-blue-600" />
        </button>
      </div>
      <ModalDialog
        open={isOpen}
        title={t('student:paymentProof.editPaymentAmount') as string}
        onOpenChange={() => setIsOpen(false)}
        className="max-w-md"
      >
        <div className="mb-4">
          <Label className="mb-2">
            {t('student:paymentProof.paymentAmount') as string}
          </Label>
          <Input
            type="number"
            value={payAmount}
            onChange={e => setPayAmount(Number(e.target.value))}
          />
          <Button
            className="mt-4 w-full"
            iconBefore={<MdSave />}
            onClick={() => {
              setIsOpen(false)
              setConfirm({
                title: t(
                  'student:paymentProof.updatePaymentAmountTitle'
                ).toString(),
                description: t(
                  'student:paymentProof.updatePaymentAmountDescription'
                ).toString(),
                alertType: AlertTypes.WARN,
                cancelText: t('common:action.cancel').toString(),
                confirmText: t('common:action.confirm').toString(),
                onConfirm: async () => {
                  await handleUpdate({
                    invoiceId: data.id,
                    paymentAmount: payAmount,
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

export default UpdatePayAmount
