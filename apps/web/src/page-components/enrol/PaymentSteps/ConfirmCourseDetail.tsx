import { Fragment, useMemo } from 'react'

import useTranslation from 'next-translate/useTranslation'

import Text from '@/components/Texts/Text'
import CourseDetail from '@/entities/CourseDetail'
import { EnrolState } from '@/stores/enrol'
import { ClassType } from '@/types'
import { calculateLessonFormatAndDuration } from '@/utils/calculateTime'

const rowClasses =
  'box-col-full items-start lg:!items-start lg:box-row-full flex-nowrap gap-2 mt-4 md:p-4'
const multipleRowClasses = 'raw-input-label break-words text-right font-bold italic'
const valueRowClasses = 'flex w-full flex-col flex-nowrap gap-2 text-right'
const questionClasses = 'raw-input-label break-words text-left font-bold md:w-2/5'

const ConfirmCourseDetail = ({
  enrolForm,
  courseDetail,
  courseName,
}: {
  enrolForm: EnrolState
  courseDetail: CourseDetail
  courseName?: string
}): JSX.Element => {
  const { t } = useTranslation()

  const allAreSubscriptions = enrolForm.selectedClassData.every(
    classData => classData.selectedClass?.type === ClassType.subscription
  )
  /**
   * THE PART WHERE MULTIPLE CLASS IS ENABLED
   */
  const allLesson = useMemo(() => {
    if (!courseDetail.allLesson) return []
    if (enrolForm.classTrialLesson)
      return courseDetail.allLesson.slice(0, 1).map(d => ({
        ...d,
        lessons: (d.lessons || [])?.slice(0, 1),
      }))
    return courseDetail.allLesson
  }, [enrolForm.classTrialLesson, courseDetail.allLesson])

  return (
    <div className="w-full table-auto">
      {courseName && (
        <div key={1} className={rowClasses}>
          <Text className={questionClasses}>{t('enrol:successPayment.courseName')}</Text>
          <div className={valueRowClasses}>
            <Text className={multipleRowClasses}>{courseName}</Text>
          </div>
        </div>
      )}
      {/* {!allAreSubscriptions && (
          <div key={2} className={rowClasses}>
            <Text className="raw-input-label w-2/6 break-words text-left font-bold">
              {t('enrol:successPayment.firstLesson')}
            </Text>
  
            <div className={valueRowClasses}>
              {courseDetail.firstLesson.map((firstLessonData: any, index: number) => {
                return (
                  <div key={index} className="flex w-full flex-col">
                    <Text className={multipleRowClasses}>{firstLessonData.name}</Text>
                    <Text className={multipleRowClasses}>{firstLessonData.firstLesson}</Text>
                  </div>
                )
              })}
            </div>
          </div>
        )} */}
      {!allAreSubscriptions && (
        <div key={3} className={rowClasses}>
          <Text className={questionClasses}>{t('enrol:successPayment.allLesson')}</Text>
          <div className={valueRowClasses}>
            {allLesson &&
              allLesson.map((lessonData: any, key: number) => {
                const lessonKey = `lesson-${key}-${lessonData.name}`

                return (
                  <div key={lessonKey}>
                    <Text className={multipleRowClasses}>{lessonData.name}</Text>
                    {lessonData.lessons.map((lesson: string, innerKey: number) => {
                      const subLessonKey = `lesson-${key}-${innerKey}-${lesson}`
                      return (
                        <Text key={subLessonKey} className={valueRowClasses}>
                          {
                            calculateLessonFormatAndDuration(
                              lesson.split(' ')[0],
                              lesson.split(' ')[1]
                            )[0]
                          }
                        </Text>
                      )
                    })}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <div key={4} className={rowClasses}>
        <Text className={questionClasses}>{t('enrol:confirmDetailStep.tuitionFee')}</Text>
        <div className="flex w-full flex-col flex-nowrap justify-end gap-2">
          {(courseDetail.tuitionFee as string[]).map((tuitionFee: string, index: number) => {
            const tuitionFeeKey = `tuition-fee-${index}-${tuitionFee}`
            return (
              <Fragment key={tuitionFeeKey}>
                <Text className={multipleRowClasses}>{courseDetail.name[index]}</Text>
                <Text className={valueRowClasses}>{tuitionFee}</Text>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ConfirmCourseDetail
