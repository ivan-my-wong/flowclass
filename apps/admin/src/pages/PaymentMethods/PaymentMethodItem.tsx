import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import Switch from '@/components/Toggle/Switch'
import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import usePayoutData from '@/hooks/usePayoutData'
import { ConfirmOptionsType } from '@/reducers/confirm.reducers'
import { Payout } from '@/types/payout'

import PaymentAction from './PaymentAction'
import PaymentSection from './PaymentSection'

type PropsType = {
  data: Payout
}
export default ({ data }: PropsType): React.ReactElement => {
  const { t } = useTranslation()
  const { useCreatePayoutMethod } = usePayoutData()

  const onUpdateSuccess = () => {
    closeConfirm()
  }
  const { mutateAsync: createPayout, isLoading } = useCreatePayoutMethod(
    onUpdateSuccess,
    () => {
      closeConfirm()
    }
  )
  const { setConfirm, closeConfirm } = useGlobalConfirm(isLoading)
  const confirmParams = useMemo<ConfirmOptionsType>(() => {
    return {
      title: (data?.enabled
        ? t('payout:payoutToggle.disableTitle')
        : t('payout:payoutToggle.enableTitle')
      ).toString(),
      description: (data?.enabled
        ? t('payout:payoutToggle.disableDescription')
        : t('payout:payoutToggle.enableDescription')
      ).toString(),
      cancelText: t('common:action.cancel') as string,
      confirmText: t('common:action.confirm') as string,
      onConfirm: async () => {
        await createPayout({
          ...data,
          enabled: !data.enabled,
        })
      },
    }
  }, [createPayout, data, t])
  return (
    <PaymentSection
      key={`payment-method-${data.id}`}
      title={data.methodName}
      additionalAction={
        <Switch
          className="!justify-start w-fit"
          checked={data.enabled}
          dataTestId="switch-btn"
          onCheckedChange={() => {
            setConfirm(confirmParams).open()
          }}
        />
      }
      rightAction={<PaymentAction payment={data} />}
    >
      <p className="text-sm">{data.description}</p>
    </PaymentSection>
  )
}
