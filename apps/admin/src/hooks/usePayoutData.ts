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

import { createCustomerAccount, createExpressStripeAccount } from '@/api/admin'
import { ApiError, handleApiError } from '@/api/errors/apiError'
import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import {
  createPayoutMethod,
  deletePayout,
  getAllPayoutMethods,
} from '@/api/payout'
import {
  connectStripe,
  enableStripe,
  getExpressAccountDetail,
  getStripeConnectDetail,
  StripeAccountLinkProps,
} from '@/api/settingPayments'
import { QUERY_KEY } from '@/constants/queryKey'
import payoutState from '@/stores/payoutData'
import { schoolState } from '@/stores/schoolData'
import {
  AboveInstructorRoles,
  userPermissionState,
} from '@/stores/userPermissionData'
import { IPaginatedData, PaginateOptionParams } from '@/types/pagination'
import { Payout, PayoutResponse } from '@/types/payout'
import {
  StripeConnectAccount,
  StripeConnectDetail,
} from '@/types/stripe-connect'

import useAuth from './useAuth'

const usePayoutData = () => {
  const { currentSchool } = useRecoilValue(schoolState)
  const [payoutData, setPayoutData] = useRecoilState(payoutState)
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { isLogin } = useAuth()
  const currentSchoolId = currentSchool?.id || 0
  const userPermission = useRecoilValue(userPermissionState)

  const useFetchExpressAccountDetail = (
    enabled: boolean,
    successfulCallback?: (data: Stripe.Account) => void
  ): UseQueryResult<Stripe.Account, ApiError> => {
    const result = useQuery(
      [QUERY_KEY.plans.getAccountDetailSchoolKey, currentSchoolId],
      () => getExpressAccountDetail(currentSchoolId),
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          return error
        },
        enabled: isLogin && !!currentSchoolId && enabled,
        refetchOnMount: false,
        // Because of recent migration to Stripe, we need to retry this query fewer times to reduce load time
        // retry: 2,
      }
    )
    return result
  }

  const useCreateCustomerAccount = (): UseMutationResult<
    StripeConnectAccount,
    ApiError,
    number,
    unknown
  > => {
    return useMutation({
      mutationFn: (schoolId: number) => createCustomerAccount(schoolId),
      onSuccess: () => {
        toast.success(t('payout:stripe.accountCreated'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useCreateExpressStripeAccount = (
    successfulCallback?: (data: StripeConnectAccount) => void,
    errorCallback?: () => void
  ): UseMutationResult<StripeConnectAccount, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (schoolId: number) => createExpressStripeAccount(schoolId),
      onSuccess: data => {
        successfulCallback?.(data)
        toast.success(t('payout:stripe.accountCreated'))

        setGtmEvent({
          schoolId: data.institutionId,
          event: GtmEvent.connectStripeExpress,
        })
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
        errorCallback?.()
      },
    })
    return mutation
  }

  const useFetchStripeConnectDetail = (
    successfulCallback?: (data: StripeConnectDetail) => void
  ): UseQueryResult<StripeConnectDetail, ApiError> => {
    const result = useQuery(
      [QUERY_KEY.stripe.stripeConnectDetailSchoolKey, currentSchoolId],
      () => getStripeConnectDetail(currentSchoolId),
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
          return error
        },
        enabled:
          !!currentSchoolId && AboveInstructorRoles.includes(userPermission),
        refetchOnMount: false,
        // Because of recent migration to Stripe, we need to retry this query fewer times to reduce load time
        retry: 2,
      }
    )
    return result
  }

  const useCreatePayoutMethod = (
    successfulCallback?: (success: PayoutResponse) => void,
    errorCallback?: () => void
  ): UseMutationResult<PayoutResponse, unknown, Payout, unknown> => {
    const mutation = useMutation({
      mutationFn: (payout: Payout) => createPayoutMethod(payout),
      onSuccess: data => {
        if (data.status === 201) toast.success(t('payout:createSuccess'))
        if (data.status === 200) toast.success(t('payout:updateSuccess'))
        successfulCallback?.(data)
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.payout.getPayoutMethodsKey, currentSchoolId],
        })
      },
      onError: (error: ApiError) => {
        toast.error(
          `${t('payout:updateFailed')}: ${handleApiError({ error, t })}`
        )
        errorCallback?.()
      },
    })
    return mutation
  }

  const useEnableStripe = (
    successfulCallback?: (data: StripeConnectDetail) => void,
    errorCallback?: () => void
  ): UseMutationResult<
    StripeConnectDetail,
    ApiError,
    {
      schoolId: number
      enabled: boolean
    },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: ({
        schoolId,
        enabled,
      }: {
        schoolId: number
        enabled: boolean
      }) => {
        return enableStripe(schoolId, enabled)
      },
      onSuccess: data => {
        successfulCallback?.(data)
        toast.success(t('payout:updateSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
        errorCallback?.()
      },
    })
    return mutation
  }

  const useFetchPayoutMethodsNew = (
    query?: PaginateOptionParams
  ): UseQueryResult<IPaginatedData<Payout>, unknown> => {
    const result = useQuery(
      [QUERY_KEY.payout.getPayoutMethodsKey, currentSchoolId],
      () => getAllPayoutMethods(currentSchoolId, false, query),
      {
        onSuccess: data => {
          setPayoutData({
            ...payoutData,
            payouts: data.content,
            meta: data.meta,
          })
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: AboveInstructorRoles.includes(userPermission),
      }
    )
    return result
  }

  const useDeletePayoutMethod = (
    successfulCallback?: (data: Payout) => void
  ): UseMutationResult<
    Payout,
    ApiError,
    { siteId: number; institutionId: number; id: number },
    unknown
  > => {
    const result = useMutation({
      mutationFn: (obj: {
        siteId: number
        institutionId: number
        id: number
      }) => deletePayout(obj),
      onSuccess: data => {
        successfulCallback?.(data)
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.payout.getPayoutMethodsKey, currentSchoolId],
        })
        toast.success(t('payout:deleteSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return result
  }

  const useConnectStripe = (
    successfulCallback: (data: StripeAccountLinkProps) => void
  ): UseMutationResult<
    StripeAccountLinkProps,
    ApiError,
    {
      institutionId: number
    },
    unknown
  > => {
    return useMutation({
      mutationFn: ({ institutionId }: { institutionId: number }) => {
        return connectStripe(institutionId)
      },
      onSuccess: (data: StripeAccountLinkProps) => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        if (error.statusCode === 403) {
          toast.error(t('subscription:checkout.noPermission'))
        } else {
          handleApiError({ error, t })
        }
      },
    })
  }

  return {
    useCreateCustomerAccount,
    useFetchExpressAccountDetail,
    useFetchStripeConnectDetail,
    useCreatePayoutMethod,
    useFetchPayoutMethodsNew,
    useDeletePayoutMethod,
    useCreateExpressStripeAccount,
    useEnableStripe,
    useConnectStripe,
  }
}

export default usePayoutData
