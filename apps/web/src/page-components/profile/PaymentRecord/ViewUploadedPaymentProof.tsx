import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'

import { LucideExternalLink } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import ImageAspect from '@/components/Images/ImageAspect'
import InfoDialog from '@/components/Popups/InfoDialog'
import { PaymentReports } from '@/types/profile'
import { getUrlPaymentView } from '@/utils/profile'

type ViewUploadedPaymentProofProps = {
  data?: PaymentReports
  refetch: () => void
  schoolUrl: string
}

const ViewUploadedPaymentProof = ({
  data,
  refetch,
  schoolUrl,
}: ViewUploadedPaymentProofProps): React.ReactElement => {
  const { t } = useTranslation()
  const router = useRouter()

  const [showInfoDialog, setShowInfoDialog] = useState(false)

  const handleOpen = useCallback(() => {
    setShowInfoDialog(!showInfoDialog)
  }, [showInfoDialog])

  const isLoading = !data

  const uploadReceiptUrl = useMemo(() => {
    if (!data) return ''
    return getUrlPaymentView({
      proofToken: data?.proofToken,
      enrollId: data?.enrollCourses?.at(0)?.id,
      enrollIds: (data?.enrollCourses ?? []).map(enroll => enroll.id.toString()).join(','),
      paymentState: data?.paymentState,
      schoolPath: schoolUrl ?? '',
      coursePath: data?.course?.path,
    })
  }, [data, schoolUrl])

  const handleClose = () => {
    setShowInfoDialog(false)
    refetch()
  }

  const handleReUpload = () => {
    if (uploadReceiptUrl) {
      router.push(uploadReceiptUrl)
      handleClose()
    }
  }

  const hasPaymentProof = !!data?.paymentProof

  return (
    <InfoDialog
      key={'view-uploaded-payment-proof'}
      title={
        hasPaymentProof
          ? t('profile:viewUploadedPaymentProof')
          : t('profile:paymentProofWithoutReceipt')
      }
      description={hasPaymentProof ? '' : t('profile:paymentProofWithoutReceiptDesc')}
      trigger={
        <Button className="w-full lg:w-fit" variant="outlined" onClick={handleOpen}>
          {t('profile:viewUploadedPaymentProof')}
        </Button>
      }
      open={showInfoDialog}
      setOpen={handleOpen}
    >
      <div className="flex flex-col items-center gap-4">
        {hasPaymentProof && data?.paymentProof && (
          <ImageAspect
            src={data.paymentProof}
            alt={t('profile:viewUploadedPaymentProof')}
            ratio={4 / 3}
            className="max-w-full rounded-lg"
            imgClassName="object-contain"
          />
        )}
        <Button
          variant="textPrimary"
          onClick={handleReUpload}
          disabled={isLoading || !uploadReceiptUrl}
          iconAfter={<LucideExternalLink size={18} />}
        >
          {hasPaymentProof ? t('profile:reUploadPaymentProof') : t('profile:uploadPaymentProof')}
        </Button>
      </div>
    </InfoDialog>
  )
}

export default ViewUploadedPaymentProof
