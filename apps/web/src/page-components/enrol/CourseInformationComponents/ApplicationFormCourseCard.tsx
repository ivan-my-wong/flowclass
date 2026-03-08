import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'

import ImageAspect from '@/components/Images/ImageAspect'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { EnrolState, enrolState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { ClassType, Course, PeriodLesson, School, SiteSettings, Weekday } from '@/types'
import { calculateClassPriceForAllTypes } from '@/utils/calculateCourse'
import { calculateLessonFormatAndDuration, getDateTimeByAmPm } from '@/utils/calculateTime'
import { getPriceWithCurrency } from '@/utils/string.utils'

interface ApplicationFormCourseCardProps {
  course?: Course
  siteSetting?: SiteSettings
  school?: School
  currentEnrolForm?: EnrolState
}

const ApplicationFormCourseCard = ({
  course: courseProp,
  siteSetting: siteSettingProp,
  school: schoolProp,
  currentEnrolForm: currentEnrolForm,
}: ApplicationFormCourseCardProps): JSX.Element => {
  // const [showEnquiryCard, setShowEnquiryCard] = useState(false)
  const [enrolForm] = useRecoilState(enrolState)
  const { course, siteSetting, school } = useEnrolState()
  const { t } = useTranslation()

  const _course = courseProp ?? course
  const _school = schoolProp ?? school
  const _siteSetting = siteSettingProp ?? siteSetting
  const _enrolForm = currentEnrolForm ?? enrolForm

  if (!_course || !_school) return <></>

  const shouldShowPrice = (): boolean => {
    if (!_enrolForm.tuition.length) return false

    const currentStep = _enrolForm.currentStep
    const classType = _enrolForm.selectedClassData[0]?.selectedClass?.type
    // Define at which step the Application Form (customField) stage occurs for each course type
    const applicationFormStepIndex: Record<ClassType, number> = {
      [ClassType.regular]: 3,
      [ClassType.regularV2]: 3,
      [ClassType.workshop]: 2,
      [ClassType.recurring]: 3,
      [ClassType.subscription]: 1,
      [ClassType.appointment]: 2,
    }

    const requiredStep = classType ? applicationFormStepIndex[classType] : 3

    return currentStep >= requiredStep
  }

  const renderRecurLessons = () => {
    if (_enrolForm?.selectedClassData.length === 0) return null

    const allSelectedLessons: PeriodLesson[] = []
    const allRecurLessons: string[] = []
    const allIndividualLessons: string[] = []

    _enrolForm.selectedClassData.forEach(classData => {
      if (classData?.selectedLessons) {
        allSelectedLessons.push(...(classData.selectedLessons as PeriodLesson[]))
      }
      if (classData?.selectedRecurLessons) {
        allRecurLessons.push(...classData.selectedRecurLessons)
      }
      if (classData?.selectedIndividualRecurLessons) {
        allIndividualLessons.push(...classData.selectedIndividualRecurLessons)
      }
    })

    if (allSelectedLessons.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          <Text className="font-bold">{t('enrol:stepTitles.pickedLesson')}:</Text>
          {_enrolForm.setMultipleClass
            ? _enrolForm.selectedClassData.map((classData, classIndex) => {
                if (!classData?.selectedLessons || classData.selectedLessons.length === 0)
                  return null

                return (
                  <div key={`class-lessons-${classIndex}`} className="ml-2">
                    <Text className="text-sm font-semibold text-gray-600">
                      {classData.selectedClass?.name}:
                    </Text>
                    {(classData.selectedLessons as PeriodLesson[]).map(item => (
                      <Text key={`selectedLesson-${item.id}`} className="ml-2">
                        {`${getDateTimeByAmPm(item.startTime ?? '')} - ${getDateTimeByAmPm(
                          item?.endTime ?? ''
                        )}`}
                      </Text>
                    ))}
                  </div>
                )
              })
            : allSelectedLessons.map(item => (
                <Text key={`selectedLesson-${item.id}`}>
                  {`${getDateTimeByAmPm(item.startTime ?? '')} - ${getDateTimeByAmPm(
                    item?.endTime ?? ''
                  )}`}
                </Text>
              ))}
        </div>
      )
    }

    if (allRecurLessons.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          <Text className="font-bold">{t('enrol:stepTitles.pickedLesson')}:</Text>
          {_enrolForm.setMultipleClass
            ? _enrolForm.selectedClassData.map((classData, classIndex) => {
                if (!classData?.selectedRecurLessons || classData.selectedRecurLessons.length === 0)
                  return null

                return (
                  <div key={`class-recur-lessons-${classIndex}`} className="ml-2">
                    <Text className="text-sm font-semibold text-gray-600">
                      {classData.selectedClass?.name}:
                    </Text>
                    {classData.selectedRecurLessons.map((item, lessonIndex) => (
                      <Text
                        key={`selectedRecurLesson-${classIndex}-${lessonIndex}`}
                        className="ml-2"
                      >
                        {
                          calculateLessonFormatAndDuration(
                            item.split(' ')[0],
                            item.split(' ')[1]
                          )[0]
                        }
                      </Text>
                    ))}
                  </div>
                )
              })
            : allRecurLessons.map((item, index) => (
                <Text key={`selectedLesson-${index}`}>
                  {calculateLessonFormatAndDuration(item.split(' ')[0], item.split(' ')[1])[0]}
                </Text>
              ))}
        </div>
      )
    }

    if (allIndividualLessons.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          <Text className="font-bold">{t('enrol:stepTitles.pickedLesson')}:</Text>
          {_enrolForm.setMultipleClass
            ? _enrolForm.selectedClassData.map((classData, classIndex) => {
                if (
                  !classData?.selectedIndividualRecurLessons ||
                  classData.selectedIndividualRecurLessons.length === 0
                )
                  return null

                return (
                  <div key={`class-individual-lessons-${classIndex}`} className="ml-2">
                    <Text className="text-sm font-semibold text-gray-600">
                      {classData.selectedClass?.name}:
                    </Text>
                    {classData.selectedIndividualRecurLessons.map((item, lessonIndex) => (
                      <Text
                        key={`selectedIndividualLesson-${classIndex}-${lessonIndex}`}
                        className="ml-2"
                      >
                        {
                          calculateLessonFormatAndDuration(
                            item.split(' ')[0],
                            item.split(' ')[1]
                          )[0]
                        }
                      </Text>
                    ))}
                  </div>
                )
              })
            : allIndividualLessons.map((item, index) => (
                <Text key={`selectedLesson-${index}`}>
                  {calculateLessonFormatAndDuration(item.split(' ')[0], item.split(' ')[1])[0]}
                </Text>
              ))}
        </div>
      )
    }

    return null
  }

  return (
    <div className="border-borderColor box-col items-start justify-start rounded-md border lg:w-[33%]">
      <ImageAspect
        s3="public"
        src={_course.previewImageUrl}
        alt="Course Primary Logo"
        ratio={21 / 9}
        imgClassName="object-cover"
      />
      <Heading className="text-xl" id="select-course">
        {_course.name}
      </Heading>

      {_enrolForm?.selectedClassData.length !== 0 && (
        <>
          <Text className="font-bold">{t('enrol:stepTitles.pickedClass')}:</Text>
          {_enrolForm.selectedClassData.map((item, index) => (
            <Text key={`selected-class-${item?.selectedClass?.id}`} id={`selectedClass-${index}`}>
              {item?.selectedClass?.name}
            </Text>
          ))}
        </>
      )}

      {_enrolForm?.selectedClassData.length !== 0 &&
        _enrolForm.selectedClassData[0]?.selectedRegularPeriod &&
        _enrolForm.selectedClassData[0]?.selectedClass?.type === ClassType.regular &&
        Object.keys(_enrolForm.selectedClassData[0]?.selectedRegularPeriod).length > 0 && (
          <div className="flex flex-col gap-2">
            <Text className="font-bold">{t('enrol:stepTitles.pickedPhase')}:</Text>
            {_enrolForm.selectedClassData
              .filter(item => item?.selectedRegularPeriod)
              .map(item => (
                <Text key={`picked-phase-${item.selectedClass?.id}`}>
                  {item?.selectedRegularPeriod?.name}
                </Text>
              ))}
          </div>
        )}

      {_enrolForm?.selectedClassData.length !== 0 &&
        _enrolForm.selectedClassData[0]?.selectedRecurSchedule && (
          <div className="flex flex-col gap-2">
            <Text className="font-bold">{t('enrol:stepTitles.pickedPeriod')}:</Text>
            {_enrolForm.selectedClassData
              .filter(item => item?.selectedRecurSchedule)
              .map(item => {
                if (!item || !item.selectedClass || !item?.selectedRecurSchedule) return <></>

                return (
                  <Text key={`picked-period-${item.selectedClass.id}`}>
                    {`${Object.values(Weekday)[item.selectedRecurSchedule.weekDay ?? 7]} ${
                      item.selectedRecurSchedule.startTime
                    } - ${item.selectedRecurSchedule.endTime}`}
                  </Text>
                )
              })}
          </div>
        )}

      {renderRecurLessons()}

      {shouldShowPrice() && (
        <>
          <Text className="font-bold"> {t('enrol:stepTitles.pickedPrice')}:</Text>
          {_enrolForm.tuition.map((item, index) => {
            const label = _enrolForm.setMultipleClass
              ? `${_enrolForm.selectedClassData[index]?.selectedClass?.name} - `
              : ''
            return (
              <Text
                key={`picked-price-${(item.bundleDiscount || 0) + index}`}
                id={`picked-price-${index}`}
              >
                {`${label}${getPriceWithCurrency(
                  _siteSetting?.currency,
                  calculateClassPriceForAllTypes({
                    item: _enrolForm.selectedClassData[index],
                    classTrialLesson: _enrolForm.classTrialLesson,
                  })
                )}`}
              </Text>
            )
          })}
        </>
      )}

      {/* <div className="box-col mt-4 p-0">
        <Button
          className="w-full py-0"
          variant="outlinedPlain"
          onClick={() => setShowEnquiryCard(!showEnquiryCard)}
        >
          <div className="box-row">
            {showEnquiryCard ? <BiChevronUp /> : <BiChevronDown />}
            {t(`course:enquire`)}
          </div>
        </Button>
        {showEnquiryCard && school && (
          <CourseEnquiryCard course={course} site={course.site} school={school} />
        )}
      </div> */}
    </div>
  )
}

export default ApplicationFormCourseCard
