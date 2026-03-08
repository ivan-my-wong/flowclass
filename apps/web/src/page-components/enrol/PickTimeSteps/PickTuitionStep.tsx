import { useEffect, useMemo } from 'react'

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { FaChevronRight } from 'react-icons/fa'

import { Badge } from '@/components/Badge/Badge'
import TextInput from '@/components/Inputs/TextInput'
import BoxWithTextAction from '@/components/PresetBlocks/BoxWithTextAction'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import useTrialLessonData from '@/hooks/useTrialLessonData'
import { defaultTuition, enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { ClassType } from '@/types'
import { ClassTriaLessonResponse } from '@/types/trial-lesson'
import {
  calculateClassPrice,
  calculatePriceDetails,
  generateTotalLessons,
} from '@/utils/calculateCourse'
import { calculateLessonFormatAndDuration } from '@/utils/calculateTime'
import {
  enrolCourseScrollAction,
  updateCurrentSelectedClass,
  updateSelectedClassTuition,
} from '@/utils/courseDisplay'
import { getPriceWithCurrency } from '@/utils/string.utils'

const PickTuitionStep = (): JSX.Element => {
  const { siteSetting } = useEnrolState()
  const { t } = useTranslation()

  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)

  const { currentStep, selectedClassData, currentSelectedClassIndex, numberOfApplicant } = enrolForm

  const currentSelectedClassData = selectedClassData[currentSelectedClassIndex]

  const setMultipleApplicant = currentSelectedClassData?.selectedClass?.setMultipleApplicant

  const selectedClass = useMemo(
    () => currentSelectedClassData?.selectedClass,
    [currentSelectedClassData?.selectedClass]
  )

  const selectedRecurLessons = useMemo(
    () => currentSelectedClassData?.selectedRecurLessons,
    [currentSelectedClassData?.selectedRecurLessons]
  )

  const selectedRegularScheduleV2 = useMemo(
    () => currentSelectedClassData?.selectedRegularSchedulePreviewV2,
    [currentSelectedClassData?.selectedRegularSchedulePreviewV2]
  )

  const selectedIndividualRecurLessons = useMemo(
    () => currentSelectedClassData?.selectedIndividualRecurLessons,
    [currentSelectedClassData?.selectedIndividualRecurLessons]
  )

  const selectedRegularPeriod = useMemo(
    () => currentSelectedClassData?.selectedRegularPeriod,
    [currentSelectedClassData?.selectedRegularPeriod]
  )
  const selectedRegularLesson = useMemo(
    () => currentSelectedClassData?.selectedLessons,
    [currentSelectedClassData?.selectedLessons]
  )

  const setPrevSelectedOption = useSetRecoilState(prevSelectedOptionState)
  const currentTheme = useRecoilValue(currentWebsiteTheme)

  const { useFetchAvailableTrialLesson } = useTrialLessonData()
  const { data: classTrialLesson } = useFetchAvailableTrialLesson(selectedClass?.id)

  /**
   * Going back should not change the tuition because the user has not selected the tuition yet
   */
  useEffect(() => {
    if (
      !selectedClass ||
      (!selectedRecurLessons && !selectedIndividualRecurLessons && !selectedRegularPeriod)
    ) {
      setEnrolForm(prev => ({
        ...prev,
        currentStep: currentStep - 1,
      }))
      // toast.warning(t('errors:ENROL.PLEASE_PICK_STARTING_LESSON') as string)
    }

    setPrevSelectedOption(prev => {
      const currentSelectedClass = selectedClassData[currentSelectedClassIndex].selectedClass
      const updatedSelectedClassData = updateCurrentSelectedClass(
        prev.selectedClassData,
        prev.currentSelectedClassIndex,
        {
          selectedClass: currentSelectedClass,
          selectedRegularPeriod: undefined,
          selectedLessons: undefined,
        }
      )

      return {
        ...prev,
        currentStep: currentStep - 1,
        selectedClassData: updatedSelectedClassData,
      }
    })
  }, [
    selectedClass,
    selectedRegularLesson,
    selectedRecurLessons,
    selectedRegularPeriod,
    selectedIndividualRecurLessons,
    currentStep,
    selectedClassData,
    currentSelectedClassIndex,
    setPrevSelectedOption,
    setEnrolForm,
  ])

  const recurringLessons = useMemo(() => {
    if (!selectedClass) return []
    if (
      selectedClass?.type === ClassType.recurring ||
      selectedClass?.type === ClassType.regularV2
    ) {
      return selectedRecurLessons || selectedIndividualRecurLessons
    }
    return []
  }, [selectedClass, selectedRecurLessons, selectedIndividualRecurLessons])

  const { totalLesson, periodLessonNumber, allLessonDates } = useMemo(() => {
    if (!selectedClass)
      return {
        allLessonDates: [],
        periodLessonNumber: 0,
        totalLesson: 0,
      }

    return generateTotalLessons({
      selectedClass,
      selectedRecurLessons: recurringLessons,
      selectedRegularLesson,
      selectedRegularScheduleV2,
      currentSelectedClassData: {
        ...currentSelectedClassData,
        selectedIndividualRecurLessons,
      },
    })
  }, [
    selectedClass,
    recurringLessons,
    selectedRegularLesson,
    currentSelectedClassData,
    selectedRegularScheduleV2,
  ])

  const singlePrice = useMemo(() => selectedClass?.tuition || 0, [selectedClass?.tuition])
  const periodPrice = useMemo(
    () =>
      calculateClassPrice(
        currentSelectedClassData.selectedClass,
        periodLessonNumber,
        totalLesson,
        currentSelectedClassData.selectedPriceOption
      ),
    [
      currentSelectedClassData.selectedClass,
      periodLessonNumber,
      totalLesson,
      currentSelectedClassData.selectedPriceOption,
    ]
  )

  const { totalPrice, priceTrialExplanation, priceExplanation } = useMemo(() => {
    if (!siteSetting || !selectedClass) {
      return {
        totalPrice: 0,
        priceExplanation: '',
        priceTrialExplanation: '',
      }
    }

    return calculatePriceDetails({
      t,
      classTrialLesson: classTrialLesson || {},
      periodPrice,
      numberOfApplicant,
      periodLessonNumber,
      totalLesson,
      siteSetting,
      selectedClass,
    })
  }, [
    t,
    classTrialLesson,
    periodPrice,
    numberOfApplicant,
    periodLessonNumber,
    totalLesson,
    siteSetting,
    selectedClass,
  ])

  const handleNextStep = (classTrialLesson?: ClassTriaLessonResponse) => {
    setEnrolForm(prev => {
      const updatedSelectedClassData = updateCurrentSelectedClass(
        prev.selectedClassData,
        prev.currentSelectedClassIndex,
        {}
      )

      const isTrialSelected = !!classTrialLesson
      const finalPeriodPrice = isTrialSelected ? classTrialLesson?.price : periodPrice
      const finalSinglePrice = isTrialSelected ? Number(classTrialLesson?.price) : singlePrice

      const updatedTuition =
        prev.tuition.length > 0
          ? updateSelectedClassTuition(
              prev.tuition,
              prev.currentSelectedClassIndex,

              {
                originalFee: finalPeriodPrice,
                paymentAmount: finalPeriodPrice,
                feePerLesson: finalSinglePrice,
                couponDiscount: 0,
                directDiscount: 0,
                bundleDiscount: 0,
                recurringDiscount: 0,
                totalDiscount: 0,
                currency: siteSetting?.currency ?? 'USD',
              }
            )
          : [
              {
                ...defaultTuition,
                originalFee: finalPeriodPrice,
                paymentAmount: finalPeriodPrice,
                feePerLesson: finalSinglePrice,
                currency: siteSetting?.currency ?? 'USD',
              },
            ]

      return {
        ...prev,
        currentStep: prev.setMultipleClass ? 0 : prev.currentStep + 1,
        selectedClassData: updatedSelectedClassData.map(d => {
          const selectedRegularPeriod = Object.assign({}, d.selectedRegularPeriod)
          let selectedRecurLessons = Object.assign(
            [],
            d.selectedRecurLessons || d.selectedIndividualRecurLessons
          )
          if (classTrialLesson && selectedRegularPeriod && selectedRegularPeriod.lessons) {
            selectedRegularPeriod.lessons = selectedRegularPeriod.lessons.slice(0, 1)
          }
          if (classTrialLesson && selectedRecurLessons) {
            selectedRecurLessons = selectedRecurLessons.slice(0, 1)
          }
          return {
            ...d,
            selectedRegularPeriod,
            selectedRecurLessons,
            selectedLessons:
              classTrialLesson && d.selectedLessons && (d.selectedLessons?.length || 0) > 0
                ? [d.selectedLessons[0]]
                : d.selectedLessons,
          }
        }),
        tuition: updatedTuition,
        classTrialLesson,
      }
    })

    enrolCourseScrollAction(currentTheme)
  }

  return (
    <div className="box-col items-start p-0">
      {setMultipleApplicant && (
        <div className="box-col-full mb-4">
          <Heading>{t('enrol:pickTuitionStep.numberOfApplicant')}</Heading>
          <TextInput
            id="numberOfApplicant"
            name="numberOfApplicant"
            className="raw-input w-full text-right"
            type="number"
            vertical
            value={+enrolForm?.numberOfApplicant}
            onChange={e => {
              let value = +e.target.value
              if (value < 1) return (value = 1)
              setEnrolForm(prev => ({ ...prev, numberOfApplicant: value }))
            }}
            min={1}
          />
        </div>
      )}
      <Heading>{t('enrol:pickTuitionStep.pickOption')}</Heading>
      {selectedClassData[currentSelectedClassIndex]?.selectedClass?.type ===
        ClassType.recurring && <Text>{t('enrol:pickTuitionStep.recurTuitionReminder')}</Text>}
      <BoxWithTextAction
        data-testid={'tuition-option-paid'}
        text={getPriceWithCurrency(siteSetting?.currency, totalPrice)}
        description={
          selectedClass?.type === ClassType.recurring ? (
            <div className="mt-2 flex flex-col gap-2" id="generatedLessonDate">
              {allLessonDates?.map((item: any, index: number) => {
                const startTime = item.split(' ')[0]
                const endTime = item.split(' ')[1]

                return (
                  <div key={item} id={`generatedLessonDate-${index}`}>
                    {calculateLessonFormatAndDuration(startTime, endTime)[0]}
                  </div>
                )
              })}
            </div>
          ) : (
            priceExplanation
          )
        }
        icon={<FaChevronRight />}
        action={() => handleNextStep(undefined)}
      />
      {classTrialLesson && (
        <BoxWithTextAction
          data-testid={'tuition-option'}
          text={
            +classTrialLesson.price === 0 ? t('common:description.free') : priceTrialExplanation
          }
          prefix={<Badge>{t('enrol:trialLesson.title')}</Badge>}
          description={
            selectedClass?.type === ClassType.recurring ? (
              <div className="mt-2 flex flex-col gap-2" id="generatedLessonDate">
                {(allLessonDates || []).slice(0, 1)?.map((item: any, index: number) => {
                  const startTime = item.split(' ')[0]
                  const endTime = item.split(' ')[1]

                  return (
                    <div key={item} id={`generatedLessonDate-${index}`}>
                      {calculateLessonFormatAndDuration(startTime, endTime)[0]}
                    </div>
                  )
                })}
              </div>
            ) : undefined
          }
          icon={<FaChevronRight />}
          action={() => handleNextStep(classTrialLesson)}
        />
      )}
    </div>
  )
}

export default PickTuitionStep
