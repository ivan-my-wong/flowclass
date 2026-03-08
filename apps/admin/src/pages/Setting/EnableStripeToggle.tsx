import { useEffect, useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { toast } from 'sonner'

import Switch from '@/components/Toggle/Switch'
import { QUERY_KEY } from '@/constants/queryKey'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import usePayoutData from '@/hooks/usePayoutData'
import { ConfirmOptionsType } from '@/reducers/confirm.reducers'
import {
  StripeConnectDetail,
  StripeConnectStatus,
} from '@/types/stripe-connect'

const EnableStripeToggle = ({
  stripeDetailResult,
  currentSchoolId,
}: {
  stripeDetailResult: StripeConnectDetail
  currentSchoolId: number
}): JSX.Element => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { useEnableStripe } = usePayoutData()
  const { mutateAsync: enableStripeMutate, isLoading } = useEnableStripe(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY.stripe.stripeConnectDetailSchoolKey],
    })
    closeConfirm()
  })
  const confirmParams = useMemo<ConfirmOptionsType>(() => {
    return {
      title: (stripeDetailResult.enabled
        ? t('payout:payoutToggle.disableTitle')
        : t('payout:payoutToggle.enableTitle')
      ).toString(),
      description: (stripeDetailResult.enabled
        ? t('payout:payoutToggle.disableDescription')
        : t('payout:payoutToggle.enableDescription')
      ).toString(),
      cancelText: t('common:action.cancel') as string,
      confirmText: t('common:action.confirm') as string,
      onConfirm: () =>
        enableStripeMutate({
          enabled: !stripeDetailResult.enabled,
          schoolId: currentSchoolId,
        }),
    }
  }, [stripeDetailResult.enabled, currentSchoolId, enableStripeMutate, t])
  const { setConfirm, setLoading, closeConfirm } = useGlobalConfirm(isLoading)
  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])
  return (
    <div className="w-fit">
      <Switch
        checked={stripeDetailResult.enabled}
        disabled={isLoading}
        onCheckedChange={() => {
          if (stripeDetailResult.status === StripeConnectStatus.COMPLETE) {
            setConfirm(confirmParams).open()
          } else {
            toast.error(t('payout:payoutToggle.haveNotConnected'))
          }
        }}
      />
    </div>
  )
}
export default EnableStripeToggle
