import { Institution } from '../institutions.entity'
import { Site } from '../site.entity'
import { User } from '../user.entity'
import { UserAlias } from '../user-aliases.entity'

export type StudentEnrollCourse = {
  token: string
  studentAccount: User
  email: string
  phone: string
  name: string
  createdPassword: string
}

export type StudentEnrollCourseAlias = {
  studentAccount: User
  userAliasId: number
  userAlias?: UserAlias
  name: string
  phone: string
  email: string
  token: string
  createdPassword?: string
}
export type EnrollmentForm = {
  question?: string
  answer?: string
}
export type ReminderDataType = {
  contactEmail: string
  contactPhone: string
  classDateTime: string
  enrollmentForm: EnrollmentForm[]
  institution: Institution
  site: Site
  timeZone: string
}
