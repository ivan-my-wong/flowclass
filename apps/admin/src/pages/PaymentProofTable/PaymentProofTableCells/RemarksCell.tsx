import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { HiOutlinePencilSquare } from 'react-icons/hi2'
import { MdOutlineDelete, MdSave } from 'react-icons/md'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import TextArea from '@/components/ui/TextAreaBase'
import useConfirm from '@/hooks/useGlobalConfirm'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Invoice, PaymentProofTableItem } from '@/types/enrollCourse'

type RemarksCellProps = {
  data: PaymentProofTableItem
  filteredStudentList: Invoice[]
  setFilteredStudentList: (list: Invoice[]) => void
}

const RemarksCell = (props: RemarksCellProps) => {
  const { data, filteredStudentList, setFilteredStudentList } = props

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [remark, setRemark] = useState(data?.remark || '')

  const { useUpdateRemarkInvoice, useDeleteRemarkInvoice } =
    usePaymentEvidenceData()
  const { mutateAsync: handleUpdate, isLoading } = useUpdateRemarkInvoice()
  const { mutateAsync: handleDelete } = useDeleteRemarkInvoice()
  const { setConfirm, closeConfirm } = useConfirm(isLoading)

  return (
    <>
      <div className="!flex !items-center group h-full">
        <p>{data?.remark}</p>
        <button
          type="button"
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => {
            setIsOpen(true)
            setRemark(data?.remark || '')
          }}
        >
          <HiOutlinePencilSquare className="text-primary hover:text-blue-600" />
        </button>
        {!!data?.remark && (
          <button
            type="button"
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => {
              setConfirm({
                title: t('student:paymentProof.deleteRemarkTitle').toString(),
                description: t(
                  'student:paymentProof.deleteRemarkDescription'
                ).toString(),
                alertType: AlertTypes.WARN,
                cancelText: t('common:action.cancel').toString(),
                confirmText: t('common:action.confirm').toString(),
                onConfirm: async () => {
                  await handleDelete(data.id).then(() => {
                    const updatedList = filteredStudentList.map(item => {
                      if (item.id === data.id) return { ...item, remark: '' }
                      return item
                    })
                    setFilteredStudentList(updatedList)
                    closeConfirm()
                  })
                },
              }).open()
            }}
          >
            <MdOutlineDelete className="text-destructive hover:text-red-600" />
          </button>
        )}
      </div>
      <ModalDialog
        open={isOpen}
        title={
          t('student:paymentProof.editRemark', {
            name: data?.enrollCourses[0]?.name,
          }) as string
        }
        onOpenChange={() => setIsOpen(false)}
        className="max-w-md"
      >
        <div className="mb-4">
          <TextArea value={remark} onChange={e => setRemark(e.target.value)} />
          <Button
            className="mt-4 w-full"
            iconBefore={<MdSave />}
            onClick={() => {
              setIsOpen(false)
              setConfirm({
                title: t('student:paymentProof.updateRemarkTitle').toString(),
                description: t(
                  'student:paymentProof.updateRemarkDescription'
                ).toString(),
                alertType: AlertTypes.WARN,
                cancelText: t('common:action.cancel').toString(),
                confirmText: t('common:action.confirm').toString(),
                onConfirm: async () => {
                  await handleUpdate({
                    invoiceId: data.id,
                    remark,
                  }).then(() => {
                    const updatedList = filteredStudentList.map(item => {
                      if (item.id === data.id) return { ...item, remark }
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

export default RemarksCell
