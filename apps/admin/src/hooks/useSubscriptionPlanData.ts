import * as _ from 'lodash'
import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'
import Stripe from 'stripe'

import { getPresetPlans, subscribePresetPlan } from '@/api/preset-plans'
import { siteState } from '@/stores/siteData'
import { type SubscribePresetPlansDto } from '@/types/subscription-preset-plan'

import {
  addNewSubscriptionPlan,
  cancelSubscriptionPlan,
  createClientSubscriptionPlan,
  createCustomerAccount,
  createSubscriptionPlanRecordDirectly,
  deleteSubscriptionPlanRecord,
  downgradeSubscriptionPlan,
  fetchSubscriptionBillingHistory,
  getAllSubscriptionPlansAndQuotas,
  getNewPlanSubscriptionPreview,
  getUpgradeSubscriptionPreview,
  substituteSubscriptionPlan,
  updateSubscriptionPlanRecord,
  upgradeSubscriptionPlan,
} from '../api/admin'
import { ApiError, handleApiError } from '../api/errors/apiError'
import {
  createSubscriptionUpgradeCheckoutSession,
  createTrialPlan,
  getActiveSubscriptionPlanRecord,
  getAllPlanPrices,
  getAllSubscriptionPlanRecordsBySiteId,
  getAllSubscriptionPlans,
  getCurrentPlanAndQuotas,
  getSubscriptionDetail,
  getUpdateSubscriptionPortalLink,
  updateSubscription,
} from '../api/schoolSubscription'
import { getBillingPortalLink } from '../api/settingPayments'
import { QUERY_KEY } from '../constants/queryKey'
import { schoolState } from '../stores/schoolData'
import { schoolSubscriptionState } from '../stores/schoolSubscriptionData'
import type {
  AddPlansSubscriptionPayload,
  ClientSubscriptionPayload,
  CreateSubscriptionPlanRecordDirectlyProps,
  PlanWithQuotasResponse,
  StripeConnectAccount,
  StripePaymentLinkRecord,
  StripeProductPrice,
  SubscriptionPlanRecord,
  SubstituteSubscriptionPlanPayload,
  UpgradePreviewInfo,
  UpgradeSubscriptionPlanPayload,
} from '../types/schoolSubscriptionPlan'

import useAuth from './useAuth'

