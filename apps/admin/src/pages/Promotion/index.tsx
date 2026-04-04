import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import BundleDiscountIcon from '@/assets/promotion/bundlediscount.png'
import CouponIcon from '@/assets/promotion/couponIcon.png'
import Heading from '@/components/Texts/Heading'
import usePromotionData from '@/hooks/usePromotionData'
import useSiteData from '@/hooks/useSiteData'
import useSitesFeatureEnabled from '@/hooks/useSiteFeatureEnableData'
import ContentLayout from '@/layouts/ContentLayout'
import { SiteFeature } from '@/types/site-feature'

import PromotionCard from './components/PromotionCard'

const Promotion = (): JSX.Element => {
  const { t } = useTranslation()
  const {
    useFetchAllCouponData,
    useFetchAllBundleDiscountsData,
    useFetchAllPackageDiscountsData,
  } = usePromotionData()
  const fetchCouponDataResult = useFetchAllCouponData()
  const { data } = fetchCouponDataResult
  const hasAdditionalFeeAccess = true
  const hasBundleDiscountAccess = true

  const { data: bundleDiscountData } = useFetchAllBundleDiscountsData()
  const { data: packageDiscountData } = useFetchAllPackageDiscountsData()

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

  const enabledPackageDiscounts = useMemo(() => {
    if (!siteData?.currentSite?.id) return false
    if (!sitesFeatureEnabled) return true
    const packageDiscounts = sitesFeatureEnabled.find(
      o => o.feature === SiteFeature.PackageDiscounts
    )
    return (
      !packageDiscounts ||
      packageDiscounts.siteIds.length === 0 ||
      packageDiscounts.siteIds.includes(siteData.currentSite.id)
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

        {enabledBundleDiscounts && (
          <PromotionCard
            icon={BundleDiscountIcon}
            title={t('promotion:titles.bundleDiscount')}
            numOfPromotion={bundleDiscountData?.length || 0}
            haveAccess={hasBundleDiscountAccess}
            url="/promotion/bundle-discounts"
          />
        )}
        {enabledPackageDiscounts && (
          <PromotionCard
            icon={BundleDiscountIcon}
            title={t('promotion:titles.packageDiscount')}
            numOfPromotion={packageDiscountData?.length || 0}
            haveAccess
            url="/promotion/package-discounts"
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
