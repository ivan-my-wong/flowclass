import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'

import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { QUERY_KEY } from '@/constants/queryKey'
import usePlanData from '@/hooks/useSubscriptionPlanData'

import ClientSubscriptionPlan from './ClientSubscriptionPlan'

const CreateSubscriptionPage = (): JSX.Element => {
  const { t } = useTranslation()
  const { useFetchAllStripeProductPlanPrices } = usePlanData()

  const { isLoading, isError, isIdle, isSuccess } =
    useFetchAllStripeProductPlanPrices()

  const queryClient = useQueryClient()

  useEffect(() => {
    if (queryClient) {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.site.getCurrentSchoolKey],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.site.getCurrentSchoolsSiteKey],
      })
    }
  }, [queryClient])

  return (
    <div className="box-col">
      {isIdle && <FullScreenAlertBox text={t(`teachingService:noSchool`)} />}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && (
        <div className="box-col">
          <ClientSubscriptionPlan />
        </div>
      )}
    </div>
  )
}

export default CreateSubscriptionPage
