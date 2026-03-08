import { UserRole } from '@/stores/userPermissionData'
import { StaffUserType } from '@/types/user'

export const generateFirstNameAndLastName = (
  userData: StaffUserType
): [string, string] => {
  if (!userData.user) {
    return ['', '']
  }

  const { user } = userData

  if (user.firstName && user.lastName) {
    return [user.firstName, user.lastName]
  }
  const hasSpace = user.firstName?.includes(' ')
  if (hasSpace) {
    const names = user.firstName?.split(' ')
    // all remaining names should be last name
    const lastName = names.slice(1).join(' ')
    return [names[0], lastName]
  }
  return [user.firstName, '']
}

export const roleParserMap: Record<
  Exclude<UserRole, UserRole.Guest | UserRole.Student>,
  string
> = {
  [UserRole.SiteAdmin]: 'isSiteManager',
  [UserRole.Operations]: 'isOperator',
  [UserRole.Instructor]: 'isInstructor',
  [UserRole.SchoolAdmin]: 'isInstitutionManager',
  [UserRole.MasterAdmin]: 'isMasterAdmin',
}