const usePlanData = () => {
  const schoolData = useRecoilValue(schoolState)
  const siteData = useRecoilValue(siteState)
  const { isLogin } = useAuth()
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentSiteId = siteData.currentSite?.id || 0
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  // SubscriptionDialog logic
  const [schoolSubscription, setSchoolSubscription] = useRecoilState(
    schoolSubscriptionState
  )

  const checkSubscriptionAccess = (
    key: keyof SubscriptionPlanRecord,
    value: number | string | boolean
  ): boolean => {
    if (!schoolSubscription || !schoolSubscription.activePlan) return false
    const { activePlan } = schoolSubscription

    const planField = activePlan[key]
    if (!planField || !value) return false
    if (_.isArray(planField as string[]) && value) {
      // For array fields, check if value is included in the array
      return (planField as string[]).includes(value as string)
    }
    if (typeof planField === 'object' && planField !== null) {
      // For object fields (e.g., featureEnable, notificationChannels)
      const key = value as keyof typeof planField
      return key in planField ? (planField[key] as boolean) : false
    }
    if (typeof planField === 'number') {
      // For numeric fields, check if planField >= value
      return planField >= Number(value)
    }
    // For string/boolean fields, check equality
    return planField === value
  }

  const useGetActiveSubscriptionPlanRecord = (
    onSuccess?: (data: SubscriptionPlanRecord) => void
  ): UseQueryResult<SubscriptionPlanRecord, unknown> => {
    return useQuery(
      [QUERY_KEY.plans.getActiveSubscriptionPlanRecordKey, currentSiteId],
      () => getActiveSubscriptionPlanRecord(currentSchoolId, currentSiteId),
      {
        onSuccess: data => {
          setSchoolSubscription(prev => ({
            ...prev,
            activePlan: data,
          }))
          onSuccess?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSiteId,
      }
    )
  }

  const useFetchSubscriptionDetail = (
    successfulCallback?: (data: Stripe.Subscription) => void,
    isDisabled?: boolean
  ): UseQueryResult<Stripe.Subscription, unknown> => {
    const result = useQuery(
      [QUERY_KEY.plans.getSubscriptionDetailSchoolKey, currentSchoolId],
      () => getSubscriptionDetail(currentSchoolId),
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
          return error
        },
        enabled: isLogin && !!currentSchoolId && !isDisabled,
      }
    )
    return result
  }

  const useGetBillingPortalLink = (
    isDisabled?: boolean
  ): UseQueryResult<Stripe.BillingPortal.Session, unknown> => {
    const result = useQuery(
      [QUERY_KEY.plans.getBillingPortalLinkSchoolKey, currentSchoolId],
      () => getBillingPortalLink(currentSchoolId),
      {
        onSuccess: data => {
          if (data && data.url) {
            return data
          }
          toast.error(t('setting:paymentSetting.updateError'))
          return null
        },
        onError: (error: ApiError) => {
          if (error.statusCode === 400) {
            toast.error(t('setting:paymentSetting.notCompleteOnboarding'))
          } else if (error.statusCode === 403) {
            toast.error(t('subscription:checkout.noPermission'))
          } else {
            toast.error(t('common:errors.network'))
          }
        },
        enabled: isLogin && !!currentSchoolId && !isDisabled,
      }
    )
    return result
  }

  const useUpdateSubscription = (
    successfulCallback?: (success: Stripe.Subscription) => void
  ): UseMutationResult<Stripe.Subscription, ApiError, number[], unknown> => {
    const mutation = useMutation({
      mutationFn: (planIds: number[]) =>
        updateSubscription(currentSchoolId, planIds),
      onSuccess: data => {
        successfulCallback?.(data)
        toast.success(t('subscription:updateSubscriptionSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useGetUpdateSubscriptionPortalLink = (
    successfulCallback?: (success: Stripe.BillingPortal.Session) => void
  ): UseMutationResult<
    Stripe.BillingPortal.Session,
    ApiError,
    number[],
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (planIds: number[]) =>
        getUpdateSubscriptionPortalLink(currentSchoolId, planIds),
      onSuccess: data => {
        successfulCallback?.(data)

        window.open(data.url, '_blank')
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useCreateSubscription = (
    successfulCallback?: (success: Stripe.Checkout.Session) => void
  ): UseMutationResult<
    Stripe.Checkout.Session,
    ApiError,
    {
      siteId: number
      schoolId: number
      planIds: number[]
    },
    unknown
  > => {
    return useMutation({
      mutationFn: ({
        schoolId,
        planIds,
      }: {
        siteId: number
        schoolId: number
        planIds: number[]
      }) => createSubscriptionUpgradeCheckoutSession(schoolId, planIds),
      onSuccess: (data: Stripe.Checkout.Session) => {
        successfulCallback?.(data)
        toast.success(t('subscription:checkOutWithLink'))
        if (data.url) {
          window.open(data.url, '_blank')
        }
      },
      onError: e => {
        if (e instanceof ApiError) {
          if (e.statusCode === 403) {
            toast.error(t('subscription:checkout.noPermission'))
          } else {
            toast.error(t('subscription:checkout.subscriptionFailCheckout'))
          }
        } else {
          toast.error(t('subscription:checkout.failCheckout'))
        }
      },
    })
  }

  const useCreateCustomerAccount = (
    successfulCallback?: (data: StripeConnectAccount) => void
  ): UseMutationResult<StripeConnectAccount, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (schoolId: number) => createCustomerAccount(schoolId),
      onSuccess: data => {
        successfulCallback?.(data)
        toast.success(t('payout:stripe.customerAccountCreated'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useFetchAllStripeProductPlanPrices = (
    successfulCallback?: (data: StripeProductPrice[]) => void
  ): UseQueryResult<StripeProductPrice[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.plans.allPlanPricesKey],
      () => getAllPlanPrices(),
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSchoolId,
      }
    )
    return result
  }

  const useFetchAllPlanPrices = () => {
    const result = useQuery(
      [QUERY_KEY.plans.allPlanPricesKey],
      () => getAllSubscriptionPlans(),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSchoolId,
      }
    )
    return result
  }

  const useGetPlanAndQuotas = (
    successfulCallback?: (data: PlanWithQuotasResponse) => void
  ) => {
    return useQuery(
      [QUERY_KEY.plans.getPlanAndQuotasKey, currentSchoolId],
      () => getCurrentPlanAndQuotas(currentSchoolId),
      {
        onSuccess: data => {
          setSchoolSubscription(prev => ({
            ...prev,
            planQuotas: data,
          }))
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSchoolId,
      }
    )
  }

  const useCreateTrialPlan = (
    onSuccess?: (data: SubscriptionPlanRecord) => void
  ): UseMutationResult<SubscriptionPlanRecord, ApiError, number, unknown> => {
    return useMutation({
      mutationFn: (siteId: number) => createTrialPlan(siteId),
      onSuccess: data => {
        onSuccess?.(data)
        toast.success(t('subscription:planRecordCreated'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  // Subscription Plan Records CRUD. This is for admins.
  const useFetchSubscriptionPlanRecords = (
    onSuccess?: (data: SubscriptionPlanRecord[]) => void
  ): UseQueryResult<SubscriptionPlanRecord[], ApiError> => {
    return useQuery(
      [QUERY_KEY.plans.planListKey, currentSiteId],
      () =>
        getAllSubscriptionPlanRecordsBySiteId(currentSchoolId, currentSiteId),
      {
        onSuccess: data => {
          onSuccess?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSiteId,
      }
    )
  }

  const useCreateSubscriptionPlanRecordDirectly = (
    onSuccess?: (data: SubscriptionPlanRecord) => void
  ): UseMutationResult<
    SubscriptionPlanRecord,
    ApiError,
    CreateSubscriptionPlanRecordDirectlyProps,
    unknown
  > => {
    return useMutation({
      mutationFn: (data: CreateSubscriptionPlanRecordDirectlyProps) =>
        createSubscriptionPlanRecordDirectly(data),
      onSuccess: data => {
        onSuccess?.(data)
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.plans.planListKey, currentSiteId],
        })
        queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEY.plans.getActiveSubscriptionPlanRecordKey,
            currentSiteId,
          ],
        })
        toast.success(t('subscription:planRecordCreated'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateSubscriptionPlanRecord = (
    onSuccess?: (data: SubscriptionPlanRecord) => void
  ): UseMutationResult<
    SubscriptionPlanRecord,
    ApiError,
    { id: number; data: Partial<SubscriptionPlanRecord> },
    unknown
  > => {
    return useMutation({
      mutationFn: ({ id, data }) => updateSubscriptionPlanRecord(id, data),
      onSuccess: data => {
        onSuccess?.(data)
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.plans.planListKey, currentSiteId],
        })
        queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEY.plans.getActiveSubscriptionPlanRecordKey,
            currentSiteId,
          ],
        })
        toast.success(t('subscription:planRecordUpdated'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useDeleteSubscriptionPlanRecord = (
    onSuccess?: () => void
  ): UseMutationResult<void, ApiError, number, unknown> => {
    return useMutation({
      mutationFn: (id: number) => deleteSubscriptionPlanRecord(id),
      onSuccess: () => {
        onSuccess?.()
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.plans.planListKey, currentSiteId],
        })
        queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEY.plans.getActiveSubscriptionPlanRecordKey,
            currentSiteId,
          ],
        })
        toast.success(t('subscription:planRecordDeleted'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useFetchAllClientSubscriptionPlans = () => {
    const result = useQuery(
      [QUERY_KEY.plans.clientSubscriptionPlans],
      () => getAllSubscriptionPlans(),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSchoolId,
      }
    )
    return result
  }

  const useCreateClientSubscriptionRecord = (
    cb?: (data: StripePaymentLinkRecord) => void
  ) => {
    return useMutation<
      StripePaymentLinkRecord,
      ApiError,
      ClientSubscriptionPayload
    >({
      mutationFn: (payload: ClientSubscriptionPayload) =>
        createClientSubscriptionPlan(payload),
      onSuccess: data => {
        cb?.(data)
        toast.success(t('subscription:createSubscriptionPlanSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useGetSubscriptionPlansAndQuotas = () => {
    return useQuery(
      [QUERY_KEY.plans.getSubscriptionPlansAndQuotasRecord],
      () =>
        getAllSubscriptionPlansAndQuotas(
          currentSchoolId,
          siteData.currentSite?.id || 0
        ),
      {
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSchoolId,
        retry: 2,
      }
    )
  }

  const useGetPreviewUpgradePlan = (
    payload: UpgradeSubscriptionPlanPayload
  ) => {
    return useQuery(
      ['subscriptionPlanUpgradePreview'],
      () =>
        getUpgradeSubscriptionPreview(siteData.currentSite?.id || 0, payload),
      {
        retry: 1,
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: false,
      }
    )
  }

  const useUpgradeSubscriptionPlan = (
    callbackFn?: (result: UpgradePreviewInfo | StripePaymentLinkRecord) => void
  ) => {
    return useMutation(
      (payload: UpgradeSubscriptionPlanPayload) =>
        upgradeSubscriptionPlan(siteData.currentSite?.id || 0, payload),
      {
        retry: false,
        onSuccess: result => {
          callbackFn?.(result)
          toast.success(t('subscription:alert.subscriptionUpdated'))
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useDowngradeSubscriptionPlan = (callbackFn?: () => void) => {
    return useMutation(
      (payload: UpgradeSubscriptionPlanPayload) =>
        downgradeSubscriptionPlan(siteData.currentSite?.id || 0, payload),
      {
        retry: false,
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              QUERY_KEY.plans.getSubscriptionPlansAndQuotasRecord,
              currentSiteId,
            ],
          })
          toast.success(t('subscription:alert.subscriptionUpdated'))
          callbackFn?.()
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useCancelSubscriptionPlan = (callbackFn?: () => void) => {
    return useMutation(
      (planId: number) =>
        cancelSubscriptionPlan(siteData.currentSite?.id || 0, planId),
      {
        retry: false,
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              QUERY_KEY.plans.getSubscriptionPlansAndQuotasRecord,
              currentSiteId,
            ],
          })
          toast.success(t('subscription:alert.subscriptionUpdated'))
          callbackFn?.()
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useSubstituteSubscriptionPlan = (onSuccess?: () => void) => {
    return useMutation(
      (payload: SubstituteSubscriptionPlanPayload) =>
        substituteSubscriptionPlan(siteData.currentSite?.id || 0, payload),
      {
        retry: false,
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEY.plans.planListKey, currentSiteId],
          })
          queryClient.invalidateQueries({
            queryKey: [
              QUERY_KEY.plans.getActiveSubscriptionPlanRecordKey,
              currentSiteId,
            ],
          })
          toast.success(t('subscription:alert.subscriptionUpdated'))
          onSuccess?.()
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useGetNewPlanSubscriptionPreview = (
    payload: AddPlansSubscriptionPayload
  ) => {
    return useQuery(
      ['newPlanSubscriptionPreview'],
      () =>
        getNewPlanSubscriptionPreview(siteData.currentSite?.id || 0, payload),
      {
        retry: false,
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: true,
      }
    )
  }

  const useAddNewSubscriptionPlan = (
    callbackFn?: (result: UpgradePreviewInfo | StripePaymentLinkRecord) => void
  ) => {
    return useMutation(
      (payload: AddPlansSubscriptionPayload) =>
        addNewSubscriptionPlan(siteData.currentSite?.id || 0, payload),
      {
        retry: false,
        onSuccess: result => {
          queryClient.invalidateQueries({
            queryKey: [
              QUERY_KEY.plans.getSubscriptionPlansAndQuotasRecord,
              currentSiteId,
            ],
          })
          toast.success(t('subscription:alert.subscriptionUpdated'))
          callbackFn?.(result)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
      }
    )
  }

  const useGetBillingHistory = () => {
    return useQuery(
      ['subscriptionBillingHistory'],
      () => fetchSubscriptionBillingHistory(siteData.currentSite?.id || 0),
      {
        retry: 1,
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: true,
      }
    )
  }

  const useSubscriptionPresetPlans = () => {
    return useQuery({
      queryKey: ['subscriptionPresetPlans'],
      queryFn: getPresetPlans,
    })
  }
  const useSubscribePresetPlan = (
    onSuccess?: (data: Stripe.Checkout.Session) => void
  ) => {
    return useMutation({
      mutationFn: (dto: SubscribePresetPlansDto) => subscribePresetPlan(dto),
      onSuccess: data => {
        toast.success(t('subscription:alert.subscriptionUpdated'))
        onSuccess?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  return {
    useFetchSubscriptionDetail,
    useGetActiveSubscriptionPlanRecord,
    useGetBillingPortalLink,
    useUpdateSubscription,
    useGetUpdateSubscriptionPortalLink,
    useCreateSubscription,
    useCreateCustomerAccount,
    useFetchAllStripeProductPlanPrices,
    useGetPlanAndQuotas,
    useFetchAllPlanPrices,
    useFetchSubscriptionPlanRecords,
    useCreateSubscriptionPlanRecordDirectly,
    useUpdateSubscriptionPlanRecord,
    useDeleteSubscriptionPlanRecord,
    useCreateTrialPlan,
    checkSubscriptionAccess,
    schoolSubscription,
    useFetchAllClientSubscriptionPlans,
    useCreateClientSubscriptionRecord,
    useGetSubscriptionPlansAndQuotas,
    useGetPreviewUpgradePlan,
    useUpgradeSubscriptionPlan,
    useDowngradeSubscriptionPlan,
    useCancelSubscriptionPlan,
    useGetNewPlanSubscriptionPreview,
    useAddNewSubscriptionPlan,
    useSubstituteSubscriptionPlan,
    useGetBillingHistory,
    useSubscriptionPresetPlans,
    useSubscribePresetPlan,
  }
}

export default usePlanData
