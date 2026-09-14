import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentMemo } from '@/models/student-memo.entity'
import { UserAlias } from '@/models/user-aliases.entity'

import { ClassLesson } from '../class-lessons.entity'

export type StudentLessonWithUserMemo = {
  userMemo?: StudentMemo
  aliases?: UserAlias
} & StudentLesson

export type StudentLessonWithUserAlias = {
  userAlias: UserAlias
} & StudentLesson

export type ClassLessonWithStudentLessons = ClassLesson & {
  studentLessons: StudentLessonWithUserAlias[]
}
