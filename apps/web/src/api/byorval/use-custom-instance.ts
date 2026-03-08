import Axios, { AxiosError, AxiosRequestConfig } from 'axios'

export const AXIOS_INSTANCE = Axios.create({ baseURL: '' })

export const useCustomInstance = <T>(): ((config: AxiosRequestConfig) => Promise<T>) => {
  const token = localStorage.getItem('token')

  return (config: AxiosRequestConfig) => {
    const source = Axios.CancelToken.source()
    const promise = AXIOS_INSTANCE({
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cancelToken: source.token,
    }).then(({ data }) => data)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    promise.cancel = () => {
      source.cancel('Query was cancelled by React Query')
    }

    return promise
  }
}

export default useCustomInstance

export type ErrorType<Error> = AxiosError<Error>
