import { ReactElement, Suspense } from 'react'
import { Navigate } from 'react-router-dom'

import { useRecoilState, useRecoilValue } from 'recoil'

import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { Spinner } from '@/components/Loaders/Spinner'
import useAuth from '@/hooks/useAuth'
import useSiteData from '@/hooks/useSiteData'
import Forbidden from '@/pages/PageNotFound/Forbidden'
import { userState } from '@/stores/userData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'

interface IProtectedRouteProps {
  roleAllowed?: UserRole[]
  element: ReactElement
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  element,
  roleAllowed,
}) => {
  const { isLogin } = useAuth()
  const { siteData } = useSiteData()
  const [userPermission] = useRecoilState(userPermissionState)
  const currentUser = useRecoilValue(userState)

  if (!isLogin) {
    return <Navigate to="/login" replace />
  }

  if (siteData.initFetch && siteData?.sites && siteData.sites.length === 0) {
    return <Navigate to="/welcome/set-up" replace />
  }

  if (
    isLogin &&
    roleAllowed &&
    !roleAllowed?.includes(userPermission) &&
    userPermission !== UserRole.MasterAdmin
  ) {
    if (userPermission === UserRole.Instructor) {
      return (
        <Navigate
          to={`/settings/users/profile?userId=${currentUser.id}&view=profile`}
          replace
        />
      )
    }
    if (userPermission === UserRole.Guest) {
      return <Spinner />
    }

    return <Forbidden />
  }

  return <Suspense fallback={<FullScreenLoading />}>{element}</Suspense>
}

export default ProtectedRoute
