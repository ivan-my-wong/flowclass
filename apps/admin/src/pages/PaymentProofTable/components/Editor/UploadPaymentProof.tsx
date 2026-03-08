import { useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaUpload } from 'react-icons/fa'
import { LuPencil } from 'react-icons/lu'
import { MdSave } from 'react-icons/md'

import ZoomableImage from '@/components/Images/ZoomableImage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import useConfirm from '@/hooks/useGlobalConfirm'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import { useResponsive } from '@/hooks/useResponsive'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Invoice, PaymentEvidence } from '@/types/enrollCourse'

type PaymentAmountCellProps = {
  data: Invoice
  paymentEvidence?: PaymentEvidence
  refetch: () => void
}

const UploadPaymentProof = (props: PaymentAmountCellProps): JSX.Element => {
  const { data, refetch, paymentEvidence } = props

  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [paymentProofImg, setPaymentProofImg] = useState<File | undefined>()
  const [paymentProof, setPaymentProof] = useState<string | undefined>()

  const { useUploadPaymentProof } = usePaymentEvidenceData()
  const { mutateAsync: handleUpdate, isLoading } = useUploadPaymentProof()
  const { setConfirm, closeConfirm } = useConfirm(isLoading)

  const handleClose = () => {
    setIsOpen(prev => !prev)
    setPaymentProof(paymentEvidence?.image)
    setPaymentProofImg(undefined)
  }

  return (
    <>
      <div className="!flex !items-center group h-full">
        {!!paymentEvidence && (
          <Badge variant="secondary">
            {t('student:paymentProof.uploaded')}
          </Badge>
        )}
        <button type="button" className="ml-2" onClick={() => handleClose()}>
          <LuPencil className="text-primary hover:text-blue-600" />
        </button>
      </div>
      <ModalDialog
        open={isOpen}
        title={t('student:paymentProof.editPaymentProof') as string}
        onOpenChange={() => handleClose()}
        className="max-w-3xl"
        footer={
          <div className="box-row-full">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              {t('common:action.cancel')}
            </Button>

            <Button
              iconBefore={<MdSave />}
              onClick={() => {
                setIsOpen(false)
                setConfirm({
                  title: t(
                    'student:paymentProof.updatePaymentProofTitle'
                  ) as string,
                  description: t(
                    'student:paymentProof.updatePaymentProofDescription'
                  ) as string,
                  alertType: AlertTypes.WARN,
                  cancelText: t('common:action.cancel') as string,
                  confirmText: t('common:action.confirm') as string,
                  onConfirm: async () => {
                    await handleUpdate({
                      enrollId:
                        data?.enrollCourses?.[0]?.id ??
                        data?.enrollCourse?.id ??
                        null,
                      file: paymentProofImg as File,
                      institutionId: data.institutionId,
                      siteId: data.siteId,
                      invoiceId: data.id,
                      payLaterMethod: data.payLaterMethod ?? {},
                      token: data.proofToken || '',
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
        }
      >
        <div className="mb-4">
          <ZoomableImage
            src={paymentProof ?? ''}
            alt={t('student:paymentReceipt')}
            s3={paymentProof?.startsWith('data:image') ? undefined : 'private'}
            width={isDesktop ? '45rem' : '100%'}
            objectFit="contain"
            zoomInAriaLabel={t('student:paymentProof.zoomIn') as string}
            zoomOutAriaLabel={t('student:paymentProof.zoomOut') as string}
          />

          <div className="mt-4">
            <Button
              onClick={() => inputRef.current?.click()}
              className="w-full"
              iconBefore={<FaUpload />}
            >
              {t('student:paymentProof.upload')}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) {
                  setPaymentProofImg(file)
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    setPaymentProof(reader.result as string)
                  }
                  reader.readAsDataURL(file)
                }
                e.target.value = ''
              }}
              hidden
            />
          </div>
        </div>
      </ModalDialog>
    </>
  )
}

export default UploadPaymentProof
