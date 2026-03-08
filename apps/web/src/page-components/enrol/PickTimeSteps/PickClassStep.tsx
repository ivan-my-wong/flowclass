import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { useRecoilState } from 'recoil'

import getSymbolFromCurrency from 'currency-symbol-map'
import useTranslation from 'next-translate/useTranslation'
import { FaChevronRight, FaListAlt } from 'react-icons/fa'
import { toast } from 'sonner'

import BackButton from '@/components/Buttons/Back'
import Button from '@/components/Buttons/Button'
import { ClassTypeIcon } from '@/components/Icon/ClassTypeIcon'
import BoxWithTextAction from '@/components/PresetBlocks/BoxWithTextAction'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Switch } from '@/components/Toggle/Switch'
import {
  defaultEnrolState,
  enrolState,
  prevSelectedOptionState,
  SelectedClassDataState,
} from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { ClassType, ClassWithQuotaValue, TuitionMode } from '@/types'
import {
  availableTimeslotsCount,
  calculateClassPrice,
  getLessonsOrOptionsCount,
  getMultipleOptionsPriceDisplay,
} from '@/utils/calculateCourse'
import { getRegularScheduleAfterTodayOnly } from '@/utils/calculateTime'
import { rearrangeOrder } from '@/utils/convert'
import { enrolCourseScrollAction, getSubscriptionClassDescription } from '@/utils/courseDisplay'
import dayjs from '@/utils/dayjs'
import { countValidRecurringDaysWithinAP } from '@/utils/recurringAvailability'

import { getCourseEnrolSteps } from '../FullApplicationSteps'
import MultipleClassDialog from '../MultipleClassModal'

const PickClassStep = (): JSX.Element => {
  const { course, originalUrl, siteSetting } = useEnrolState()
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const { t } = useTranslation()
  const [classes, setClasses] = useState(course?.classes)
  const router = useRouter()

  const [hasMultipleClass, setHasMultipleClass] = useState(false)
  const [isMultipleClass, setIsMultipleClass] = useState(enrolForm.setMultipleClass)
  const [isMultipleClassDialogOpen, setIsMultipleClassDialogOpen] = useState(false)
  const [, setPrevSelectedOption] = useRecoilState(prevSelectedOptionState)
  const [currentTheme] = useRecoilState(currentWebsiteTheme)

  const multipleClassArray = (course?.classes as ClassWithQuotaValue[])?.filter(
    classItem => classItem.setMultipleClass === true
  )

  const selectedClass = useMemo(() => {
    return enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]?.selectedClass
  }, [enrolForm.selectedClassData, enrolForm.currentSelectedClassIndex])

  const handleCheckOut = () => {
    const enrolSteps = getCourseEnrolSteps(
      selectedClass?.type,
      selectedClass?.setMultipleApplicant ?? false,
      (selectedClass?.priceOptions?.length ?? 0) > 0
    )

    setEnrolForm(prev => ({
      ...prev,
      currentStep: enrolSteps.length - 1,
    }))
  }

  useEffect(() => {
    if (isMultipleClass) {
      const classesWithQuotaValue = multipleClassArray?.map((classItem: ClassWithQuotaValue) => ({
        ...classItem,
        classQuota: classItem.classQuota,
      }))
      setClasses(classesWithQuotaValue)

      if (multipleClassArray?.length === 0) {
        setIsMultipleClass(false)
      }
    } else {
      setClasses(course?.classes)
    }
    setEnrolForm(prev => ({
      ...prev,
      setMultipleClass: isMultipleClass,
    }))
  }, [isMultipleClass])

  useEffect(() => {
    if (!course) {
      toast.error(t('errors:ENROL.PLEASE_PICK_COURSE') as string)
      router.push(originalUrl ?? '/')
    }

    if (!classes || classes.length === 0) {
      toast.error(t('errors:ENROL.COURSE_NOT_OPEN') as string)
      setEnrolForm(prev => ({
        ...prev,
        currentStep: enrolForm.currentStep - 1,
      }))
    }

    if (multipleClassArray && multipleClassArray.length > 0) {
      setHasMultipleClass(true)
    }

    if (enrolForm.setMultipleClass) {
      const updatedClasses = [...enrolForm.selectedClassData]
      updatedClasses.splice(enrolForm.currentSelectedClassIndex, 1)
      setPrevSelectedOption(prev => ({
        ...prev,
        selectedClassData: updatedClasses,
      }))
    } else {
      setPrevSelectedOption(defaultEnrolState)
    }
  }, [])

  const handleSetMultipleClass = () => {
    setIsMultipleClass(prev => !prev)
    setEnrolForm(prev => ({
      ...prev,
      currentSelectedClassIndex: 0,
    }))
  }

  const sortedClasses = useMemo(() => {
    if (!classes) return []

    if (!course?.courseActivitiesOrder) {
      return classes?.filter(o => o.isArchived !== true)
    }
    const { activityOrder } = course.courseActivitiesOrder
    const sortedWithOrder = rearrangeOrder(classes, activityOrder)
    return sortedWithOrder?.filter(o => o.isArchived !== true)
  }, [classes, course?.courseActivitiesOrder])

  // const getSortedClassesByApplicationStatus = (status: 'applicable' | 'notApplicable') => {
  //   const isApplicable = (classItem: ClassWithQuotaValue): boolean => {
  //     const dropIn = classItem.dropIn
  //     const regularScheduleAfterTodayOnly = getRegularScheduleAfterTodayOnly(classItem)
  //     const hasRegularSchedule =
  //       regularScheduleAfterTodayOnly && regularScheduleAfterTodayOnly.length > 0
  //     const hasAvailableTimeslots = availableTimeslots(classItem) > 0
  //
  //     if (status === 'applicable') {
  //       return (dropIn && hasAvailableTimeslots) || (!dropIn && hasRegularSchedule)
  //     } else {
  //       return (dropIn && !hasAvailableTimeslots) || (!dropIn && !hasRegularSchedule)
  //     }
  //   }
  //
  //   // return sortedClasses?.filter(isApplicable) ?? []
  //   return sortedClasses ?? []
  // }

  const updateSelectedClass = (classItem: ClassWithQuotaValue) => {
    const newClassData: SelectedClassDataState = {
      selectedClass: classItem,
    }
    let finalTuition = 0
    if (classItem.priceType === TuitionMode.MULTIPLE_OPTIONS) {
      if (classItem.priceOptions?.length) {
        finalTuition = Math.min(...classItem.priceOptions.map(option => option.amount))
      } else {
        finalTuition = classItem.tuition
      }
    } else {
      const priceOption = classItem.priceOptions?.at(0)
      if (priceOption) {
        finalTuition = calculateClassPrice(classItem, 1, 1, priceOption)
        newClassData.selectedPriceOption = priceOption
      } else {
        finalTuition = classItem.tuition
      }
    }

    const tuitionData = {
      originalFee: finalTuition,
      paymentAmount: finalTuition,
      feePerLesson: finalTuition,
      currency: siteSetting?.currency ?? 'USD',
      couponDiscount: 0,
      directDiscount: 0,
      bundleDiscount: 0,
      recurringDiscount: 0,
      totalDiscount: 0,
    }

    const setMultipleApplicant = classItem.setMultipleApplicant

    if (isMultipleClass) {
      setEnrolForm(prev => {
        let nextStep = prev.currentStep + 1
        if (classItem.type === ClassType.subscription) {
          nextStep = 0
        }

        const toBeChanged: Record<string, any> = {
          currentStep: nextStep,
          currentSelectedClassIndex: prev.selectedClassData.length,
          selectedClassData: [...prev.selectedClassData, newClassData],
          setMultipleClass: true,
          setMultipleApplicant,
        }

        // if (
        //   classItem.type === ClassType.subscription ||
        //   classItem.priceType === TuitionMode.MULTIPLE_OPTIONS
        // ) {
        //   toBeChanged.tuition = [...prev.tuition, tuitionData]
        // }

        return {
          ...prev,
          ...toBeChanged,
          tuition: [...prev.tuition, tuitionData],
        }
      })
    } else {
      setEnrolForm(prev => {
        const toBeChanged: Record<string, any> = {
          currentStep: prev.currentStep + 1,
          selectedClassData: [newClassData],
          setMultipleClass: false,
          setMultipleApplicant,
        }

        // if (
        //   classItem.type === ClassType.subscription ||
        //   classItem.priceType === TuitionMode.MULTIPLE_OPTIONS
        // ) {
        //   toBeChanged.tuition = [...prev.tuition, tuitionData]
        // }

        return {
          ...prev,
          ...toBeChanged,
          tuition: [tuitionData],
        }
      })
    }

    enrolCourseScrollAction(currentTheme)
  }

  const ClassSelectionBox = (): JSX.Element => {
    const isRecurringInsufficient = (classItem: ClassWithQuotaValue) => {
      if (
        classItem.type !== ClassType.recurring ||
        classItem.priceType === TuitionMode.MULTIPLE_OPTIONS
      )
        return false
      const required = classItem?.recurringFormat?.times || 0
      if (!required) return false

      const apStart = classItem.applicationPeriod?.startDatetime
        ? dayjs(classItem.applicationPeriod.startDatetime)
        : undefined
      const apEnd = classItem.applicationPeriod?.endDatetime
        ? dayjs(classItem.applicationPeriod.endDatetime)
        : undefined
      const tz = siteSetting?.timeZone || 'UTC'

      const total = countValidRecurringDaysWithinAP(
        classItem.recurringSchedules || [],
        apStart,
        apEnd,
        tz
      )
      return total < required
    }

    const isClassUnavailable = (classItem: ClassWithQuotaValue) => {
      if (
        classItem.quota !== 0 &&
        !!classItem.classQuota &&
        classItem.classQuota.length > 0 &&
        classItem.classQuota.every(enroll => enroll.remainingQuota <= 0)
      ) {
        return true
      }

      if (
        enrolForm.setMultipleClass &&
        !!enrolForm.selectedClassData.find(
          item => !!item.selectedClass && item.selectedClass?.id === classItem.id
        )
      ) {
        return true
      }
      if (classItem.type === ClassType.regular || classItem.type === ClassType.workshop) {
        if (
          classItem.type === ClassType.workshop &&
          classItem.quota !== 0 &&
          !!classItem.classQuota &&
          classItem.classQuota.length > 0
        ) {
          const workshopRemainingQuotas = classItem.classQuota.map(enroll =>
            Math.max(0, enroll.remainingQuota ?? 0)
          )

          if (workshopRemainingQuotas.some(remaining => remaining <= 0)) {
            return true
          }
        }

        if (classItem.dropIn && availableTimeslotsCount(classItem) === 0) {
          return true
        } else if (!classItem.dropIn && getRegularScheduleAfterTodayOnly(classItem)?.length === 0) {
          return true
        } else {
          return false
        }
      } else if (
        classItem.recurringSchedules?.length == 0 &&
        classItem.type === ClassType.recurring
      ) {
        return true
      }
      if (isRecurringInsufficient(classItem)) {
        return true
      }

      return false
    }

    return (
      <>
        {sortedClasses?.map(classItem => {
          const { quota, classQuota } = classItem as ClassWithQuotaValue

          const periodLessonNumber = classItem?.recurringFormat?.times ?? 0

          const tuitionLabel =
            classItem.priceType === TuitionMode.PER_CLASS
              ? t('enrol:pickPeriodStep.perClass')
              : t('enrol:pickPeriodStep.perLesson')
          let showRecurringText: any

          if (classItem.priceType === TuitionMode.MULTIPLE_OPTIONS) {
            const priceDisplay = getMultipleOptionsPriceDisplay(
              classItem,
              siteSetting?.currency ?? ''
            )
            const lessonsDisplay = getLessonsOrOptionsCount(classItem, t)
            showRecurringText = `${priceDisplay} / ${lessonsDisplay}`
          } else {
            switch (classItem.type) {
              case ClassType.recurring:
                showRecurringText = (
                  <>
                    <span>
                      {`${siteSetting?.currency}${getSymbolFromCurrency(
                        siteSetting?.currency ?? ''
                      )} ${classItem.tuition} ${tuitionLabel} /  ${periodLessonNumber} ${t(
                        'enrol:pickPeriodStep.lessons'
                      )} / ${availableTimeslotsCount(classItem)} ${t(
                        'enrol:pickPeriodStep.timeslotsAvailable'
                      )}`}
                    </span>
                  </>
                )
                break
              case ClassType.subscription:
                if (classItem?.recurringFormat) {
                  showRecurringText = `${siteSetting?.currency}${getSymbolFromCurrency(
                    siteSetting?.currency ?? ''
                  )} ${classItem.tuition} ${getSubscriptionClassDescription(
                    classItem.recurringFormat,
                    t
                  )}`
                } else {
                  showRecurringText = `${siteSetting?.currency}${getSymbolFromCurrency(
                    siteSetting?.currency ?? ''
                  )} ${classItem.tuition}`
                }
                break
              case ClassType.regular:
                showRecurringText = `${siteSetting?.currency}${getSymbolFromCurrency(
                  siteSetting?.currency ?? ''
                )} ${classItem.tuition} ${tuitionLabel} / ${availableTimeslotsCount(classItem)} ${t(
                  'enrol:pickPeriodStep.lessonsInClass'
                )}`
                break
              case ClassType.workshop:
                showRecurringText = `${siteSetting?.currency}${getSymbolFromCurrency(
                  siteSetting?.currency ?? ''
                )} ${classItem.tuition * availableTimeslotsCount(classItem)} ${t(
                  'enrol:pickPeriodStep.forApplication'
                )} / ${availableTimeslotsCount(classItem)} ${t(
                  'enrol:pickPeriodStep.timeslotsAvailable'
                )}`
                break
              case ClassType.appointment:
                showRecurringText = `${siteSetting?.currency}${getSymbolFromCurrency(
                  siteSetting?.currency ?? ''
                )} ${classItem.tuition} ${t('enrol:pickPeriodStep.subscriptionPaymentDescription')}`
                break
              case ClassType.regularV2:
                showRecurringText = `${siteSetting?.currency}${getSymbolFromCurrency(
                  siteSetting?.currency ?? ''
                )} ${classItem.tuition} ${tuitionLabel}`
                break
              default:
                showRecurringText = ''
            }
          }

          {
            /* Unrelated to class type */
          }
          const percentage = () => {
            if (isClassUnavailable(classItem)) {
              return 100
            } else if (!classQuota || classQuota.length === 0) {
              return 0
            } else if (classQuota.some(enroll => enroll.remainingQuota <= enroll.quota)) {
              const totalRemainingQuota = classQuota.reduce(
                (sum, enroll) => sum + (enroll.remainingQuota || 0),
                0
              )
              const totalQuota = classQuota.reduce((sum, enroll) => sum + (enroll.quota || 0), 0)
              return ((totalQuota - totalRemainingQuota) / totalQuota) * 100
            } else {
              return 100
            }
          }

          {
            /* Unrelated to class type */
          }
          const remainingQuota = () => {
            if (isClassUnavailable(classItem)) {
              return 0
            } else if (!classQuota || classQuota.length === 0) {
              return quota
            } else {
              if (classItem.type === ClassType.workshop) {
                const minRemaining = Math.min(
                  ...classQuota.map(enroll => enroll.remainingQuota ?? Infinity)
                )
                return minRemaining === Infinity ? quota : minRemaining
              }

              const totalRemainingQuota = classQuota.reduce(
                (sum, enroll) => sum + (enroll.remainingQuota || 0),
                0
              )
              return Math.floor(totalRemainingQuota / classQuota.length)
            }
          }

          return (
            <div key={classItem.id} className="box-col-full mb-4">
              <BoxWithTextAction
                percentage={percentage()}
                quotaLeft={remainingQuota()}
                categoryIcon={<ClassTypeIcon classType={classItem.type} />}
                text={classItem.name}
                description={showRecurringText}
                icon={<FaChevronRight />}
                disabled={isClassUnavailable(classItem)}
                insufficient={isRecurringInsufficient(classItem)}
                action={() => {
                  updateSelectedClass(classItem)
                }}
              />
            </div>
          )
        })}
      </>
    )
  }

  if (!course || !classes || classes.length === 0) {
    return (
      <div className="box-col">
        <Text>{t('enrol:pickPeriodStep.noClasses')}</Text>
        <BackButton />
      </div>
    )
  }

  return (
    <div className="box-col items-start p-0">
      <div className="box-col-full lg:box-row-full items-end p-0">
        <Heading>{t('enrol:stepTitles.selectOption.event')}</Heading>

        {hasMultipleClass && (
          <div className="box-row-full justify-end">
            <span className="whitespace-nowrap">{t('enrol:pickClassStep.multipleClass')}</span>
            <Switch
              data-testid="multiple-class-switch"
              checked={isMultipleClass}
              onCheckedChange={handleSetMultipleClass}
            />
          </div>
        )}
      </div>

      {isMultipleClass && (
        <MultipleClassDialog
          open={isMultipleClassDialogOpen}
          setOpen={setIsMultipleClassDialogOpen}
          trigger={
            <Button
              id="selected-multi-class"
              className="self-end rounded-xl font-bold"
              variant="outlined"
              iconBefore={<FaListAlt />}
            >
              {t('enrol:pickClassStep.selectedClass')}
            </Button>
          }
        />
      )}

      <ClassSelectionBox />

      {enrolForm.selectedClassData.length > 0 && enrolForm.setMultipleClass && (
        <div className="box-row">
          <Button
            data-testid="proceed-btn"
            className="w-full"
            onClick={handleCheckOut}
            iconAfter={<FaChevronRight />}
          >
            {t('enrol:payment.proceed')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default PickClassStep
