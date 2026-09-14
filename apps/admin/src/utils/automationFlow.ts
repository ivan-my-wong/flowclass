export const ONE_TIME_EVENTS = [
  'Send Notification After Finish Application',
  'Send Notification After Admin Approve Payment',
  'Send Notification When Add New Lesson',
  'Send Notification When Add New Class',
  'Send Lesson Reminder',
] as const

export const shouldShowFrequency = (flowName: string): boolean => {
  return !ONE_TIME_EVENTS.includes(flowName as (typeof ONE_TIME_EVENTS)[number])
}
