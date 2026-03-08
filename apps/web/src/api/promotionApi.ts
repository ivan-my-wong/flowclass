import {
  ApplicableAdditionalFeeResponse,
  GetApplicableAdditionalFeeRequest,
} from '@/types/additionalFee'
import { BundleDiscount } from '@/types/bundleDiscount'
import {
  CalculateCouponPriceDto,
  CalculateCouponPriceResponse,
  Coupon,
  ValidateCouponDto,
  ValidateCouponResponse,
} from '@/types/coupon'
import {
  ClassTriaLessonResponse,
  GetAvailableTrialLessonDTO,
  ValidateTrialLessonDTO,
  ValidClassTrialLessonResponse,
} from '@/types/trial-lesson'
import { objectValueToString } from '@/utils/flatten'

import customFetch from './baseClient'

export const calculateCouponPrice = async (query: CalculateCouponPriceDto) => {
  const { data: result } = await customFetch<CalculateCouponPriceResponse>(
    '/student/coupons/calculate-price',
    {
      method: 'GET',
      query: objectValueToString(query),
    }
  )
  return result
}

export const validateCoupon = async (query: ValidateCouponDto) => {
  const { data: result } = await customFetch<ValidateCouponResponse>('/student/coupons/validate', {
    method: 'GET',
    query: objectValueToString(query),
  })
  return result
}

export const getCourseBundleDiscounts = async (courseId: number) => {
  const { data: result } = await customFetch<BundleDiscount>(
    `/student/bundle-discounts/course/${courseId}`,
    {
      method: 'GET',
    }
  )
  return result
}

export const getAvailableCoupon = async (enrolToken: string) => {
  const { data: result } = await customFetch<Coupon[]>('/student/coupons/available-coupon', {
    method: 'GET',
    query: { enrolToken },
  })
  return result
}

export const getApplicableAdditionalFee = async (
  data: GetApplicableAdditionalFeeRequest
): Promise<ApplicableAdditionalFeeResponse> => {
  const { data: result } = await customFetch<ApplicableAdditionalFeeResponse>(
    '/student/enroll-courses/additional-fee',
    {
      method: 'POST',
      query: {
        siteId: data.siteId.toString(),
        institutionId: data.institutionId.toString(),
        courseId: data.courseId.toString(),
      },
      body: {
        ...data,
        siteId: data.siteId,
        institutionId: data.institutionId,
        courseId: data.courseId,
      },
    }
  )
  return result
}

export const getAvailableTrialLesson = async (dto: GetAvailableTrialLessonDTO) => {
  const { data: result } = await customFetch<ClassTriaLessonResponse>(
    '/student/trial-lesson/available',
    {
      method: 'POST',
      body: dto,
    }
  )
  return result
}

export const validateTrialLesson = async (dto: ValidateTrialLessonDTO) => {
  const { data: result } = await customFetch<ValidClassTrialLessonResponse>(
    '/student/trial-lesson/validate',
    {
      method: 'POST',
      body: dto,
    }
  )
  return result
}
