import { useEffect, useMemo } from 'react'

import { useRecoilState } from 'recoil'

import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { FaChevronRight } from 'react-icons/fa'
import { toast } from 'sonner'

import BoxWithTextAction from '@/components/PresetBlocks/BoxWithTextAction'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { defaultTuition, enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { TuitionMode } from '@/types/class'
import {
  enrolCourseScrollAction,
  updateCurrentSelectedClass,
  updateSelectedClassTuition,
} from '@/utils/courseDisplay'
import { countValidRecurringDaysWithinAP } from '@/utils/recurringAvailability'
import { getPriceWithCurrency } from '@/utils/string.utils'

export type PriceOption = {
  id: number
  name: string
  amount: number
  numberOfLessons: number
}

const PickPriceOptionStep = (): JSX.Element => {
  const { siteSetting } = useEnrolState()
  const { t } = useTranslation()
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const [, setPrevSelectedOption] = useRecoilState(prevSelectedOptionState)
  const [currentTheme] = useRecoilState(currentWebsiteTheme)

  const currentSelectedClassData = enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]
  const selectedClass = currentSelectedClassData?.selectedClass

  const priceOptions: PriceOption[] = selectedClass?.priceOptions || []
  const sortedPriceOptions = [...priceOptions].sort((a, b) => a.numberOfLessons - b.numberOfLessons)

  const apStart = selectedClass?.applicationPeriod?.startDatetime
    ? dayjs(selectedClass.applicationPeriod.startDatetime)
    : undefined
  const apEnd = selectedClass?.applicationPeriod?.endDatetime
    ? dayjs(selectedClass.applicationPeriod.endDatetime)
    : undefined

  const totalAvailableWithinAP = useMemo(() => {
    return countValidRecurringDaysWithinAP(
      selectedClass?.recurringSchedules || [],
      apStart,
      apEnd,
      siteSetting?.timeZone || 'UTC'
    )
  }, [selectedClass, apStart?.toString(), apEnd?.toString(), siteSetting?.timeZone])

  useEffect(() => {
    if (!selectedClass || !hasMultiplePriceOptions()) {
      setEnrolForm(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
      }))
      return
    }

    if (priceOptions.length === 0) {
      toast.error(t('errors:ENROL.NO_PRICE_OPTIONS') as string)
      setEnrolForm(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }))
      return
    }
    if (currentSelectedClassData?.selectedPriceOption) {
      const selectedOption = currentSelectedClassData.selectedPriceOption
      handleSelectPriceOption(selectedOption)
      return
    }
    setPrevSelectedOption(prev => ({
      ...prev,
      currentStep: enrolForm.currentStep - 1,
    }))
  }, [selectedClass, priceOptions.length, currentSelectedClassData?.selectedPriceOption])

  const hasMultiplePriceOptions = (): boolean => {
    return selectedClass?.priceType === TuitionMode.MULTIPLE_OPTIONS
  }

  const handleSelectPriceOption = (option: PriceOption) => {
    if (!siteSetting?.currency) {
      toast.error(t('errors:ENROL.CURRENCY_NOT_SET') as string)
      return
    }

    setEnrolForm(prev => {
      const updatedSelectedClassData = updateCurrentSelectedClass(
        prev.selectedClassData,
        prev.currentSelectedClassIndex,
        {
          selectedPriceOption: option,
        }
      )

      const tuitionData = {
        originalFee: option.amount,
        paymentAmount: option.amount,
        feePerLesson:
          option.numberOfLessons > 0 ? option.amount / option.numberOfLessons : option.amount,
        currency: siteSetting.currency,
        couponDiscount: 0,
        directDiscount: 0,
        bundleDiscount: 0,
        recurringDiscount: 0,
        totalDiscount: 0,
      }

      const updatedTuition =
        prev.tuition.length > 0
          ? updateSelectedClassTuition(prev.tuition, prev.currentSelectedClassIndex, tuitionData)
          : [{ ...defaultTuition, ...tuitionData }]

      return {
        ...prev,
        currentStep: prev.currentStep + 1,
        selectedClassData: updatedSelectedClassData,
        tuition: updatedTuition,
      }
    })

    enrolCourseScrollAction(currentTheme)
  }

  if (!selectedClass || !hasMultiplePriceOptions()) {
    return <></>
  }

  return (
    <div className="box-col items-start p-0">
      <Heading>{t('enrol:pickPriceOptionStep.title')}</Heading>
      <Text className="mb-4">{t('enrol:pickPriceOptionStep.description')}</Text>

      <div className="box-col-full w-full gap-3">
        {sortedPriceOptions.map(option => {
          const expected = option.numberOfLessons || 0
          const insufficient = expected > 0 && expected > totalAvailableWithinAP
          return (
            <BoxWithTextAction
              insufficient={insufficient}
              key={option.id}
              data-testid={`price-option-${option.id}`}
              text={getPriceWithCurrency(siteSetting?.currency, option.amount)}
              description={
                <div className="mt-2">
                  <div className="font-semibold">{option.name}</div>
                  {option.numberOfLessons && (
                    <div className="text-sm text-gray-600">
                      {t('enrol:pickPriceOptionStep.numOfLesson', {
                        count: option.numberOfLessons,
                      })}
                    </div>
                  )}
                  {insufficient && (
                    <div className="text-warn mt-2 text-sm">
                      {t('enrol:pickPriceOptionStep.insufficientLessonsWithinPeriod')}
                    </div>
                  )}
                </div>
              }
              icon={<FaChevronRight />}
              action={() => handleSelectPriceOption(option)}
              disabled={insufficient}
            />
          )
        })}
      </div>
    </div>
  )
}

export default PickPriceOptionStep
