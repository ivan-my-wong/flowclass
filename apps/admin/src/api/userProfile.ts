import { ChangePasswordProps, UserState } from '../types/user'

import ApiError from './errors/apiError'
import apiClient from './index'

export const getUserProfile = async (): Promise<UserState> => {
  const res = await apiClient.get({
    url: '/admin/users/me',
    needAuth: true,
  })

  if (res) {
    return res.data.data
  }
  throw new Error('Unexpected response status')
}

export const updateUserProfile = async (
  profile: Partial<UserState>
): Promise<UserState> => {
  const res = await apiClient.post({
    url: '/admin/users/change-profile',
    needAuth: true,
    data: { ...profile },
  })

  if (res) {
    return res.data.data
  }
  throw new Error('Unexpected response status')
}

export const changePassword = async (
  user: Partial<ChangePasswordProps>
): Promise<boolean> => {
  const res = await apiClient.post({
    url: '/admin/users/change-password',
    needAuth: true,
    data: { ...user },
  })

  if (res.status === 201) {
    return true
  }

  if (res instanceof ApiError) {
    if (res.status === 400) {
      throw new ApiError('IncorrectPassword', res.statusCode)
    } else {
      throw new ApiError(res.message, res.statusCode)
    }
  }
  throw new Error('Unexpected response status')
}
