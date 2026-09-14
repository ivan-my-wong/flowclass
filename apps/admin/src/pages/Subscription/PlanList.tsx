import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { HiOutlineArrowRight } from 'react-icons/hi2'
import { useQueryClient } from 'react-query'
import { useRecoilValue } from 'recoil'

import { handleApiError } from '@/api/errors/apiError'
import SubscriptionPlanRecordsTable from '@/components/Subscription/SubscriptionPlanRecordsTable'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import usePayoutData from '@/hooks/usePayoutData'
import { useResponsive } from '@/hooks/useResponsive'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import ContentLayout from '@/layouts/ContentLayout'
import { schoolSubscriptionState } from '@/stores/schoolSubscriptionData'

const PlanList = (): JSX.Element => {
  const { t } = useTranslation()
  const { isSafari } = useResponsive()
  const { useFetchStripeConnectDetail } = usePayoutData()
  const { useFetchSubscriptionPlanRecords } = usePlanData()

  const queryClient = useQueryClient()
  const invalidateQueries = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries(QUERY_KEY.site.getCurrentSchoolKey),
        queryClient.invalidateQueries(QUERY_KEY.site.getCurrentSchoolsSiteKey),
      ])
    } catch (error) {
      handleApiError({ error, t })
    }
  }

  // For regular view: get subscription plan records by institution
  const { data: siteSubscriptionPlanRecords } =
    useFetchSubscriptionPlanRecords(undefined)

  useEffect(() => {
    invalidateQueries()
  }, [])

  const { activePlan } = useRecoilValue(schoolSubscriptionState)
  const { data: stripeDetail } = useFetchStripeConnectDetail()

  const headerBackButton: HeaderBackButtonStatus = {
    title: t(`component:menubar.subscription`),
    mode: 'add',
  }

  return (
    <ContentLayout
      leftHeader={<Heading>{t(`subscription:mySubscription`)}</Heading>}
      headerBackButton={headerBackButton}
      rightHeader={
        <Button
          onClick={async () => {
            const loginLink = `https://dashboard.stripe.com/b/${stripeDetail?.stripeAccountId}`
            if (isSafari) {
              // Safari-specific code
              window.location.href = loginLink
            } else {
              window.open(loginLink, '_blank')
            }
          }}
          iconAfter={<HiOutlineArrowRight />}
          disabled={!stripeDetail}
        >
          {t('subscription:visitDashboard.title')}
        </Button>
      }
    >
      <div className="box-col p-4">
        {activePlan ? (
          <div className="space-y-6">
            {/* Current Plan Summary */}
            <div className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-bold mb-4">
                Current Subscription Plan Record
              </h2>
              <ul className="space-y-2">
                {Object.entries(activePlan).map(([key, value]) => (
                  <li key={key} className="flex gap-2">
                    <span className="font-semibold">{key}:</span>
                    <span>
                      {typeof value === 'object' && value !== null
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscription Records Table */}
            <SubscriptionPlanRecordsTable
              isAdminView={false}
              showAddButton={false}
              maxHeight="max-h-96"
              subscriptionPlanRecords={siteSubscriptionPlanRecords || []}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div>{t('subscription:noActivePlan')}</div>

            {/* Show empty subscription table */}
            <SubscriptionPlanRecordsTable
              isAdminView={false}
              showAddButton={false}
              maxHeight="max-h-96"
            />
          </div>
        )}
      </div>
    </ContentLayout>
  )
}

export default PlanList
