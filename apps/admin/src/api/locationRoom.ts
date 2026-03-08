import { LocationRoom } from '@/types/classes'

import apiClient from './index'

export const fetchLocationRooms = async (
  institutionId: string,
  siteId: string
): Promise<LocationRoom[]> => {
  const res = await apiClient.get({
    url: '/admin/location-room/list',
    params: {
      institutionId,
      siteId,
    },
  })
  return res?.data?.data ?? []
}

export const createLocationRoom = async (
  institutionId: string,
  siteId: string,
  locationRoom: LocationRoom
): Promise<LocationRoom> => {
  const res = await apiClient.post({
    url: '/admin/location-room/list',
    params: {
      institutionId,
      siteId,
    },
    data: locationRoom,
  })
  return res?.data?.data ?? {}
}

export const fetchLocationGroupAndEquipment = async (
  institutionId: string,
  siteId: string
): Promise<{ locationGroups: string[]; equipment: string[] }> => {
  const res = await apiClient.get({
    url: '/admin/location-room/options',
    params: {
      institutionId,
      siteId,
    },
  })
  return res?.data?.data ?? { locationGroups: [], equipment: [] }
}

export const fetchLocationRoom = async (
  institutionId: string,
  siteId: string,
  locationRoomId: string
): Promise<LocationRoom> => {
  const res = await apiClient.get({
    url: `/admin/location-room/${locationRoomId}/detail`,
    params: {
      institutionId,
      siteId,
    },
  })
  return res?.data?.data ?? {}
}

export const updateLocationRoom = async (
  institutionId: string,
  siteId: string,
  locationRoomId: string,
  locationRoom: LocationRoom
): Promise<LocationRoom> => {
  const res = await apiClient.put({
    url: `/admin/location-room/${locationRoomId}/detail`,
    params: {
      institutionId,
      siteId,
    },
    data: locationRoom,
  })
  return res?.data?.data ?? {}
}

export const deleteLocationRoom = async (
  institutionId: string,
  siteId: string,
  locationRoomId: string
): Promise<void> => {
  await apiClient.delete({
    url: `/admin/location-room/${locationRoomId}/detail`,
    params: {
      institutionId,
      siteId,
    },
  })
}
