import { defaultRepeatFormat, RepeatUnit } from '@/constants/course'
import {
  Classes,
  ClassesForm,
  RecurringSchedules,
  RegularPeriods,
} from '@/types/classes'

import dayjs from './dayjs'
import { shallow, ShallowIface } from './shallow'
import { addMinutesToDate, addRepeatTypeToDate } from './timeFormat'

type ToClassFormDataOptions = {
  classData: ClassesForm | Classes
  transformIdentifier?: boolean
  revertIdentifier?: boolean
}
const processArrayItems = <T extends object>(
  items: T[] | undefined,
  excludeFields: string[] = ['uid']
): T[] => {
  if (!items) return []
  return items.map(item =>
    shallow<T>({
      source: item,
      fields: item
        ? Object.keys(item as object).filter(
            key => !excludeFields.includes(key)
          )
        : [],
    })
  )
}

/**
 * Converts class data to a format suitable for form handling
 *
 * @param classData - The class data to be transformed
 * @param transformIdentifier - If true, replaces 'id' with 'dataId'
 * @param revertIdentifier - If true, replaces 'dataId' with 'id'
 * @returns Transformed class data ready for form submission
 */
export const convertToClassFormData = ({
  classData,
  transformIdentifier = false,
  revertIdentifier = false,
}: ToClassFormDataOptions): ClassesForm => {
  const options: ShallowIface<ClassesForm> = {
    source: classData as ClassesForm,
    // Exclude 'isDirty' and 'course' to break circular reference
    fields: Object.keys(classData).filter(
      key => key !== 'isDirty' && key !== 'course'
    ),
  }

  if (transformIdentifier) {
    options.fieldsReplace = { id: 'dataId' }
  }
  if (revertIdentifier) {
    options.fieldsReplace = { dataId: 'id' }
  }

  const shallowedClassData = shallow<ClassesForm>(options)

  shallowedClassData.regularPeriods = processArrayItems<RegularPeriods>(
    shallowedClassData.regularPeriods
  )
  shallowedClassData.recurringSchedules = processArrayItems<RecurringSchedules>(
    shallowedClassData.recurringSchedules
  )

  // If we need course ID, we can preserve just that without the full course object
  if (classData.course?.id) {
    // Manually set courseId from the course object to maintain the relationship
    // without creating circular references
    shallowedClassData.courseId = classData.course.id
  }

  return shallowedClassData
}

export const defaultRegularPeriod = (
  courseId: number,
  addMinutes = 60,
  unit = RepeatUnit.days
) => {
  const firstStartDate = addRepeatTypeToDate(new Date().toISOString(), unit, 1)
  return {
    courseId,
    // Default name should be current year and month, use the dayjs package
    name: dayjs().format('YYYY-MM'),
    lessons: [
      {
        startTime: firstStartDate,
        endTime: addMinutesToDate(firstStartDate, addMinutes),
      },
    ],
    duration: addMinutes,
    repeatFormat: defaultRepeatFormat,
  }
}
