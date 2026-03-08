import {
  ChangeRequestTimeChangeStatus,
  GetRequestTimeChange,
  RequestTimeChange,
  RescheduleSettings,
} from '@/types/rescheduleApproval'

import apiClient from '.'

export const getRescheduleApproval = async (
  payload: GetRequestTimeChange
): Promise<RequestTimeChange[]> => {
  const res = await apiClient.post({
    url: '/admin/reschedule-approval/list',
    needAuth: true,
    params: { institutionId: payload.institutionId },
    data: payload,
  })
  return res.data.data
}

export const changeRescheduleApprovalStatus = async (
  payload: ChangeRequestTimeChangeStatus
): Promise<RequestTimeChange[]> => {
  const res = await apiClient.put({
    url: '/admin/reschedule-approval/status',
    needAuth: true,
    params: { institutionId: payload.institutionId },
    data: payload,
  })
  return res.data.data
}

export const getDetailRescheduleApproval = async (
  id: number
): Promise<RequestTimeChange> => {
  const res = await apiClient.get({
    url: `/admin/reschedule-approval/${id}`,
    needAuth: true,
  })
  return res.data.data
}

export const getRescheduleSettings = async (
  institutionId: number
): Promise<RescheduleSettings> => {
  const res = await apiClient.get({
    url: `/admin/reschedule-approval/settings/${institutionId}`,
    needAuth: true,
  })
  return res.data.data
}

export const updateRescheduleSettings = async (
  payload: RescheduleSettings
): Promise<RescheduleSettings> => {
  const res = await apiClient.put({
    url: `/admin/reschedule-approval/settings/${payload.institutionId}`,
    needAuth: true,
    data: payload,
  })
  return res.data.data
}
