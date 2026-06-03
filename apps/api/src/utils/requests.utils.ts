import { Request } from 'express'

import { RequireParam } from '@/models/enums/'

export const getParamId = (req: Request, paramName): number => {
  const paramId =
    req.body?.[paramName] ||
    req.query?.[paramName] ||
    req.headers?.[HEADER_PARAM[paramName]] ||
    req.params?.[paramName]

  const result = parseInt(paramId)

  return Number.isNaN(result) ? undefined : result
}

export const HEADER_PARAM = {
  [RequireParam.SITE_ID]: 'site-id',
  [RequireParam.INSTITUTION_ID]: 'institution-id',
  [RequireParam.COURSE_ID]: 'course-id',
}
