import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '@/api/errors/apiError'
import {
  createLocationRoom,
  deleteLocationRoom,
  fetchLocationGroupAndEquipment,
  fetchLocationRoom,
  fetchLocationRooms,
  updateLocationRoom,
} from '@/api/locationRoom'
import { QUERY_KEY } from '@/constants/queryKey'
import { LocationRoom } from '@/types/classes'

import useSchoolData from './useSchoolData'

export const useLocationRoom = () => {
  const queryClient = useQueryClient()
  const { schoolData } = useSchoolData()
  const { t } = useTranslation()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''
  const currentSiteId = schoolData.currentSchool?.siteId.toString() || ''
  const listQueryKey = useMemo(
    () => [
      QUERY_KEY.locationRoom.getLocationRoomsKey,
      currentInstitutionId,
      currentSiteId,
    ],
    [currentInstitutionId, currentSiteId]
  )
  const groupAndEquipmentQueryKey = useMemo(
    () => [
      QUERY_KEY.locationRoom.getLocationGroupAndEquipmentKey,
      currentInstitutionId,
      currentSiteId,
    ],
    [currentInstitutionId, currentSiteId]
  )
  const useFetchLocationRooms = () => {
    return useQuery({
      queryKey: listQueryKey,
      queryFn: () => fetchLocationRooms(currentInstitutionId, currentSiteId),
      enabled: !!currentInstitutionId && !!currentSiteId,
    })
  }
  const useCreateLocationRoom = (onSuccessCallback?: () => void) => {
    return useMutation({
      mutationFn: (payload: LocationRoom) =>
        createLocationRoom(currentInstitutionId, currentSiteId, payload),
      onSuccess: async () => {
        toast.success(t('location:messages.createLocationSuccess'))
        await queryClient.invalidateQueries({ queryKey: listQueryKey })
        await queryClient.invalidateQueries({
          queryKey: groupAndEquipmentQueryKey,
        })
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  const useFetchLocationGroupAndEquipment = () => {
    return useQuery({
      queryKey: groupAndEquipmentQueryKey,
      queryFn: () =>
        fetchLocationGroupAndEquipment(currentInstitutionId, currentSiteId),
      enabled: !!currentInstitutionId && !!currentSiteId,
    })
  }
  const useFetchLocationRoom = (locationRoomId: string) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.locationRoom.getLocationRoomKey,
        currentInstitutionId,
        currentSiteId,
        locationRoomId,
      ],
      queryFn: () =>
        fetchLocationRoom(currentInstitutionId, currentSiteId, locationRoomId),
      enabled: !!currentInstitutionId && !!currentSiteId && !!locationRoomId,
    })
  }
  const useUpdateLocationRoom = (
    locationRoomId: string,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: (payload: LocationRoom) =>
        updateLocationRoom(
          currentInstitutionId,
          currentSiteId,
          locationRoomId,
          payload
        ),
      onSuccess: async () => {
        toast.success(t('location:messages.updateLocationSuccess'))
        await queryClient.invalidateQueries({ queryKey: listQueryKey })
        await queryClient.invalidateQueries({
          queryKey: groupAndEquipmentQueryKey,
        })
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  const useDeleteLocationRoom = (
    locationRoomId: string,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: () =>
        deleteLocationRoom(currentInstitutionId, currentSiteId, locationRoomId),
      onSuccess: async () => {
        toast.success(t('location:messages.deleteLocationSuccess'))
        await queryClient.invalidateQueries({ queryKey: listQueryKey })
        await queryClient.invalidateQueries({
          queryKey: groupAndEquipmentQueryKey,
        })
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useFetchLocationRooms,
    useCreateLocationRoom,
    useUpdateLocationRoom,
    useDeleteLocationRoom,
    useFetchLocationRoom,
    useFetchLocationGroupAndEquipment,
  }
}
