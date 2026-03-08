import { HTMLAttributes, ReactNode, useEffect, useState } from 'react'

import { useMediaQuery } from 'react-responsive'

type DeviceProps = {
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

const BREAKPOINT = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
}

// Tailwind breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

const useResponsive = (): {
  isDesktop: boolean
  isMobileOrTablet: boolean
  isTablet: boolean
  isMobile: boolean
  isSafari: boolean
} => {
  const isDesktop = useMediaQuery({ minWidth: BREAKPOINT.DESKTOP })
  const isMobileOrTablet = useMediaQuery({ maxWidth: BREAKPOINT.DESKTOP })

  const isTablet = useMediaQuery({ minWidth: BREAKPOINT.MOBILE, maxWidth: BREAKPOINT.DESKTOP })
  const isMobile = useMediaQuery({ maxWidth: BREAKPOINT.MOBILE })

  const [isSafari, setIsSafari] = useState<boolean>(false)

  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator?.userAgent))
  }, [])

  return {
    isDesktop,
    isTablet,
    isMobile,
    isSafari,
    isMobileOrTablet,
  }
}

export default useResponsive

//can use in the future
export const getBrowserType = (): string => {
  const userAgent = navigator.userAgent
  let browser = 'unknown'
  if (userAgent.indexOf('IE') != -1) {
    browser = 'IE'
  } else if (userAgent.indexOf('Firefox') != -1) {
    browser = 'Firefox'
  } else if (userAgent.indexOf('OPR') != -1) {
    //Opera
    browser = 'Opera'
  } else if (userAgent.indexOf('Chrome') != -1) {
    browser = 'Chrome'
  } else if (userAgent.indexOf('Safari') != -1) {
    browser = 'Safari'
  } else if (userAgent.indexOf('Trident') != -1) {
    browser = 'IE 11'
  }
  return browser
}

export const Desktop = ({ children, className, ...props }: DeviceProps): JSX.Element | null => {
  return (
    <div className={`${className} hidden lg:inline-flex`} {...props}>
      {children}
    </div>
  )
}

export const NotDesktop = ({ children, className, ...props }: DeviceProps): JSX.Element | null => {
  return (
    <div className={`${className} inline-flex lg:hidden`} {...props}>
      {children}
    </div>
  )
}

export const Tablet = ({ children, className, ...props }: DeviceProps): JSX.Element | null => {
  return (
    <div className={`${className} hidden md:inline-flex lg:hidden`} {...props}>
      {children}
    </div>
  )
}

export const Mobile = ({ children, className, ...props }: DeviceProps): JSX.Element | null => {
  return (
    <div className={`${className} md:hidden`} {...props}>
      {children}
    </div>
  )
}

export const NotMobile = ({ children, className, ...props }: DeviceProps): JSX.Element | null => {
  return (
    <div className={`${className} hidden md:inline-flex`} {...props}>
      {children}
    </div>
  )
}
