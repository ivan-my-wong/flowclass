import { Classes } from '@/types/classes'
import { ClassOpts, TypeOpts } from '@/types/student'
import { isClassUnavailable } from '@/utils/calculate-course'

import dayjs from './dayjs'

// eslint-disable-next-line import/prefer-default-export
export const filterClassOptionItems = (
  classData: Classes[],
  classes: ClassOpts[]
): ClassOpts[] => {
  const availableClassIds = classData
    .filter(classItem => !isClassUnavailable(classItem, true))
    .filter(classItem => !classItem.isArchived)
    .map(classItem => classItem.id)

  const classesArray: ClassOpts[] = Array.isArray(classes)
    ? classes
    : Object.values(classes || {})

  return classesArray.filter(
    (classItem: ClassOpts) =>
      classItem.value && availableClassIds.includes(+classItem.value)
  )
}

export const filterPeriodOptionItems = (periods: TypeOpts[]): TypeOpts[] => {
  return periods.filter(period =>
    period.data?.some(dateString =>
      dayjs(dateString.split(' ')[0]).isAfter(dayjs().startOf('day'))
    )
  )
}

export const createOption = (label: string) => ({
  label,
  value: label.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, ''),
})
