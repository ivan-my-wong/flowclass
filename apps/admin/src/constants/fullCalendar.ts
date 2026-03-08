export const FIVE_MINUTES_INTERVALS = Object.freeze(
  Array.from({ length: 12 }, (_, i) => i * 5)
)
// Fallback timezone when site/institution timezone is unavailable.
// Do not set this as a global default; prefer site/institution tz or dayjs.tz.guess() first.
export const DEFAULT_TZ = 'Etc/UTC'
export const DRAG_TYPE = 'event' as const
export const HOUR_HEIGHT_PX = 56
export const MINUTES_IN_HOUR = 60

export const HOURS = Object.freeze(Array.from({ length: 24 }, (_, i) => i))

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
export const longDayNameFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
}
export const shortDayNameFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: 'short',
}

export const clockFormatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
}

export const dateMonthNameFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}
export const dateShortMonthFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

export const shortDateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  ...shortDayNameFormatOptions,
  ...clockFormatOptions,
  ...dateShortMonthFormatOptions,
}

export const longMonthDayFormatOptions: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
}
export const longMonthYearFormatOptions: Intl.DateTimeFormatOptions = {
  month: 'long',
  year: 'numeric',
}
export const shortMonthDayFormatOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
}

export const dateFormatOptions = {
  shortDateTime: shortDateTimeFormatOptions,
  dateMonthName: dateMonthNameFormatOptions,
  dateShortMonthName: dateShortMonthFormatOptions,
  clock: clockFormatOptions,
  longMonthDay: longMonthDayFormatOptions,
  shortMonthDay: shortMonthDayFormatOptions,
  longDayName: longDayNameFormatOptions,
  longMonthYear: longMonthYearFormatOptions,
  shortDayName: shortDayNameFormatOptions,
}

export const viewTypes = ['day', 'nDays', 'week', 'month', 'year', 'schedule']
