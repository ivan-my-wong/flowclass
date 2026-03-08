import { SetMetadata } from '@nestjs/common'

import { REQUIRE_PARAM_KEY } from '@/common/constants'
import { RequireParam } from '@/models/enums/'

export const RequireParams = (...requireParams: RequireParam[]) =>
  SetMetadata(REQUIRE_PARAM_KEY, requireParams)
