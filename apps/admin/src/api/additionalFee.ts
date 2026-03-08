import { AdditionalFee, AdditionalFeeConditions } from '../types/additionalFee'
import { CouponStatusEnum, DiscountType } from '../types/coupon'

import apiClient from './index'

export const getAllAdditionalFee = async (
  siteId: number,
  institutionId: number
): Promise<AdditionalFee[]> => {
  const res = await apiClient.get({
    url: '/admin/additional-fee',
    needAuth: true,
    params: {
      siteId,
      institutionId,
    },
  })

  return res.data.data
}

export const getSingleAdditionalFee = async (
  id: number
): Promise<AdditionalFee> => {
  const res = await apiClient.get({
    url: `/admin/additional-fee/${id}`,
    needAuth: true,
  })

  return res.data.data
}

export const createAdditionalFee = async ({
  siteId,
  institutionId,
  name,
  amount,
}: {
  siteId: number
  institutionId: number
  name: string
  amount: number
}): Promise<AdditionalFee> => {
  const res = await apiClient.post({
    url: '/admin/additional-fee',
    needAuth: true,
    data: {
      siteId,
      institutionId,
      name,
      amount,
      feeType: DiscountType.FIXED_AMOUNT,
      status: CouponStatusEnum.active,
      condition: AdditionalFeeConditions.NEW_STUDENT,
    },
  })

  return res.data.data
}

export const updateAdditionalFee = async (
  id: number,
  data: Partial<AdditionalFee>
): Promise<AdditionalFee> => {
  const res = await apiClient.patch({
    url: `/admin/additional-fee/${id}`,
    needAuth: true,
    data,
  })

  return res.data.data
}

export const deleteAdditionalFee = async (id: number): Promise<void> => {
  await apiClient.delete({
    url: `/admin/additional-fee/${id}`,
    needAuth: true,
  })
}

export const assignAdditionalFeeToCourse = async (
  additionalFeeId: number,
  courseId: number
): Promise<void> => {
  await apiClient.post({
    url: `/admin/additional-fee/assign-course`,
    data: { additionalFeeId, courseId },
    needAuth: true,
  })
}

export const unassignAdditionalFeeToCourse = async (
  additionalFeeId: number,
  courseId: number
): Promise<void> => {
  await apiClient.post({
    url: `/admin/additional-fee/unassign-course`,
    data: { additionalFeeId, courseId },
    needAuth: true,
  })
}
