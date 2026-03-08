import { format, utcToZonedTime } from 'date-fns-tz'
import * as dayjs from 'dayjs'

import { ClassEntity } from '@/models/classes.entity'
import { LessonString } from '@/models/custom-types/lesson-string'
import { EnrollClassMapping, EnrollIntoInfo } from '@/models/enroll-courses.entity'
import { addressDetail } from '@/models/institutions.entity'
import { PeriodLessons } from '@/models/period-lessons.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentScheduleWithUserAlias } from '@/models/student-schedule.entity'

export const addressObjectToString = (address?: addressDetail) => {
  if (!address) return ''

  return Object.values(address)
    .filter((v) => !!v)
    .join(', ')
}

export const lessonDateToString = (firstLesson: LessonString | string, timeZone: string) => {
  const [start, end] = firstLesson.split(' ')
  const startDate = utcToZonedTime(start, timeZone)
  const endDate = utcToZonedTime(end, timeZone)

  const formatStr = 'yyyy/MM/dd hh:mm a'
  const formatTimeStr = 'hh:mm a'
  return `${format(startDate, formatStr, { timeZone })} - ${format(
    endDate,
    startDate.getDate() === endDate.getDate() ? formatTimeStr : formatStr,
    {
      timeZone,
    }
  )}`
}

export const formatSessionDateString = (sessionDate?: PeriodLessons): string => {
  if (sessionDate && typeof sessionDate === 'string') {
    return sessionDate
  }
  if (
    sessionDate &&
    sessionDate instanceof PeriodLessons &&
    sessionDate.startTime &&
    sessionDate.endTime
  ) {
    return `${sessionDate.startTime.toString()} ${sessionDate.endTime.toString()}`
  }
  return null
}

export const exportStudentSchedule = (
  studentSchedule: StudentScheduleWithUserAlias,
  timeZone: string
) => {
  if (!studentSchedule.studentLessons || studentSchedule.studentLessons.length === 0) return ''
  const sortedLessons = studentSchedule.studentLessons
    .slice()
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  const periodLessonStr = sortedLessons.map(
    (o) => `${o.startTime.toISOString()} ${o.endTime.toISOString()}`
  )

  return periodLessonStr
    .map((lesson) => {
      return `${studentSchedule.userAlias.name} - ${lessonDateToString(lesson, timeZone)}`
    })
    .join('\n')
}

export const studentScheduleToString = (
  studentSchedule: StudentScheduleWithUserAlias[],
  timeZone: string,
  classes?: EnrollClassMapping[] | ClassEntity[]
): string => {
  if (!studentSchedule) return ''

  // Create a map of classId to class name from the passed classes
  const classMap = new Map<number, string>()
  if (classes && classes.length > 0) {
    for (const classItem of classes) {
      // Handle both EnrollClassMapping (has .class property) and ClassEntity (has .name directly)
      const classEntity = 'class' in classItem ? classItem.class : classItem
      if (classEntity?.id && classEntity?.name) {
        classMap.set(classEntity.id, classEntity.name)
      }
    }
  }

  // Group student schedules by class name
  // Each student schedule represents an enroll_course (or student_schedule)
  // We need to group them by class so lessons from the same class are together
  const groupedByClass = new Map<string, StudentScheduleWithUserAlias[]>()

  for (const schedule of studentSchedule) {
    // Get class name from the passed classes map, or fallback to schedule/lesson class
    let className: string | undefined
    if (schedule.classId && classMap.has(schedule.classId)) {
      className = classMap.get(schedule.classId)
    } else if (schedule.class?.name) {
      className = schedule.class.name
    } else if (schedule.studentLessons?.length > 0) {
      const firstLesson = schedule.studentLessons[0]
      if (firstLesson.classId && classMap.has(firstLesson.classId)) {
        className = classMap.get(firstLesson.classId)
      } else {
        className = firstLesson.class?.name || `Class ${schedule.classId || 'Unknown'}`
      }
    }
    if (!className) {
      className = `Class ${schedule.classId || 'Unknown'}`
    }

    if (!groupedByClass.has(className)) {
      groupedByClass.set(className, [])
    }
    const classSchedules = groupedByClass.get(className)
    if (classSchedules) {
      classSchedules.push(schedule)
    }
  }

  // Build the output string, grouping by class name
  const result: string[] = []
  for (const [className, schedules] of groupedByClass.entries()) {
    // Add class name header
    result.push(className)

    // Add all lessons for this class
    const classLessons = schedules
      .map((o) => exportStudentSchedule(o, timeZone))
      .filter((lesson) => lesson.trim() !== '') // Remove empty strings
      .sort()

    result.push(...classLessons)

    // Add separator between classes (but not after the last class)
    const classNames = Array.from(groupedByClass.keys())
    const isLastClass = classNames.indexOf(className) === classNames.length - 1
    if (result.length > 0 && !isLastClass) {
      result.push('---')
    }
  }

  return result.join('\n')
}

