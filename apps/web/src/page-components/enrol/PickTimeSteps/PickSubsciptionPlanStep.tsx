import { useEffect } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { FaChevronRight } from 'react-icons/fa'

import BoxWithTextAction from '@/components/PresetBlocks/BoxWithTextAction'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { defaultTuition, enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { ClassType } from '@/types'
import {
  calculateBillingEndDate,
  calculateBillingNextDate,
  getFormatDate,
} from '@/utils/calculateTime'
import {
  enrolCourseScrollAction,
  updateCurrentSelectedClass,
  updateSelectedClassTuition,
} from '@/utils/courseDisplay'
import { getPriceWithCurrency } from '@/utils/string.utils'

const PickSubscriptionPlanStep = (): JSX.Element => {
  const { course, siteSetting } = useEnrolState()
  const { t } = useTranslation()

  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)

  const currentSelectedClassData = enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]

  const selectedClass = currentSelectedClassData?.selectedClass

  const [, setPrevSelectedOption] = useRecoilState(prevSelectedOptionState)
  const [currentTheme, setCurrentTheme] = useRecoilState(currentWebsiteTheme)

  /**
   * Going back should not change the tuition because the user has not selected the tuition yet
   */
  useEffect(() => {
    if (!selectedClass || selectedClass?.type !== ClassType.subscription) {
      setEnrolForm(prev => ({
        ...prev,
        currentStep: enrolForm.currentStep - 1,
      }))
    }

    setPrevSelectedOption(prev => {
      const currentSelectedClass =
        enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex].selectedClass
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
        currentStep: enrolForm.currentStep - 1,
        selectedClassData: updatedSelectedClassData,
      }
    })
  }, [])

  if (!selectedClass) {
    return <></>
  }

  const priceExplanation = `${getPriceWithCurrency(siteSetting?.currency, selectedClass.tuition)} `

  return (
    <div className="box-col items-start p-0">
      <Heading>{t('enrol:pickTuitionStep.pickOption')}</Heading>
      <Text>
        {t('enrol:pickSubscriptionPlanStep.buyPlanRemind')} {priceExplanation}/
        {selectedClass.recurringFormat.every} {selectedClass.recurringFormat.unit}.{' '}
        {t('enrol:pickSubscriptionPlanStep.billCycleRepeat')} {selectedClass.recurringFormat.times}{' '}
        {t('enrol:repeatType.times')}.
      </Text>
      <BoxWithTextAction
        data-testid={'tuition-option'}
        text={`${priceExplanation}`}
        description={
          <>
            <div className="mt-2 flex flex-col gap-2" id="billingDate">
              <div>
                {t('enrol:pickSubscriptionPlanStep.billingCycleStartDate')}:{' '}
                {getFormatDate(new Date().toString())}
              </div>
              <div>
                {t('enrol:pickSubscriptionPlanStep.billingCycleNextDate')}:{' '}
                {calculateBillingNextDate(selectedClass.recurringFormat)}
              </div>
              <div>
                {t('enrol:pickSubscriptionPlanStep.billingCycleEndDate')}:{' '}
                {calculateBillingEndDate(selectedClass.recurringFormat)}
              </div>
            </div>
          </>
        }
        icon={<FaChevronRight />}
        action={() => {
          if (siteSetting?.currency) {
            setEnrolForm(prev => {
              const updatedSelectedClassData = updateCurrentSelectedClass(
                prev.selectedClassData,
                prev.currentSelectedClassIndex,
                {}
              )

              const updatedTuition =
                prev.tuition.length > 0
                  ? updateSelectedClassTuition(
                      prev.tuition,
                      prev.currentSelectedClassIndex,

                      {
                        originalFee: selectedClass.tuition,
                        paymentAmount: selectedClass.tuition,
                        feePerLesson: selectedClass.tuition,
                        couponDiscount: 0,
                        directDiscount: 0,
                        bundleDiscount: 0,
                        recurringDiscount: 0,
                        totalDiscount: 0,
                        currency: siteSetting?.currency,
                      }
                    )
                  : [
                      {
                        ...defaultTuition,
                        originalFee: selectedClass.tuition,
                        paymentAmount: selectedClass.tuition,
                        feePerLesson: selectedClass.tuition,
                        currency: siteSetting?.currency,
                      },
                    ]

              return {
                ...prev,
                currentStep: prev.setMultipleClass ? 0 : prev.currentStep + 1,
                selectedClassData: updatedSelectedClassData,
                tuition: updatedTuition,
              }
            })

            enrolCourseScrollAction(currentTheme)
          }
        }}
      />
    </div>
  )
}

export default PickSubscriptionPlanStep
