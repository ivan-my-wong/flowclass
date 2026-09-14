import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import { STALE_TIME } from '@/constants/common'

import { ApiError, handleApiError } from '../api/errors/apiError'
import {
  changeStatusCoupon,
  createBundleDiscount,
  createCoupon,
  deleteBundleDiscount,
  deleteCoupon,
  getAllBundleDiscounts,
  getAllExistCoupons,
  getBundleDiscountsById,
  getCourseAndStudent,
  getCurrentCoupon,
  getListCourse,
  getListStudent,
  toggleBundleDiscountStatus,
  updateBundleDiscount,
  UpdateBundleDiscountDto,
  updateCoupon,
} from '../api/promotion'
import { getHistoryCoupon } from '../api/recordLogs'
import { QUERY_KEY } from '../constants/queryKey'
import { promotionState } from '../stores/promotionData'
import {
  BundleDiscount,
  CreateBundleDiscountDto,
} from '../types/bundleDiscounts'
import {
  Coupon,
  CouponStatusEnum,
  CourseAndStudentProps,
  CourseProps,
  CreateCouponProps,
  HistoryCouponProps,
  StudentProps,
} from '../types/coupon'

import useSchoolData from './useSchoolData'

const usePromotionData = () => {
  const [promotionData, setPromotionData] = useRecoilState(promotionState)

  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''
  const currentSiteId = schoolData.currentSchool?.siteId.toString() || ''
  const code = promotionData.currentCoupon?.code || ''
  const { t } = useTranslation()
  const currentCouponId = promotionData.currentCoupon?.id || 0

  const useFetchCurrentCoupon = (
    successfulCallback?: (data: Coupon) => void
  ): UseQueryResult<Coupon, unknown> => {
    const result = useQuery(
      [QUERY_KEY.promotion.getCurrentCouponKey, currentCouponId],
      () =>
        getCurrentCoupon(currentCouponId, currentInstitutionId, currentSiteId),
      {
        onSuccess: data => {
          setPromotionData(prev => ({ ...prev, currentCoupon: data }))
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentCouponId,
      }
    )
    return result
  }
  const useFetchAllCouponData = (): UseQueryResult<Coupon[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.promotion.promotionListCouponKey, currentInstitutionId],
      () => getAllExistCoupons(currentInstitutionId, +currentSiteId),
      {
        onSuccess: data => {
          const currentCoupon =
            data.find(
              (coupon: Coupon) => coupon.id === promotionData.currentCoupon?.id
            ) || (data.length > 0 ? data[0] : null)

          setPromotionData({
            ...promotionData,
            currentCoupon,
            coupons: data,
            initFetch: true,
          })
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!currentInstitutionId,
      }
    )
    return result
  }

  const useFetchAllBundleDiscountsData = (): UseQueryResult<
    BundleDiscount[],
    unknown
  > => {
    const result = useQuery(
      [
        QUERY_KEY.promotion.bundleDiscountsListKey,
        currentSiteId,
        currentInstitutionId,
      ],
      () => getAllBundleDiscounts(currentSiteId, currentInstitutionId),
      {
        onSuccess: data => {
          const currentBundleDiscount =
            data.find(
              (bundle: BundleDiscount) =>
                bundle.id === promotionData.currentBundleDiscount?.id
            ) || (data.length > 0 ? data[0] : null)

          setPromotionData({
            ...promotionData,
            currentBundleDiscount,
            bundleDiscounts: data,
            initFetch: true,
          })
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!currentInstitutionId,
      }
    )
    return result
  }

  const setCurrentCoupon = (id: number | string) => {
    const currentCoupon = promotionData.coupons.find(
      // eslint-disable-next-line eqeqeq
      (coupon: Coupon) => coupon.id === id
    )
    if (currentCoupon) {
      setPromotionData(prev => ({
        ...prev,
        currentCoupon,
      }))
    }
  }

  const useCreateCoupon = (
    successfulCallback?: (data: CreateCouponProps) => void
  ): UseMutationResult<Coupon, ApiError, CreateCouponProps, unknown> => {
    const mutation = useMutation({
      mutationFn: (classData: CreateCouponProps) => {
        return createCoupon(
          {
            ...classData,
          },
          currentInstitutionId,
          currentSiteId
        )
      },
      onSuccess: data => {
        toast.success(t('promotion:coupons.createCouponSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDeleteCoupon = (
    successfulCallback?: (data: Coupon) => void
  ): UseMutationResult<Coupon, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (couponId: number) =>
        deleteCoupon(couponId, currentInstitutionId, currentSiteId),
      onSuccess: data => {
        setPromotionData(prev => ({
          ...prev,
          coupons: prev.coupons.filter(coupon => {
            return coupon.id !== data.id
          }),
        }))
        toast.success(t('promotion:deleteCouponSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useFetchCourseAndStudentData = (
    disabled = false
  ): UseQueryResult<CourseAndStudentProps, unknown> => {
    const result = useQuery(
      [QUERY_KEY.course.courseAndStudentDataKey, currentInstitutionId],
      () => getCourseAndStudent(+currentInstitutionId, currentSiteId),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !disabled,
        staleTime: STALE_TIME,
      }
    )
    return result
  }

  const useFetchStudentData = (params: {
    disabled?: boolean
    page?: number
    limit?: number
    search?: string
  }): UseQueryResult<StudentProps[], unknown> => {
    const { disabled, ...other } = params
    const result = useQuery(
      [QUERY_KEY.course.studentsDataKey, currentInstitutionId, params],
      () =>
        getListStudent({
          id: +currentInstitutionId,
          siteId: currentSiteId,
          ...other,
        }),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !disabled,
        staleTime: STALE_TIME,
      }
    )
    return result
  }

  const useFetchCourseData = (
    disabled = false
  ): UseQueryResult<CourseProps[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.course.coursesDataKey, currentInstitutionId],
      () => getListCourse(+currentInstitutionId, currentSiteId),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !disabled,
        staleTime: STALE_TIME,
      }
    )
    return result
  }
  const useUpdateStatusCoupon = (
    id: number,
    successfulCallback?: (data: Coupon) => void
  ): UseMutationResult<Coupon, ApiError, Partial<Coupon>, unknown> => {
    const mutation = useMutation({
      mutationFn: (updatedFields: Partial<Coupon>) =>
        changeStatusCoupon(
          id,
          currentInstitutionId,
          currentSiteId,
          updatedFields
        ),
      onSuccess: () => {
        let tempCurrentCoupon: any = null

        setPromotionData(prev => ({
          ...prev,
          coupons: prev.coupons.map(coupon => {
            let operation = coupon
            if (operation.id === id) {
              operation = {
                ...operation,
                status:
                  operation.status === CouponStatusEnum.active
                    ? CouponStatusEnum.inActive
                    : CouponStatusEnum.active,
              }
              tempCurrentCoupon = operation
            }
            return operation
          }),
          currentCoupon: tempCurrentCoupon,
        }))
        successfulCallback?.(tempCurrentCoupon)
        toast.success(t('promotion:updateCouponSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateCoupon = (
    id: number,
    successfulCallback?: (data: Coupon) => void
  ): UseMutationResult<Coupon, ApiError, Partial<Coupon>, unknown> => {
    const mutation = useMutation({
      mutationFn: (updateData: Partial<Coupon>) => {
        return updateCoupon(id, currentInstitutionId, updateData)
      },
      onSuccess: (data: Coupon) => {
        // Update the coupon in the state
        setPromotionData(prev => ({
          ...prev,
          coupons: prev.coupons.map(coupon =>
            coupon.id === data.id ? data : coupon
          ),
          currentCoupon: data,
        }))
        toast.success(t('promotion:updateCouponSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useFetchHistoryCoupon = (
    successfulCallback?: (data: HistoryCouponProps[]) => void
  ) => {
    const result = useQuery(
      [QUERY_KEY.promotion.getHistoryCouponKey, currentInstitutionId],
      () => getHistoryCoupon(+currentInstitutionId, +currentSiteId, code),
      {
        onSuccess: historyData => {
          successfulCallback?.(historyData)
        },
        onError: (error: ApiError) => handleApiError({ error, t }),
        enabled: !!currentInstitutionId,
      }
    )
    return result
  }

  const useCreateBundleDiscount = (
    successfulCallback?: (data: BundleDiscount) => void
  ): UseMutationResult<
    BundleDiscount,
    ApiError,
    CreateBundleDiscountDto,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (classData: CreateBundleDiscountDto) => {
        return createBundleDiscount({
          ...classData,
        })
      },
      onSuccess: data => {
        toast.success(t('promotion:bundleDiscount.createSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDeleteBundleDiscount = (
    successfulCallback?: (data: BundleDiscount) => void
  ): UseMutationResult<BundleDiscount, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (bundleId: number) =>
        deleteBundleDiscount(bundleId, currentInstitutionId),
      onSuccess: data => {
        setPromotionData(prev => ({
          ...prev,
          bundleDiscounts: prev.bundleDiscounts.filter(bundle => {
            return bundle.id !== data.id
          }),
        }))
        toast.success(t('promotion:bundleDiscount.deleteBundleSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useFetchBundleDiscountById = (
    bundleId: number,
    successfulCallback?: (data: BundleDiscount) => void
  ): UseQueryResult<BundleDiscount, unknown> => {
    const result = useQuery(
      [QUERY_KEY.promotion.bundleDiscountDetailKey, bundleId],
      () => getBundleDiscountsById(bundleId),
      {
        onSuccess: data => {
          setPromotionData(prev => ({
            ...prev,
            currentBundleDiscount: data,
          }))
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!bundleId,
        staleTime: STALE_TIME,
      }
    )
    return result
  }

  const useUpdateBundleDiscount = (
    successfulCallback?: (data: BundleDiscount) => void
  ): UseMutationResult<
    BundleDiscount,
    ApiError,
    UpdateBundleDiscountDto,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (payload: UpdateBundleDiscountDto) => {
        return updateBundleDiscount(payload)
      },
      onSuccess: data => {
        // Update the bundle in the state
        setPromotionData(prev => ({
          ...prev,
          bundleDiscounts: prev.bundleDiscounts.map(bundle =>
            bundle.id === data.id ? data : bundle
          ),
          currentBundleDiscount: data,
        }))
        toast.success(t('promotion:bundleDiscount.successUpdateMessage'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useToggleBundleDiscountStatus = (
    successfulCallback?: (data: BundleDiscount) => void
  ): UseMutationResult<BundleDiscount, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (bundleId: number) => toggleBundleDiscountStatus(bundleId),
      onSuccess: data => {
        // Update the bundle status in the state
        setPromotionData(prev => ({
          ...prev,
          bundleDiscounts: prev.bundleDiscounts.map(bundle =>
            bundle.id === data.id ? data : bundle
          ),
          currentBundleDiscount:
            prev.currentBundleDiscount?.id === data.id
              ? data
              : prev.currentBundleDiscount,
        }))
        toast.success(
          data.isActive
            ? t('promotion:bundleDiscount.activateSuccess')
            : t('promotion:bundleDiscount.deactivateSuccess')
        )
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const setCurrentBundleDiscount = (id: number | string) => {
    const currentBundle = promotionData.bundleDiscounts.find(
      (bundle: BundleDiscount) => bundle.id === id
    )
    if (currentBundle) {
      setPromotionData(prev => ({
        ...prev,
        currentBundleDiscount: currentBundle,
      }))
    }
  }

  return {
    promotionData,
    useFetchAllCouponData,
    setCurrentCoupon,
    useCreateCoupon,
    useDeleteCoupon,
    useUpdateCoupon,
    useFetchCurrentCoupon,
    useFetchHistoryCoupon,
    useUpdateStatusCoupon,
    useFetchCourseAndStudentData,

    useFetchAllBundleDiscountsData,
    useCreateBundleDiscount,
    useDeleteBundleDiscount,
    useFetchBundleDiscountById,
    useUpdateBundleDiscount,
    useToggleBundleDiscountStatus,
    setCurrentBundleDiscount,

    useFetchStudentData,
    useFetchCourseData,
  }
}

export default usePromotionData
