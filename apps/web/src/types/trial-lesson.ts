export type GetAvailableTrialLessonDTO = {
  institutionId: number
  siteId: number
  courseId: number
  classIds: number[]
}

export type ClassEntityResponse = {
  id: number
  name: string
  type: string
  quota: number
  tuition: string
}

export type TrialLessonResponse = {
  id: number
  siteId: number
  institutionId: number
  courseIds: number[]
  useOriginalPrice: boolean
  price: string
  enabled: boolean
}

export type ClassTriaLessonResponse = {
  id: number
  price: string
  trialLessonId: number
  classId: number
  trialLesson: TrialLessonResponse
  classEntity: ClassEntityResponse
}

export type ValidClassTrialLessonResponse = {
  isValid: boolean
  classTrialLesson: ClassTriaLessonResponse | null
}

export type ValidateTrialLessonDTO = {
  institutionId?: number
  siteId?: number
  courseId?: number
  classIds: number[]
  applicants: [
    {
      email: string
      phone: string
    }
  ]
}
