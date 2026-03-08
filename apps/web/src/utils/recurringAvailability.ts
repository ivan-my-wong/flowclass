import { RecurringSchedule } from '@/types'
import { getDatesForWeekdaysByStartEndTime } from '@/utils/calendar'
import dayjs from '@/utils/dayjs'

export function countValidRecurringDaysWithinAP(
  schedules: RecurringSchedule[] = [],
  apStart?: dayjs.Dayjs,
  apEnd?: dayjs.Dayjs,
  timeZone = 'UTC'
): number {
  if (!apStart || !apEnd || schedules.length === 0) return Infinity

  const days = getDatesForWeekdaysByStartEndTime(
    schedules.map(s => s.weekDay),
    apStart.toDate(),
    apEnd.toDate()
  )

  const apStartTz = apStart.tz(timeZone)
  const apEndTz = apEnd.tz(timeZone)

  let count = 0
  for (const d of days) {
    const dateStr = dayjs(d).format('YYYY-MM-DD')
    const ok = schedules.some(s => {
      const st = dayjs.tz(`${dateStr} ${s.startTime}`, timeZone)
      const en = dayjs.tz(`${dateStr} ${s.endTime}`, timeZone)
      return !st.isBefore(apStartTz) && !en.isAfter(apEndTz)
    })
    if (ok) count++
  }
  return count
}
