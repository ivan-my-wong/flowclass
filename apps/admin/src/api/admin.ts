import { WhatsappMessageType } from '@/types/whatsappMessage'

import { School } from '../types/school'
import { StripeConnectAccount } from '../types/stripe-connect'

import apiClient from '.'

export const createExpressStripeAccount = async (
  schoolId: number
): Promise<StripeConnectAccount> => {
  const res = await apiClient.post({
    url: '/admin/stripe-connects/create-account',
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
  })
  return res.data
}

export const createCustomerAccount = async (
  schoolId: number
): Promise<StripeConnectAccount> => {
  const res = await apiClient.post({
    url: '/admin/stripe-connects/create-customer-account',
    needAuth: true,
    params: {
      institutionId: schoolId,
    },
  })
  return res.data.data.content
}

export const sendWtsTestMessage = async (
  sendWtsDTO: Partial<WhatsappMessageType>
): Promise<any> => {
  const res = await apiClient.post({
    url: '/admin/notification-reminder/send',
    needAuth: true,
    data: sendWtsDTO,
  })
  return res.data
}

export const getAllInstitutionsForAdmin = async (): Promise<School[]> => {
  const res = await apiClient.get({
    url: '/admin/institutions/all',
    needAuth: true,
  })

  return res.data.data
}

export const changeOtherUserPassword = async (
  email: string,
  password: string
): Promise<void> => {
  await apiClient.post({
    url: `/admin/auth/change-other-user-password`,
    needAuth: true,
    data: {
      email,
      password,
    },
  })
}
