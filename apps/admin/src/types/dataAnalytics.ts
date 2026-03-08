export type SchoolCourseRevenueDto = {
  institutionId: number
  courseId?: number
  startDate?: string
  endDate?: string
}

export type SchoolCourseRevenueAmount = {
  totalAmount: number
  date: string
}
