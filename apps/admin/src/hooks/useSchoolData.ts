import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from 'react-query'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '@/api/errors/apiError'
import {
  copySchool,
  createSchool,
  deleteSchool,
  getCurrentSchool,
  getDemoSchool,
  getSchools,
  updateSchool,
} from '@/api/school'
import {
  createNotificationsSettingRecord,
  getNotificationsSettingRecord,
} from '@/api/settingNotifications'
import { getWebpageStyle } from '@/api/settingSite'
import { STALE_TIME } from '@/constants/common'
import { QUERY_KEY } from '@/constants/queryKey'
import notificationSettingState from '@/stores/NotificationSettingData'
import { schoolState } from '@/stores/schoolData'
import { schoolSubscriptionState } from '@/stores/schoolSubscriptionData'
import { siteState } from '@/stores/siteData'
import { userState } from '@/stores/userData'
import {
  AboveInstructorRoles,
  userPermissionState,
} from '@/stores/userPermissionData'
import {
  defaultNotificationsSetting,
  NotificationsSettingProps,
} from '@/types/notifications'
import { CopySchool, School } from '@/types/school'
import { WebpageInstitutionSettingProps } from '@/types/settingWebpageInstitution'
import { getUserRoleFromArray } from '@/utils/convert'
import { siteDomainIfCustom } from '@/utils/string'

import useAuth from './useAuth'

