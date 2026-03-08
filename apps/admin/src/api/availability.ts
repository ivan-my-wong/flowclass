import {
  Availability,
  AvailabilityWithAppointmentForm,
  CreateAvailabilityDto,
  DateOverride,
  SingleRecurringSchedule,
  UpdateAvailabilityDto,
} from '@/types/availability.type'

import apiClient from './index'

// Availability API endpoints
export const getAvailabilities = async (
  institutionId: number
): Promise<Availability[]> => {
  const res = await apiClient.get({
    url: '/admin/availability',
    params: { institutionId },
    needAuth: true,
  })

  if (res) {
    return res.data.data
  }

  throw new Error('Failed to fetch availabilities')
}

export const getAvailabilityByUserId = async (
  institutionId: number,
  userId: number
): Promise<Availability[]> => {
  const res = await apiClient.get({
    url: `/admin/availability/user/${userId}`,
    params: { institutionId },
    needAuth: true,
  })

  if (res) {
    return res.data.data
  }

  throw new Error('Failed to fetch availability')
}

export const getSingleAvailability = async (
  institutionId: number,
  id: number
): Promise<Availability> => {
  const res = await apiClient.get({
    url: `/admin/availability/${id}`,
    params: { institutionId },
    needAuth: true,
  })

  if (res) {
    return res.data.data
  }

  throw new Error('Failed to fetch availability')
}

export const createAvailability = async (
  data: CreateAvailabilityDto
): Promise<Availability> => {
  const res = await apiClient.post({
    url: '/admin/availability',
    data,
    needAuth: true,
    params: { institutionId: data.institutionId },
  })

  if (res) {
    return res.data.data
  }

  throw new Error('Failed to create availability')
}

export const updateAvailability = async (
  id: number,
  data: UpdateAvailabilityDto
): Promise<AvailabilityWithAppointmentForm> => {
  const res = await apiClient.patch({
    url: `/admin/availability/${id}`,
    data,
    needAuth: true,
  })

  if (res) {
    return res.data.data
  }

  throw new Error('Failed to update availability')
}

export const deleteAvailability = async (
  id: number,
  institutionId: number
): Promise<void> => {
  const res = await apiClient.delete({
    url: `/admin/availability/${id}`,
    needAuth: true,
    params: { institutionId },
  })

  if (!res) {
    throw new Error('Failed to delete availability')
  }
}

export const updateAvailableSchedules = async (
  id: number,
  schedules: SingleRecurringSchedule[]
): Promise<Availability> => {
  const res = await apiClient.patch({
    url: `/admin/availability/${id}/schedules`,
    data: schedules,
    needAuth: true,
  })

  if (res) {
    return res.data.data
  }

  throw new Error('Failed to update available schedules')
}

export const updateDateOverrides = async (
  id: number,
  overrides: DateOverride[]
): Promise<Availability> => {
  const res = await apiClient.patch({
    url: `/admin/availability/${id}/overrides`,
    data: overrides,
    needAuth: true,
  })

  if (res) {
    return res.data.data
  }

  throw new Error('Failed to update date overrides')
}

export const updateAvailabilityCalendar = async (
  id: number,
  integrationCalendarId: number
): Promise<Availability> => {
  const res = await apiClient.patch({
    url: `/admin/availability/${id}/calendar`,
    data: { integrationCalendarId },
    needAuth: true,
  })

  if (res) {
    return res.data.data
  }

  throw new Error('Failed to update calendar connection')
}

export const updateAvailabilityAssignedUserId = async (
  id: number,
  userId: number
): Promise<Availability> => {
  const res = await apiClient.patch({
    url: `/admin/availability/${id}/assigned-user`,
    data: { userId },
    needAuth: true,
  })

  if (res) {
    return res.data.data
  }

  throw new Error('Failed to update availability assigned user')
}
