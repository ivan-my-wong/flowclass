import { ReactNode, useEffect, useState } from 'react'

import { useMediaQuery } from 'react-responsive'

type DeviceProps = {
  children: ReactNode
}

export const useResponsive = () => {
  const isDesktop = useMediaQuery({ minWidth: 1025 })
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1112 })
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const isSmallMobile = useMediaQuery({ maxWidth: 576 })
  const [isSafari, setIsSafari] = useState<boolean>(false)

  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator?.userAgent))
  }, [])

  return {
    isDesktop,
    isTablet,
    isMobile,
    isSmallMobile,
    isSafari,
  }
}

export const Desktop = ({ children }: DeviceProps): JSX.Element | null => {
  const isDesktop = useMediaQuery({ minWidth: 1112 })
  return isDesktop ? <>{children}</> : null
}

export const Tablet = ({ children }: DeviceProps): JSX.Element | null => {
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1112 })
  return isTablet ? <>{children}</> : null
}

export const Mobile = ({ children }: DeviceProps): JSX.Element | null => {
  const isMobile = useMediaQuery({ maxWidth: 768 })
  return isMobile ? <>{children}</> : null
}

export const NotMobile = ({ children }: DeviceProps): JSX.Element | null => {
  const isMobile = useMediaQuery({ minWidth: 768 })
  return isMobile ? <>{children}</> : null
}

export const Default = ({ children }: DeviceProps): JSX.Element | null => {
  const isNotMobile = useMediaQuery({ minWidth: 768 })
  return isNotMobile ? <>{children}</> : null
}
