import BaseClient from './baseClient'

const apiClient = new BaseClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export default apiClient