export const enrollIntoInfoToString = (enrollIntoInfo: EnrollIntoInfo): string => {
  const initialString = []
  if (enrollIntoInfo) {
    if (typeof enrollIntoInfo === 'string') {
      return enrollIntoInfo
    }
    // This is when enrollIntoInfo is an object

    Object.keys(enrollIntoInfo).forEach((key) => {
      // Keep only secondLevelName and thirdLevelName
      if (key === 'secondLevelName' || key === 'thirdLevelName') {
        initialString.push(enrollIntoInfo[key])
      }
    })

    return initialString.join('\n')
  }
  return ''
}

export const lessonObjectToString = (lessonArray: PeriodLessons[]): LessonString[] => {
  if (!lessonArray) return []
  const lessons: LessonString[] = lessonArray?.map((lesson) => {
    const startTime = dayjs(lesson?.startTime || dayjs())?.toISOString()
    const endTime = dayjs(lesson?.endTime || dayjs())?.toISOString()
    return new LessonString(`${startTime} ${endTime}`)
  })
  return lessons
}

export const studentLessonArrayToString = (
  lessonArray: StudentLesson[],
  timeZone: string
): string => {
  if (!lessonArray) return ''
  const lessons: string[] = []
  lessonArray?.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  lessonArray?.forEach((lesson) => {
    const formatted = lessonDateToString(
      `${lesson.startTime.toISOString()} ${lesson.endTime.toISOString()}`,
      timeZone
    )
    lessons.push(formatted)
  })
  return lessons.join('\n')
}

export const removeEmailPlusPart = (email: string): string => {
  if (!email) return ''

  const atIndex = email.indexOf('@')
  const plusIndex = email.indexOf('+')
  if (plusIndex !== -1 && atIndex !== -1 && plusIndex < atIndex) {
    return email.substring(0, plusIndex) + email.substring(atIndex)
  }
  return email
}

export const capitalizeString = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const splitName = (name: string): { firstName: string; lastName: string } => {
  const nameArray = name.split(' ')
  if (nameArray.length === 1) {
    return { firstName: nameArray[0], lastName: '' }
  }
  return { firstName: nameArray[0], lastName: nameArray.slice(1).join(' ') }
}

export const transformEmail = (email: string): string => {
  if (!email) return ''
  return email.trim().toLowerCase()
}

export const transformPhone = (phone: string): string => {
  if (!phone) return ''
  return phone.toString().trim().replace(/\+/g, '')
}

export const getNumberIdFromFieldId = (fieldId: string): number => {
  if (fieldId && fieldId.includes('.') && !isNaN(Number(fieldId.split('.')[2]))) {
    return Number(fieldId.split('.')[2])
  }
  if (typeof fieldId === 'number') {
    return fieldId
  }
  return null
}

export const parseStringToArray = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed.startsWith('[') && !trimmed.endsWith(']')) {
    const arrayItem = trimmed.split(',')

    if (Array.isArray(arrayItem) && arrayItem.length > 0) {
      return arrayItem.map((item) => item.trim())
    }
    return []
  }
  // Otherwise, remove the [ and ] and split by comma
  const parsed = JSON.parse(trimmed.replace(/[\[\]]/g, '').trim())
  if (Array.isArray(parsed)) {
    return parsed
  }
  return []
}
