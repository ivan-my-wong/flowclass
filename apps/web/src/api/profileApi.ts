import {
  AuthState,
  FilterPaymentReports,
  FindProfileProps,
  LessonQuestionProps,
  PaymentRecordConfirm,
  PaymentReports,
  RefreshTokenDto,
  RequestTimeChangeProps,
  ResendPaymentRecord,
  SendQuestionProps,
  StudentChangeAliasPasswordDto,
  StudentLoginWithAliasPasswordDto,
  StudentNotificationSettings,
  StudentPortalSettings,
  SubmitRequestTimeChangeProps,
  TypeGetTeachingServiceOpt,
  TypeGetTeachingServiceOptItem,
  UpcomingLesson,
} from '@/types/profile'

import customFetch from './baseClient'

export const getStudentPortalSettings = async (
  institutionId: number
): Promise<StudentPortalSettings> => {
  const { data } = await customFetch<StudentPortalSettings>('/student/profile/settings', {
    method: 'GET',
    query: { institutionId: institutionId.toString() },
  })
  return data
}

export const checkProfile = async (body: FindProfileProps): Promise<AuthState> => {
  const { data } = await customFetch<AuthState>('/student/profile/check', {
    method: 'POST',
    body,
  })
  return data
}

export const doRefreshToken = async (body: RefreshTokenDto): Promise<AuthState> => {
  const { data } = await customFetch<AuthState>('/admin/auth/refresh-token', {
    method: 'POST',
    body,
    needAuth: false,
  })
  return data
}

export const updateProfile = async (body: FindProfileProps): Promise<AuthState> => {
  const { data } = await customFetch<AuthState>('/student/users/change-profile', {
    method: 'POST',
    body,
    needAuth: true,
  })
  return data
}

export const getNotification = async (
  institutionId: number
): Promise<StudentNotificationSettings[]> => {
  const { data } = await customFetch<StudentNotificationSettings[]>(
    '/student/profile/notification',
    { method: 'GET', query: { institutionId: institutionId.toString() }, needAuth: true }
  )
  return data
}

export const updateNotification = async (
  institutionId: number,
  body: StudentNotificationSettings[]
): Promise<StudentNotificationSettings[]> => {
  const { data } = await customFetch<StudentNotificationSettings[]>(
    '/student/profile/notification',
    {
      method: 'POST',
      body,
      query: { institutionId: institutionId.toString() },
      needAuth: true,
    }
  )
  return data
}

export const getPaymentRecords = async (
  filter: FilterPaymentReports
): Promise<PaymentReports[]> => {
  const { data } = await customFetch<PaymentReports[]>('/student/profile/payment-records', {
    method: 'POST',
    query: { institutionId: filter.institutionId.toString() },
    body: filter,
    needAuth: true,
  })
  return data
}

export const getPastLessons = async (
  filter: FilterPaymentReports
): Promise<Record<string, UpcomingLesson[]>> => {
  const { data } = await customFetch<Record<string, UpcomingLesson[]>>(
    '/student/profile/past-lessons',
    {
      method: 'POST',
      query: { institutionId: filter.institutionId.toString() },
      body: filter,
      needAuth: true,
    }
  )
  return data
}

export const getUpcomingLessons = async (
  filter: FilterPaymentReports
): Promise<Record<string, UpcomingLesson[]>> => {
  const { data } = await customFetch<Record<string, UpcomingLesson[]>>(
    '/student/profile/upcoming-lessons',
    {
      method: 'POST',
      query: { institutionId: filter.institutionId.toString() },
      body: filter,
      needAuth: true,
    }
  )
  return data
}

export const getDetailStudentLesson = async (
  studentLessonId?: number,
  schoolId?: number
): Promise<UpcomingLesson> => {
  const { data } = await customFetch<UpcomingLesson>(
    `/student/profile/student-lesson/${studentLessonId}/detail`,
    {
      method: 'GET',
      query: { schoolId: schoolId?.toString() ?? '' },
      needAuth: true,
    }
  )
  return data
}

export const resendPaymentRecord = async (body: ResendPaymentRecord): Promise<any> => {
  const { data } = await customFetch<any>('/student/profile/payment-records/resend', {
    method: 'POST',
    body,
    needAuth: true,
  })
  return data
}

export const confirmPaymentRecords = async (
  payload: PaymentRecordConfirm
): Promise<PaymentReports[]> => {
  const { data } = await customFetch<PaymentReports[]>('/student/profile/payment-records/confirm', {
    method: 'POST',
    query: { institutionId: payload.institutionId.toString(), siteId: payload.siteId.toString() },
    body: payload,
    needAuth: true,
  })
  return data
}

export const rejectPaymentRecords = async (
  payload: PaymentRecordConfirm
): Promise<PaymentReports[]> => {
  const { data } = await customFetch<PaymentReports[]>('/student/profile/payment-records/reject', {
    method: 'POST',
    query: { institutionId: payload.institutionId.toString(), siteId: payload.siteId.toString() },
    body: payload,
    needAuth: true,
  })
  return data
}

export const reminderPaymentRecords = async (
  payload: PaymentRecordConfirm
): Promise<PaymentReports[]> => {
  const { data } = await customFetch<PaymentReports[]>(
    '/student/profile/payment-records/send-reminder',
    {
      method: 'POST',
      query: { institutionId: payload.institutionId.toString(), siteId: payload.siteId.toString() },
      body: payload,
      needAuth: true,
    }
  )
  return data
}

export const sendQuestion = async (payload: SendQuestionProps): Promise<LessonQuestionProps> => {
  const { data } = await customFetch<LessonQuestionProps>('/student/profile/send-question', {
    method: 'POST',
    query: { institutionId: payload.institutionId?.toString() ?? '' },
    body: payload,
    needAuth: true,
  })
  return data
}

export const getTeachingServiceOpts = async (
  payload: TypeGetTeachingServiceOpt
): Promise<TypeGetTeachingServiceOptItem[]> => {
  const { data } = await customFetch<TypeGetTeachingServiceOptItem[]>(
    '/student/profile/teaching-service-opt',
    {
      method: 'GET',
      query: {
        institutionId: payload.institutionId?.toString() ?? '',
        siteId: payload.siteId?.toString() ?? '',
      },
      needAuth: true,
    }
  )
  return data
}

export const requestTimeChange = async (
  payload: SubmitRequestTimeChangeProps
): Promise<RequestTimeChangeProps> => {
  const { data } = await customFetch<RequestTimeChangeProps>(
    '/student/profile/request-time-change',
    {
      method: 'POST',
      query: { institutionId: payload.institutionId?.toString() ?? '' },
      body: payload,
      needAuth: true,
    }
  )
  return data
}

export const loginWithAliasPassword = async (
  body: StudentLoginWithAliasPasswordDto
): Promise<AuthState> => {
  const { data } = await customFetch<AuthState>('/student/profile/login-with-alias-password', {
    method: 'POST',
    body,
    needAuth: false,
  })
  return data
}

export const changeAliasPassword = async (
  body: StudentChangeAliasPasswordDto
): Promise<AuthState> => {
  const { data } = await customFetch<AuthState>('/student/profile/change-alias-password', {
    method: 'POST',
    body,
    needAuth: true,
  })
  return data
}
