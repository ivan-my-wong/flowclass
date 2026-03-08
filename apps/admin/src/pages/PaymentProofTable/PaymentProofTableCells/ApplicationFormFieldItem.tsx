import { useMemo } from 'react'

import dayjs from 'dayjs'
import * as _ from 'lodash'

import { TableCell, TableRow } from '@/components/ui/Table'
import { DATE_LOCAL_FORMAT } from '@/constants/dateTimeFormat'
import { Locale } from '@/stores/siteData'
import { validateIsoDate } from '@/utils/validate'

import { booleanFieldValue } from '../tableFormatter'

type PropsType = {
  label: string
  value: string | null | number | string[]
  tz?: Locale | undefined
}

const ApplicationFormFieldItem = ({
  label,
  value,
  tz,
}: PropsType): JSX.Element => {
  const formattedValue = useMemo(() => {
    if (validateIsoDate(value as string)) {
      return dayjs(value as string).format(DATE_LOCAL_FORMAT)
    }
    if (typeof value === 'boolean') {
      return booleanFieldValue(value as boolean)
    }
    if (typeof value === 'number') {
      return value.toString()
    }
    if (_.isArray(value)) {
      return value.join(', ')
    }

    return value || '-'
  }, [value, tz?.id])
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell>{formattedValue}</TableCell>
    </TableRow>
  )
}

export default ApplicationFormFieldItem
