import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios'
import { merge } from 'lodash'

import { LocalStorageKeys } from '../constants/localStorageKeys'

import { ApiError } from './errors/apiError'
import { logout, refreshAccessToken } from './auth'

interface RequestProps extends AxiosRequestConfig {
  needAuth?: boolean
  url: string | undefined
  method?: Method | undefined
  data?: Record<string, any> | undefined
  params?: Record<string, any> | undefined
  headers?: Record<string, any | undefined>
  onUploadProgress?: (progressEvent: ProgressEvent) => void
  onDownloadProgress?: (progressEvent: ProgressEvent) => void
  responseType?:
    | 'json'
    | 'blob'
    | 'arraybuffer'
    | 'document'
    | 'text'
    | 'stream'
}

export default class BaseClient {
  instance: AxiosInstance

  baseURL: string

  // Track refresh promises per user request using a Map
  private refreshPromises: Map<string, Promise<string>> = new Map()

  constructor(customConfig: AxiosRequestConfig = {}) {
    this.baseURL = customConfig.baseURL || ''
    this.instance = axios.create(
      merge(
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'zh-HK',
          },
          needAuth: false,
        },
        customConfig
      )
    )
    this.setRequestInterceptor()
    this.setResponseInterceptor()
  }

  setRequestInterceptor(): void {
    this.instance.interceptors.request.use(
      (config: any) => {
        return config
      },
      (error: any) => {
        throw error
      }
    )
  }

  setResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      (response: { data: any }) => {
        return response
      },
      (error: AxiosError) => {
        if (error.response?.data) {
          throw new ApiError(error.response.data.message, error.response.status)
        }

        throw error
      }
    )
  }

  // eslint-disable-next-line class-methods-use-this
  private getAuthorizationHeader(
    needAuth: boolean
  ): Record<string, string> | undefined {
    if (!needAuth) return undefined

    const accessToken = localStorage.getItem(LocalStorageKeys.UserAccessToken)
    if (!accessToken) return undefined

    return { Authorization: `Bearer ${accessToken}` }
  }

  // eslint-disable-next-line class-methods-use-this
  async cleanAndRedirectToLogin(): Promise<void> {
    logout()
    window.location.replace('/login')
  }

  private async refreshAccessTokenSingleton(refreshToken: string) {
    // Use refresh token as key to track promises per user
    const existingPromise = this.refreshPromises.get(refreshToken)
    if (existingPromise) {
      return existingPromise
    }

    const promise = (async () => {
      try {
        const { accessToken } = await refreshAccessToken(refreshToken)
        localStorage.setItem(LocalStorageKeys.UserAccessToken, accessToken)
        return accessToken
      } catch (error) {
        this.refreshPromises.delete(refreshToken)
        throw error
      }
    })()

    this.refreshPromises.set(refreshToken, promise)
    return promise
  }

  private async handleAuthError(
    error: ApiError,
    requestConfig: AxiosRequestConfig
  ): Promise<AxiosResponse<any>> {
    if (error.message === 'TOKEN_EXPIRED') {
      await this.cleanAndRedirectToLogin()
      throw error
    }

    if (error.statusCode !== 401) throw error

    try {
      const refreshToken = localStorage.getItem(
        LocalStorageKeys.UserRefreshToken
      )
      if (!refreshToken) {
        await this.cleanAndRedirectToLogin()
        throw new Error('UNAUTHORIZED: No refresh token')
      }

      let accessToken
      try {
        accessToken = await this.refreshAccessTokenSingleton(refreshToken)
      } catch (refreshTokenError) {
        console.error('Failed to refresh token:', refreshTokenError)
        await this.cleanAndRedirectToLogin()
        throw refreshTokenError
      }

      if (!accessToken) {
        await this.cleanAndRedirectToLogin()
        throw new Error('Failed to obtain new access token')
      }

      // eslint-disable-next-line no-param-reassign
      requestConfig.headers = {
        ...requestConfig.headers,
        Authorization: `Bearer ${accessToken}`,
      }

      return await this.instance.request(requestConfig)
    } catch (refreshError) {
      if (refreshError instanceof ApiError && refreshError.statusCode === 401) {
        await this.cleanAndRedirectToLogin()
      }
      throw refreshError
    }
  }

  async request({
    url,
    method,
    data,
    params,
    headers,
    needAuth = true,
    onUploadProgress,
    onDownloadProgress,
    responseType,
    ...opts
  }: RequestProps): Promise<AxiosResponse<any>> {
    const requestConfig: AxiosRequestConfig = {
      ...opts,
      url,
      method,
      data,
      params,
      headers: {
        ...headers,
        ...this.getAuthorizationHeader(needAuth),
      },
      onUploadProgress,
      onDownloadProgress,
      responseType,
    }

    try {
      return await this.instance.request(requestConfig)
    } catch (error) {
      if (error instanceof ApiError && needAuth) {
        return this.handleAuthError(error, requestConfig)
      }
      throw error
    }
  }

  async get({
    url,
    params,
    ...opts
  }: RequestProps): Promise<AxiosResponse<any>> {
    return this.request({ url, method: 'GET', params, ...opts })
  }

  async post({
    url,
    data,
    ...opts
  }: RequestProps): Promise<AxiosResponse<any>> {
    return this.request({ url, method: 'POST', data, ...opts })
  }

  async delete({
    url,
    data,
    ...opts
  }: RequestProps): Promise<AxiosResponse<any>> {
    return this.request({ url, method: 'DELETE', data, ...opts })
  }

  async patch({
    url,
    data,
    ...opts
  }: RequestProps): Promise<AxiosResponse<any>> {
    return this.request({ url, method: 'PATCH', data, ...opts })
  }

  async put({ url, data, ...opts }: RequestProps): Promise<AxiosResponse<any>> {
    return this.request({ url, method: 'PUT', data, ...opts })
  }

  async head({
    url,
    params,
    ...opts
  }: RequestProps): Promise<AxiosResponse<any>> {
    return this.request({ url, method: 'HEAD', params, ...opts })
  }
}
