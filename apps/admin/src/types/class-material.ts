import { Classes } from '@/types/classes'
import { Course } from '@/types/course'
import { ClassLesson } from '@/types/student'

import { UserAlias } from './studentMemo'

export enum TypeSupported {
  DOCUMENT = 'DOCUMENT',
  ONLINE_RECORDING = 'ONLINE_RECORDING',
  LINK = 'LINK',
}
export type MediaMaterialsType = {
  id: number
  fileType: string
  classMaterialId: number
  studentSubmissionId?: number
  teacherFeedbackId?: number
  driveId: string
  fileId: string
  name: string
  expiryDate: Date
  description?: string
  createdAt?: Date
  link: string
}

export type StudentMediaMaterialsType = {
  id: number
  fileType: string
  classMaterialId: number
  studentSubmissionId?: number
  teacherFeedbackId?: number
  driveId: string
  fileId: string
  name: string
  expiryDate: Date
  description?: string
  createdAt?: Date
  link: string
}

export type StudentWithExpiry = UserAlias & {
  expiryDate?: Date
}

export type ClassMaterialsType = {
  id: number
  name: string
  classLessonId: number
  classId: number
  courseId: number
  institutionId: number
  // Relations
  classEntity?: Classes
  course?: Course
  classLesson?: ClassLesson
  mediaMaterials?: MediaMaterialsType[]
  // studentMaterials?: StudentMediaMaterialsType[]
  students?: StudentWithExpiry[]
  studentExpiryDate?: {
    studentId: number
    expiryDate: Date
  }[]
}

export type CreateClassMaterialsData = {
  classLessonId: number
  classId: number
  courseId: number
  mediaMaterials: Array<{
    name: string
    description?: string
    link?: string
    expiryDate?: Date | null
    fileType?: string | null
    type: TypeSupported
  }>
  files: File[]
}

export type MaterialSearchParams = {
  search?: string
  type?: TypeSupported
  classIds?: string[]
  lessonIds?: string[]
  courseIds?: string[]
  institutionId?: number
  startDate?: string
  endDate?: string
}

export type PaginationParams = {
  page?: number
  limit?: number
}

export type ListParams = MaterialSearchParams & PaginationParams

export interface UploadProgress {
  uploadId: string
  userId: number
  totalFiles: number
  completedFiles: number
  currentFile?: string
  percentage: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  results?: unknown[]
  message?: string
  startedAt: Date
  updatedAt: Date
}
export interface NotifyStudentClassMaterialsDto {
  sendViaEmail: boolean
  sendViaWhatsapp: boolean
  emailBody: string
  emailSubject: string
  whatsappContent: string
}
export interface UpdateExpiryData {
  expiryDate: string | null
}
export interface UpdateExpiryDataForStudent extends UpdateExpiryData {
  studentId: number
}
