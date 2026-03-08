import { t } from 'i18next'

import { getDurationArray } from '@/utils/time-picker.utils'

import SelectDefault from './Select'

interface DurationSelectorProps {
  currentSelect: string
  onValueChange: (value: string) => void
}

const DurationSelector = ({
  currentSelect,
  onValueChange,
}: DurationSelectorProps) => {
  const durationArray = getDurationArray()
  const tabSelectProps = {
    placeholder: t('component:select.placeholder'),
    selectItems: [
      {
        group: t('component:select.selectDuration'),
        itemValues: durationArray,
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

export default DurationSelector
