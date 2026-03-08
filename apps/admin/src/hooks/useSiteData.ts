import { useTranslation } from 'react-i18next'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from 'react-query'
import { useRecoilState } from 'recoil'

import {
  convertDateToCurrentTimeZone,
  getTimeZoneDate,
} from '@/utils/date.utils'

import ApiError, { handleApiError } from '../api/errors/apiError'
import { getWebpageSetting } from '../api/settingSite'
import { createSite, getSites } from '../api/siteManagement'
import { QUERY_KEY } from '../constants/queryKey'
import { RegisterSiteResponse, Site, siteState } from '../stores/siteData'
import { userState } from '../stores/userData'
import { userPermissionState } from '../stores/userPermissionData'
import { RegionLanguageSettingResponse } from '../types/settingWebpageInstitution'
import { getUserRoleFromArray } from '../utils/convert'

import useAuth from './useAuth'

const useSiteData = () => {
  const [siteData, setSiteData] = useRecoilState(siteState)
  const [user] = useRecoilState(userState)
  const [, setUserPermission] = useRecoilState(userPermissionState)
  const { t } = useTranslation()
  const { isLogin } = useAuth()
  const timeZone = siteData.currentSite?.timeZone?.id || ''
  const currency = siteData.currentSite?.currency || ''
  const currentSiteId = siteData.currentSite?.id || 0

  const useFetchAllSiteData = (): UseQueryResult<Site[], unknown> & {
    isLoading: boolean
  } => {
    const result = useQuery(QUERY_KEY.site.siteDataKey, () => getSites(), {
      onSuccess: res => {
        const data = [...res].sort((a, b) => b.id - a.id)
        // last user selected site is stored, check the user's last activity on the site
        // and retrieve the data from the newly fetched information.
        // if current site is not in the list, set current site to the first site from new data
        // same logic also goes for the school and course
        // const defaultSite = data.find(site => site.defaultInstitutionId === 1)
        const currentSite =
          data.find(site => site.id === siteData.currentSite?.id) ||
          (data.length > 0 ? data[0] : null)

        setSiteData({
          currentSite,
          sites: data,
          initFetch: true,
        })

        if (currentSite) {
          setUserPermission(
            getUserRoleFromArray(user.permissions, currentSite.id)
          )
        }
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      enabled: isLogin,
    })
    return result
  }

  const useFetchCurrentSiteSetting = (
    successfulCallback?: (data: RegionLanguageSettingResponse) => void
  ): UseQueryResult<RegionLanguageSettingResponse, unknown> => {
    const result = useQuery(
      [QUERY_KEY.settings.getRegionLanguageSettingSiteKey, currentSiteId],
      () => getWebpageSetting(currentSiteId),
      {
        onSuccess: data => {
          successfulCallback?.(data)
        },
        onError: (error: ApiError) => {
          handleApiError({ error, t })
        },
        enabled: !!currentSiteId,
      }
    )
    return result
  }

  const updateCurrentSite = async (site: Site) => {
    setSiteData(prev => ({
      ...prev,
      currentSite: site,
      sites: [...prev.sites, site],
    }))

    // const resUser = await getUserProfile()

    // if (resUser && resUser.permissions) {
    //   setUser({ ...resUser, isLogin: true })
    //   setUserPermission(getUserRoleFromArray(resUser.permissions, site.id))
    // }
  }

  const setCurrentSite = async (id: number | string) => {
    const currentSite = siteData.sites.find(
      // eslint-disable-next-line eqeqeq
      (site: Site) => site.id == id
    )

    if (currentSite) {
      setSiteData(prev => ({
        ...prev,
        currentSite,
      }))

      if (user.permissions) {
        setUserPermission(
          getUserRoleFromArray(user.permissions, currentSite.id)
        )
      }
    }
  }

  // for later use
  // const useFetchCurrentSiteWebpageSetting =
  //   (): UseQueryResult<RegionLanguageSettingProps> => {
  //     const result = useQuery(
  //       [QUERY_KEY.currentRegionLanguageSettingSiteKey, siteData.currentSite?.id],
  //       () => getWebpageSetting(siteData.currentSite?.id.toString() || ''),
  //       {
  //         onSuccess: data => {
  //           setSiteData(prev => ({
  //             ...prev,
  //             currentSite: {
  //               ...prev.currentSite,
  //               regionLanguageSetting: data,
  //             },
  //           }))
  //         },
  //         onError: (error: ApiError) => {handleApiError(error,t)},
  //         enabled: !!siteData.currentSite,
  //       }
  //     )
  //     return result
  //   }

  const useGetCurrentSiteTimeZone = (): string => {
    return timeZone
  }

  // return date in current site time zone
  const getCurrentSiteTimeZoneDate = (date: string | null): Date | null =>
    getTimeZoneDate(date, timeZone)

  // return date string in utc format
  const convertDateToCurrentTimeZoneUTCString = (
    date: Date | null
  ): string | null => convertDateToCurrentTimeZone(date, timeZone)

  const useCreateNewSite = (
    successfulCallback?: (data: RegisterSiteResponse) => void
  ): UseMutationResult<
    RegisterSiteResponse,
    ApiError,
    { url: string; name: string },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (data: { url: string; name: string }) =>
        createSite({ url: data.url, name: data.name }),
      onSuccess: (data: RegisterSiteResponse) => {
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })

    return mutation
  }

  return {
    siteData,
    currentSite: siteData.currentSite,
    useFetchAllSiteData,
    setCurrentSite,
    updateCurrentSite,
    useGetCurrentSiteTimeZone,
    getCurrentSiteTimeZoneDate,
    convertDateToCurrentTimeZoneUTCString,
    useFetchCurrentSiteSetting,
    useCreateNewSite,
    currency,
    timeZone,
    // convertIsoStringToOffset,
    // useFetchCurrentSchool,
    // useCreateSchool,
    // useUpdateSchool,
  }
}

export default useSiteData
