import { Fragment, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'
import { Invoice } from '@/types/enrollCourse'
import { formatCurrency } from '@/utils/currency'

const ToBeReviewedCardItem = ({
  title,
  value,
  onReview,
}: {
  title: string
  value: string
  onReview: () => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="w-full flex flex-row justify-between items-center py-2">
      <div className="flex flex-col flex-1">
        <Text variant="disabled" className="text-lg">
          {title}
        </Text>
        <Text variant="disabled" className="text-base !text-gray-500">
          {value}
        </Text>
      </div>
      <Button variant="link" className="text-base" onClick={onReview}>
        {t('onboarding:dashboard.review')}
      </Button>
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-text-disabled" />
}

export const ToBeReviewedCard = ({ invoices }: { invoices: Invoice[] }) => {
  const navigate = useNavigate()
  const invoicesToReview = useMemo(() => {
    return invoices.slice(0, 5)
  }, [invoices])

  const { t } = useTranslation()

  return (
    <Box className="flex flex-col rounded-md">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-row items-center gap-2">
          <Text variant="disabled" className="text-lg">
            {t('onboarding:dashboard.toBeReviewed')}
          </Text>
          <Badge>{invoices.length}</Badge>
        </div>
        <Button
          variant="link"
          className="text-base"
          onClick={() => {
            navigate('/application')
          }}
        >
          {t('onboarding:dashboard.allRecords')}
        </Button>
      </div>
      <Divider />
      <div className="flex flex-col w-full">
        {invoicesToReview.length > 0 ? (
          invoicesToReview.map((invoice, index) => (
            <Fragment key={`${invoice.id} ${index}`}>
              <ToBeReviewedCardItem
                title={invoice.payBy}
                value={formatCurrency(invoice.payAmount, invoice.currency)}
                onReview={() => {
                  navigate(
                    `/application?paymentStatus=awaitingReviewProof%2CawaitingReviewWithoutProof&search=${invoice.payBy}`
                  )
                }}
              />
              {index !== invoicesToReview.length - 1 && <Divider />}
            </Fragment>
          ))
        ) : (
          <div className="flex flex-col w-full">
            <Text variant="disabled" className="text-lg">
              {t('onboarding:dashboard.noData')}
            </Text>
          </div>
        )}
      </div>
    </Box>
  )
}
