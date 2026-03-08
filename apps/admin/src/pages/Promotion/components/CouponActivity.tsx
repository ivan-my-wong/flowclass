import { useState } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import { siteState } from '@/stores/siteData'
import { formatCurrency } from '@/utils/currency'

import AdminIcon from '../../../assets/svgs/promotion/AdminIcon'
import StudentIcon from '../../../assets/svgs/promotion/StudentIcon'
import ViewIcon from '../../../assets/svgs/ViewIcon'
import Button from '../../../components/Buttons/Button'
import Box from '../../../components/Containers/Box'
import SvgIcon from '../../../components/Images/SvgIcon'
import Text from '../../../components/Texts/Text'
import {
  ClassProps,
  Coupon,
  CouponTypeHistoryEnum,
  HistoryCouponProps,
} from '../../../types/coupon'
import { formatTs } from '../../../utils/timeFormat'

type CouponInformationProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  currentCoupon: Coupon
  history: HistoryCouponProps
}

const CreateCoupon = ({ history }: CouponInformationProps) => {
  const { t } = useTranslation()
  return (
    <Box
      direction="column"
      align="flex-start"
      css={{
        borderBottom: '1px solid $colors$textDisabled',
        paddingBottom: '$4',
      }}
    >
      <Box justify="space-between" align="center" css={{ padding: '$3 0' }}>
        <Box justify="flex-start" align="center">
          <AdminIcon />
          <Text>
            {formatTs(history.createdAt.toString(), 'DD MMM YYYY - HH:mm')}
          </Text>
        </Box>
      </Box>
      {
        history.type === 'CREATE_COUPON' && (
          <Text size="medium" css={{ fontWeight: '' }}>
            {`${history.detail.educatorFirstName ?? ''} ${
              history.detail.educatorLastName ?? ''
            } ${t('promotion:coupons.history.createdCoupon')}`}
          </Text>
        )
        //  : (
        //   <Text size="medium" css={{ fontWeight: '' }}>
        //     Peter Chan paid for the course (Math S5)- class (Wed 1500-1700) -
        //     lesson (12 Oct 2023-18 Oct 2023) using coupon code{' '}
        //     {currentCoupon.code}
        //   </Text>
        // >)
      }
    </Box>
  )
}
const InactiveCoupon = ({ history }: CouponInformationProps) => {
  const { t } = useTranslation()
  return (
    <Box
      direction="column"
      align="flex-start"
      css={{
        borderBottom: '1px solid $colors$textDisabled',
        paddingBottom: '$4',
      }}
    >
      <Box justify="space-between" align="center" css={{ padding: '$3 0' }}>
        <Box justify="flex-start" align="center">
          <AdminIcon />
          <Text>
            {formatTs(history.createdAt.toString(), 'DD MMM YYYY | HH:mm')}
          </Text>
        </Box>
      </Box>
      <Text size="medium" css={{ fontWeight: '' }}>
        {history.detail.updateBy.name} {t('promotion:historyInactive')}
      </Text>
    </Box>
  )
}
const UsageCoupon = ({ currentCoupon, history }: CouponInformationProps) => {
  const { t } = useTranslation()
  const [siteData] = useRecoilState(siteState)

  const [showDetail, setShowDetail] = useState(false)

  const studentId = currentCoupon.studentsAssigned.find(o => {
    return [o.firstName, o.lastName].join(' ') === history.detail.studentName
  })?.id

  let classDetail = {}
  const { modifiedDate } = history.detail
  currentCoupon.courseAssigned.forEach(o => {
    o.classes?.forEach(p => {
      if (Math.abs(dayjs(p.createdAt).diff(dayjs(modifiedDate), 's')) <= 3) {
        classDetail = p
      }
    })
  })

  const currency = siteData.currentSite?.currency || ''

  const {
    originalFee = 0,
    payAmount = 0,
    name: className = '',
    startTime,
    endTime,
  } = classDetail as ClassProps

  const { studentName, courseName } = history.detail

  return (
    <Box
      direction="column"
      align="flex-start"
      css={{
        borderBottom: '1px solid $colors$textDisabled',
        paddingBottom: '$4',
      }}
    >
      <Box justify="space-between" align="center" css={{ padding: '$3 0' }}>
        <Box justify="flex-start" align="center">
          <StudentIcon />
          <Text>
            {formatTs(history.createdAt.toString(), 'DD MMM YYYY | HH:mm')}
          </Text>
        </Box>
        <Button
          css={{ background: 'transparent', color: '$primary' }}
          onClick={() => setShowDetail(!showDetail)}
        >
          <SvgIcon>
            <ViewIcon />
          </SvgIcon>
          <Text css={{ marginLeft: '$2' }}>{t('promotion:action:detail')}</Text>
        </Button>
      </Box>
      {showDetail && (
        <div className="text-[15px] leading-6">
          <div>The coupon code has been used.</div>
          <div>Name: {studentName}</div>
          <div>Application ID: {studentId}</div>
          <div>Course Name: {courseName}</div>
          <div>Class Name: {className ?? ''}</div>
          {!!startTime && !!endTime && (
            <div>
              Lessons: {dayjs(startTime).format('YYYY/MM/DD hh:mm:ss a')}
              {` - `}
              {dayjs(endTime).format('YYYY/MM/DD hh:mm:ss a')}
            </div>
          )}
          <div>
            Original Payment Amount:{' '}
            {`${currency} ${formatCurrency(originalFee ?? 0, currency)}`}
          </div>
          <div>
            Final Payment Amount:{' '}
            {`${currency} ${formatCurrency(payAmount ?? 0, currency)}`}
          </div>
        </div>
      )}
    </Box>
  )
}

const CouponActivity = ({ currentCoupon, history }: CouponInformationProps) => {
  switch (history.type) {
    case CouponTypeHistoryEnum.CREATE_COUPON:
      return <CreateCoupon currentCoupon={currentCoupon} history={history} />
    case CouponTypeHistoryEnum.USAGE_COUPON:
      return <UsageCoupon currentCoupon={currentCoupon} history={history} />
    case CouponTypeHistoryEnum.INACTIVE_COUPON:
      return <InactiveCoupon currentCoupon={currentCoupon} history={history} />
    default:
      return <CreateCoupon currentCoupon={currentCoupon} history={history} />
  }
}
export default CouponActivity
