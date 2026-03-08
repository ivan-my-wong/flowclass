import { LocalStorageKeys } from '@/constants/localStorageKeys'
import { API_BASE_URL } from '@/lib/config'

const baseUrl = API_BASE_URL

export type ApiResponse<T> = {
  data: T
  message: string
  statusCode: number
  errorCode?: string
}

type FetchMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'HEAD'
type FetchParam = {
  method?: FetchMethod
  query?: Record<string, string>
  headers?: Record<string, string>
  body?: Record<string, any>
  needAuth?: boolean
  onUploadProgress?: (progressEvent: ProgressEvent) => void
}

class ApiError extends Error {
  statusCode: number
  errorCode: string
  message: string
  constructor(response: ApiResponse<any>) {
    super(response.message)
    this.errorCode = response.errorCode || 'UNKNOWN_ERROR'
    this.statusCode = response.statusCode
    this.message = response.message || 'UNKNOWN_ERROR'
  }
}

const apiDownError = new ApiError({
  errorCode: 'SERVICE_UNAVAILABLE',
  statusCode: 503,
  message: 'Our API server is undermaintenance, please try again later.',
  data: null,
})

async function customFetch<Data>(path: string, param: FetchParam): Promise<ApiResponse<Data>> {
  let url = `${baseUrl}${path}`

  const urlParam = param?.query ? new URLSearchParams(param.query) : null
  if (urlParam) {
    url = `${url}?${urlParam.toString()}`
  }

  // handle method
  const requestInit: RequestInit = {
    method: param?.method,
  }

  // handle body
  // if you use formData, you need to set boundary as well
  // broswer will set it automatically
  // if you set multipart/form-data mamually will casuing error
  if (param?.body) {
    if (param.body instanceof FormData) {
      requestInit.body = param.body
    } else {
      requestInit.headers = {
        ...requestInit.headers,
        'Content-Type': 'application/json',
      }
      requestInit.body = JSON.stringify(param.body)
    }
  }

  // handle headers
  if (param.headers) {
    requestInit.headers = {
      ...requestInit.headers,
      ...param.headers,
    }
  }

  if (param?.needAuth) {
    const isBrowser = typeof window !== 'undefined'
    if (isBrowser) {
      const token = localStorage.getItem(LocalStorageKeys.UserAccessToken)
      if (token) {
        requestInit.headers = {
          ...requestInit.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    }
  }

  // Handle upload progress for FormData
  if (param?.onUploadProgress && param.body instanceof FormData) {
    const xhr = new XMLHttpRequest()

    return new Promise<ApiResponse<Data>>((resolve, reject) => {
      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          param.onUploadProgress!(event)
        }
      })

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText) as ApiResponse<Data>
          if (response.statusCode >= 400 && response.statusCode < 600) {
            reject(new ApiError(response))
          } else {
            resolve(response)
          }
        } catch (e) {
          reject(apiDownError)
        }
      })

      xhr.addEventListener('error', () => {
        reject(apiDownError)
      })

      xhr.open(requestInit.method || 'GET', url)

      // Set headers
      if (requestInit.headers) {
        Object.entries(requestInit.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })
      }

      xhr.send(requestInit.body as FormData)
    })
  }

  const rawRes = await fetch(url, requestInit)
  let res: ApiResponse<Data>
  try {
    res = (await rawRes.json()) as ApiResponse<Data>
  } catch (e) {
    throw apiDownError
  }

  // Error handling here

  // if (res.statusCode === 401) {
  //   // special handling for invalid JWT
  // }

  if (res.statusCode >= 400 && res.statusCode < 600) {
    throw new ApiError(res)
  }

  return res
}

export default customFetch
