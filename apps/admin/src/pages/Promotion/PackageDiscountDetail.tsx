import { useNavigate, useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import { Button } from '@/components/ui/Button'
import useCourseData from '@/hooks/useCourseData'
import usePromotionData from '@/hooks/usePromotionData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { formatCurrency } from '@/utils/currency'

const PackageDiscountDetail = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { packageDiscountId } = useParams<{ packageDiscountId: string }>()
  const parsedId = parseInt(packageDiscountId ?? '0', 10)

  const { useFetchPackageDiscountById } = usePromotionData()
  const { siteData } = useSiteData()
  const { courseData } = useCourseData()

  const { data, isLoading, isError } = useFetchPackageDiscountById(parsedId)
  const currency = siteData.currentSite?.currency ?? ''

  const headerBackButton: HeaderBackButtonStatus = {
    title: t('promotion:packageDiscount.detailTitle'),
    mode: 'back',
  }

  if (isLoading) {
    return (
      <ContentLayout headerBackButton={headerBackButton}>
        <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
          {t('common:loading')}
        </div>
      </ContentLayout>
    )
  }

  if (isError || !data) {
    return (
      <ContentLayout headerBackButton={headerBackButton}>
        <div className="p-6 text-center space-y-3">
          <p className="text-sm text-gray-500">
            {t('promotion:packageDiscount.notFound')}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/promotion/package-discounts')}
          >
            {t('common:action.back')}
          </Button>
        </div>
      </ContentLayout>
    )
  }

  // Resolve class names for the applicable IDs
  const classMap = new Map(
    courseData.courses.flatMap(course =>
      (course.classes ?? []).map(cls => [
        cls.id,
        `${cls.name} — ${course.name}`,
      ])
    )
  )

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      rightHeader={
        <Button
          variant="outline"
          onClick={() =>
            navigate(`/promotion/package-discounts/edit/${data.id}`)
          }
        >
          {t('common:action.edit')}
        </Button>
      }
    >
      <div className="p-6 max-w-lg space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">{data.name}</h2>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              data.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {data.isActive
              ? t('common:status.active')
              : t('common:status.inactive')}
          </span>
        </div>

        {/* Details */}
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">
              {t('promotion:packageDiscount.form.amountPerLesson')}
            </span>
            <span className="font-medium text-gray-900">
              {formatCurrency(data.amountPerLesson, currency)}{' '}
              {t('promotion:packageDiscount.perLesson')}
            </span>
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">
              {t('promotion:packageDiscount.applicableTo')}
            </span>
            <span className="font-medium text-gray-900">
              {data.isAllClasses
                ? t('promotion:packageDiscount.allClasses')
                : `${data.applicableClassIds?.length ?? 0} ${t(
                    'promotion:packageDiscount.classes'
                  )}`}
            </span>
          </div>
        </div>

        {/* Applicable classes list */}
        {!data.isAllClasses &&
          data.applicableClassIds &&
          data.applicableClassIds.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                {t('promotion:packageDiscount.form.selectClasses')}
              </h3>
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                {data.applicableClassIds.map(id => (
                  <li key={id} className="px-4 py-2 text-sm text-gray-800">
                    {classMap.get(id) ?? `Class #${id}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </ContentLayout>
  )
}

export default PackageDiscountDetail
