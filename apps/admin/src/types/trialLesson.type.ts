import { Classes } from '@/types/classes'
import { OptionType } from '@/types/options'

export type ClassTrialLessonDto = {
  classId: number
}
export type ClassTrialLessonResponse = {
  id: number
  classId: number
  classEntity: Classes
  price: number
}
export type TrialLessonDto = {
  id?: number
  useOriginalPrice: boolean
  enabled: boolean
  price: number
  courseIds: number[]
  classes: ClassTrialLessonDto[]
}

export type TrialLessonResponse = {
  classes: ClassTrialLessonResponse[]
} & TrialLessonDto

export type TrialLessonFormDto = {
  price: number
  useOriginalPrice: boolean
  enabled: boolean
  courses: OptionType[]
  classes: OptionType[]
}
