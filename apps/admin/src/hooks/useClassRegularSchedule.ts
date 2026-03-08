import { useMutation, useQuery, useQueryClient } from 'react-query'

import {
  addDateOverride,
  addPeriod,
  CreateClassRegularPeriodV2Dto,
  CreateClassRegularScheduleV2Dto,
  createSchedule,
  deleteDateOverride,
  deletePeriod,
  deleteSchedule,
  findSchedulesByClassId,
  updateDateOverrides,
  updatePeriod,
  updateSchedule,
} from '@/api/classRegularSchedule'
import { DateOverride } from '@/types/availability.type'

export const useClassRegularSchedule = (classId?: number) => {
  const queryClient = useQueryClient()
  const queryKey = ['class-regular-schedules', classId]

  const { data: schedules, isLoading } = useQuery({
    queryKey,
    queryFn: () => findSchedulesByClassId(classId!),
    enabled: !!classId,
  })

  const { mutateAsync: create } = useMutation({
    mutationFn: (data: CreateClassRegularScheduleV2Dto) => createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const { mutateAsync: update } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<CreateClassRegularScheduleV2Dto>
    }) => updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const { mutateAsync: remove } = useMutation({
    mutationFn: (id: number) => deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const { mutateAsync: createPeriod } = useMutation({
    mutationFn: ({
      scheduleId,
      data,
    }: {
      scheduleId: number
      data: CreateClassRegularPeriodV2Dto
    }) => addPeriod(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const { mutateAsync: editPeriod } = useMutation({
    mutationFn: ({
      scheduleId,
      periodId,
      data,
    }: {
      scheduleId: number
      periodId: number
      data: Partial<CreateClassRegularPeriodV2Dto>
    }) => updatePeriod(scheduleId, periodId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const { mutateAsync: removePeriod } = useMutation({
    mutationFn: ({
      scheduleId,
      periodId,
    }: {
      scheduleId: number
      periodId: number
    }) => deletePeriod(scheduleId, periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const { mutateAsync: createDateOverride } = useMutation({
    mutationFn: ({
      scheduleId,
      data,
    }: {
      scheduleId: number
      data: DateOverride
    }) => addDateOverride(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const { mutateAsync: editDateOverrides } = useMutation({
    mutationFn: ({
      scheduleId,
      data,
    }: {
      scheduleId: number
      data: DateOverride[]
    }) => updateDateOverrides(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const { mutateAsync: removeDateOverride } = useMutation({
    mutationFn: ({ scheduleId, date }: { scheduleId: number; date: string }) =>
      deleteDateOverride(scheduleId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    schedules: schedules || [],
    isLoading,
    create,
    update,
    remove,
    createPeriod,
    editPeriod,
    removePeriod,
    createDateOverride,
    editDateOverrides,
    removeDateOverride,
  }
}
