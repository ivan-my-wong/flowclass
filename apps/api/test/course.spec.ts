import { initEnv } from '../src/utils/misc/env.utils'
import axios, { AxiosInstance } from 'axios'

describe('student course controller', () => {
  let client: AxiosInstance

  beforeAll(() => {
    initEnv()
    client = axios.create({
      baseURL: `${process.env.APP_HOSTNAME}:${process.env.APP_PORT}`,
    })
  })

  it('get all courses with pagination', async () => {
    const data = await client.get('/student/courses', {
      params: {
        siteId: 1,
      },
    })
    console.log(data)
  })
})
