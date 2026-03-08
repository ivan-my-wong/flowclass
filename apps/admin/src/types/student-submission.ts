import { MediaMaterialsType } from './class-material'
import { ClassLesson, StudentLesson } from './student'
import { UserAlias } from './studentMemo'
import { BaseUser } from './user'

export type StudentSubmissionType = {
  id: number
  studentLessonId: number
  studentLesson?: StudentLesson
  classLesson?: ClassLesson
  mediaMaterials?: MediaMaterialsType[]
  student?: BaseUser
  studentAlias?: UserAlias
  teacherResponses?: MediaMaterialsType[]
  createdAt?: string
  updatedAt?: string
}

export type StudentSubmissionNotificationSetting = {
  sendViaEmail: boolean
  sendViaWhatsapp: boolean
  whatsappContent: string
}

export type TeacherFeedbackType = {
  id: number
  classLessonId: number
  studentLessonId: number
  teacherId: number
  institutionId: number
  mediaMaterials?: MediaMaterialsType[]
}
