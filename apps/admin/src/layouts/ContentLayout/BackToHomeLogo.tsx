import { ComponentPropsWithoutRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useRecoilValue } from 'recoil'

import flowclassLogoBlack from '@/assets/logos/flowclass.png'
import flowclassLogoWhite from '@/assets/logos/flowclassLogoWhite.png'
import { darkModeState } from '@/stores/darkMode'
import { cn } from '@/utils/cn'

type PropTypes = ComponentPropsWithoutRef<'img'>

const FlowclassLogo = ({
  onClick,
  className,
  ...props
}: PropTypes): JSX.Element => {
  const navigate = useNavigate()
  const isDarkMode = useRecoilValue(darkModeState)
  const defaultOnClick = () => {
    navigate('/')
  }

  const thisOnClick = onClick ?? defaultOnClick

  return (
    <img
      className={cn('w-32 cursor-pointer md:w-24', className)}
      src={isDarkMode ? flowclassLogoWhite : flowclassLogoBlack}
      onClick={thisOnClick}
      alt="Flowclass Logo"
      {...props}
    />
  )
}

export default FlowclassLogo
