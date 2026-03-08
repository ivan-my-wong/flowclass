import { LoginFormProps } from '../pages/Login/LoginForm'
import { UserRole } from '../stores/userPermissionData'

import { SinglePermission } from './user'

export type SchoolInviteProps = {
  siteId: number
  institutionId: number
  role: string
}

export type UserInviteProps = {
  email: string
  siteId: number
  institutionId?: number
  role?: string
}

export type ChangeUserRoleProps = {
  email: string
  role: UserRole
}

export type UserPermissionRecord = {
  lastActiveTime: string
  permissions: SinglePermission[]
  email: string
}

export type AcceptInviteWithRegisterProps = LoginFormProps & {
  phone: string
  token: string
  agree: boolean
}

export enum InviteSiteMemberStatus {
  INVITING = 'inviting',
  REFUSE = 'refuse',
  ACCEPT = 'accept',
}

export type InviteSuccessResponse = {
  id: number
  siteId: number
  institutionId: number
  email: string
  token: string
  status: InviteSiteMemberStatus
  isSiteManager: boolean
  isInstitutionManager: boolean
  isInstructor: boolean
  isOperator: boolean
  inviteLink: string
}

export type InviteMemberResponse = {
  siteId: number
  institutionId: number
  email: string
  name: string
  phone: string
  isSiteManager: boolean
  isInstitutionManager: boolean
  isInstructor: boolean
  isOperator: boolean
  token: string
  status: InviteSiteMemberStatus
  isExistingUser: boolean
}

export type InviteUserFormData = {
  email: string
  name: string
  phone: string
  role: UserRole
}
/**
 * Data structure for accepting an invitation
 * @property {string} token - Invitation token
 * @property {string} email - User's email address
 * @property {string} firstName - User's first name
 * @property {string} password - Password (must meet security requirements)
 * @property {string} [confirmPassword] - Optional confirmation of password
 */
export type AcceptInviteFormData = {
  token: string
  email: string
  firstName: string
  password: string
  phone: string
  confirmPassword?: string
}
