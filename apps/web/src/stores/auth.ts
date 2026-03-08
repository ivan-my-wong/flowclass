import { useEffect, useMemo } from 'react'

import { atom, useRecoilState } from 'recoil'

import { jwtDecode } from 'jwt-decode'

import { AtomKey } from '@/constants/atomKey'
import { LocalStorageKeys } from '@/constants/localStorageKeys'
import { useDoRefreshToken } from '@/hooks/useProfile'
import { AuthState } from '@/types/profile'

import { persistLocalStorage } from './effect'
import { useSsrComplected } from './ssrCompleted'

const defaultState: AuthState = {
  firstName: '',
  email: '',
  phone: '',
  accessToken: '',
  refreshToken: '',
  institutionId: 0,
}

const authState = atom<AuthState>({
  key: AtomKey.auth,
  default: defaultState,
  effects: [persistLocalStorage],
})

export const useAuth = () => {
  const isInitialized = useSsrComplected()
  const [auth, setAuth] = useRecoilState(authState)

  const { mutate: doRefreshToken } = useDoRefreshToken(data => {
    if (data.accessToken) {
      localStorage.setItem(LocalStorageKeys.UserAccessToken, data.accessToken)

      setAuth(prev => ({ ...prev, accessToken: data.accessToken }))
    }
  })
  const refreshToken = useMemo(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(LocalStorageKeys.UserRefreshToken)
  }, [])
  const accessToken = useMemo(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(LocalStorageKeys.UserAccessToken)
  }, [])

  const checkExpiration = (token: string) => {
    const decoded = jwtDecode(token)
    const now = new Date()
    return decoded.exp && decoded.exp * 1000 > now.getTime()
  }

  const isTokenValid = useMemo(() => {
    if (!accessToken) return false
    return checkExpiration(accessToken)
  }, [accessToken])

  const isRefreshTokenValid = useMemo(() => {
    if (!refreshToken) return false
    return checkExpiration(refreshToken)
  }, [refreshToken])

  useEffect(() => {
    if (!isTokenValid && !isRefreshTokenValid) {
      localStorage.removeItem(LocalStorageKeys.UserAccessToken)
      localStorage.removeItem(LocalStorageKeys.UserRefreshToken)

      setAuth(defaultState)
    } else if (!isTokenValid && isRefreshTokenValid && refreshToken) {
      doRefreshToken({ refreshToken })
    }
  }, [isTokenValid, isRefreshTokenValid, refreshToken, doRefreshToken, setAuth])

  const updateAuth = (value: AuthState) => {
    setAuth(value)
    localStorage.setItem(LocalStorageKeys.UserAccessToken, value.accessToken)
    localStorage.setItem(LocalStorageKeys.UserRefreshToken, value.refreshToken)
    sessionStorage.setItem(
      'custom-form',
      JSON.stringify({
        applicant: [
          {
            Name: value.firstName,
            Email: value.email,
            Phone: value.phone,
          },
        ],
      })
    )
  }

  return {
    auth: isInitialized ? auth : defaultState,
    setAuth: updateAuth,
    clearAuth: () => {
      updateAuth(defaultState)
    },
  }
}
