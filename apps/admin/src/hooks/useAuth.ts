import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  AuthError,
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithPopup,
  UserCredential,
} from '@firebase/auth'
import { useTranslation } from 'react-i18next'
import { useMutation, UseMutationResult } from 'react-query'
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil'
import { toast } from 'sonner'

import {
  createLoginToken,
  login,
  loginWithToken,
  socialLogin,
} from '../api/auth'
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
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false)
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
  const navigate = useNavigate()
  const googleProvider = new GoogleAuthProvider()
  const facebookProvider = new FacebookAuthProvider()
  const firebaseAuth = getAuth()

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
        firebaseId: resUser.firebaseId,
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

  const signInWithGoogle = async (): Promise<UserState | null> => {
    setIsLoadingGoogle(true)
    try {
      return await signInWithPopup(firebaseAuth, googleProvider)
        .then(async (result: UserCredential) => {
          if (result && result.user) {
            const returnResult = {
              providerId: result.providerId,
              email: result.user.email,
              displayName: result.user.displayName,
              photoUrl: result.user.photoURL,
              accessToken:
                GoogleAuthProvider.credentialFromResult(result)?.accessToken,
              idToken: result.user.getIdToken(),
              refreshToken: result.user.refreshToken,
              uid: result.user.uid,
            }
            const res = await socialLogin(await returnResult.idToken)
            if (res) {
              setUserAndPermissions()
            }

            return user
          }
          throw new Error('Failed Authentication')
        })
        .catch(async (error: AuthError) => {
          if (
            error.message.includes('account-exists-with-different-credential')
          ) {
            const credential = GoogleAuthProvider.credentialFromError(error)
            toast.warning(t('login:errors.accountExists'))
            const currentUser = await signInWithFacebook()
            if (currentUser && firebaseAuth.currentUser && credential) {
              await linkWithCredential(firebaseAuth.currentUser, credential)
                .then(() => {
                  toast.success(t('login:register.socialMediaLinked'))
                })
                .catch(() => {
                  toast.warning(t('login:register.socialMediaLinkedError'))
                })

              return user
            }
            throw new Error('Failed Authentication')
          } else if (error.message.includes('USER_NOT_FOUND')) {
            throw new Error('USER_NOT_FOUND')
          }
          throw new Error('Failed Authentication')
        })
    } catch (error: any) {
      if (error.message) {
        if (error.message.includes('USER_NOT_FOUND')) {
          toast.error(t('login:errors.noAccountWithThisSocialMedia'))

          navigate('/register?source=google-login')
        }
      } else if (error.statusCode === 401) {
        toast.error(t('login:errors.userNotExist'))
      } else {
        toast.error(t('common:errors.network'))
        setErrorMessages(t('common:errors.network') as string)
      }
    } finally {
      setIsLoadingGoogle(false)
    }
    return null
  }

  const signInWithFacebook = async (): Promise<UserState | null> => {
    setIsLoadingFacebook(true)
    try {
      return await signInWithPopup(firebaseAuth, facebookProvider)
        .then(async (result: UserCredential) => {
          if (result && result.user) {
            const returnResult = {
              providerId: result.providerId,
              email: result.user.email,
              displayName: result.user.displayName,
              photoUrl: result.user.photoURL,
              accessToken:
                FacebookAuthProvider.credentialFromResult(result)?.accessToken,
              idToken: result.user.getIdToken(),
              refreshToken: result.user.refreshToken,
              uid: result.user.uid,
            }
            const res = await socialLogin(await returnResult.idToken)
            if (res) {
              setUserAndPermissions()
            }

            return user
          }
          throw new Error('Failed Authentication')
        })
        .catch(async (error: AuthError) => {
          if (
            error.message.includes('account-exists-with-different-credential')
          ) {
            const credential = FacebookAuthProvider.credentialFromError(error)
            toast.warning(t('login:errors.accountExists'))
            const currentUser = await signInWithGoogle()
            if (currentUser && firebaseAuth.currentUser && credential) {
              await linkWithCredential(firebaseAuth.currentUser, credential)
                .then(() => {
                  toast.success(t('login:register.socialMediaLinked'))
                })
                .catch(() => {
                  toast.warning(t('login:register.socialMediaLinkedError'))
                })

              return currentUser
            }
            throw new Error('Failed Authentication')
          }
          return null
        })
    } catch (error: any) {
      setErrorMessages(error.message)
      if (error.statusCode === 401) {
        toast.error(t('login:errors.userNotExist'))
      } else {
        toast.error(t('common:errors.network'))
        setErrorMessages(t('common:errors.network') as string)
      }
    } finally {
      setIsLoadingFacebook(false)
    }
    return null
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
    isLoadingGoogle,
    isLoadingFacebook,
    isLoading,
    isLogin,
    errorMessages,
    useCreateLoginTokenWithEmail,
    useLoginTokenWithEmail,
    signInWithEmailAndPassword,
    signInWithGoogle,
    signInWithFacebook,
    logout,
  }
}

export default useAuth
