import moment from 'moment/moment'

import { FieldTypes } from '@/constants/common'
import CourseDetail from '@/entities/CourseDetail'
import ConfirmCourseDetail from '@/page-components/enrol/PaymentSteps/ConfirmCourseDetail'
import RenderPaymentAmount from '@/page-components/enrol/PaymentSteps/PaymentAmount'
import PaymentAmountAdditionalFee from '@/page-components/enrol/PaymentSteps/PaymentAmountAdditionalFee'
import StudentDetailItem from '@/page-components/enrol/StudentDetailItem'
import { EnrolState } from '@/stores/enrol'
import { Course } from '@/types'
import { onlyAlphaNumericAndSpace } from '@/utils/sanitize'

interface ConfirmApplyWishlistDetailStepItemProps {
  enrolForm: EnrolState
  courseDetail: CourseDetail
  course: Course
  applicantFields: any[]
  commonFields: any[]
  t: (key: string) => string
}

const ConfirmApplyWishlistDetailStepItem: React.FC<ConfirmApplyWishlistDetailStepItemProps> = ({
  enrolForm,
  courseDetail,
  course,
  applicantFields,
  commonFields,
  t,
}) => {
  return (
    <div className="box-col bg-backgroundLayer2 rounded">
      <ConfirmCourseDetail
        enrolForm={enrolForm}
        courseDetail={courseDetail}
        courseName={course?.name}
      />

      {courseDetail.totalAdditionalFee > 0 ? (
        <PaymentAmountAdditionalFee
          courseDetail={courseDetail}
          course={course}
          paymentAmount={courseDetail.totalPayAmount}
        />
      ) : (
        <RenderPaymentAmount courseDetail={courseDetail} />
      )}

      <div className="w-full table-auto">
        {applicantFields?.map((applicant, index) => {
          const labelForm =
            applicantFields.length === 1
              ? t('enrol:customFieldStep.applicantOfNumber')
                  .replace('{total}', '1')
                  .replace('{step}', '1')
              : t('enrol:customFieldStep.applicantOfNumber')
                  .replace('{step}', `${index + 1}`)
                  .replace('{total}', '')

          return (
            <div key={`applicant-${index}`} className="border-backgroundLayer4 gap-4 border-b pb-4">
              {applicantFields.length > 1 && (
                <div className="raw-input-label mt-2 font-bold">{labelForm}</div>
              )}
              {Object.entries(applicant).map(([key, value]) => {
                if (key === 'createAnAccount') return null

                const field = course?.form?.fields?.find(
                  f => onlyAlphaNumericAndSpace(f.question) === key
                )

                const displayValue =
                  field?.type === FieldTypes.DATE
                    ? moment(value as string).format('YYYY-MM-DD')
                    : value

                return (
                  <StudentDetailItem
                    key={field?.question || key}
                    name={field?.question || key}
                    value={displayValue as string}
                    type={field?.type}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      {commonFields.length > 0 && (
        <div className="w-full table-auto">
          {commonFields.map(field => (
            <StudentDetailItem
              key={`custom-field-${field.id}`}
              name={field.question}
              value={field.value}
              type={field.type}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ConfirmApplyWishlistDetailStepItem
