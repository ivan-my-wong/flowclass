import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import {
  createAvailability,
  deleteAvailability,
  getAvailabilities,
  getAvailabilityByUserId,
  getSingleAvailability,
  updateAvailability,
  updateAvailabilityAssignedUserId,
} from '@/api/availability'
import { handleApiError } from '@/api/errors/apiError'
import { QUERY_KEY } from '@/constants/queryKey'
import { availabilityState } from '@/stores/availabilityStore'
import { userState } from '@/stores/userData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import {
  Availability,
  AvailabilityWithAppointmentForm,
  SingleRecurringSchedule,
  UpdateAvailabilityDto,
  WorkingHours,
} from '@/types/availability.type'

import useAuth from './useAuth'
import useSchoolData from './useSchoolData'

const useAvailability = () => {
  const { currentSchool } = useSchoolData()
  const institutionId = currentSchool?.id
  const siteId = currentSchool?.siteId
  const { isLogin } = useAuth()

  const [availabilityStateData, setAvailabilityStateData] =
    useRecoilState(availabilityState)

  const { t } = useTranslation()

  const userPermission = useRecoilValue(userPermissionState)
  const currentUser = useRecoilValue(userState)

  // Destructure state from Recoil
  const {
    availabilities,
    currentAvailability: selectedAvailability,
    workingHours,
  } = availabilityStateData

  // Convert working hours to SingleRecurringSchedule format
  const convertWorkingHoursToSchedules = (): SingleRecurringSchedule[] => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    return days
      .map((day, index) => {
        const dayData = workingHours[day]
        if (!dayData || !dayData.enabled) return null

        return {
          dayOfWeek: index,
          startTime: dayData.startTime,
          endTime: dayData.endTime,
          isEnabled: true,
        }
      })
      .filter(Boolean) as SingleRecurringSchedule[]
  }

  // Fetch availabilities using useQuery
  const fetchAvailabilities = useQuery({
    queryKey: [
      QUERY_KEY.availability.fetchAvailabilitiesKey,
      institutionId,
      userPermission,
    ],
    queryFn: () => {
      if (
        [
          UserRole.MasterAdmin,
          UserRole.SiteAdmin,
          UserRole.SchoolAdmin,
        ].includes(userPermission)
      ) {
        return getAvailabilities(institutionId ?? 0)
      }

      return getAvailabilityByUserId(institutionId ?? 0, currentUser?.id ?? 0)
    },
    onSuccess: data => {
      setAvailabilityStateData(prev => ({
        ...prev,
        availabilities: data,
        currentAvailability: data.length > 0 ? data[0] : null,
      }))
    },
    onError: error => {
      toast.error(t('availability:errors.fetchAvailabilities'))
      handleApiError({ error, t })
    },
    enabled: userPermission !== UserRole.Guest,
  })

  const useFetchAvailabilitiesById = (availabilityId?: number) =>
    useQuery({
      queryKey: [
        QUERY_KEY.availability.fetchCurrentAvailabilityKey,
        institutionId,
        availabilityId,
      ],
      queryFn: () =>
        getSingleAvailability(institutionId ?? 0, availabilityId ?? 0),
      onError: error => {
        toast.error(t('availability:availability:errors.fetchAvailabilities'))
        handleApiError({ error, t })
      },
      enabled: !!availabilityId,
    })

  const fetchCurrentAvailability = useMutation({
    mutationFn: (availabilityId: number) =>
      getSingleAvailability(institutionId ?? 0, availabilityId ?? 0),
    onSuccess: data => {
      setAvailabilityStateData(prev => ({
        ...prev,
        currentAvailability: data,
      }))
    },
    onError: error => {
      toast.error(t('availability:errors.fetchCurrentAvailability'))
      handleApiError({ error, t })
    },
  })

  // Update working hours
  const updateWorkingHours = useCallback(
    (newWorkingHours: WorkingHours): void => {
      setAvailabilityStateData(prev => ({
        ...prev,
        workingHours: newWorkingHours,
      }))
    },
    [setAvailabilityStateData]
  )

  const useCreateAvailability = () => {
    const mutation = useMutation({
      mutationFn: createAvailability,
      onSuccess: () => {
        fetchAvailabilities.refetch()
      },
      onError: error => {
        toast.error(t('availability:errors.createError'))
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDeleteAvailability = () => {
    const mutation = useMutation({
      mutationFn: ({
        id,
        institutionId,
      }: {
        id: number
        institutionId: number
      }) => deleteAvailability(id, institutionId),
      onSuccess: () => {
        fetchAvailabilities.refetch()
      },
      onError: error => {
        toast.error(t('availability:errors.deleteError'))
        handleApiError({ error, t })
      },
    })

    return mutation
  }
  // Update assigned user for an availability
  const useUpdateAssignedUser = () => {
    const mutation = useMutation({
      mutationFn: async ({
        availabilityId,
        userId,
      }: {
        availabilityId: number
        userId: number
      }) => {
        try {
          return await updateAvailabilityAssignedUserId(availabilityId, userId)
        } catch (error) {
          console.error('Error updating assigned user:', error)
          throw error
        }
      },
      onSuccess: () => {
        toast.success(t('availability.messages.assignUserSuccess'))
        fetchAvailabilities.refetch()
      },
      onError: error => {
        toast.error(t('availability:errors.assignUserError'))
        console.error('Error updating assigned user:', error)
      },
    })
    return mutation
  }

  // Save availability settings
  const saveAvailabilitySettings = async (): Promise<void> => {
    if (!isLogin || !siteId || !institutionId) {
      toast.error('You must be logged in to save availability settings')
      return
    }

    try {
      const schedules = convertWorkingHoursToSchedules()

      if (selectedAvailability) {
        // Update existing availability
        const updateData: UpdateAvailabilityDto = {
          availableSchedules: schedules,
        }

        await updateAvailability(selectedAvailability.id, updateData)
        toast.success(t('availability:messages.settingsSaved'))
      }

      // Invalidate and refetch availabilities
      await fetchAvailabilities.refetch()
    } catch (error) {
      toast.error(t('availability:errors.settingsSaved'))
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  const useUpdateAvailabilitySettings = (
    successCallback?: (data: AvailabilityWithAppointmentForm) => void
  ) => {
    return useMutation({
      mutationFn: async (payload: Availability) => {
        if (!isLogin || !siteId || !institutionId) {
          throw new Error('You must be logged in to save availability settings')
        }
        return updateAvailability(payload.id, payload)
      },
      onSuccess: (data: AvailabilityWithAppointmentForm) => {
        toast.success(t('availability:messages.settingsSaved'))
        if (successCallback) {
          successCallback(data)
        }
      },
      onError: (error: unknown) => {
        toast.error(t('availability:errors.settingsSaved'))
        // eslint-disable-next-line no-console
        console.error(error)
      },
    })
  }

  return {
    availabilities,
    selectedAvailability,
    workingHours,
    fetchAvailabilities,
    fetchCurrentAvailability,
    updateWorkingHours,
    saveAvailabilitySettings,
    useCreateAvailability,
    useDeleteAvailability,
    useUpdateAssignedUser,
    useFetchAvailabilitiesById,
    useUpdateAvailabilitySettings,
  }
}

export default useAvailability
