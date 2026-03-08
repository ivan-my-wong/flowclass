import { IPaginatedData } from '@/types/pagination'
import {
  BaseUser,
  BaseUserRole,
  ChangeAliasPasswordDto,
  ChangeUserPasswordDto,
  ExportClassCsvDto,
  SinglePermission,
  StaffUserType,
  UpcomingClasses,
  UpcomingClassesDto,
} from '@/types/user'
import { downloadStringAsCsvFile } from '@/utils/download.utils'

import {
  ChangeUserRoleProps,
  InviteSuccessResponse,
  InviteUserFormData,
} from '../types/userManagement'

import apiClient from './index'

export const getUserList = async ({
  siteId,
  schoolId,
}: {
  siteId: number
  schoolId?: number
}): Promise<IPaginatedData<StaffUserType[]>> => {
  const res = await apiClient.get({
    url: '/admin/users',
    needAuth: true,
    params: {
      siteId,
      institutionId: schoolId,
    },
  })
  return res.data.data
}

export const inviteUser = async (
  institutionId: number,
  siteId: number,
  payload: InviteUserFormData
): Promise<InviteSuccessResponse[]> => {
  const res = await apiClient.post({
    url: '/admin/sites/invite',
    needAuth: true,
    params: {
      siteId,
      institutionId,
    },
    data: {
      ...payload,
      institutionId,
      siteId,
      institutions: [
        {
          institutionId,
          siteId,
          role: payload.role,
        },
      ],
    },
  })

  return res.data.data
}

export const changeUserRole = async ({
  email,
  role,
}: ChangeUserRoleProps): Promise<any> => {
  const res = await apiClient.patch({
    url: '/admin/users/change-user-roles',
    needAuth: true,
    params: {
      email,
      role,
    },
  })

  return res
}

export const assignSiteManager = async ({
  siteId,
  userId,
}: {
  siteId: number
  userId: number
}): Promise<{}> => {
  const res = await apiClient.post({
    url: '/admin/sites/assign-manager',
    needAuth: true,
    data: {
      siteId,
      assignedUserId: userId,
    },
  })
  return res.data.data
}

export const deleteUser = async (
  userId: string,
  siteId: number
): Promise<void> => {
  const res = await apiClient.delete({
    url: `/admin/users/delete`,
    needAuth: true,
    params: {
      siteId,
      userId,
    },
  })
  return res.data.data
}

export const updateUser = async (
  userId: number,
  data: StaffUserType,
  institutionId: number
): Promise<StaffUserType> => {
  const res = await apiClient.patch({
    url: `/admin/users/update`,
    needAuth: true,
    params: { institutionId, userId },
    data,
  })
  return res.data.data
}

export const updateUserPermission = async (
  userId: number,
  data: SinglePermission[],
  siteId: number
): Promise<BaseUserRole> => {
  const res = await apiClient.patch({
    url: '/admin/users/update-permission',
    needAuth: true,
    params: { siteId, userId },
    data: {
      permissions: data,
    },
  })
  return res.data.data
}

export const updateUserPassword = async (
  userId: number,
  data: ChangeUserPasswordDto,
  siteId: number
): Promise<void> => {
  await apiClient.patch({
    url: `/admin/users/update-password`,
    needAuth: true,
    params: { siteId, userId },
    data,
  })
}

export const changeAliasPassword = async (
  data: ChangeAliasPasswordDto,
  institutionId: number
): Promise<void> => {
  await apiClient.post({
    url: '/admin/users/change-alias-password',
    needAuth: true,
    params: { institutionId },
    data,
  })
}

export const getUserRole = async (
  userId: number,
  institutionId: number
): Promise<StaffUserType> => {
  const res = await apiClient.get({
    url: `/admin/users/get`,
    needAuth: true,
    params: {
      userId,
      institutionId,
    },
  })
  return res.data.data
}

export const getClassLessonsOfInstructor = async (
  upComingClassParams: UpcomingClassesDto
): Promise<UpcomingClasses[]> => {
  const res = await apiClient.get({
    url: `/admin/instructors/class-lessons`,
    needAuth: true,
    params: upComingClassParams,
  })
  return res.data.data
}

export const exportClassLessonsCsv = async (
  params: ExportClassCsvDto,
  fileName: string
): Promise<void> => {
  const res = await apiClient.get({
    url: `/admin/instructors/class-lessons/export-csv`,
    needAuth: true,
    params,
  })

  downloadStringAsCsvFile(res.data, fileName)
}
