import useTranslation from 'next-translate/useTranslation'

import Text from '@/components/Texts/Text'
import CourseDetail from '@/entities/CourseDetail'
import { cn } from '@/utils/cn'

type PropsType = {
  courseDetail: CourseDetail
}

const RenderPaymentAmount = ({ courseDetail }: PropsType): JSX.Element => {
  const { t } = useTranslation()

  return (
    <>
      <div className={'row-classes'}>
        <Text className={'question-classes raw-input-label'}>
          {t('enrol:pickTuitionStep.numberOfApplicant')}
        </Text>

        <p className={cn('multiple-row-classes', 'ml-auto')}>
          {`${courseDetail.numberOfApplicant ?? 1} ${t('enrol:pickTuitionStep.applicant')}`}
        </p>
      </div>
      <div className={'row-classes'}>
        <Text className={'question-classes raw-input-label'}>
          {t('enrol:confirmDetailStep.totalTuitionFee')}
        </Text>

        <p className={cn('multiple-row-classes', 'ml-auto', 'raw-input-label')}>
          {courseDetail.totalTuitionFee ?? ''}
        </p>
      </div>
    </>
  )
}

export default RenderPaymentAmount
