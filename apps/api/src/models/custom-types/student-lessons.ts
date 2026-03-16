import { StudentLesson } from '@/models/student-lesson.entity'
import { UserAlias } from '@/models/user-aliases.entity'

import { ClassLesson } from '../class-lessons.entity'

export type StudentLessonWithUserMemo = {
  userMemo?: UserAlias
  aliases?: UserAlias
} & StudentLesson

export type StudentLessonWithUserAlias = {
  userAlias: UserAlias
} & StudentLesson

export type ClassLessonWithStudentLessons = ClassLesson & {
  studentLessons: StudentLessonWithUserAlias[]
}
