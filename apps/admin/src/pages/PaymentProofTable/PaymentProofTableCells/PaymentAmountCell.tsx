import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { HiOutlinePencilSquare } from 'react-icons/hi2'
import { MdSave } from 'react-icons/md'

import Label from '@/components/Inputs/Label'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import ModalDialog from '@/components/ui/ModalDialog'
import useConfirm from '@/hooks/useGlobalConfirm'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import useSiteData from '@/hooks/useSiteData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Invoice, PaymentProofTableItem } from '@/types/enrollCourse'
import { formatCurrencyWithName } from '@/utils/currency'

type PaymentAmountCellProps = {
  data: PaymentProofTableItem
  filteredStudentList: Invoice[]
  setFilteredStudentList: (list: Invoice[]) => void
}

const PaymentAmountCell = (props: PaymentAmountCellProps) => {
  const { data, filteredStudentList, setFilteredStudentList } = props
  const { currentSite } = useSiteData()
  const firstEnrollCourse = data?.enrollCourses?.at(0)
  const currency = firstEnrollCourse?.currency ?? currentSite?.currency
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
        <button
          type="button"
          className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => {
            setIsOpen(true)
            setPayAmount(+paymentAmount)
          }}
        >
          <HiOutlinePencilSquare className="text-primary hover:text-blue-600" />
        </button>
        <p>
          {currency && formatCurrencyWithName(Number(paymentAmount), currency)}
        </p>
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
                    const updatedList = filteredStudentList.map(item => {
                      if (item.id === data.id) {
                        return { ...item, payAmount: Number(payAmount) }
                      }
                      return item
                    })
                    setFilteredStudentList(updatedList)
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

export default PaymentAmountCell
