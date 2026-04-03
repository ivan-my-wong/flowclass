import {
  BundleDiscount,
  CreateBundleDiscountDto,
} from '@/types/bundleDiscounts'
import {
  CreatePackageDiscountDto,
  PackageDiscount,
  UpdatePackageDiscountDto,
} from '@/types/packageDiscounts'
import {
  BundleDiscountAvailabilityResponse,
  BundleDiscountDto,
  PossiblePromotionsType,
} from '@/types/studentInvoice.type'

import {
  Coupon,
  CourseAndStudentProps,
  CourseProps,
  CreateCouponProps,
  StudentProps,
} from '../types/coupon'

import apiClient from './index'

export type UpdateBundleDiscountDto = {
  bundleId: number
  patch: Partial<CreateBundleDiscountDto>
}
type IdNumberOrString = string | number
export const getAllExistCoupons = async (
  institutionId: string,
  siteId: number
): Promise<Coupon[]> => {
  const res = await apiClient.get({
    url: '/admin/coupons',
    needAuth: true,
    params: {
      institutionId,
      siteId,
    },
  })

  return res.data.data.content
}

export const getAllBundleDiscounts = async (
  siteId: string,
  institutionId: string
): Promise<BundleDiscount[]> => {
  const res = await apiClient.get({
    url: '/admin/bundle-discounts',
    needAuth: true,
    params: {
      siteId,
      institutionId,
    },
  })

  return res.data.data.content
}

export const getBundleDiscountsById = async (
  bundleId: number
): Promise<BundleDiscount> => {
  const res = await apiClient.get({
    url: `/admin/bundle-discounts/${bundleId}`,
    needAuth: true,
  })

  return res.data.data
}

export const getBundleDiscountsByCourseId = async (
  bundleId: number
): Promise<BundleDiscount> => {
  const res = await apiClient.get({
    url: `/student/bundle-discounts/course/${bundleId}`,
  })

  return res.data.data.content
}

export const getCurrentCoupon = async (
  id: number,
  institutionId: string,
  siteId: string
): Promise<Coupon> => {
  const res = await apiClient.get({
    url: '/admin/coupons/detail',
    needAuth: true,
    params: {
      couponId: id,
      institutionId,
      siteId,
    },
  })
  return res.data.data
}

export const createCoupon = async (
  coupon: Partial<CreateCouponProps>,
  institutionId: string,
  siteId: string
): Promise<any> => {
  const res = await apiClient.post({
    url: '/admin/coupons/create',
    params: {
      institutionId,
      siteId,
    },
    needAuth: true,
    data: { ...coupon },
  })

  return res.data.data
}

export const updateCoupon = async (
  id: number,
  institutionId: string,
  updateData: Partial<Coupon>
): Promise<Coupon> => {
  const res = await apiClient.patch({
    url: '/admin/coupons/update',
    params: {
      institutionId,
      couponId: id,
    },
    needAuth: true,
    data: updateData,
  })

  return res.data.data
}

export const createBundleDiscount = async (
  bundle: CreateBundleDiscountDto
): Promise<BundleDiscount> => {
  const res = await apiClient.post({
    url: '/admin/bundle-discounts/create',
    needAuth: true,
    data: { ...bundle },
  })

  return res.data.data
}

export const deleteBundleDiscount = async (
  bundleId: number,
  institutionId: string
): Promise<BundleDiscount> => {
  const res = await apiClient.delete({
    url: '/admin/bundle-discounts/delete',
    needAuth: true,
    params: { bundleId, institutionId },
  })

  return res.data.data
}

export const changeStatusCoupon = async (
  id: number,
  institutionId: string,
  siteId: string,
  body: Partial<Coupon>
): Promise<Coupon> => {
  const res = await apiClient.patch({
    needAuth: true,
    url: `/admin/coupons/${id}/status`,
    params: {
      institutionId,
      siteId,
    },
    data: body,
    headers: { institutionId },
  })

  return res.data.data
}

export const getCourseAndStudent = async (
  id: number,
  siteId: string
): Promise<CourseAndStudentProps> => {
  const res = await apiClient.get({
    needAuth: true,
    url: `/admin/institutions/${id}/courses-student`,
    params: {
      institutionId: id,
      siteId,
    },
  })

  return res.data.data
}

export const getListStudent = async (params: {
  id: number
  siteId: string
  page?: number
  limit?: number
  search?: string
}): Promise<StudentProps[]> => {
  const { id, ...other } = params
  const res = await apiClient.get({
    needAuth: true,
    url: `/admin/institutions/${id}/list-students`,
    params: { institutionId: id, ...other },
  })

  return res.data.data
}

