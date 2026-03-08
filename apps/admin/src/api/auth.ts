import { LocalStorageKeys } from '../constants/localStorageKeys'
import { LoginFormProps } from '../pages/Login/LoginForm'
import { UserState } from '../types/user'

import { ApiError } from './errors/apiError'
import apiClient from './index'

export const hasUsers = async (): Promise<boolean> => {
  const res = await apiClient.get({
    url: '/admin/auth/has-users',
    needAuth: false,
  })
  if (res.status === 200 && res.data?.data?.hasUsers !== undefined) {
    return res.data.data.hasUsers
  }
  return true
}

export const registerAccount = async ({
  firstName,
  email,
  phone,
  password,
}: LoginFormProps): Promise<UserState> => {
  const res = await apiClient.post({
    url: '/admin/auth/register',
    needAuth: false,
    data: {
      firstName,
      // lastName,
      email,
      phone,
      password,
    },
  })

  if (res.status === 201) {
    localStorage.setItem(
      LocalStorageKeys.UserAccessToken,
      res.data.data.accessToken
    )
    localStorage.setItem(
      LocalStorageKeys.UserRefreshToken,
      res.data.data.refreshToken
    )
    return res.data.data
  }
  if (res instanceof ApiError) {
    throw new Error(res.message)
  }
  throw new Error('Unexpected response status')
}

export const createLoginToken = async (email: string): Promise<string> => {
  const res = await apiClient.post({
    url: '/admin/auth/create-login-token',
    needAuth: true,
    data: {
      email,
    },
  })

  if (res.status === 201) {
    return res.data.data
  }
  if (res instanceof ApiError) throw new Error(res.message)
  throw new Error('Unexpected response status')
}

export const loginWithToken = async (token: string): Promise<UserState> => {
  const res = await apiClient.post({
    url: '/admin/auth/login-with-token',
    needAuth: true,
    data: {
      token,
    },
  })

  if (res.status === 201) {
    localStorage.setItem(
      LocalStorageKeys.UserAccessToken,
      res.data.data.accessToken
    )
    localStorage.setItem(
      LocalStorageKeys.UserRefreshToken,
      res.data.data.refreshToken
    )
    return res.data.data
  }
  if (res instanceof ApiError) throw new Error(res.message)
  throw new Error('Unexpected response status')
}

export const login = async ({
  email,
  password,
}: LoginFormProps): Promise<UserState> => {
  const res = await apiClient.post({
    url: '/admin/auth/login',
    needAuth: false,
    data: {
      email,
      password,
    },
  })

  if (res.status === 201) {
    localStorage.setItem(
      LocalStorageKeys.UserAccessToken,
      res.data.data.accessToken
    )
    localStorage.setItem(
      LocalStorageKeys.UserRefreshToken,
      res.data.data.refreshToken
    )
    return res.data.data
  }
  if (res instanceof ApiError) throw new Error(res.message)
  throw new Error('Unexpected response status')
}

export const logout = (): void => {
  const keysToPreserve = ['displayLanguageState', 'i18nextLng', 'darkMode']

  Object.keys(localStorage)
    .filter(key => !keysToPreserve.includes(key))
    .forEach(key => localStorage.removeItem(key))
}

export const refreshAccessToken = async (
  refreshToken: string
): Promise<UserState & { accessToken: string }> => {
  const res = await apiClient.post({
    url: '/admin/auth/refresh-token',
    data: { refreshToken },
    needAuth: true,
  })
  if (res.status === 201) {
    localStorage.setItem(
      LocalStorageKeys.UserAccessToken,
      res.data.data.accessToken
    )
    return res.data.data
  }
  throw new Error('Unexpected response status')
}

export const forgotPassword = async ({
  email,
}: {
  email: string
}): Promise<boolean> => {
  const res = await apiClient.post({
    url: '/admin/auth/reset-password',
    needAuth: false,
    data: {
      email,
    },
  })

  if (res.status === 201) {
    return true
  }
  if (res instanceof ApiError) {
    throw new Error(res.message)
  }
  throw new Error('Unexpected response status')
}

export const resetPassword = async ({
  email,
  password,
  token,
}: {
  email: string
  password: string
  token: string
}): Promise<boolean> => {
  const res = await apiClient.post({
    url: '/admin/auth/forgot-password',
    needAuth: false,
    params: {
      email,
      token,
    },
    data: {
      password,
      passwordConfirm: password,
    },
  })

  if (res.status === 201) {
    return true
  }
  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }
  throw new Error('Unexpected response status')
}

export const deleteAccount = async (userId: number): Promise<boolean> => {
  const res = await apiClient.delete({
    url: '/admin/users/remove-account',
    params: {
      userId,
    },
  })

  if (res.status === 200) {
    return true
  }
  if (res instanceof ApiError) {
    throw new Error(res.message)
  }
  throw new Error('Unexpected response status')
}

export default {
  hasUsers,
  registerAccount,
  login,
  logout,
  forgotPassword,
  deleteAccount,
}
