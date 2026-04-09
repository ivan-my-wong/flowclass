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

type UpdateAmountPaidProps = {
  data: Invoice
  refetch: () => void
}

const UpdateAmountPaid = (props: UpdateAmountPaidProps): JSX.Element => {
  const { data, refetch } = props
  const { currentSite } = useSiteData()
  const currency = data?.enrollCourse?.currency ?? currentSite?.currency
  const currentAmountPaid = data?.amountPaid ?? 0

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [amountPaid, setAmountPaid] = useState(0)

  const { useAmountPaidUpdate } = usePaymentEvidenceData()
  const { mutateAsync: handleUpdate, isLoading } = useAmountPaidUpdate()
  const { setConfirm, closeConfirm } = useConfirm(isLoading)

  return (
    <>
      <div className="!flex !items-center group h-full">
        <div className="text-lg text-blue-600">
          {currency &&
            formatCurrencyWithName(Number(currentAmountPaid), currency)}
        </div>
        <button
          type="button"
          className="ml-2"
          onClick={() => {
            setIsOpen(true)
            setAmountPaid(+currentAmountPaid)
          }}
        >
          <LuPencil className="text-primary hover:text-blue-600" />
        </button>
      </div>
      <ModalDialog
        open={isOpen}
        title={t('student:paymentProof.editAmountPaid') as string}
        onOpenChange={() => setIsOpen(false)}
        className="max-w-md"
      >
        <div className="mb-4">
          <Label className="mb-2">
            {t('student:paymentProof.amountPaid') as string}
          </Label>
          <Input
            type="number"
            value={amountPaid}
            onChange={e => setAmountPaid(Number(e.target.value))}
          />
          <Button
            className="mt-4 w-full"
            iconBefore={<MdSave />}
            onClick={() => {
              setIsOpen(false)
              setConfirm({
                title: t(
                  'student:paymentProof.updateAmountPaidTitle'
                ).toString(),
                description: t(
                  'student:paymentProof.updateAmountPaidDescription'
                ).toString(),
                alertType: AlertTypes.CONFIRM,
                cancelText: t('common:action.cancel').toString(),
                confirmText: t('common:action.confirm').toString(),
                onConfirm: async () => {
                  await handleUpdate({
                    invoiceId: data.id,
                    amountPaid,
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

export default UpdateAmountPaid
