import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import { queryClient } from '@/api/byorval/query-client'
import {
  changeAliasPassword,
  checkProfile,
  doRefreshToken,
  getDetailStudentLesson,
  getNotification,
  getPastLessons,
  getPaymentRecords,
  getStudentPortalSettings,
  getTeachingServiceOpts,
  getUpcomingLessons,
  loginWithAliasPassword,
  reminderPaymentRecords,
  requestTimeChange,
  resendPaymentRecord,
  sendQuestion,
  updateNotification,
  updateProfile,
} from '@/api/profileApi'
import { QUERY_KEY } from '@/constants/queryKey'
import {
  AuthState,
  FilterPaymentReports,
  FindProfileProps,
  PaymentRecordConfirm,
  RefreshTokenDto,
  ResendPaymentRecord,
  SendQuestionProps,
  StudentNotificationSettings,
  SubmitRequestTimeChangeProps,
  TypeGetTeachingServiceOpt,
} from '@/types/profile'

export function useGetStudentPortalSettings(institutionId: number) {
  const queryKey = [QUERY_KEY.getStudentPortalSettings, institutionId]
  const query = useQuery({
    queryKey,
    queryFn: () => getStudentPortalSettings(institutionId),
  })

  return query
}

export function useCheckProfile() {
  return useMutation({
    mutationFn: (body: FindProfileProps) => {
      if (body.email === '') {
        delete body.email
      }

      return checkProfile(body)
    },
  })
}

export function useDoRefreshToken(onSuccess: (data: AuthState) => void) {
  return useMutation({
    mutationFn: (body: RefreshTokenDto) => doRefreshToken(body),
    onSuccess: data => {
      onSuccess(data)
    },
  })
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (body: FindProfileProps) => updateProfile(body),
  })
}

export function useGetNotification(institutionId: number) {
  const queryKey = [QUERY_KEY.getNotification, institutionId]
  const query = useQuery({
    queryKey,
    queryFn: () => getNotification(institutionId),
  })

  return query
}

export function useUpdateNotification(institutionId: number) {
  return useMutation({
    mutationFn: (body: StudentNotificationSettings[]) => updateNotification(institutionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.getNotification, institutionId] })
    },
  })
}

export function useGetPaymentRecords(filter: FilterPaymentReports) {
  const queryKey = [QUERY_KEY.getPaymentRecords, filter]
  const query = useQuery({
    queryKey,

    queryFn: () => getPaymentRecords(filter),
  })

  return query
}

export function useGetPastLessons(filter: FilterPaymentReports) {
  const queryKey = [QUERY_KEY.getPastLessons, filter]
  const query = useQuery({
    queryKey,
    queryFn: () => getPastLessons(filter),
  })

  return query
}

export function useGetUpcomingLessons(filter: FilterPaymentReports) {
  const queryKey = [QUERY_KEY.getUpcomingLessons, filter]
  const query = useQuery({
    queryKey,
    queryFn: () => getUpcomingLessons(filter),
  })

  return query
}

export function useGetDetailStudentLesson(studentLessonId?: number, schoolId?: number) {
  const queryKey = [QUERY_KEY.getDetailStudentLesson, schoolId, studentLessonId]
  const query = useQuery({
    queryKey,
    queryFn: () => getDetailStudentLesson(studentLessonId, schoolId),
    enabled: !!studentLessonId && !!schoolId,
  })

  return query
}

export function useResendPaymentRecord() {
  return useMutation({
    mutationFn: (body: ResendPaymentRecord) => resendPaymentRecord(body),
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useReminderPaymentRecord() {
  return useMutation({
    mutationFn: (body: PaymentRecordConfirm) => reminderPaymentRecords(body),
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useSendQuestion() {
  return useMutation({
    mutationFn: (body: SendQuestionProps) => sendQuestion(body),
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useGetTeachingServiceOpts(filter: TypeGetTeachingServiceOpt) {
  const queryKey = [QUERY_KEY.getTeachingServiceOpts, filter]
  const query = useQuery({
    queryKey,
    queryFn: () => getTeachingServiceOpts(filter),
    enabled: !!filter.institutionId && !!filter.siteId,
  })

  return query
}

export function useRequestTimeChange() {
  return useMutation({
    mutationFn: (body: SubmitRequestTimeChangeProps) => requestTimeChange(body),
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useLoginWithAliasPassword(onSuccessCallback?: (result: AuthState) => void) {
  return useMutation({
    mutationFn: loginWithAliasPassword,
    onSuccess: data => {
      onSuccessCallback?.(data)
    },
  })
}

export function useChangeAliasPassword() {
  return useMutation({
    mutationFn: changeAliasPassword,
  })
}
