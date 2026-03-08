import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ClassRepository } from '@/models/classes.repository'
import { CoursesRepository } from '@/models/courses.repository'
import { RequireParam, Role } from '@/models/enums/'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { getParamId } from '@/utils/requests.utils'
import {
  isInstitutionManager,
  isInstructor,
  isMasterAdmin,
  isOperator,
  isSiteManager,
  isStudent,
} from '@/utils/user-roles.utils'

import { ROLES_KEY } from '../constants'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly classRepository: ClassRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const userRoles = await request.user.userRoles
    let institutionId = getParamId(request, RequireParam.INSTITUTION_ID)
    let siteId = getParamId(request, RequireParam.SITE_ID)

    if (!siteId && !institutionId) {
      const courseId = getParamId(request, RequireParam.COURSE_ID)
      const course = await this.courseRepository.findOne({ where: { id: courseId } })
      if (course) {
        institutionId = course.institutionId
        siteId = course.siteId
      }

      if (!courseId) {
        const classId = getParamId(request, RequireParam.CLASS_ID)
        const class_ = await this.classRepository.findOne({ where: { id: classId } })
        if (class_) {
          institutionId = class_.institutionId
          siteId = class_.siteId
        }
      }
    }

    if (!userRoles) {
      return false
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const results: boolean[] = []

    // Override all other roles if the user is a master admin
    if (isMasterAdmin(userRoles)) {
      results.push(true)
    }

    if (requiredRoles.includes(Role.MASTER_ADMIN)) {
      results.push(isMasterAdmin(userRoles))
    }

    if (requiredRoles.includes(Role.SITE_MANAGER)) {
      results.push(isSiteManager(userRoles, siteId))

      const retrievedSiteId = await this.institutionsRepository.findOne({
        where: { id: institutionId },
        select: {
          id: true,
          siteId: true,
        },
      })
      if (retrievedSiteId) {
        results.push(isSiteManager(userRoles, retrievedSiteId.siteId))
      }
    }

    if (requiredRoles.includes(Role.INSTITUTION_MANAGER)) {
      results.push(isInstitutionManager(userRoles, institutionId))
    }

    if (requiredRoles.includes(Role.INSTRUCTOR)) {
      results.push(isInstructor(userRoles, institutionId))
    }

    if (requiredRoles.includes(Role.OPERATOR)) {
      results.push(isOperator(userRoles, institutionId))
    }
    if (requiredRoles.includes(Role.STUDENT)) {
      results.push(isStudent(userRoles, institutionId))
    }
    return results.some((d) => d)
  }
}
