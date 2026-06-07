// src/common/guards/permission.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { Role } from '@/models/enums'

import {
  hasPermission,
  Permission,
  PermissionAction,
  PermissionScope,
  ResourceType,
  ROLE_PERMISSIONS,
} from '../permissions/permission-registry'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<{
      resource: ResourceType
      action: PermissionAction
      scope: PermissionScope
    }>('permission', context.getHandler())

    if (!requiredPermission) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    // Get user's permissions based on roles
    const userPermissions = this.getUserPermissions(user)

    // Check if user has the required permission
    const hasRequiredPermission = hasPermission(
      userPermissions,
      requiredPermission.resource,
      requiredPermission.action,
      requiredPermission.scope
    )

    if (!hasRequiredPermission) {
      return false
    }

    // If the scope is INSTITUTION or OWN, we need to check if the user
    // has access to this specific resource
    if (requiredPermission.scope !== PermissionScope.ALL) {
      return this.checkResourceAccess(
        user,
        requiredPermission.resource,
        requiredPermission.scope,
        request
      )
    }

    return true
  }

  private getUserPermissions(user: any): Permission[] {
    // Extract roles from user
    const roles = this.getUserRoles(user)

    // Get permissions for all roles
    return roles.flatMap((role) => ROLE_PERMISSIONS[role] || [])
  }

  private getUserRoles(user: any): Role[] {
    const roles = []
    if (user.permissions) {
      user.permissions.forEach((permission) => {
        if (permission.isMasterAdmin) roles.push(Role.MASTER_ADMIN)
        if (permission.isSiteManager) roles.push(Role.SITE_MANAGER)
        if (permission.isInstitutionManager) roles.push(Role.INSTITUTION_MANAGER)
        if (permission.isInstructor) roles.push(Role.INSTRUCTOR)
        if (permission.isOperator) roles.push(Role.OPERATOR)
        if (permission.isStudent) roles.push(Role.STUDENT)
      })
    }
    return roles
  }

  private checkResourceAccess(
    user: any,
    resourceType: ResourceType,
    scope: PermissionScope,
    request: any
  ): boolean {
    if (scope === PermissionScope.SITE) {
      return this.checkSiteAccess(user, resourceType, request)
    }

    // If scope is INSTITUTION, check if resource belongs to user's institution
    if (scope === PermissionScope.INSTITUTION) {
      return this.checkInstitutionAccess(user, resourceType, request)
    }

    // If scope is OWN, check if resource belongs to user
    if (scope === PermissionScope.OWN) {
      return this.checkOwnAccess(user, resourceType, request)
    }

    return false
  }

  private checkSiteAccess(user: any, resourceType: ResourceType, request: any): boolean {
    // Get the site ID from the request
    const resourceSiteId = this.getResourceSiteId(resourceType, request)

    // Check if user belongs to this site
    const userSiteIds = (user.permissions || [])
      .filter((p) => p?.siteId)
      .map((p) => p.siteId)

    return userSiteIds.includes(resourceSiteId)
  }

  private checkInstitutionAccess(user: any, resourceType: ResourceType, request: any): boolean {
    // Get the institution ID from the request
    const resourceInstitutionId = this.getResourceInstitutionId(resourceType, request)

    // Check if user belongs to this institution
    const userInstitutionIds = (user.permissions || [])
      .filter((p) => p?.institutionId)
      .map((p) => p.institutionId)

    return userInstitutionIds.includes(resourceInstitutionId)
  }

  private checkOwnAccess(user: any, resourceType: ResourceType, request: any): boolean {
    switch (resourceType) {
      case ResourceType.USERS:
        return user.id === this.getResourceUserId(request)

      case ResourceType.COURSES:
        return this.isUserCourse(user, this.getResourceId(resourceType, request))

      case ResourceType.INVOICES:
        return this.isUserInvoice(user, this.getResourceId(resourceType, request))

      case ResourceType.PAYMENT_EVIDENCES:
        return this.isUserPaymentEvidence(user, this.getResourceId(resourceType, request))

      case ResourceType.ENROLL_COURSES:
        return this.isUserEnrollCourse(user, this.getResourceId(resourceType, request))

      // case ResourceType.AVAILABILITY:
      //   return this.isUserAvailability(user, this.getResourceId(resourceType, request))

      default:
        return false
    }
  }

  private getResourceSiteId(resourceType: ResourceType, request: any): number {
    // Extract site ID from request based on resource type
    return parseInt(request.params.siteId || request.query.siteId || request.body.siteId)
  }

  private getResourceInstitutionId(resourceType: ResourceType, request: any): number {
    // Extract institution ID from request based on resource type
    return parseInt(
      request.params.institutionId || request.query.institutionId || request.body.institutionId
    )
  }

  private getResourceUserId(request: any): number {
    return parseInt(request.params.userId || request.query.id)
  }

  private getResourceId(resourceType: ResourceType, request: any): number {
    // Extract resource ID from request based on resource type
    switch (resourceType) {
      case ResourceType.COURSES:
        return parseInt(request.params.courseId || request.query.id)
      case ResourceType.INVOICES:
        return parseInt(request.params.invoiceId || request.query.id)
      case ResourceType.PAYMENT_EVIDENCES:
        return parseInt(request.params.paymentEvidenceId || request.query.id)
      default:
        return null
    }
  }

  private isUserCourse(
    user: {
      id?: number
      permissions?: { isInstructor: boolean; courseIds?: number[] }[]
      enrollCourses?: { courseId: number }[]
    },
    courseId: number
  ): boolean {
    if (!user || !courseId) {
      return false
    }

    // Check if user is instructor of this course
    if (user.permissions) {
      // Check if user is an instructor for this course
      const isInstructor = user.permissions.some(
        (permission) => permission.isInstructor && permission.courseIds?.includes(courseId)
      )

      if (isInstructor) {
        return true
      }
    }

    // Check if user is enrolled in this course
    if (user.enrollCourses && user.enrollCourses.length > 0) {
      return user.enrollCourses.some((enrollment) => enrollment.courseId === courseId)
    }

    return false
  }

  private isUserInvoice(
    user: { id?: number; invoices?: { id: number; userId: number; payById: number }[] },
    invoiceId: number
  ): boolean {
    // Check if invoice belongs to user
    if (!user || !invoiceId) {
      return false
    }

    // Direct check if user has this invoice
    if (user.invoices && user.invoices.length > 0) {
      return user.invoices.some((invoice) => invoice.id === invoiceId)
    }

    // Check if user is the payer of this invoice
    if (user.invoices && user.id) {
      // If the invoice's userId or payById matches the current user's id
      return user.invoices.some(
        (invoice) => invoice.userId === user.id || invoice.payById === user.id
      )
    }

    return false
  }

  private isUserPaymentEvidence(
    user: { id?: number; paymentEvidences?: { id: number; userId: number }[] },
    paymentEvidenceId: number
  ): boolean {
    if (!user || !paymentEvidenceId) {
      return false
    }

    // Direct check if user has this payment evidence
    if (user.paymentEvidences && user.paymentEvidences.length > 0) {
      return user.paymentEvidences.some((evidence) => evidence.id === paymentEvidenceId)
    }

    // Check by userId in the payment evidence
    if (user.id) {
      return user.paymentEvidences?.some((evidence) => evidence.userId === user.id) ?? false
    }

    return false
  }

  private isUserEnrollCourse(
    user: { id?: number; enrollCourses?: { id: number; userId: number }[] },
    enrollCourseId: number
  ): boolean {
    // Check if enroll course belongs to user
    if (!user || !enrollCourseId) {
      return false
    }

    // Direct check if user has this enroll course
    if (user.enrollCourses && user.enrollCourses.length > 0) {
      return user.enrollCourses.some((enrollment) => enrollment.id === enrollCourseId)
    }

    // Check by userId in the enroll course
    if (user.id) {
      return user.enrollCourses?.some((enrollment) => enrollment.userId === user.id) ?? false
    }

    return false
  }
}
