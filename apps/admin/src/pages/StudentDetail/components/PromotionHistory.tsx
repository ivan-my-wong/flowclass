import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { getCoupon } from '@/api/student'
import { Spinner } from '@/components/Loaders/Spinner'
import Separator from '@/components/Separators/Separator'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import CouponCard from '@/pages/Promotion/components/CouponCard'
import CreateCouponCode from '@/pages/Promotion/Coupons/CreateCouponCode'
import WhatsappButton from '@/pages/StudentCRM/components/WhatsappButton'
import { promotionState } from '@/stores/promotionData'
import { requiredParamsState } from '@/stores/requiredParamsData'
import { Coupon, CouponStatusEnum } from '@/types/coupon'
import { StudentUser } from '@/types/user'
import { formatTs } from '@/utils/timeFormat'

type Props = {
  personalInfo: StudentUser
  tabName: string
}
const Promotion = ({ personalInfo, tabName }: Props): React.ReactElement => {
  const [couponData, setCouponData] = useRecoilState(promotionState)
  const [searchParams, setSearchParams] = useSearchParams()
  const param = useParams()
  const studentId = param.id
  const [isOpenCreatePage, setIsOpenCreatePage] = useState<boolean>(false)
  const [isLoadData, setIsLoadData] = useState(false)
  const { t } = useTranslation()
  const requiredParams = useRecoilValue(requiredParamsState)
  const handleCreateCoupon = () => {
    const urlSearchParams = searchParams.toString()
    setSearchParams(prev => ({
      ...prev,
      back: `/student-record/${studentId}?${urlSearchParams}`,
      userId: requiredParams.userId,
      name: personalInfo.firstName,
    }))
    setIsOpenCreatePage(!isOpenCreatePage)
  }
  const [coupons, setCoupons] = useState<Coupon[]>()

  const queryClient = useQueryClient()
  const { isLoading } = useQuery(
    [QUERY_KEY.promotion.getStudentCouponKey],
    () => {
      const params = {
        institutionId: requiredParams.institutionId,
        userId: requiredParams.userId,
        siteId: requiredParams.siteId ?? 0,
      }
      return getCoupon(params)
    },
    {
      onSuccess: rs => {
        setCoupons(rs.data)
        setCouponData({ ...couponData, coupons: rs.data })
        setIsLoadData(false)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      enabled: !!requiredParams.userId,
    }
  )
  useEffect(() => {
    // Refetch data after close create page and also when isLoadData is triggered by the coupon card
    if (!isOpenCreatePage || isLoadData) {
      queryClient.invalidateQueries([QUERY_KEY.promotion.getStudentCouponKey])
    }
  }, [isOpenCreatePage, isLoadData])

  if (isLoading)
    return (
      <div className="flex justify-center text-center">
        <Spinner size="small" />
      </div>
    )

  return (
    <Box border direction="col" id={tabName} padding="base">
      <Box justify="between">
        <Heading size="smallMedium">{t('student:coupon.title')}</Heading>
        <Button
          disabled={personalInfo.isDeleted ?? false}
          onClick={handleCreateCoupon}
        >
          {t('student:coupon.add')}
        </Button>
      </Box>
      <Separator margin="large" />
      <Box
        direction="row"
        responsive
        justify="start"
        gap="lg"
        className="flex-wrap"
      >
        {coupons &&
          coupons.map(coupon => {
            const amountInString =
              coupon.discountType === 'percentage'
                ? `${coupon.amount}%`
                : `$${coupon.amount}`

            const expireDate = coupon.expireDate ?? ''

            const { usedCount } = coupon

            const messageToBeCopied = `${requiredParams.institutionId} ${t(
              'promotion:dialog:descriptionCopyMessage'
            )} ${amountInString}! ${t(
              'promotion:dialog:descriptionCopyMessage1'
            )} ${coupon.code} ${t(
              'promotion:dialog:descriptionCopyMessage2'
            )} ${formatTs(expireDate.toString(), 'DD MMM YYYY')}`

            return (
              <Box key={coupon.id}>
                <CouponCard
                  width="100%"
                  id={coupon.id || 0}
                  code={coupon.code}
                  quota={coupon.quota}
                  amount={amountInString}
                  isActive={coupon.status === CouponStatusEnum.active}
                  description=""
                  usage={usedCount}
                  date={expireDate.toString()}
                  handleReload={() => setIsLoadData(true)}
                />
                <WhatsappButton
                  type="custom"
                  phone={personalInfo.phone ?? ''}
                  params={{}}
                  customMessage={messageToBeCopied}
                />
              </Box>
            )
          })}
      </Box>
      <CreateCouponCode
        open={isOpenCreatePage}
        handleClose={() => setIsOpenCreatePage(false)}
      />
    </Box>
  )
}
export default Promotion
