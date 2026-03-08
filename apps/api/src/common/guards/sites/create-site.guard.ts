import { CanActivate, ExecutionContext } from '@nestjs/common'

import { isMasterAdmin } from '@/utils/user-roles.utils'

export class CreateSiteGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    const userRoles = await request.user.userRoles

    if (!userRoles) {
      return false
    }

    return isMasterAdmin(userRoles)
  }
}
