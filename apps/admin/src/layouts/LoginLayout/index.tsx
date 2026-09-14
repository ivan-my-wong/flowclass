import React, { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { motion } from 'framer-motion'
import { useRecoilValue } from 'recoil'

import LeftLoginScreen from '@/components/Animations/LeftLoginScreen'
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

  const navigate = useNavigate()

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
  }, [userPermission, isLogin, currentUser])

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

  return (
    <div className="flex md:flex-row flex-col-reverse md:h-dvh overflow-hidden">
      {/* Left side with floating phone image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="md:w-1/2 w-full h-full flex items-center justify-center bg-white"
      >
        <LeftLoginScreen />
      </motion.div>

      {/* Right side with auth form */}
      <motion.div
        className="md:p-0 p-8 md:w-1/2 w-full h-full flex items-center justify-center bg-white"
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full h-full flex items-center justify-center"
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginLayout
