import React from 'react'

import { CalendarIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { BundleDiscount } from '@/types/bundleDiscounts'
import { DiscountType } from '@/types/coupon'

interface BundleDetailViewProps {
  bundle: BundleDiscount
  currency?: string
  onEdit?: () => void
  onClose?: () => void
  showActions?: boolean
}

const BundleDetailView: React.FC<BundleDetailViewProps> = ({
  bundle,
  currency = 'HK$',
  onEdit,
  onClose,
  showActions = true,
}) => {
  const { t } = useTranslation()
  const locale = navigator.language || 'zh-HK'
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDiscount = (discount: number, discountType: string) => {
    if (discountType === DiscountType.PERCENTAGE) {
      return `${discount}%`
    }
    return `${currency}${discount.toLocaleString()}`
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? { backgroundColor: '$green3', color: '$green11' }
      : { backgroundColor: '$red3', color: '$red11' }
  }

  // Helper function to get bundle data - prioritize amount/minQty over bundleTable
  const getBundleData = () => {
    if (bundle.bundleTable && bundle.bundleTable.length > 0) {
      // Legacy bundleTable format
      return {
        hasTiers: true,
        tierCount: bundle.bundleTable.length,
        minQuantity: Math.min(...bundle.bundleTable.map(t => t.amount)),
        maxDiscount: Math.max(...bundle.bundleTable.map(t => t.discount)),
        tiers: bundle.bundleTable,
      }
    }
    // New simplified format using amount and minQty
    return {
      hasTiers: false,
      tierCount: 1,
      minQuantity: bundle.minQty,
      maxDiscount: bundle.amount,
      tiers: [{ amount: bundle.minQty, discount: bundle.amount }],
    }
  }

  const bundleData = getBundleData()

  return (
    <Box
      direction="column"
      css={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
    >
      {/* Header */}
      <Box
        direction="row"
        justify="space-between"
        align="center"
        css={{
          padding: '$4',
          borderBottom: '1px solid $borderColor',
          marginBottom: '$4',
        }}
      >
        <Box direction="column">
          <Heading css={{ fontSize: '$6', fontWeight: 600 }}>
            {bundle.name}
          </Heading>
          <Text css={{ color: '$gray11', fontSize: '$3' }}>
            {t('bundleDiscount.detail.campaignLabel')}
          </Text>
        </Box>

        {showActions && (
          <Box direction="row" css={{ gap: '$2' }}>
            {onEdit && (
              <Button onClick={onEdit}>
                {t('promotion:bundleDiscount.detail.editCampaign')}
              </Button>
            )}
            {onClose && (
              <Button onClick={onClose}>
                {t('promotion:bundleDiscount.detail.close')}
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Status and Basic Info */}
      <Box direction="column" css={{ gap: '$4', marginBottom: '$6' }}>
        <Box direction="row" css={{ gap: '$3', flexWrap: 'wrap' }}>
          <Box
            css={{
              padding: '$2 $3',
              borderRadius: '$2',
              fontSize: '$2',
              fontWeight: 500,
              ...getStatusColor(bundle.isActive),
            }}
          >
            {bundle.isActive
              ? t('common:status.active')
              : t('common:status.inactive')}{' '}
          </Box>

          {bundle.isAutoApply && (
            <Box
              css={{
                padding: '$2 $3',
                borderRadius: '$2',
                fontSize: '$2',
                fontWeight: 500,
                backgroundColor: '$blue3',
                color: '$blue11',
              }}
            >
              {t('bundleDiscount.detail.autoApply')}
            </Box>
          )}

          {bundle.isRetroactive && (
            <Box
              css={{
                padding: '$2 $3',
                borderRadius: '$2',
                fontSize: '$2',
                fontWeight: 500,
                backgroundColor: '$purple3',
                color: '$purple11',
              }}
            >
              {t('promotion:bundleDiscount.detail.retroactive')}
            </Box>
          )}

          <Box
            css={{
              padding: '$2 $3',
              borderRadius: '$2',
              fontSize: '$2',
              fontWeight: 500,
              backgroundColor: bundle.isAllItems ? '$yellow3' : '$orange3',
              color: bundle.isAllItems ? '$yellow11' : '$orange11',
            }}
          >
            {bundle.isAllItems
              ? t('bundleDiscount.detail.allItems')
              : t('bundleDiscount.detail.specificItems', {
                  count: bundle.applicableItemIds?.length || 0,
                })}
          </Box>
        </Box>
      </Box>

      {/* Campaign Details Grid */}
      <Box
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '$4',
          marginBottom: '$6',
        }}
      >
        <Box
          css={{
            padding: '$4',
            border: '1px solid $borderColor',
            borderRadius: '$3',
            backgroundColor: '$gray1',
          }}
        >
          <Text css={{ fontWeight: 600, color: '$gray12', marginBottom: '$2' }}>
            {t('promotion:bundleDiscount.detail.discountType')}
          </Text>
          <Text css={{ fontSize: '$4', textTransform: 'capitalize' }}>
            {bundle.discountType}
          </Text>
        </Box>

        <Box
          css={{
            padding: '$4',
            border: '1px solid $borderColor',
            borderRadius: '$3',
            backgroundColor: '$gray1',
          }}
        >
          <Text css={{ fontWeight: 600, color: '$gray12', marginBottom: '$2' }}>
            {t('promotion:bundleDiscount.detail.bundleTiers')}
          </Text>
          <Text css={{ fontSize: '$4' }}>
            {bundleData.tierCount}{' '}
            {bundleData.tierCount !== 1
              ? t('promotion:bundleDiscount.detail.tiers')
              : t('promotion:bundleDiscount.detail.tier')}
          </Text>
        </Box>

        <Box
          css={{
            padding: '$4',
            border: '1px solid $borderColor',
            borderRadius: '$3',
            backgroundColor: '$gray1',
          }}
        >
          <Text css={{ fontWeight: 600, color: '$gray12', marginBottom: '$2' }}>
            {t('promotion:bundleDiscount.detail.minQuantity')}
          </Text>
          <Text css={{ fontSize: '$4' }}>
            {bundleData.minQuantity}{' '}
            {t('promotion:bundleDiscount.detail.items')}
          </Text>
        </Box>

        <Box
          css={{
            padding: '$4',
            border: '1px solid $borderColor',
            borderRadius: '$3',
            backgroundColor: '$gray1',
          }}
        >
          <Text css={{ fontWeight: 600, color: '$gray12', marginBottom: '$2' }}>
            {t('promotion:bundleDiscount.detail.discountAmount')}
          </Text>
          <Text css={{ fontSize: '$4', color: '$green11', fontWeight: 600 }}>
            {formatDiscount(bundleData.maxDiscount, bundle.discountType)}
          </Text>
        </Box>
      </Box>

      {/* Bundle Tiers Table */}
      <Box css={{ marginBottom: '$6' }}>
        <Heading css={{ fontSize: '$4', marginBottom: '$3' }}>
          {t('promotion:bundleDiscount.detail.bundleDetails')}
        </Heading>
        <Box
          css={{
            border: '1px solid $borderColor',
            borderRadius: '$3',
            overflow: 'hidden',
          }}
        >
          <Box
            css={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0',
              backgroundColor: '$gray3',
              padding: '$3',
              borderBottom: '1px solid $borderColor',
            }}
          >
            <Text css={{ fontWeight: 600 }}>
              {t('promotion:bundleDiscount.detail.minimumQuantity')}
            </Text>
            <Text css={{ fontWeight: 600 }}>
              {t('promotion:bundleDiscount.detail.discount')}
            </Text>
          </Box>

          {bundleData.tiers.map((tier, index) => (
            <Box
              key={`tier-${tier.amount}-${tier.discount}`}
              css={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0',
                padding: '$3',
                borderBottom:
                  index < bundleData.tiers.length - 1
                    ? '1px solid $borderColor'
                    : 'none',
                '&:hover': { backgroundColor: '$gray2' },
              }}
            >
              <Text>
                {tier.amount} {t('promotion:bundleDiscount.detail.items')}
              </Text>
              <Text css={{ color: '$green11', fontWeight: 500 }}>
                {formatDiscount(tier.discount, bundle.discountType)}{' '}
                {t('promotion:bundleDiscount.detail.off')}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Campaign Period */}
      <Box css={{ marginBottom: '$6' }}>
        <Heading css={{ fontSize: '$4', marginBottom: '$3' }}>
          {t('promotion:bundleDiscount.detail.campaignPeriod')}
        </Heading>
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: '$3',
            padding: '$4',
            border: '1px solid $borderColor',
            borderRadius: '$3',
            backgroundColor: '$blue1',
          }}
        >
          <CalendarIcon
            style={{ width: 20, height: 20, color: 'var(--colors-blue11)' }}
          />
          <Text css={{ fontSize: '$3' }}>
            <strong>{t('promotion:bundleDiscount.detail.start')}</strong>{' '}
            {formatDateOnly(bundle.startDate)}
          </Text>
          <Text css={{ color: '$gray9' }}>{t('common:to')}</Text>
          <Text css={{ fontSize: '$3' }}>
            <strong>{t('promotion:bundleDiscount.detail.end')}</strong>{' '}
            {formatDateOnly(bundle.endDate)}
          </Text>
        </Box>
      </Box>

      {/* Applicable Items */}
      {bundle.applicableItemIds && bundle.applicableItemIds.length > 0 && (
        <Box css={{ marginBottom: '$6' }}>
          <Box
            direction="row"
            justify="space-between"
            align="center"
            css={{ marginBottom: '$3' }}
          >
            <Heading css={{ fontSize: '$4' }}>
              {t('promotion:bundleDiscount.detail.applicableItemIds')}
            </Heading>
          </Box>
          <Box
            css={{
              padding: '$3',
              border: '1px solid $borderColor',
              borderRadius: '$3',
              backgroundColor: '$gray1',
              fontFamily: 'monospace',
              fontSize: '$2',
              wordBreak: 'break-all',
            }}
          >
            {bundle.applicableItemIds.join(', ')}
          </Box>
        </Box>
      )}

      {/* Metadata */}
      <Box
        css={{
          padding: '$4',
          border: '1px solid $borderColor',
          borderRadius: '$3',
          backgroundColor: '$gray1',
        }}
      >
        <Heading css={{ fontSize: '$3', marginBottom: '$3', color: '$gray11' }}>
          {t('promotion:bundleDiscount.detail.campaignMetadata')}
        </Heading>
        <Box
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '$3',
            fontSize: '$2',
          }}
        >
          <Box>
            <Text css={{ fontWeight: 600, color: '$gray11' }}>
              {t('promotion:bundleDiscount.detail.campaignId')}
            </Text>
            <Text>{bundle.id}</Text>
          </Box>
          <Box>
            <Text css={{ fontWeight: 600, color: '$gray11' }}>
              {t('promotion:bundleDiscount.detail.created')}
            </Text>
            <Text>{formatDate(bundle.createdAt)}</Text>
          </Box>
          <Box>
            <Text css={{ fontWeight: 600, color: '$gray11' }}>
              {t('promotion:bundleDiscount.detail.lastUpdated')}
            </Text>
            <Text>{formatDate(bundle.updatedAt)}</Text>
          </Box>
          <Box>
            <Text css={{ fontWeight: 600, color: '$gray11' }}>
              {t('promotion:bundleDiscount.detail.stackable')}
            </Text>
            <Text>
              {bundle.isStackable
                ? t('promotion:bundleDiscount.detail.yes')
                : t('promotion:bundleDiscount.detail.no')}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default BundleDetailView
