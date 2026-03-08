import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { toast } from 'sonner'

import Text from '@/components/Texts/Text'
import { enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { ClassType } from '@/types'

import PickAppointmentTime from '../Appointment/PickAppointmentTime'

import PickRecurringLesson from './PickRecurringLesson'

const PickRecurPeriodStep = (): JSX.Element => {
  const { t } = useTranslation()
  const { course, originalUrl } = useEnrolState()
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const router = useRouter()

  const [, setPrevSelectedOption] = useRecoilState(prevSelectedOptionState)
  const currentSelectedClassData = useMemo(() => {
    return enrolForm.selectedClassData[enrolForm.currentSelectedClassIndex]
  }, [enrolForm.selectedClassData, enrolForm.currentSelectedClassIndex])

  const classType = currentSelectedClassData?.selectedClass?.type
  const classes = course?.classes ?? []
  let lessonDates = classes
    .filter(classItem => classItem.id === currentSelectedClassData?.selectedClass?.id)
    .map(classItem => classItem.recurringSchedules)
    .flat()
  const selectedPriceOption = currentSelectedClassData?.selectedPriceOption

  if (selectedPriceOption?.numberOfLessons) {
    lessonDates = lessonDates.slice(0, selectedPriceOption.numberOfLessons)
  }
  useEffect(() => {
    if (!course) {
      toast.error(t('errors:ENROL.PLEASE_PICK_COURSE') as string)
      router.push(originalUrl ?? '/')
    }

    if (!enrolForm.selectedClassData) {
      toast.warning(t('errors:ENROL.PLEASE_PICK_CLASS') as string)
      setEnrolForm(prev => ({ ...prev, currentStep: 0 }))
    }
  }, [course, enrolForm.selectedClassData, originalUrl, router, setEnrolForm, t])

  useEffect(() => {
    if (enrolForm.setMultipleClass) {
      const prevClassData = [...enrolForm.selectedClassData]
      prevClassData.splice(enrolForm.currentSelectedClassIndex, 1)

      const prevTuitionData = [...enrolForm.tuition]
      prevTuitionData.splice(enrolForm.currentSelectedClassIndex, 1)

      setPrevSelectedOption(prev => ({
        ...prev,
        selectedClassData: prevClassData,
        tuition: prevTuitionData,
      }))
    } else {
      setPrevSelectedOption({
        ...enrolForm,
        currentStep: enrolForm.currentStep - 1,
        selectedClassData: [],
        tuition: [],
      })
    }
  }, [])

  if (classType === ClassType.appointment) {
    return (
      <div className="box-col-full border-borderColor w-full items-start rounded-md border p-4">
        <PickAppointmentTime />
      </div>
    )
  }

  if (!course || !lessonDates || lessonDates.length === 0) {
    return <Text>{t('enrol:pickPeriodStep.noPhases')}</Text>
  }

  return (
    <div className="box-col-full border-borderColor w-full items-start rounded-md border p-4">
      <PickRecurringLesson />
    </div>
  )
}

export default PickRecurPeriodStep
