import { Permission } from '@/application/admin/users/dto/user-role.dto'
import { UserRole } from '@/models/user-role.entity'

export const isMasterAdmin = (userRoles: UserRole[]): boolean => {
  const result = userRoles.find((userRole) => userRole.isMasterAdmin == true)
  return !!result
}

export const isSiteManager = (userRoles: UserRole[], siteId: number): boolean => {
  const result = userRoles.find(
    (userRole) => userRole.isSiteManager == true && userRole.siteId == siteId
  )
  return !!result
}

export const isInstitutionManager = (userRoles: UserRole[], institutionId: number): boolean => {
  const result = userRoles.find(
    (userRole) => userRole.isInstitutionManager == true && userRole.institutionId == institutionId
  )
  return !!result
}

export const isInstructor = (userRoles: UserRole[], institutionId: number): boolean => {
  const result = userRoles.find(
    (userRole) => userRole.isInstructor == true && userRole.institutionId == institutionId
  )
  return !!result
}

export const isOperator = (userRoles: UserRole[], institutionId: number): boolean => {
  const result = userRoles.find(
    (userRole) => userRole.isOperator == true && userRole.institutionId == institutionId
  )
  return !!result
}

export const isStudent = (userRoles: UserRole[], institutionId: number): boolean => {
  const result = userRoles.find(
    (userRole) => userRole.isStudent == true && userRole.institutionId == institutionId
  )
  return !!result
}

export const isInstructorCheck = (userRoles: UserRole[], institutionIds: number[]): boolean => {
  const result = userRoles.find(
    (userRole) =>
      userRole.isInstructor == true && institutionIds.indexOf(userRole.institutionId) !== -1
  )
  return !!result
}

export const permissionsOfUser = (userRoles: UserRole[]): Permission[] => {
  const data: Permission[] = []

  if (!userRoles) {
    return data
  }

  return userRoles.map((userRole) => {
    return {
      siteId: userRole.siteId,
      institutionId: userRole.institutionId,
      isMasterAdmin: userRole.isMasterAdmin,
      isSiteManager: userRole.isSiteManager,
      isInstitutionManager: userRole.isInstitutionManager,
      isInstructor: userRole.isInstructor,
      isOperator: userRole.isOperator,
    }
  })
}

export const getSiteIds = (userRoles: UserRole[]) => {
  if (!userRoles || userRoles.length === 0) return []
  const ids = userRoles.map((role: UserRole) => role.siteId)
  return ids
}

export const getSiteId = (userRoles: UserRole[], institutionId: number) => {
  if (!userRoles || userRoles.length === 0) {
    return 0
  }
  const role = userRoles.find((role: UserRole) => role.institutionId === institutionId)
  return role?.siteId | 0
}

export const getInstitutionIds = (userRoles: UserRole[]) => {
  if (!userRoles || userRoles.length === 0) return []
  const ids = userRoles.map((role: UserRole) => role.institutionId)
  return ids
}
