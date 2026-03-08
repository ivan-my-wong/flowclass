import { ReactElement } from 'react'

import { useRecoilState } from 'recoil'

import useAuth from '@/hooks/useAuth'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'

interface IProtectedComponentProps {
  roleAllowed?: UserRole[]
  fallback?: ReactElement
  children: ReactElement
}

const ProtectedComponent: React.FC<IProtectedComponentProps> = ({
  roleAllowed,
  children,
  fallback,
}) => {
  const { isLogin } = useAuth()

  const [userPermission] = useRecoilState(userPermissionState)

  // set up check user role later
  if (
    (isLogin && roleAllowed?.includes(userPermission)) ||
    userPermission === UserRole.MasterAdmin
  ) {
    return children
  }
  return fallback ?? <></>
}

export default ProtectedComponent
