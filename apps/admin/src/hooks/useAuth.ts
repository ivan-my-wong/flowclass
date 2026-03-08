import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useMutation, UseMutationResult } from 'react-query'
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil'
import { toast } from 'sonner'

import { createLoginToken, login, loginWithToken } from '../api/auth'
import { GtmEvent, setGtmEvent } from '../api/external/gtmEvent'
import { getUserProfile } from '../api/userProfile'
import { LoginFormProps } from '../pages/Login/LoginForm'
import { courseState } from '../stores/courseData'
import { schoolState } from '../stores/schoolData'
import { Site, siteState } from '../stores/siteData'
import { userState } from '../stores/userData'
import { userPermissionState } from '../stores/userPermissionData'
import { UserState } from '../types/user'
import { getUserRoleFromArray } from '../utils/convert'

const useAuth = () => {
  const [user, setUser] = useRecoilState(userState)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessages, setErrorMessages] = useState<string>('')
  const resetUserData = useResetRecoilState(userState)
  const resetSiteData = useResetRecoilState(siteState)
  const resetSchoolData = useResetRecoilState(schoolState)
  const resetCourseData = useResetRecoilState(courseState)
  const [, setUserPermission] = useRecoilState(userPermissionState)
  // const { siteData } = useSiteData()
  const { sites, currentSite } = useRecoilValue(siteState)
  const { isLogin } = user
  const { t } = useTranslation()

  const setUserAndPermissions = async (newSite?: Site) => {
    const resUser = await getUserProfile()

    if (resUser) {
      setUser({ ...resUser, isLogin: true })

      if (newSite) {
        setUserPermission(getUserRoleFromArray(user.permissions, newSite.id))
      } else if (currentSite) {
        setUserPermission(
          getUserRoleFromArray(user.permissions, currentSite.id)
        )
      } else if (sites && sites.length > 0) {
        setUserPermission(getUserRoleFromArray(user.permissions, sites[0].id))
      } else {
        setUserPermission(
          getUserRoleFromArray(user.permissions, resUser.permissions[0].siteId)
        )
      }

      setGtmEvent({
        userId: resUser.id,
        siteId: currentSite?.id ?? undefined,
        email: resUser.email,
        event: GtmEvent.login,
      })
    }
  }

  const useCreateLoginTokenWithEmail = (
    successfulCallback?: (data: string) => void
  ): UseMutationResult<string, any, string, unknown> => {
    const mutation = useMutation({
      mutationFn: (email: string) => createLoginToken(email),
      onSuccess: data => {
        successfulCallback?.(data)
      },
      onError: (error: any) => {
        switch (error.statusCode) {
          case 401:
            toast.error(t('login:errors.loginError'))
            break
          case 422:
            toast.error(t('login:errors.checkEmail'))
            break
          default:
            toast.error(t('common:errors.network'))
            setErrorMessages(t('common:errors.network') as string)
            break
        }
      },
    })
    return mutation
  }

  const useLoginTokenWithEmail = (
    successfulCallback?: (data: UserState) => void
  ): UseMutationResult<UserState, any, string, unknown> => {
    const mutation = useMutation({
      mutationFn: (token: string) => loginWithToken(token),
      onSuccess: data => {
        setUserAndPermissions()
        successfulCallback?.(data)
      },
      onError: (error: any) => {
        switch (error.statusCode) {
          case 401:
            toast.error(t('login:errors.loginError'))
            break
          case 422:
            toast.error(t('login:errors.checkEmail'))
            break
          default:
            toast.error(t('common:errors.network'))
            setErrorMessages(t('common:errors.network') as string)
            break
        }
      },
    })
    return mutation
  }

  const signInWithEmailAndPassword = async (loginForm: LoginFormProps) => {
    setIsLoading(true)
    try {
      const res = await login(loginForm)

      if (res) {
        setUserAndPermissions()
      }
    } catch (error: any) {
      switch (error.statusCode) {
        case 401:
          toast.error(t('login:errors.loginError'))
          break
        case 422:
          toast.error(t('login:errors.checkEmail'))
          break
        default:
          toast.error(t('common:errors.network'))
          setErrorMessages(t('common:errors.network') as string)
          break
      }
      throw new Error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('user-access-token')
    localStorage.removeItem('user-refresh-token')
    resetUserData()
    resetSiteData()
    resetSchoolData()
    resetCourseData()
    return Promise.resolve()
  }

  return {
    setUserAndPermissions,
    isLoading,
    isLogin,
    errorMessages,
    useCreateLoginTokenWithEmail,
    useLoginTokenWithEmail,
    signInWithEmailAndPassword,
    logout,
  }
}

export default useAuth
