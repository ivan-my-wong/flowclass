export type StudentMemoBase = {
  userId: number
  institutionId: number
}
export type AddStudentMemoRequestDto = {
  memo: string | null
} & StudentMemoBase

export type GetStudentMemoOnlyContactResponseDto = {
  userAliasId: number
  userAlias: UserAlias
  institutionId: number
  preferredName: string
  memo?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export type EditStudentContactInfoRequestDto = {
  contactEmail?: string
  contactPhone?: string
  contactName?: string
} & StudentMemoBase

export type EditStudentContactInfoV2RequestDto = {
  userAliasId: number
  alias?: string
  phone?: string
  email?: string
  invoiceId?: number
  secondaryEmail?: string | null
} & StudentMemoBase

export type UserAlias = {
  id: number
  name: string
  // phone: string
  email: string
  secondaryEmail?: string | null
  userId: number
  isStudentParent: boolean
  childOfUserAliasId?: number
  user: {
    id: number
    phone: string
  }
  studentParent?: UserAlias
  parentChildren?: UserAlias[]
}

export type StudentInfoResponse = {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  createdBy?: null
  updatedBy?: null
  institutionId: number
  userId: number
  userAlias?: UserAlias
  memo?: string

  overdueReminder?: {
    email: boolean
    whatsapp: boolean
  }
  paymentReminder?: {
    email: boolean
    whatsapp: boolean
  }
  lessonReminder?: {
    email: boolean
    whatsapp: boolean
  }
}

export interface StudentWithExpiry extends UserAlias {
  createdAt?: string
  studentLessonExpiryDate?: string | null
}
