import { useMemo } from 'react'

import useTranslation from 'next-translate/useTranslation'

import Text from '@/components/Texts/Text'
import CourseDetail from '@/entities/CourseDetail'
import { Course } from '@/types'
import { getPriceWithCurrency } from '@/utils/string.utils'

type PropsType = {
  courseDetail: CourseDetail
  course?: Course
  paymentAmount: number
}
const PaymentAmountAdditionalFee = ({
  course,
  courseDetail,
  paymentAmount,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()
  const multipleApplicantLabel = useMemo(() => {
    if (courseDetail.numberNewStudent > 1) {
      return [
        courseDetail?.additionalFeeLabel || t('enrol:payment.newStudentFee'),
        'X',
        courseDetail.numberNewStudent,
      ].join(' ')
    }
    return courseDetail?.additionalFeeLabel || t('enrol:payment.newStudentFee')
  }, [
    courseDetail.numberNewStudent,
    courseDetail.numberNewStudent,
    courseDetail?.additionalFeeLabel,
  ])
  const multipleApplicantAmount = useMemo(() => {
    if (courseDetail.numberNewStudent > 1) {
      return [
        getPriceWithCurrency(course?.site.currency, courseDetail.originalAdditionalFee),
        '=',
        getPriceWithCurrency(course?.site.currency, courseDetail.totalAdditionalFee),
      ].join(' ')
    }
    return getPriceWithCurrency(course?.site.currency, courseDetail.totalAdditionalFee)
  }, [course?.site?.currency, courseDetail.totalAdditionalFee, courseDetail.totalAdditionalFee])
  return (
    <>
      <div className="box-col border-primary rounded-md border p-2">
        <div className="box-row justify-between">
          <Text className={'question-classes'}>{t('enrol:confirmDetailStep.totalTuitionFee')}</Text>

          <Text className={'multiple-row-classes'}>
            {getPriceWithCurrency(course?.site.currency, courseDetail.subTotalPayAmount) ?? ''}
          </Text>
        </div>
        <div className="box-row justify-between">
          <Text className={'question-classes'}>{multipleApplicantLabel}</Text>
          <Text>{multipleApplicantAmount}</Text>
        </div>
      </div>
      <div className={'row-classes'}>
        <div className="box-row-full justify-between">
          <Text className="font-bold">{t('enrol:payment.totalPayment')}</Text>
          <Text>{getPriceWithCurrency(course?.site.currency, paymentAmount)}</Text>
        </div>
      </div>
    </>
  )
}

export default PaymentAmountAdditionalFee
