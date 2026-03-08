import * as dayjs from 'dayjs'
import * as duration from 'dayjs/plugin/duration'
import * as isBetween from 'dayjs/plugin/isBetween'
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import * as weekday from 'dayjs/plugin/weekday'

export const init = () => {
  dayjs.extend(isSameOrBefore)
  dayjs.extend(duration)
  dayjs.extend(isBetween)
  dayjs.extend(weekday)
}