export const getListCourse = async (
  id: number,
  siteId: string
): Promise<CourseProps[]> => {
  const res = await apiClient.get({
    needAuth: true,
    url: `/admin/institutions/${id}/list-courses`,
    params: {
      institutionId: id,
      siteId,
    },
  })

  return res.data.data
}

export const deleteCoupon = async (
  id: number,
  institutionId: string,
  siteId: string
): Promise<Coupon> => {
  const res = await apiClient.delete({
    needAuth: true,
    url: '/admin/coupons/delete',
    params: { couponId: id, institutionId, siteId },
  })

  return res.data
}

export const fetchPossiblePromotions = async (
  institutionId: IdNumberOrString
): Promise<PossiblePromotionsType[]> => {
  const res = await apiClient.post({
    url: '/admin/promotions/possible-promotions',
    needAuth: true,
    params: { institutionId },
  })

  return res.data.data
}

export const fetchBundleDiscountAvailability = async (
  institutionId: IdNumberOrString,
  siteId: IdNumberOrString,
  bundleId: number,
  userAliasIds?: number[]
): Promise<BundleDiscountAvailabilityResponse[]> => {
  const res = await apiClient.post({
    url: `/admin/bundle-discounts/check-eligible`,
    needAuth: true,
    data: {
      institutionId,
      siteId,
      bundleId,
      ...(userAliasIds && userAliasIds.length > 0 && { userAliasIds }),
    },
  })
  return res.data.data
}
// Get single bundle discount by ID (for view/edit)
export const getBundleDiscountById = async (
  bundleId: number
): Promise<BundleDiscount> => {
  const res = await apiClient.get({
    url: `/admin/bundle-discounts/${bundleId}`,
    needAuth: true,
  })

  return res.data.data
}

// Update bundle discount
export const updateBundleDiscount = async (
  payload: UpdateBundleDiscountDto
): Promise<BundleDiscount> => {
  const res = await apiClient.patch({
    url: `/admin/bundle-discounts/update?bundleId=${payload.bundleId}`,
    needAuth: true,
    data: payload,
  })

  return res.data.data
}

// Toggle bundle discount status (activate/deactivate)
export const toggleBundleDiscountStatus = async (
  bundleId: number
): Promise<BundleDiscount> => {
  const res = await apiClient.patch({
    url: `/admin/bundle-discounts/${bundleId}/toggle-status`,
    needAuth: true,
  })

  return res.data.data
}

// Get bundle discount usage statistics
export const getBundleDiscountStats = async (
  bundleId: number
): Promise<{
  usageCount: number
  totalSavings: number
  lastUsed: string | null
}> => {
  const res = await apiClient.get({
    url: `/admin/bundle-discounts/${bundleId}/stats`,
    needAuth: true,
  })

  return res.data.data
}

// ── Package Discounts ──

export const getAllPackageDiscounts = async (
  siteId: string,
  institutionId: string
): Promise<PackageDiscount[]> => {
  const res = await apiClient.get({
    url: '/admin/package-discounts',
    needAuth: true,
    params: { siteId, institutionId },
  })
  return res.data.data.content
}

export const getPackageDiscountById = async (
  id: number
): Promise<PackageDiscount> => {
  const res = await apiClient.get({
    url: `/admin/package-discounts/${id}`,
    needAuth: true,
  })
  return res.data.data
}

export const createPackageDiscount = async (
  dto: CreatePackageDiscountDto
): Promise<PackageDiscount> => {
  const res = await apiClient.post({
    url: '/admin/package-discounts/create',
    needAuth: true,
    data: { ...dto },
  })
  return res.data.data
}

export const updatePackageDiscount = async (
  payload: UpdatePackageDiscountDto
): Promise<PackageDiscount> => {
  const res = await apiClient.patch({
    url: `/admin/package-discounts/update?packageDiscountId=${payload.packageDiscountId}`,
    needAuth: true,
    data: payload.patch,
  })
  return res.data.data
}

export const deletePackageDiscount = async (
  id: number,
  institutionId: string
): Promise<PackageDiscount> => {
  const res = await apiClient.delete({
    url: '/admin/package-discounts/delete',
    needAuth: true,
    params: { packageDiscountId: id, institutionId },
  })
  return res.data.data
}

export const togglePackageDiscountStatus = async (
  id: number
): Promise<PackageDiscount> => {
  const res = await apiClient.patch({
    url: `/admin/package-discounts/${id}/toggle-status`,
    needAuth: true,
  })
  return res.data.data
}

export const getPackageDiscountsForClass = async (
  classId: number,
  siteId: string,
  institutionId: string
): Promise<PackageDiscount[]> => {
  const res = await apiClient.get({
    url: `/admin/package-discounts/by-class/${classId}`,
    needAuth: true,
    params: { siteId, institutionId },
  })
  return res.data.data
}
