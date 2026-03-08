import { useMutation, useQuery } from 'react-query'

import {
  changeRescheduleApprovalStatus,
  getDetailRescheduleApproval,
  getRescheduleApproval,
  getRescheduleSettings,
  updateRescheduleSettings,
} from '@/api/rescheduleApproval'
import { QUERY_KEY } from '@/constants/queryKey'
import {
  ChangeRequestTimeChangeStatus,
  GetRequestTimeChange,
  RescheduleSettings,
} from '@/types/rescheduleApproval'

export function useGetRescheduleApproval(payload: GetRequestTimeChange) {
  const queryKey = [
    QUERY_KEY.rescheduleApproval.getRequestTimeChangeKey,
    payload,
  ]
  const query = useQuery({
    queryKey,
    queryFn: () => getRescheduleApproval(payload),
    enabled: !!payload.institutionId,
  })

  return query
}

export function useChangeRescheduleApprovalStatus() {
  return useMutation({
    mutationFn: (body: ChangeRequestTimeChangeStatus) =>
      changeRescheduleApprovalStatus(body),
  })
}

export function useGetDetailRescheduleApproval() {
  return useMutation({
    mutationFn: (id: number) => getDetailRescheduleApproval(id),
  })
}

export function useUpdateRescheduleSettings() {
  return useMutation({
    mutationFn: (payload: RescheduleSettings) =>
      updateRescheduleSettings(payload),
  })
}

export function useGetRescheduleSettings(institutionId: number) {
  const queryKey = [
    QUERY_KEY.rescheduleApproval.getRescheduleSettingsKey,
    institutionId,
  ]
  const query = useQuery({
    queryKey,
    queryFn: () => getRescheduleSettings(institutionId),
    enabled: !!institutionId,
  })

  return query
}
