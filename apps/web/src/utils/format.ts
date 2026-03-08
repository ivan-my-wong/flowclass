import dayjs from 'dayjs'
import { unix } from 'moment'
import moment from 'moment-timezone'
import { formatPhoneNumberIntl } from 'react-phone-number-input'

import { StudentLesson } from '@/types/enrol'

export const formatPhoneNumber = (phone: string): string => {
  if (!phone || phone === '') {
    return ''
  }
  if (phone.includes('+')) {
    return formatPhoneNumberIntl(phone)
  }
  return formatPhoneNumberIntl(`+${phone}`)
}

//format unix timestamp to ISO 8601
// example input: 1708245900-1708249500
// expected output:'2024-02-18T08:45:00.000Z 2024-02-18T09:45:00.000Z'
export const formatUnixTime = (timeStampPair: string): string => {
  const dateStrings = timeStampPair.split('-')
  const timestamp1 = Number(dateStrings[0])
  const timestamp2 = Number(dateStrings[1])

  // TODO: Change moment js to day.js
  const dateTime1 = unix(timestamp1).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
  const dateTime2 = unix(timestamp2).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
  const formatedTimePair = `${dateTime1} ${dateTime2}`

  return formatedTimePair
}

export const formatStudentLessonToString = (studentLesson: StudentLesson): string => {
  if (!studentLesson) return ''
  const { startTime, endTime } = studentLesson
  return `${startTime} ${endTime}`
}

export const getTimeZone = (id: string) => {
  try {
    return moment.tz(id).format('Z')
  } catch (error) {
    return ''
  }
}

export const formatTime = (time: string, timezone?: string): string => {
  const date = dayjs().format('YYYY-MM-DD')
  // Use am or pm
  const timeFormat = dayjs(`${date} ${time}`)
  return timezone ? timeFormat.tz(timezone).format('hh:mm A') : timeFormat.format('hh:mm A')
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}
