// src/common/permissions/permission-registry.ts
import { Role } from '@/models/enums'

// Define resource types
export enum ResourceType {
  USERS = 'users',
  COURSES = 'courses',
  INVOICES = 'invoices',
  PAYMENT_EVIDENCES = 'payment_evidences',
  ENROLL_COURSES = 'enroll_courses',
  AVAILABILITY = 'availability',
  // Add more resources as needed
}

// Define permission scopes
export enum PermissionScope {
  ALL = 'all', // Can access all objects
  INSTITUTION = 'institution', // Can only access objects in their institution
  SITE = 'site', // Can only access objects in their site
  OWN = 'own', // Can only access their own objects
}

// Define permission actions
export enum PermissionAction {
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Permission structure
export type Permission = {
  resource: ResourceType
  action: PermissionAction
  scope: PermissionScope
}

// Create a permission object
export function createPermission(
  resource: ResourceType,
  action: PermissionAction,
  scope: PermissionScope
): Permission {
  return { resource, action, scope }
}

// Function to check if a user has a specific permission
export function hasPermission(
  userPermissions: Permission[],
  resource: ResourceType,
  action: PermissionAction,
  requiredScope: PermissionScope
): boolean {
  // First check for ALL scope (which supersedes other scopes)
  const hasAllScope = userPermissions.some(
    (p) => p.resource === resource && p.action === action && p.scope === PermissionScope.ALL
  )

  if (hasAllScope) return true

  // If requiring SITE scope, check for it
  if (requiredScope === PermissionScope.SITE) {
    return userPermissions.some(
      (p) =>
        p.resource === resource &&
        p.action === action &&
        (p.scope === PermissionScope.SITE || p.scope === PermissionScope.ALL)
    )
  }

  // If requiring INSTITUTION scope, check for it
  if (requiredScope === PermissionScope.INSTITUTION) {
    return userPermissions.some(
      (p) =>
        p.resource === resource &&
        p.action === action &&
        (p.scope === PermissionScope.INSTITUTION || p.scope === PermissionScope.ALL)
    )
  }

  // If requiring OWN scope, check for any matching permission
  if (requiredScope === PermissionScope.OWN) {
    return userPermissions.some(
      (p) =>
        p.resource === resource &&
        p.action === action &&
        (p.scope === PermissionScope.OWN ||
          p.scope === PermissionScope.INSTITUTION ||
          p.scope === PermissionScope.ALL)
    )
  }

  return false
}

// Define role permissions more concisely
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.MASTER_ADMIN]: [
    // Master admin can do everything with all objects
    ...Object.values(ResourceType).flatMap((resource) =>
      Object.values(PermissionAction).map((action) =>
        createPermission(resource, action, PermissionScope.ALL)
      )
    ),
  ],

  [Role.SITE_MANAGER]: [
    // Site manager can manage everything within the site
    ...Object.values(ResourceType).flatMap((resource) =>
      Object.values(PermissionAction).map((action) =>
        createPermission(resource, action, PermissionScope.SITE)
      )
    ),
  ],

  [Role.INSTITUTION_MANAGER]: [
    // Institution manager can manage everything within their institution
    ...Object.values(ResourceType).flatMap((resource) =>
      Object.values(PermissionAction).map((action) =>
        createPermission(resource, action, PermissionScope.INSTITUTION)
      )
    ),
  ],

  [Role.INSTRUCTOR]: [
    // Instructors can view and update their own profile
    createPermission(ResourceType.USERS, PermissionAction.VIEW, PermissionScope.OWN),
    createPermission(ResourceType.USERS, PermissionAction.UPDATE, PermissionScope.OWN),

    // Instructors can view and update courses they teach
    createPermission(ResourceType.COURSES, PermissionAction.VIEW, PermissionScope.OWN),
    createPermission(ResourceType.COURSES, PermissionAction.UPDATE, PermissionScope.OWN),

    // Instructors can view invoices related to their classes
    createPermission(ResourceType.INVOICES, PermissionAction.VIEW, PermissionScope.OWN),

    // Instructors can view payment evidences related to their classes
    createPermission(ResourceType.PAYMENT_EVIDENCES, PermissionAction.VIEW, PermissionScope.OWN),

    // Instructors can view enroll courses related to their classes
    createPermission(ResourceType.ENROLL_COURSES, PermissionAction.VIEW, PermissionScope.OWN),

    // Instructors can view availability related to their classes
    createPermission(ResourceType.AVAILABILITY, PermissionAction.VIEW, PermissionScope.OWN),
    createPermission(ResourceType.AVAILABILITY, PermissionAction.UPDATE, PermissionScope.OWN),
  ],

  [Role.OPERATOR]: [
    // Operators have limited permissions
    createPermission(ResourceType.USERS, PermissionAction.VIEW, PermissionScope.OWN),
    createPermission(ResourceType.USERS, PermissionAction.UPDATE, PermissionScope.OWN),
    createPermission(ResourceType.COURSES, PermissionAction.VIEW, PermissionScope.INSTITUTION),
  ],

  [Role.STUDENT]: [
    // Students can only view and update their own profile
    createPermission(ResourceType.USERS, PermissionAction.VIEW, PermissionScope.OWN),
    createPermission(ResourceType.USERS, PermissionAction.UPDATE, PermissionScope.OWN),

    // Students can view courses they're enrolled in
    createPermission(ResourceType.COURSES, PermissionAction.VIEW, PermissionScope.OWN),

    // Students can view their own invoices
    createPermission(ResourceType.INVOICES, PermissionAction.VIEW, PermissionScope.OWN),

    // Students can manage their payment evidences
    createPermission(ResourceType.PAYMENT_EVIDENCES, PermissionAction.VIEW, PermissionScope.OWN),
    createPermission(ResourceType.PAYMENT_EVIDENCES, PermissionAction.CREATE, PermissionScope.OWN),
  ],
}
