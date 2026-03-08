import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import relativeTime from 'dayjs/plugin/relativeTime'
import tz from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import 'dayjs/locale/zh-tw'
// For parsing dates in custom formats (e.g., from API responses)
dayjs.extend(customParseFormat)
// For relative time formatting (e.g., "2 hours ago")
dayjs.extend(relativeTime)
// For calculating time durations
dayjs.extend(duration)
// For date range checks
dayjs.extend(isBetween)
// For UTC date handling
dayjs.extend(utc)
// For date comparison operations
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
// For timezone support
dayjs.extend(tz)

export default dayjs