const useSchoolData = () => {
  const [schoolData, setSchoolData] = useRecoilState(schoolState)
  const [, setSchoolSubscription] = useRecoilState(schoolSubscriptionState)

  const userPermission = useRecoilValue(userPermissionState)
  const setNotificationSetting = useSetRecoilState(notificationSettingState)
  const [, setUserPermission] = useRecoilState(userPermissionState)
  const [user] = useRecoilState(userState)
  const siteData = useRecoilValue(siteState)
  const { t } = useTranslation()
  const { isLogin, setUserAndPermissions } = useAuth()
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentSiteId = siteData.currentSite?.id || 0

  const domain = siteDomainIfCustom(
    siteData.currentSite?.customDomain,
    siteData.currentSite?.url
  )
  const schoolBaseUrl = `https://${domain}/@${encodeURI(
    schoolData.currentSchool?.url ?? ''
  )}`

  const useFetchAllSchoolData = (): UseQueryResult<School[], unknown> => {
    const result = useQuery(
      [QUERY_KEY.site.getCurrentSchoolsSiteKey, currentSiteId],
      () => getSchools(currentSiteId),
      {
        onSuccess: res => {
          const data = [...res].sort((a, b) => a.id - b.id)

          const defaultInstitutionId =
            schoolData?.currentSchool?.id ||
            siteData?.currentSite?.defaultInstitutionId

          const currentSchool =
            data.find(school => school.id === defaultInstitutionId) ||
            (data.length > 0 ? data[0] : null)

          setSchoolData({
            currentSchool,
            schools: data,
            initFetch: true,
          })

          if (user.permissions) {
            const accessSchoolId =
              user.permissions[0].institutionId === 0
                ? user.permissions[0].institutionId
                : currentSchoolId
            setUserPermission(
              getUserRoleFromArray(
                user.permissions,
                currentSiteId,
                accessSchoolId
              )
            )
          }
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: isLogin && !!currentSiteId,
      }
    )
    return result
  }

  const updateCurrentSchool = async (school: School) => {
    setSchoolData(prev => ({
      ...prev,
      currentSchool: school,
    }))

    // const resUser = await getUserProfile()
    // if (resUser && resUser.permissions) {
    //   setUser({ ...resUser, isLogin: true })
    //   setUserPermission(
    //     getUserRoleFromArray(resUser.permissions, currentSchoolId, school.id)
    //   )
    // }
  }

  const setCurrentSchool = async (id: number | string) => {
    const currentSchool = schoolData.schools.find(
      // eslint-disable-next-line eqeqeq
      (school: School) => school.id == id
    )
    if (currentSchool) {
      setSchoolData(prev => ({
        ...prev,
        currentSchool,
      }))

      if (user.permissions) {
        const accessSchoolId =
          user.permissions[0].institutionId === 0
            ? user.permissions[0].institutionId
            : parseInt(id.toString(), 10)
        setUserPermission(
          getUserRoleFromArray(user.permissions, currentSiteId, accessSchoolId)
        )
      }
    }
  }

  const useFetchCurrentSchool = (
    successfulCallback?: (data: School) => void
  ): UseQueryResult<School, unknown> => {
    const result = useQuery(
      [QUERY_KEY.site.getCurrentSchoolKey, currentSchoolId],
      () => getCurrentSchool(currentSchoolId),
      {
        onSuccess: async currentSchool => {
          setSchoolData(prev => ({ ...prev, currentSchool }))
          successfulCallback?.(currentSchool)

          if (currentSchool) {
            setSchoolSubscription({
              planRecords: [],
              activePlan: {
                planIds: [1],
                notificationChannels: {
                  TWILIO_WHATSAPP: true,
                  UNOFFICIAL_WHATSAPP: true,
                },
              } as any,
              planQuotas: null,
            })
          }

          if (user.permissions) {
            const accessSchoolId =
              user.permissions[0].institutionId === 0
                ? user.permissions[0].institutionId
                : currentSchoolId

            setUserPermission(
              getUserRoleFromArray(
                user.permissions,
                currentSiteId,
                accessSchoolId
              )
            )
          }
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        cacheTime: 0,
        enabled: !!currentSchoolId,
        staleTime: STALE_TIME,
      }
    )
    return result
  }

  const useFetchCurrentSchoolSetting = (
    successfulCallback?: (data: WebpageInstitutionSettingProps) => void
  ) => {
    const result = useQuery(
      [QUERY_KEY.settings.getWebpageSettingSchoolKey, currentSchoolId],
      () => getWebpageStyle(currentSchoolId),
      {
        onSuccess: (data: WebpageInstitutionSettingProps) => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled:
          !!currentSchoolId && AboveInstructorRoles.includes(userPermission),
      }
    )
    return result
  }

  const useFetchCurrentSchoolNotificationsSetting = (
    successfulCallback?: (data: NotificationsSettingProps) => void
  ) => {
    const result = useQuery(
      [QUERY_KEY.settings.getSettingNotificationsSchoolKey, currentSchoolId],
      () => getNotificationsSettingRecord(currentSchoolId),
      {
        onSuccess: (data: NotificationsSettingProps) => {
          successfulCallback?.(data)
          if (data) {
            setNotificationSetting(prev => ({
              ...prev,
              currentSetting: data,
            }))
          }
        },

        onError: async (error: ApiError) => {
          if (error.statusCode === 404) {
            const newSetting = await createNotificationsSettingRecord(
              currentSchoolId,
              defaultNotificationsSetting
            )
            if (newSetting) {
              successfulCallback?.(newSetting)
            } else {
              handleApiError({ error, t })
            }
          } else {
            handleApiError({ error, t })
          }
        },
        enabled:
          !!currentSchoolId && AboveInstructorRoles.includes(userPermission),
        staleTime: STALE_TIME,
      }
    )
    return result
  }

  const useCreateSchool = (
    id: number,
    successfulCallback?: (success: boolean) => void
  ): UseMutationResult<School, ApiError, Partial<School>, unknown> => {
    const mutation = useMutation({
      mutationFn: (data: Partial<School>) => createSchool(id, data),
      onSuccess: data => {
        setSchoolData(prev => ({
          ...prev,
          schools: [...prev.schools, data],
          currentSchool: data,
        }))
        setUserAndPermissions()
        successfulCallback?.(false)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useUpdateSchool = (
    id: number,
    popUpMsg = true,
    successfulCallback?: (data: School) => void
  ): UseMutationResult<School, ApiError, Partial<School>, unknown> => {
    const mutation = useMutation({
      mutationFn: (updatedFields: Partial<School>) =>
        updateSchool(id, updatedFields),
      onSuccess: (data: School) => {
        const tempCurrentSchool: any = {
          ...data,
        }

        setSchoolData(prev => ({
          ...prev,
          schools: prev.schools.map(school =>
            school.id === data.id ? tempCurrentSchool : school
          ),
          currentSchool: tempCurrentSchool,
        }))
        successfulCallback?.(tempCurrentSchool)
        if (popUpMsg) toast.success(t('school:updateSchoolSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDeleteSchool = (
    successfulCallback?: (data: School) => void
  ): UseMutationResult<School, ApiError, number, unknown> => {
    const mutation = useMutation({
      mutationFn: (id: number) => deleteSchool(id),
      onSuccess: (data: School) => {
        setSchoolData(prev => ({
          ...prev,
          schools: prev.schools.filter(school => school.id !== data.id),
          currentSchool:
            prev.currentSchool?.id === data.id ? null : prev.currentSchool,
        }))
        successfulCallback?.(data)
        toast.success(t('school:deleteSchoolSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useGetDemoSchool = (email: string) => {
    const result = useQuery(
      [QUERY_KEY.site.getDemoSchool, email],
      () => getDemoSchool(email),
      {
        onError: async (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!email,
      }
    )
    return result
  }

  const useCopySchool = (
    successfulCallback?: (data: School[]) => void
  ): UseMutationResult<School[], ApiError, CopySchool, unknown> => {
    const mutation = useMutation({
      mutationFn: (payload: CopySchool) => copySchool(payload),
      onSuccess: (data: School[]) => {
        successfulCallback?.(data)
        toast.success(t('school:copySchoolSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  return {
    schoolBaseUrl,
    schoolData,
    currentSchool: schoolData.currentSchool,
    useFetchAllSchoolData,
    updateCurrentSchool,
    setCurrentSchool,
    useFetchCurrentSchool,
    useFetchCurrentSchoolSetting,
    useFetchCurrentSchoolNotificationsSetting,
    useCreateSchool,
    useUpdateSchool,
    useDeleteSchool,
    useGetDemoSchool,
    useCopySchool,
  }
}

export default useSchoolData
