export type Session = {
  id: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  siteId: number
  institutionId: number
  courseId: number
  name: string
  totalFee: number
  quota: number
  location: string | null
  sessionDates: SessionDates[]
}

export type SessionDates = {
  id: number
  sessionId: number
  startTime: Date
  endTime: Date
}
