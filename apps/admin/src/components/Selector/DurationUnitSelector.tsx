import { t } from 'i18next'

import SelectDefault from '@/components/Selector/Select'
import { RepeatUnit } from '@/constants/course'

interface DurationUnitSelectorProps {
  currentSelect: string
  onValueChange: (value: RepeatUnit) => void
}
const DurationUnitSelector = ({
  currentSelect,
  onValueChange,
}: DurationUnitSelectorProps) => {
  const tabSelectProps = {
    placeholder: t(`teachingService:class.editDuration`),
    selectItems: [
      {
        group: t(`teachingService:enrollment.enrollmentModal.type`),
        itemValues: [
          {
            value: RepeatUnit.weeks,
            label: t(`teachingService:class.weeks`),
          },
          { value: RepeatUnit.days, label: t(`teachingService:class.days`) },
          {
            value: RepeatUnit.months,
            label: t(`teachingService:class.months`),
          },
        ],
      },
    ],
    currentSelect,
    onValueChange,
  }

  return (
    <>
      <SelectDefault {...tabSelectProps} />
    </>
  )
}

export default DurationUnitSelector
