import { useState } from 'react'

import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import InfoDialog from '@/components/Popups/InfoDialog'

const ViewPaymentProof = ({ image }: { image?: string }) => {
  const { t } = useTranslation()
  const [showInfoDialog, setShowInfoDialog] = useState(false)

  return (
    <InfoDialog
      key={'dialog-view-uploaded-payment-proof'}
      title={t('school:profile.viewUploadedPaymentProof')}
      description={''}
      setOpen={setShowInfoDialog}
      trigger={
        <Button
          variant={image ? undefined : 'disabled'}
          className="h-[35px] w-full text-sm md:w-[250px]"
          disabled={!image}
          onClick={() => setShowInfoDialog(true)}
        >
          {t('school:profile.viewUploadedPaymentProof')}
        </Button>
      }
      open={showInfoDialog}
    >
      <div className="flex justify-center">
        <img src={image} className="max-h-[600px]" alt="payment proof" />
      </div>
    </InfoDialog>
  )
}

export default ViewPaymentProof
