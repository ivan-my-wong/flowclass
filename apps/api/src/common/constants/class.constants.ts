import { FindOptionsSelect } from 'typeorm'

import { ClassEntity } from '@/models/classes.entity'

export const classSelectRelations: FindOptionsSelect<ClassEntity> = {
  id: true,
  name: true,
  type: true,
  defaultPriceId: true,
  quota: true,
  courseId: true,
  priceType: true,
  priceOptions: true,
  applicationPeriod: {
    startDatetime: true,
    endDatetime: true,
  },
  recurringFormat: {
    id: true,
    createdAt: true,
    every: true,
    times: true,
    repeat: true,
    unit: true,
    weekday: true,
    weekdayOccurrence: true,
    startTime: true,
    institutionId: true,
  },
  instructor: {
    id: true,
    firstName: true,
    lastName: true,
  },
  locationRoom: {
    id: true,
    name: true,
    address: true,
  },
  course: {
    name: true,
    id: true,
  },
  institutionId: true,
  siteId: true,
  appointment: {
    availability: {
      id: true,
      name: true,
      availableSchedules: {
        dayOfWeek: true,
        endTime: true,
        isEnabled: true,
        startTime: true,
      },
      dateOverrides: true,
    },
    dailyLimit: true,
    gapBetweenAppointmentsMinutes: true,
    durationMinutes: true,
    bookingCondition: {
      hoursIntoFuture: true,
      indefinitelyIntoFuture: true,
      type: true,
      withinDateRangeEndTime: true,
      withinDateRangeStartTime: true,
    },
    expireCondition: {
      certainExpireDate: true,
      daysAfterBooking: true,
      type: true,
    },
  },
  regularScheduleV2: {
    id: true,
    periodRepeatFormat: {
      every: true,
      unit: true,
      startTime: true,
    },
    gapBetweenPeriods: {
      every: true,
      unit: true,
      startTime: true,
    },
    periodRepeatCount: true,
    selectionMode: true,
    dateOverrides: true,
    periodsV2: {
      id: true,
      startTime: true,
      endTime: true,
      lessonRepeatFormatId: true,
    },
  },
  recurringSchedules: {
    id: true,
    startTime: true,
    endTime: true,
    weekDay: true,
  },
}
