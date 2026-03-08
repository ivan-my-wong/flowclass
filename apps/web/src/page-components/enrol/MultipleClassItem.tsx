import { useMemo, useState } from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'

import getSymbolFromCurrency from 'currency-symbol-map'
import { FaTrashAlt } from 'react-icons/fa'

import IconButton from '@/components/Buttons/IconButton'
import BoxWithTextAction from '@/components/PresetBlocks/BoxWithTextAction'
import { enrolState, SelectedClassDataState } from '@/stores/enrol'
import { SettingsState } from '@/stores/settingsData'
import { ClassType, PeriodLesson } from '@/types'
import { getDateTimeByAmPm } from '@/utils/calculateTime'

type MultipleClassItemProps = {
  classItem: SelectedClassDataState
  index: number
}
const MultipleClassItem = ({ classItem, index }: MultipleClassItemProps): JSX.Element => {
  const [enrolForm, setEnrolForm] = useRecoilState(enrolState)
  const [classList, setClassList] = useState(enrolForm.selectedClassData)

  const { siteSettings } = useRecoilValue(SettingsState)
  const isRecurringLesson = useMemo(() => {
    return classItem?.selectedClass?.type === ClassType.recurring
  }, [classItem?.selectedClass?.type])
  const classLessons = useMemo(() => {
    if (isRecurringLesson) {
      return classItem?.selectedRecurLessons || classItem?.selectedIndividualRecurLessons || []
    }
    return classItem?.selectedLessons || []
  }, [
    isRecurringLesson,
    classItem?.selectedLessons,
    classItem?.selectedRecurLessons,
    classItem?.selectedIndividualRecurLessons,
  ])

  const timeString = useMemo(() => {
    if (!isRecurringLesson && classLessons.length > 0) {
      const periodLesson = classLessons.at(0) as PeriodLesson
      return `${getDateTimeByAmPm(periodLesson?.startTime ?? '')} - ${getDateTimeByAmPm(
        periodLesson?.endTime ?? ''
      )}`
    }
    if (isRecurringLesson && classLessons.length > 0) {
      const recurringLesson = (classLessons.at(0) as string).split(' ')
      return `${getDateTimeByAmPm(recurringLesson[0])} - ${getDateTimeByAmPm(recurringLesson[1])}`
    }
    return ''
  }, [isRecurringLesson, classLessons])

  return (
    <div className="mb-2 flex items-center justify-between border-gray-300 pb-2">
      {/* Container */}
      <div className="flex w-full justify-between ">
        <BoxWithTextAction
          text={classItem?.selectedClass?.name ?? ''}
          icon={
            <IconButton
              icon={<FaTrashAlt style={{ color: 'red' }} />}
              plain
              onClick={() => {
                // Remove item from classList and update enrolForm
                const updatedClassList = [...classList]
                updatedClassList.splice(index, 1)
                const updatedTuition = [...enrolForm.tuition]
                updatedTuition.splice(index, 1)
                setClassList(updatedClassList)
                setEnrolForm(prev => ({
                  ...prev,
                  selectedClassData: updatedClassList,
                  currentSelectedClassIndex: 0,
                  tuition: updatedTuition,
                }))
              }}
            />
          }
          description={` ${timeString} / ${siteSettings.currency ?? ''}${getSymbolFromCurrency(
            siteSettings?.currency ?? ''
          )}${enrolForm.tuition[index]?.paymentAmount}`}
        />
      </div>
    </div>
  )
}

export default MultipleClassItem
