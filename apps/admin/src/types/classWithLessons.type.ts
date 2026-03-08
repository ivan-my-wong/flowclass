import { ClassTypeEnum } from './course'
import { LessonPreview } from './regularClass'

export interface InstructorInfo {
  id: number
  fullName: string
  email: string
}

export interface LocationRoomInfo {
  id: number
  name: string
}

export interface ClassWithLessons {
  classId: number
  className: string
  courseId: number
  courseName: string
  type: ClassTypeEnum
  color: string
  instructor?: InstructorInfo
  locationRoom?: LocationRoomInfo
  lessons: LessonPreview[]
}

export interface AllClassesLessonsResponse {
  courseId: number
  courseName: string
  classes: ClassWithLessons[]
}
