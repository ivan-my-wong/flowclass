import { SharedVideoStatus } from '@/constants/course'
import { QRCodeAttendanceDto } from '@/pages/StudentCRM/QRCode/QRCodeScan'
import { ClassTypeEnum, Course } from '@/types/course'
import { IPaginatedData, PaginateOptionParams } from '@/types/pagination'
import { UserAlias } from '@/types/studentMemo'

import { MediaMaterialsType } from './class-material'
import { Classes } from './classes'
import { EnrollCourseInstance } from './enrollCourse'
import { StudentLesson } from './student'
import { StudentSubmissionType } from './student-submission'
import { BaseUser } from './user'

export type StudentType = {
  classId: number
  date: Date
  end: Date
  start: Date
  id: number
  isCheckin: false
  name: string
  email: string
  phone: string
  payments: {
    createdAt: Date
    paymentState: string
  }
  userId: number
  changeDate: Date | null
  changeEndTime: Date | null
  changeStartTime: Date | null
  attendance: string

  lessons?: number
  completedLessons?: number
  classLessonId?: number
  changeClassLessonId?: number
  enrollCourse?: EnrollCourseInstance

  aliases?: UserAlias
  teacherFeedbacks?: MediaMaterialsType[]
  studentSubmissions?: StudentSubmissionType[]
  remarks?: string | null
}

export type ClassLessonType = {
  id: number
  courseId: number
  className: string
  courseName: string
  previewImageUrl: string
  course: Course

  class: Classes
  classId: number
  startTime: string
  endTime: string
  quota: number
  quotaUsed: number
  date: Date
  type: ClassTypeEnum
  changeStartTime?: string
  changeEndTime?: string

  // It should have its own instructorId and locationId
  instructorId?: number
  locationId?: number
}

export type UpdateLessonTimePayload = {
  institutionId?: number
  courseId: number
  classId: number
  changeStartTime: string | Date
  changeEndTime: string | Date
}

export type DetailLessonProps = {
  lesson: ClassLessonType
  studentList: StudentType[]
}

export type CreateLessonProps = {
  institutionId: number
  courseId: number
  classId: number
  startTime: string
  date: string
  endTime: string
}

export type GetAvailableNextRecurringPayload = {
  institutionId?: number
  siteId?: number
  courseId: number
  classId: number
  startTime: string | Date
  endTime: string | Date
}

export type GetAvailableNextRecurringResponse = {
  newStartTime: string | Date
  newEndTime: string | Date
}

export type PayloadQrCode = {
  invoiceToken: string
  enrollCourseId: number
  studentLessonIds: number[]
}

export type StudentLessonWithUser = StudentLesson & {
  user: BaseUser
  enrollCourse: EnrollCourseInstance
  payments: {
    createdAt: string
    paymentState: string
  }
}

export type ParamsListStudentLessons = {
  search?: string
  withUnpaid?: boolean
} & PaginateOptionParams

export type StudentLessonQrCodeResponseDto = QRCodeAttendanceDto & {
  studentData: {
    name: string
    email: string
    phone: string
  }
  applicationData: {
    courseName: string
    className: string
    startTime: Date
    endTime: Date
  }
}
