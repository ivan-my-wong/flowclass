import { Request } from 'express'

import { RequireParam } from '../src/models/enums'

import { getParamId } from '../src/utils/requests/index.utils'

describe('request.utils', () => {
  it('get from body', () => {
    const req = {
      body: {
        siteId: 8,
      },
    } as Request

    expect(getParamId(req, RequireParam.SITE_ID)).toBe(8)
  })

  it('get from query', () => {
    const req = {
      body: {},
      query: {
        siteId: 8,
      },
    } as Request<any, any, any, any, any>

    expect(getParamId(req as Request, RequireParam.SITE_ID)).toBe(8)
  })

  it('get from headers and query', () => {
    const req = {
      body: {},
      query: { 'institution-id': '11' },
      headers: {
        'site-id': '8',
        'institution-id': '9',
        'course-id': '10',
      },
    } as unknown

    expect(getParamId(req as Request, RequireParam.SITE_ID)).toBe(8)
    expect(getParamId(req as Request, RequireParam.INSTITUTION_ID)).toBe(9)
    expect(getParamId(req as Request, RequireParam.COURSE_ID)).toBe(10)
  })
})
