import Axios, { AxiosError, AxiosRequestConfig } from 'axios'

import { API_BASE_URL } from '@/lib/config'

const AXIOS_INSTANCE = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
})

// Create and export a custom Axios instance
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  // eslint-disable-next-line import/no-named-as-default-member
  const source = Axios.CancelToken.source()
  const promise: Promise<T> & { cancel?: () => void } = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data) as Promise<T> & { cancel?: () => void }

  promise.cancel = () => {
    source.cancel('Query was cancelled by React Query')
  }

  return promise
}

export type ErrorType<Error> = AxiosError<Error>

export default customInstance
