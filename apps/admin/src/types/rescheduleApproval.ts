import { PaymentState } from '@/constants/payment'

import { Classes } from './classes'
import { StudentLesson } from './student'

export enum RequestTimeChangeStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  CONFLICT = 'CONFLICT',
  FULLY_BOOKED = 'FULLY_BOOKED',
}

export type RequestTimeChange = {
  id: number
  institutionId: number
  studentLessonId: number
  userId: number
  requestStartTime: Date
  requestEndTime: Date
  reason?: string
  status?: RequestTimeChangeStatus
  studentLesson: StudentLesson
  user: {
    id: number
    firstName: string
    email: string
    phone: string
  }
  availabilityStatus: AvailabilityStatus
  conflict?: {
    classroom: Classes[]
    teacher: Classes[]
  }
}

export type GetRequestTimeChange = {
  page?: number
  num?: number
  siteId?: number
  institutionId: number
  courseId?: number
  classId?: number
  paymentState?: PaymentState
  search?: string
}

export type ChangeRequestTimeChangeStatus = {
  institutionId: number
  ids: number[]
  status?: RequestTimeChangeStatus
}

export type RescheduleSettings = {
  id: number
  institutionId: number
  selectCourse: boolean
  selectClass: boolean
  minimumHoursBeforeRequest: number
}
