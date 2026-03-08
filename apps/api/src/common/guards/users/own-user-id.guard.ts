import { CanActivate, ExecutionContext } from '@nestjs/common'

import { RequireParam } from '@/models/enums'
import { getParamId } from '@/utils/requests.utils'
import {
  isInstitutionManager,
  isInstructor,
  isMasterAdmin,
  isOperator,
  isSiteManager,
} from '@/utils/user-roles.utils'

export class CurrentUserOwnIdGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const userRoles = request.user.userRoles
    const user = request.user

    if (!userRoles) {
      return false
    }

    const siteId = getParamId(request, RequireParam.SITE_ID)
    const userId = getParamId(request, RequireParam.USER_ID)
    const institutionId = getParamId(request, RequireParam.INSTITUTION_ID)

    if (siteId && isNaN(siteId)) {
      return false
    }

    if (userId && isNaN(userId)) {
      return false
    }

    if (institutionId && isNaN(institutionId)) {
      return false
    }

    if (
      isMasterAdmin(userRoles) ||
      isSiteManager(userRoles, siteId) ||
      isInstitutionManager(userRoles, institutionId)
    ) {
      return true
    }

    if (isInstructor(userRoles, institutionId) || isOperator(userRoles, institutionId)) {
      return userId === user.id
    }

    return false
  }
}
