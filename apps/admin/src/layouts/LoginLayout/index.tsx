import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { motion } from 'framer-motion'
import { useRecoilValue } from 'recoil'

import { hasUsers } from '@/api/auth'
import useAuth from '@/hooks/useAuth'
import { userState } from '@/stores/userData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'

interface LoginLayoutProps {
  children: React.ReactNode
}

const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  const { isLogin, useLoginTokenWithEmail, logout } = useAuth()
  const location = useLocation()
  const { mutateAsync } = useLoginTokenWithEmail()
  const userPermission = useRecoilValue(userPermissionState)
  const currentUser = useRecoilValue(userState)
  const [hasUsersCheckDone, setHasUsersCheckDone] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const checkHasUsers = async () => {
      try {
        const usersExist = await hasUsers()
        if (!usersExist) {
          navigate('/register', { replace: true })
        }
      } catch {
        // On API error, allow login (e.g. API not reachable)
      } finally {
        setHasUsersCheckDone(true)
      }
    }
    checkHasUsers()
  }, [navigate])

  useEffect(() => {
    if (!isLogin || !currentUser) {
      return
    }

    if (userPermission === UserRole.MasterAdmin) {
      navigate('/site', { replace: true })
    } else if (
      userPermission === UserRole.SiteAdmin ||
      userPermission === UserRole.SchoolAdmin ||
      userPermission === UserRole.Guest
    ) {
      navigate('/home', { replace: true })
    } else {
      navigate(
        `/settings/users/profile?userId=${currentUser.id}&view=profile`,
        {
          replace: true,
        }
      )
    }
  }, [userPermission, isLogin, currentUser, navigate])

  const urlParams = new URLSearchParams(location.search)
  const token = urlParams.get('token')

  const loginWithToken = async () => {
    if (token) {
      await logout()
      mutateAsync(token)
    }
  }

  useEffect(() => {
    loginWithToken()
  }, [])

  if (isLogin) {
    return <Navigate to="/home" replace />
  }

  if (!hasUsersCheckDone) {
    return (
      <div className="flex md:flex-row flex-col-reverse md:h-dvh overflow-hidden items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex md:h-dvh overflow-hidden items-center justify-center bg-white">
      <motion.div
        className="w-full max-w-md p-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default LoginLayout
