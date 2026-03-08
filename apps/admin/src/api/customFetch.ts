type FetchConfig = {
  data?: Record<string, unknown>
  method?: string
  headers?: Record<string, string>
}

const getUrl = (apiBaseUrl: string, path: string) => {
  return `${apiBaseUrl}${path}`
}

const customFetch = async <T>(
  baseUrl: string,
  path: string,
  { data, method = 'GET', headers = {} }: FetchConfig
) => {
  const res = await fetch(getUrl(baseUrl, path), {
    headers: { 'Content-Type': 'application/json', ...headers },
    mode: 'cors',
    method,
    ...(data ? { body: JSON.stringify(data) } : {}),
  })

  const resData = (await res.json()) as T

  return resData
}

export default customFetch
