import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaStripe } from 'react-icons/fa'
import { LuBadgeInfo, LuLoader } from 'react-icons/lu'
import { useQueryClient } from 'react-query'
import { toast } from 'sonner'

import PaymentMethodImg from '@/assets/payout/payment-methods.png'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import usePayoutData from '@/hooks/usePayoutData'
import { useResponsive } from '@/hooks/useResponsive'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { ConfirmOptionsType } from '@/reducers/confirm.reducers'
import { StripeConnectStatus } from '@/types/stripe-connect'
import { goToExternalLink } from '@/utils/external-link.utils'

import EnableStripeToggle from '../Setting/EnableStripeToggle'

import PaymentSection from './PaymentSection'

const StripePaymentSection = ({
  onboardingMode,
}: {
  onboardingMode?: boolean
}): React.ReactElement => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isSafari } = useResponsive()
  const { siteData } = useSiteData()
  const {
    useFetchExpressAccountDetail,
    useFetchStripeConnectDetail,
    useCreateExpressStripeAccount,
    useConnectStripe,
  } = usePayoutData()
  const { schoolData } = useSchoolData()

  const queryClient = useQueryClient()
  const country = siteData.currentSite?.country
  const currentSchoolId = schoolData.currentSchool?.id

  const stripeDetailResult = useFetchStripeConnectDetail()
  const accountDetailResult = useFetchExpressAccountDetail(
    Boolean(stripeDetailResult.data?.stripeAccountId)
  )
  const { mutateAsync, isLoading } = useCreateExpressStripeAccount(
    async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.stripe.stripeConnectDetailSchoolKey],
      })
      await mutateConnectStripeAsync({
        institutionId: currentSchoolId as number,
      })
    },
    () => closeConfirm()
  )
  const {
    mutateAsync: mutateConnectStripeAsync,
    isLoading: isLoadingStripeConnection,
  } = useConnectStripe(data => {
    if (data && data.url) {
      toast.success(t('setting:paymentSetting.updateSuccess'))
      goToExternalLink(data.url, isSafari)
      closeConfirm()
    } else {
      toast.error(t('setting:paymentSetting.updateError'))
    }
  })
  const confirmParams = useMemo<ConfirmOptionsType>(() => {
    return {
      title: t('setting:paymentSetting.connectStripe') as string,
      description: t('setting:paymentSetting.createStripeAccountDescription', {
        country,
        email: accountDetailResult.data?.email,
      }).toString(),
      cancelText: t('common:action.cancel') as string,
      confirmText: t('common:action.confirm') as string,
      onConfirm: () => mutateAsync(currentSchoolId as number),
    } as ConfirmOptionsType
  }, [currentSchoolId, country, mutateAsync, t])

  const { setConfirm, closeConfirm } = useGlobalConfirm(
    isLoading || isLoadingStripeConnection
  )

  const footerAction = () => {
    return (
      <div className="flex flex-col sm:flex-row justify-end items-center py-2">
        <Button
          onClick={() => {
            if (!stripeDetailResult.data?.stripeAccountId) return
            try {
              const loginLink = `https://dashboard.stripe.com/b/${stripeDetailResult.data.stripeAccountId}`
              goToExternalLink(loginLink, isSafari)
            } catch (error) {
              console.error(error)
            }
          }}
        >
          {t('payout:goTo')}
          <FaStripe className="ml-1 size-9" />
        </Button>
      </div>
    )
  }

  const connectToStripe = (): React.ReactElement => {
    if (!accountDetailResult.data) {
      return <></>
    }

    return (
      <div className="flex flex-col sm:flex-row justify-end items-center py-2">
        <Button
          onClick={() =>
            mutateConnectStripeAsync({
              institutionId: currentSchoolId as number,
            })
          }
          disabled={isLoadingStripeConnection || isLoading}
        >
          {isLoadingStripeConnection || isLoading ? (
            <LuLoader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              {t('payout:stripe.connectTo')}
              <FaStripe className="ml-1 size-9" />
            </>
          )}
        </Button>
      </div>
    )
  }

  const buttonText = useMemo(() => {
    if (isLoadingStripeConnection || isLoading) {
      return <LuLoader className="mr-2 h-4 w-4 animate-spin" />
    }
    return t('payout:setup')
  }, [isLoadingStripeConnection, isLoading, t])

  const rightAction = useMemo(() => {
    return (
      !(accountDetailResult.isLoading || stripeDetailResult.isLoading) &&
      (stripeDetailResult.data && stripeDetailResult.data.stripeAccountId ? (
        <EnableStripeToggle
          stripeDetailResult={stripeDetailResult?.data}
          currentSchoolId={currentSchoolId as number}
        />
      ) : (
        <Button
          disabled={isLoadingStripeConnection}
          className="text-md"
          variant="link"
          onClick={() => setConfirm(confirmParams).open()}
        >
          {buttonText}
        </Button>
      ))
    )
  }, [
    accountDetailResult.isLoading,
    stripeDetailResult.isLoading,
    stripeDetailResult.data,
    currentSchoolId,
    isLoadingStripeConnection,
    buttonText,
    setConfirm,
    confirmParams,
  ])

  if (onboardingMode) {
    return (
      <div className="flex items-center gap-2">
        {stripeDetailResult?.data?.status === StripeConnectStatus.COMPLETE
          ? footerAction()
          : connectToStripe()}
        {rightAction}
      </div>
    )
  }
  return (
    <>
      <PaymentSection
        title="Online payment (Handled by Stripe)"
        isCenter
        rightAction={rightAction}
        footer={t('payout:helperStripeDashboard')}
        footerAction={
          stripeDetailResult?.data?.status === StripeConnectStatus.COMPLETE
            ? footerAction()
            : connectToStripe()
        }
      >
        <div className="box-row-full items-center justify-start">
          <img
            alt="payment-methods images"
            src={PaymentMethodImg}
            className="max-w-fit select-none"
          />
          <LuBadgeInfo
            className="text-gray-500 cursor-pointer ml-2"
            onClick={() => navigate('/settings/payments/info')}
          />
        </div>
      </PaymentSection>
    </>
  )
}
export default StripePaymentSection
