import { ComponentPropsWithoutRef, useMemo } from 'react'

import dayjs from '@/utils/dayjs'
import { formatTs } from '@/utils/timeFormat'

type Props = {
  format?: string
  value: Date
  useFromNow?: boolean
} & ComponentPropsWithoutRef<'span'>
const DateColumn = ({
  format,
  value,
  useFromNow,
  ...props
}: Props): JSX.Element => {
  const formattedValue = useMemo(() => {
    if (!value) return '-'
    if (useFromNow) {
      return dayjs(value).fromNow()
    }
    return formatTs(value, format)
  }, [format, value, useFromNow])
  return <span {...props}>{formattedValue}</span>
}
export default DateColumn
