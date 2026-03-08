import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { StaffUserType } from '@/types/user'

type ProfileContextType = {
  userRoleData: StaffUserType
  setUserRoleData: (userRoleData: StaffUserType) => void
  goToEditProfile: () => void
  goToChangePassword: () => void
  goToDeleteAccount: () => void
  goToProfile: () => void
  goToUserManagement: () => void
}

const ProfileContext = createContext<ProfileContextType | null>(null)
type ProfileProviderProps = {
  children: React.ReactNode
  initialProfile: StaffUserType
}
export const ProfileProvider = ({
  children,
  initialProfile,
}: ProfileProviderProps): JSX.Element => {
  const [userRoleData, setUserRoleData] =
    useState<StaffUserType>(initialProfile)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const goToEditProfile = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.set('userId', String(userRoleData.id))
    params.set('view', 'edit')
    setSearchParams(params)
  }, [userRoleData, searchParams, setSearchParams])
  const goToChangePassword = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.set('userId', String(userRoleData.id))
    params.set('view', 'change-password')
    setSearchParams(params)
  }, [userRoleData, searchParams, setSearchParams])

  const goToDeleteAccount = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.set('userId', String(userRoleData.id))
    params.set('view', 'delete')
    setSearchParams(params)
  }, [userRoleData, searchParams, setSearchParams])

  const goToProfile = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.set('userId', String(userRoleData.id))
    params.set('view', 'profile')
    setSearchParams(params)
  }, [userRoleData, searchParams, setSearchParams])
  const goToUserManagement = () => {
    navigate('/settings/users')
  }
  useEffect(() => {
    if (!initialProfile) {
      navigate('/settings/users')
    }
  }, [])
  return (
    <ProfileContext.Provider
      value={{
        userRoleData,
        setUserRoleData,
        goToEditProfile,
        goToChangePassword,
        goToDeleteAccount,
        goToProfile,
        goToUserManagement,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
export default ProfileContext
