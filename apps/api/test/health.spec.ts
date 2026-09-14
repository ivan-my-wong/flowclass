import { initEnv } from '../src/utils/misc/env.utils'
import axios, { AxiosInstance } from 'axios'

describe('health controller', () => {
  let client: AxiosInstance

  beforeAll(() => {
    initEnv()
    client = axios.create({
      baseURL: `${process.env.APP_HOSTNAME}:${process.env.APP_PORT}`,
    })
  })

  it('check health', async () => {
    const { status } = await client.get('/health')
    expect(status).toBe(200)
  })
})
