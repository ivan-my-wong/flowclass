import { useTranslation } from 'react-i18next'
import { LuInfo } from 'react-icons/lu'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import useNavigateDialogPage from '@/hooks/useNavigateDialogPage'
import usePayoutData from '@/hooks/usePayoutData'
import { useResponsive } from '@/hooks/useResponsive'
import useSchoolData from '@/hooks/useSchoolData'

const ModalPaymentInfo = (): React.ReactElement => {
  const { t } = useTranslation()
  const { isSafari } = useResponsive()
  const { schoolData } = useSchoolData()
  const currentSchoolId = schoolData.currentSchool?.id
  const { isOpen, setIsOpen } = useNavigateDialogPage('/settings/payments')
  const { useFetchStripeConnectDetail, useConnectStripe } = usePayoutData()
  const stripeDetailResult = useFetchStripeConnectDetail()
  const {
    mutateAsync: mutateConnectStripeAsync,
    isLoading: isLoadingStripeConnection,
  } = useConnectStripe(data => {
    if (data && data.url) {
      toast.success(t('setting:paymentSetting.updateSuccess'))
      if (isSafari) {
        // Safari-specific code
        window.location.href = data.url
      } else {
        window.open(data.url, '_blank')
      }
      setIsOpen(false)
    } else {
      toast.error(t('setting:paymentSetting.updateError'))
    }
  })
  return (
    <ModalDialog
      title={t('payout:paymentInfo:title') as string}
      open={isOpen}
      onOpenChange={() => setIsOpen(false)}
      footer={
        currentSchoolId && (
          <Button
            className="w-full"
            size="md"
            loading={isLoadingStripeConnection}
            onClick={() => {
              mutateConnectStripeAsync({
                institutionId: currentSchoolId,
              })
            }}
          >
            {stripeDetailResult?.data?.stripeAccountId
              ? t('payout:goToStripe')
              : t('payout:paymentInfo:setupButton')}
            {/* } */}
          </Button>
        )
      }
    >
      <div className="w-full flex flex-col gap-y-4 text-left font-normal leading-5">
        <Alert>
          <LuInfo className="h-4 w-4" />
          <AlertDescription>
            {t('payout:paymentInfo:alertMessage')}
          </AlertDescription>
        </Alert>
        <p>{t('payout:paymentInfo:description')}</p>
        <p>{t('payout:paymentInfo:benefitDesc')}</p>
        <ul className="list-disc ml-8">
          <li>{t('payout:paymentInfo:benefitList:speed')}</li>
          <li>{t('payout:paymentInfo:benefitList:security')}</li>
          <li>{t('payout:paymentInfo:benefitList:reliable')}</li>
        </ul>
        <p>{t('payout:paymentInfo:notes')}</p>
      </div>
    </ModalDialog>
  )
}

export default ModalPaymentInfo
