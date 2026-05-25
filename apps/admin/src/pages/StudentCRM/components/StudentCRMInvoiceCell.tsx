import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { HiOutlinePencilSquare } from 'react-icons/hi2'
import { LuExternalLink } from 'react-icons/lu'
import { MdOutlineDelete, MdSave } from 'react-icons/md'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import { updateInvoiceRemark } from '@/api/invoice'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import TextArea from '@/components/ui/TextAreaBase'
import { SingleStudentCrmRecordEnrolledClassesInvoice } from '@/types/student'

import { handleStatusPayment } from './TeachingServiceEnrolledRow'

type Props = {
  invoice: SingleStudentCrmRecordEnrolledClassesInvoice | null
}

const StudentCRMInvoiceCell = ({ invoice }: Props): JSX.Element => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [remark, setRemark] = useState(invoice?.remark ?? '')

  const { mutate: saveRemark, isLoading } = useMutation(
    (value: string) => updateInvoiceRemark(invoice!.id, value || null),
    {
      onSuccess: () => {
        setIsOpen(false)
      },
      onError: () => {
        toast.error(t('common:error.unexpectedError'))
      },
    }
  )

  const { mutate: deleteRemark } = useMutation(
    () => updateInvoiceRemark(invoice!.id, null),
    {
      onSuccess: () => {
        setRemark('')
      },
      onError: () => {
        toast.error(t('common:error.unexpectedError'))
      },
    }
  )

  const paymentStatus = invoice
    ? handleStatusPayment(invoice.paymentState ?? '', t)
    : null

  return (
    <>
      <div className="flex items-center gap-2 w-full min-h-[72px] py-1 flex-wrap">
        {paymentStatus}
        {invoice && (
          <>
            <p className="text-[11px] text-gray-500 truncate min-w-0 flex-1">
              {remark}
            </p>
            <button
              type="button"
              className="cursor-pointer shrink-0"
              onClick={() => {
                setRemark(invoice.remark ?? '')
                setIsOpen(true)
              }}
            >
              <HiOutlinePencilSquare
                className="text-primary hover:text-blue-600"
                size={13}
              />
            </button>
            {!!remark && (
              <button
                type="button"
                className="cursor-pointer shrink-0"
                onClick={() => deleteRemark()}
              >
                <MdOutlineDelete
                  className="text-destructive hover:text-red-600"
                  size={13}
                />
              </button>
            )}
          </>
        )}
      </div>

      {invoice && (
        <ModalDialog
          open={isOpen}
          title={t('student:invoiceRemark.editTitle') as string}
          onOpenChange={() => setIsOpen(false)}
          className="max-w-md"
        >
          <div className="mb-4">
            <TextArea
              value={remark}
              onChange={e => setRemark(e.target.value)}
            />
            <Button
              className="mt-4 w-full"
              iconBefore={<MdSave />}
              loading={isLoading}
              onClick={() => saveRemark(remark)}
            >
              {t('common:action.update')}
            </Button>
          </div>
        </ModalDialog>
      )}
    </>
  )
}

export default StudentCRMInvoiceCell
