import { Site } from '../stores/siteData'
import {
  AcceptInviteWithRegisterProps,
  InviteMemberResponse,
} from '../types/userManagement'

import apiClient from './index'

export const getInvitationByToken = async (
  token: string
): Promise<InviteMemberResponse> => {
  const res = await apiClient.get({
    url: '/admin/users/get-invitation',
    params: {
      token,
    },
  })
  if (res) {
    return res.data.data
  }

  throw new Error('Unexpected response status')
}

export const acceptInviteWithRegister = async (
  data: AcceptInviteWithRegisterProps
): Promise<Site[]> => {
  const res = await apiClient.post({
    url: '/admin/users/accept-invite-with-register',
    data: {
      firstName: data.firstName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      token: data.token,
      agree: true,
    },
  })
  if (res) {
    return res.data.data
  }

  throw new Error('Unexpected response status')
}
