import { PARAMS_KEY } from '../constants/queryKey'
import {
  NotificationsSettingProps,
  NotificationsSettingUpdateProps,
} from '../types/notifications'

import ApiError from './errors/apiError'
import apiClient from './index'

export const getNotificationsSettingRecord = async (
  institutionId: number
): Promise<NotificationsSettingProps> => {
  const res = await apiClient.get({
    url: '/admin/setting-notifications/detail',
    params: {
      institutionId,
    },
    needAuth: true,
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data || ''
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }

  throw new Error('Unexpected response status')
}

export const createNotificationsSettingRecord = async (
  institutionId: number,
  notificationsSetting: NotificationsSettingUpdateProps
): Promise<NotificationsSettingProps> => {
  const res = await apiClient.post({
    url: '/admin/setting-notifications/create',
    needAuth: true,
    params: { institutionId },
    data: notificationsSetting,
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }

  throw new Error('Unexpected response status')
}

export const updateNotificationsSettingRecord = async (
  institutionId: number,
  settingNotifictionsId: number,
  notificationsSetting: NotificationsSettingUpdateProps
): Promise<NotificationsSettingProps> => {
  const res = await apiClient.patch({
    url: '/admin/setting-notifications/update',

    needAuth: true,
    headers: {
      institutionId,
    },
    params: {
      [PARAMS_KEY.SETTING_NOTIFICATIONS_ID]: settingNotifictionsId,
    },
    data: notificationsSetting,
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data || ''
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }

  throw new Error('Unexpected response status')
}
