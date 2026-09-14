import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import BundleDiscount from '@/assets/promotion/bundlediscount.png'
import CouponIcon from '@/assets/promotion/couponIcon.png'
import Heading from '@/components/Texts/Heading'
import usePromotionData from '@/hooks/usePromotionData'
import useSiteData from '@/hooks/useSiteData'
import useSitesFeatureEnabled from '@/hooks/useSiteFeatureEnableData'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import useTrialLessonData from '@/hooks/useTrialLessonData'
import ContentLayout from '@/layouts/ContentLayout'
import { PromotionType } from '@/types/coupon'
import { SiteFeature } from '@/types/site-feature'

import PromotionCard from './components/PromotionCard'

const Promotion = (): JSX.Element => {
  const { t } = useTranslation()
  const { useFetchAllCouponData, useFetchAllBundleDiscountsData } =
    usePromotionData()
  const fetchCouponDataResult = useFetchAllCouponData()
  const { data } = fetchCouponDataResult
  const { checkSubscriptionAccess } = usePlanData()

  const hasAdditionalFeeAccess = true

  const hasBundleDiscountAccess = checkSubscriptionAccess(
    'promotionTier',
    PromotionType.BUNDLE_DISCOUNT
  )

  const { data: bundleDiscountData } = useFetchAllBundleDiscountsData()

  const { siteData } = useSiteData()
  const { useFetchSitesFeatureEnabled } = useSitesFeatureEnabled()
  const { data: sitesFeatureEnabled } = useFetchSitesFeatureEnabled()

  const enabledBundleDiscounts = useMemo(() => {
    if (!siteData?.currentSite?.id) return false
    if (!sitesFeatureEnabled) return true
    const bundleDiscounts = sitesFeatureEnabled.find(
      o => o.feature === SiteFeature.BundleDiscounts
    )
    return (
      !bundleDiscounts ||
      bundleDiscounts.siteIds.length === 0 ||
      bundleDiscounts.siteIds.includes(siteData.currentSite.id)
    )
  }, [sitesFeatureEnabled, siteData?.currentSite?.id])

  return (
    <ContentLayout
      leftHeader={<Heading>{t('component:menubar.promotion')}</Heading>}
    >
      <div className="box-row justify-start p-4">
        <PromotionCard
          icon={CouponIcon}
          title={t('promotion:titles.coupon')}
          numOfPromotion={data?.length || 0}
          haveAccess={hasAdditionalFeeAccess}
          url="/promotion/coupon-code"
        />

        {/* <PromotionCard
          icon={TrialIcon}
          title={t('promotion:titles.trial')}
          numOfPromotion={summaryTrialLessond || 0}
          haveAccess={hasTrialLessonAccess}
          url="/promotion/trial-lesson"
        /> */}
        {/* <PromotionCard
          icon={BundleDiscount}
          title={t('setting:additionalFee.title')}
          numOfPromotion={additionalFeeData?.length || 0}
          haveAccess={hasAdditionalFeeAccess}
          disabled
          url="/settings/additional-fee"
        /> */}
        {enabledBundleDiscounts && (
          <PromotionCard
            icon={BundleDiscount}
            title={t('promotion:titles.bundleDiscount')}
            numOfPromotion={bundleDiscountData?.length || 0}
            haveAccess={hasBundleDiscountAccess}
            url="/promotion/bundle-discounts"
          />
        )}
        {/* <PromotionCard
          icon={BundleDiscount}
          title={t('promotion:titles.directDiscount')}
          numOfPromotion={0}
          disabled
          url="/"
        /> */}
      </div>
    </ContentLayout>
  )
}

export default Promotion
