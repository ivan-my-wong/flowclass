import { DefaultTFuncReturn, t } from 'i18next'

import {
  hoursSelectItems,
  minuteSelectItems,
} from '@/constants/timeSelectItems'

import Text from '../Texts/Text'
import Box from '../ui/Box'

import Select from './Select'

export type intervalSelectorProps = {
  currentSelectHour: number
  currentSelectMinute: number
  onSelectHourChange: (val: any) => void
  onSelectMinuteChange: (val: any) => void
  helperText?: DefaultTFuncReturn | string
  isError?: boolean
}

const IntervalSelector = ({
  currentSelectHour,
  currentSelectMinute,
  onSelectHourChange,
  onSelectMinuteChange,
  helperText,
  isError = false,
}: intervalSelectorProps): JSX.Element => {
  return (
    <>
      <Box direction="col">
        <Box justify="start">
          <Select
            id="hours"
            placeholder=""
            selectItems={[
              {
                itemValues: hoursSelectItems,
              },
            ]}
            currentSelect={currentSelectHour}
            onValueChange={onSelectHourChange}
          />
          <Text>{t(`teachingService:class.hours`)}</Text>

          <Select
            id="mins"
            placeholder=""
            selectItems={[
              {
                itemValues: minuteSelectItems,
              },
            ]}
            currentSelect={currentSelectMinute}
            onValueChange={onSelectMinuteChange}
          />
          <Text>{t(`common:unit.minutes`)}</Text>
        </Box>
        {helperText && (
          <Text
            size="small"
            type={isError ? 'error' : undefined}
            css={{ color: isError ? '$warn' : '$text' }}
          >
            {helperText}
          </Text>
        )}
      </Box>
    </>
  )
}

export default IntervalSelector
