import { StudentEnrolmentRecord } from './student'

export type MaterialType = 'documents' | 'link'
export interface LessonMaterialProps {
  id: number
  courseName: string
  classname: string
  startTime: string
  endTime: string
  materials: MaterialLesson[]
  students?: StudentEnrolmentRecord[]
}

export interface MaterialLesson {
  id: number
  type: MaterialType
  name: string
  uploadedAt: string
  expiredAt: string
}
