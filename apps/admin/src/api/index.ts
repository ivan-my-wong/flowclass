import { API_BASE_URL } from '@/lib/config'

import BaseClient from './baseClient'

const apiClient = new BaseClient({
  baseURL: API_BASE_URL,
})

export default apiClient
