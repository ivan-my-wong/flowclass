import { ReactElement, Suspense } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useRecoilState, useRecoilValue } from 'recoil'

import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { Spinner } from '@/components/Loaders/Spinner'
import useAuth from '@/hooks/useAuth'
import useSiteData from '@/hooks/useSiteData'
import NoActiveSubscription from '@/pages/CustomMessages/components/NoActiveSubscription'
import Forbidden from '@/pages/PageNotFound/Forbidden'
import { schoolSubscriptionState } from '@/stores/schoolSubscriptionData'
import { userState } from '@/stores/userData'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import { hasWhatsappAccess } from '@/utils/subscription-plan.utils'

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
  const location = useLocation()
  const { activePlan } = useRecoilValue(schoolSubscriptionState)

  // set up check user role later
  if (!isLogin) {
    return <Navigate to="/login" replace />
  }

  if (siteData.initFetch && siteData?.sites && siteData.sites.length === 0) {
    return <Navigate to="/welcome/set-up" replace />
  }

  // set up check user role later
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

  if (
    location.pathname.startsWith('/custom-messages') ||
    location.pathname.startsWith('/whatsapp-templates')
  ) {
    if (!hasWhatsappAccess(userPermission, currentUser, activePlan)) {
      return <NoActiveSubscription />
    }
  }

  return <Suspense fallback={<FullScreenLoading />}>{element}</Suspense>
}

export default ProtectedRoute
