// src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common'

import { Permission } from '../permissions/permission-registry'

/**
 * Decorator to require multiple permissions
 * @param permissions Array of permission requirements
 */
export const RequirePermissions = (permissions?: Permission[]) => {
  // If no permissions provided, extract from route parameters
  if (!permissions || permissions.length === 0) {
    return SetMetadata('extractPermissionsFromRoute', true)
  }

  // Otherwise, set the specific permissions
  return SetMetadata('permissions', permissions)
}
