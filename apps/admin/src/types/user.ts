import { SelectItemValuesProps } from '@/components/Selector/Select'
import { PriceOption } from '@/types/regularClass'

import { ClassTypeEnum, PriceType } from './course'
import { InstructorProfile } from './instructorProfiles'
import { StudentInfoResponse } from './studentMemo'

export type BaseUser = {
  id: number
  email: string
  fullName: string
  firstName: string
  lastName: string
  userNameLower: string
  displayId: number | null
  isEmailVerified: boolean
  phone: string | null
  lastActiveTime: string | null
  avatar: string | null
  avatarUrl: string | null
  company: string | null
  position: string | null
  social: string | null
  country: string | null
  isDeleted: boolean | null
  visibility: boolean | null
  deletedAt: string | null
  createdBy: number | null
  updatedBy: number | null
  createdAt: string | null
  updatedAt: string | null
}

export type SinglePermission = {
  userId: number
  siteId: number
  institutionId: number
  isInstitutionManager: boolean
  isInstructor: boolean
  isMasterAdmin: boolean
  isOperator: boolean
  isSiteManager: boolean
  isStudent: boolean
}

export type BaseUserRole = SinglePermission & {
  id: number
  isInstructorRatesEnabled: boolean
  instructorProfileId: number | null
}

export type UserState = BaseUser & {
  isLogin: boolean
  name?: string
  permissions: SinglePermission[]
}

export type StudentUser = BaseUser & {
  status: string
  contactPhone: string
  contactEmail: string
  fullName: string

  isOnlyUserAlias: boolean

  studentInfo?: StudentInfoResponse
}

export type StaffUserType = BaseUserRole & {
  // Relations (optional - loaded when needed)
  user?: BaseUser
  instructorProfile?: InstructorProfile | null
}

export type StaffUserFormType = Partial<Omit<StaffUserType, 'position'>> & {
  position: string
  phone: string
  permissions: SinglePermission
}

export type ChangePasswordProps = {
  password: string
  newPassword: string
}

export type ChangeUserPasswordDto = {
  newPassword: string
}

export type ChangeAliasPasswordDto = {
  userAliasId: number
  newAliasPassword: string
}

export type ChangeUserPasswordForm = ChangeUserPasswordDto & {
  confirmPassword: string
}

export type InstructorAnalyticsResponse = {
  numberOfLessons: number
  numberOfStudents: number
  totalSalary?: number
  totalHours?: number
}

export type UpcomingClassesDto = {
  instructorId: number
  siteId: number
  institutionId: number

  courseIds?: number[]
  classIds?: number[]
  locationIds?: number[]

  startDate: string
  endDate: string
}

export type UpComingClassesForm = Omit<
  UpcomingClassesDto,
  'locations' | 'date'
> & {
  date?: Date
  locations?: SelectItemValuesProps[]
}

export type UpcomingClasses = {
  id: number
  startTime: string
  endTime: string
  course: {
    name: string
  }
  class: {
    name: string
    type: ClassTypeEnum
    tuition: number
    priceType: PriceType
    priceOptions: PriceOption[]
  }
  locationRoom: {
    id: number
    name: string
    address: string
  }
  numberOfStudents: number // Changed from studentsCount

  hourlyRate?: number // New field for frontend
  duration: number // New field for duration in hours
  lessonSalary?: number // Total amount based on hourly rate

  isPast: boolean // For status determination
}

export type ExportClassCsvDto = {
  instructorId: number
  siteId: number | null
  institutionId: number | null

  courseIds?: number[]
  classIds?: number[]
  locationIds?: number[]
}

export type ExportCsvPayload = {
  params: ExportClassCsvDto
  fileName: string
}
