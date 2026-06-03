import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import PaginatedItems from '@/components/Pagination/Pagination'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import usePayoutData from '@/hooks/usePayoutData'
import ContentLayout from '@/layouts/ContentLayout'

import PaymentMethodItem from './PaymentMethodItem'
import StripePaymentSection from './StripePaymentSection'
import DivitSettingsSection from '../Divit/DivitSettingsSection'

const PaymentSettingsPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [perPage, _] = useState(10)
  const { useFetchPayoutMethodsNew } = usePayoutData()

  const { isLoading, isRefetching, data } = useFetchPayoutMethodsNew({
    page,
    num: perPage,
  })

  return (
    <ContentLayout
      leftHeader={<Heading>{t('payout:paymentMethod.')}</Heading>}
      rightHeader={
        <Button
          onClick={() => {
            navigate('/settings/payments/add')
          }}
          className="w-full"
        >
          {t(`payout:add`)}
        </Button>
      }
    >
      <div className="p-4 box-col-full">
        <StripePaymentSection />
        <DivitSettingsSection />
        {data?.meta && !(isLoading || isRefetching) && (
          <PaginatedItems
            meta={data?.meta}
            className="w-full md:flex"
            itemWrapperClassName="space-y-4 mb-4"
            isBottomPagination
            pageButtonProps={{
              onChangePage: page => setPage(page),
              onClickBack: () => {
                setPage(page - 1)
              },
              onClickNext: () => {
                setPage(page + 1)
              },
              next: 'Next',
              back: 'Back',
            }}
          >
            {data?.content &&
              data?.content.map(payout => (
                <PaymentMethodItem
                  data={payout}
                  key={`payment-method-${payout.id}`}
                />
              ))}
          </PaginatedItems>
        )}
        {(isLoading || isRefetching) && (
          <SkeletonLoader height="4rem" count={4} className="mt-4" />
        )}
      </div>
      <Outlet />
    </ContentLayout>
  )
}

export default PaymentSettingsPage
