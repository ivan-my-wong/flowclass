export type StatType = 'revenue' | 'student'

export type StatFilter =
  | 'overview'
  | 'by-course'
  | 'by-class'
  | 'by-instructor'
  | 'by-student'

export const isValidStatType = (value: string | null): value is StatType => {
  return value === 'revenue' || value === 'student'
}

export const isValidStatFilter = (
  value: string | null
): value is StatFilter => {
  return (
    value === 'overview' ||
    value === 'by-course' ||
    value === 'by-class' ||
    value === 'by-instructor' ||
    value === 'by-student'
  )
}

export interface LessonListParams {
  startDate: string
  endDate: string
  siteId: number
  institutionId: number
  page?: number
  limit?: number
  status?: string
  courseId?: number
  classId?: number
  instructorId?: number
  studentName?: string
  lessonId?: number
  lessonName?: string
}

export interface LessonDetailParams {
  lessonId: number
  institutionId: number
  siteId: number
}

export type StatFilterParams = {
  studentName?: string
  classId?: string
  teacherId?: string
  lessonId?: string
  status?: string
}
