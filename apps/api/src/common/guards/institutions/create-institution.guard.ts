import { CanActivate, ExecutionContext } from '@nestjs/common'

import { RequireParam } from '@/models/enums'
import { getParamId } from '@/utils/requests.utils'
import { isMasterAdmin, isSiteManager } from '@/utils/user-roles.utils'

export class CreateInstitutionGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    const siteId = getParamId(request, RequireParam.SITE_ID)
    const userRoles = await request.user.userRoles

    if (!userRoles) {
      return false
    }

    return isMasterAdmin(userRoles) || isSiteManager(userRoles, siteId)
  }
}
