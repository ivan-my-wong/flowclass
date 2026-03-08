// Types for Google Calendar events
export type GoogleCalendarEvent = {
  kind?: string
  etag?: string
  id: string
  status: string
  htmlLink: string
  created: string
  updated: string
  summary: string
  description?: string
  creator: {
    email: string
    displayName?: string
    self?: boolean
  }
  organizer: {
    email: string
    displayName?: string
    self?: boolean
  }
  start: {
    date?: string
    dateTime?: string
    timeZone?: string
  }
  end: {
    date?: string
    dateTime?: string
    timeZone?: string
  }
  transparency?: string
  visibility?: string
  iCalUID?: string
  sequence?: number
  eventType?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
    self?: boolean
    organizer?: boolean
    optional?: boolean
  }>
}

export type GoogleCalendarItem = {
  id: string
  kind: string
  etag: string
  summary: string
  description?: string
  primary?: boolean
  selected?: boolean
  accessRole: string
  backgroundColor?: string
  foregroundColor?: string
  colorId?: string
  timeZone?: string
  defaultReminders?: Array<{
    method: string
    minutes: number
  }>
  notificationSettings?: {
    notifications: Array<{
      type: string
      method: string
    }>
  }
  conferenceProperties?: {
    allowedConferenceSolutionTypes: string[]
  }
}
