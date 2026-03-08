import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'

export enum UserRole {
  Guest = 'guest',
  Student = 'student',
  Operations = 'operator',
  Instructor = 'instructor',
  SchoolAdmin = 'institution-manager',
  SiteAdmin = 'site-manager',
  MasterAdmin = 'master-admin',
}

export const AboveInstructorRoles = [
  UserRole.SchoolAdmin,
  UserRole.SiteAdmin,
  UserRole.MasterAdmin,
]

// design atom later

export const userPermissionState = atom<UserRole>({
  key: ATOM_KEY.UserPermissionState,
  default: UserRole.Guest,
})
export const loggedInState = atom<boolean>({
  key: ATOM_KEY.LoggedInState,
  default: false,
})
