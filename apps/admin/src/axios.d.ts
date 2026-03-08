import { AxiosRequestConfig } from 'axios'

declare module 'axios' {
  // eslint-disable-next-line no-shadow
  export interface AxiosRequestConfig {
    needAuth?: boolean
  }
}
