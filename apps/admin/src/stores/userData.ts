import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { UserState } from '../types/user'

import { localStorageEffect } from './utils/storageEffect'

export const defaultUserState: UserState = {
  id: 0,
  email: '',
  fullName: '',
  firstName: '',
  lastName: '',
  userNameLower: '',
  displayId: null,
  isEmailVerified: false,
  phone: null,
  lastActiveTime: null,
  avatar: null,
  avatarUrl: null,
  company: null,
  position: null,
  social: null,
  country: null,
  isDeleted: null,
  visibility: null,
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  createdAt: null,
  updatedAt: null,
  isLogin: false,
  permissions: [],
}

export const userState = atom<UserState>({
  key: ATOM_KEY.UserState,
  default: defaultUserState,
  effects: [localStorageEffect('isLogin')],
})
