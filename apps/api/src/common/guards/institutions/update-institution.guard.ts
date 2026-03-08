import { CanActivate, ExecutionContext } from '@nestjs/common'

import { RequireParam } from '@/models/enums'
import { getParamId } from '@/utils/requests.utils'
import { isInstitutionManager, isMasterAdmin, isSiteManager } from '@/utils/user-roles.utils'

export class UpdateInstitutionGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const userRoles = await request.user.userRoles

    if (!userRoles) {
      return false
    }

    const siteId = getParamId(request, RequireParam.SITE_ID)
    const institutionId = getParamId(request, RequireParam.INSTITUTION_ID)

    return (
      isMasterAdmin(userRoles) ||
      isSiteManager(userRoles, siteId) ||
      isInstitutionManager(userRoles, institutionId)
    )
  }
}
