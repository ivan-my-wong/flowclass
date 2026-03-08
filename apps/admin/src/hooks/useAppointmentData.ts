import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from 'react-query'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import {
  createAppointment,
  createAppointmentByClass,
  getCurrentAppointment,
  getCurrentAppointmentByClass,
  updateAppointment,
} from '../api/appointment'
import { ApiError, handleApiError } from '../api/errors/apiError'
import { QUERY_KEY } from '../constants/queryKey'
import { courseState } from '../stores/courseData'
import { Appointment, AppointmentForm } from '../types/appointment'

const useAppointmentData = () => {
  const courseData = useRecoilValue(courseState)
  const { t } = useTranslation()
  const currentCourseId = courseData.currentCourse?.id || 0

  const useFetchCurrentAppointment = (
    appointmentId: number,
    successfulCallback?: (data: Appointment) => void
  ): UseQueryResult<Appointment, unknown> => {
    const result = useQuery(
      [QUERY_KEY.appointment.getAppointmentKey, appointmentId],
      () => getCurrentAppointment(appointmentId),
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!appointmentId,
      }
    )
    return result
  }

  const useCreateAppointment = (
    successfulCallback?: (data: Appointment) => void
  ): UseMutationResult<
    Appointment,
    ApiError,
    Partial<Appointment>,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (appointmentData: Partial<Appointment>) =>
        createAppointment({
          ...appointmentData,
        }),
      onSuccess: data => {
        toast.success(t('teachingService:feeNTime.createAppointmentSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateAppointment = (
    appointmentId: number,
    successfulCallback?: (data: Appointment) => void
  ): UseMutationResult<Appointment, ApiError, Appointment, unknown> => {
    const mutation = useMutation({
      mutationFn: (appointmentData: Appointment) =>
        updateAppointment(appointmentId, {
          ...appointmentData,
        }),
      onSuccess: data => {
        toast.success(t('teachingService:feeNTime.updateAppointmentSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useFetchCurrentAppointmentByClass = (
    classId: number,
    successfulCallback?: (data: AppointmentForm) => void
  ): UseQueryResult<AppointmentForm, unknown> => {
    const result = useQuery(
      [QUERY_KEY.appointment.getAppointmentKeyByClass, classId],
      () => getCurrentAppointmentByClass(classId),
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!classId,
      }
    )
    return result
  }

  const useCreateAppointmentByClass = (
    successfulCallback?: (data: AppointmentForm) => void
  ): UseMutationResult<
    AppointmentForm,
    ApiError,
    Partial<AppointmentForm>,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (appointmentData: Partial<AppointmentForm>) =>
        createAppointmentByClass(appointmentData),
      onSuccess: data => {
        toast.success(t('teachingService:feeNTime.createAppointmentSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  return {
    useFetchCurrentAppointment,
    useCreateAppointment,
    useUpdateAppointment,
    useFetchCurrentAppointmentByClass,
    useCreateAppointmentByClass,
  }
}

export default useAppointmentData
