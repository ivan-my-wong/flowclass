import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator'
import * as dayjs from 'dayjs'

import { IsDateStringCompare } from '@/common/decorators/date-string-comparison.decorator'
import { IsISOTimeString } from '@/common/decorators/time-string.decorator'
import { translateTimeZone } from '@/utils/time.utils'

import { LessonString } from './lesson-string'

export class WeeklyHour {
  static example = {
    start: '2023-05-16T15:00:00.000Z',
    duration: 120,
  }
  // input SUN-hh:mm - MON-hh:mm
  static weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  @ApiProperty({ example: '2023-03-17T09:00:00.000Z' })
  @IsNotEmpty()
  @IsISOTimeString()
  start: string

  @ApiProperty({ example: 120 })
  @IsNotEmpty()
  @IsNumber()
  duration: number

  getStartTime() {
    return this.start
  }

  getStartHour() {
    return this.getStartTime().split(':')[0]
  }

  getStartMinute() {
    return this.getStartTime().split(':')[1]
  }

  // getEndHour() {
  //   return this.getEndTime().split(':')[0];
  // }

  // getEndMinute() {
  //   return this.getEndTime().split(':')[1];
  // }

  /**
   *  Generate lesson string base on Weekly schedule
   * @param fromDate begin of period need to generate lesson
   * @param toDate end of period need to generate lesson
   * @param timezoneOffset timezone offset of local time in minute
   * @returns array of LessonString in Local timezone
   */
  toLessonStrings(fromDate: Date, toDate: Date, timezoneOffset = 0): LessonString[] {
    const lessons: LessonString[] = new Array<LessonString>()
    let now = new Date()
    if (now < fromDate) {
      now = fromDate
    }
    const startDate = new Date(this.start)
    const endDate = new Date(dayjs(startDate).add(this.duration, 'minutes').toISOString())
    if (startDate > toDate) {
      return []
    }

    // convert to local timezone
    let localStartDate = '',
      localEndDate = ''
    if (timezoneOffset > 0) {
      localStartDate = translateTimeZone(startDate, timezoneOffset)
      localEndDate = translateTimeZone(endDate, timezoneOffset)
    }

    // construct lesson string YYYY-MM-DDThh:mm:ss+08:00 YYYY-MM-DDThh:mm:ss+08:00
    const lesson = localStartDate + ' ' + localEndDate
    lessons.push(new LessonString(lesson))

    const nextStartDate = new Date(startDate)
    const nextEndDate = new Date(endDate)
    nextStartDate.setUTCDate(startDate.getUTCDate() + 7)
    nextEndDate.setUTCDate(endDate.getUTCDate() + 7)
    while (nextStartDate < toDate) {
      const localStart = translateTimeZone(nextStartDate, timezoneOffset)
      const localEnd = translateTimeZone(nextEndDate, timezoneOffset)
      const lesson = localStart + ' ' + localEnd
      lessons.push(new LessonString(lesson))
      nextStartDate.setUTCDate(nextStartDate.getUTCDate() + 7)
      nextEndDate.setUTCDate(nextEndDate.getUTCDate() + 7)
    }
    return lessons
  }

  static type_definition = {
    type: 'object',
    properties: {
      start: { type: 'string' },
      duration: { type: 'number' },
    },
  }
}

export class DateRange {
  @ApiProperty({ example: '2023-02-25' })
  @IsDateString()
  startTime: string

  @ApiProperty({ example: '2023-03-25' })
  @IsDateString()
  @IsDateStringCompare('after', 'startTime')
  endTime: string
}

export type ClassAsParam<T> = new (...args: any[]) => T
