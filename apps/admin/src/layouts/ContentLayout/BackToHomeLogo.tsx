import { ComponentPropsWithoutRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useRecoilValue } from 'recoil'

import flowclassLogoBlack from '@/assets/logos/flowclass.png'
import flowclassLogoWhite from '@/assets/logos/flowclassLogoWhite.png'
import { darkModeState } from '@/stores/darkMode'
import { styled } from '@/styles'

const Icon = styled('img', {
  width: '8rem',
  cursor: 'pointer',
  '@sm': {
    width: '6rem',
  },
})

type PropTypes = ComponentPropsWithoutRef<'img'>

const FlowclassLogo = ({ onClick, ...props }: PropTypes): JSX.Element => {
  const navigate = useNavigate()
  const isDarkMode = useRecoilValue(darkModeState)
  const defaultOnClick = () => {
    navigate('/')
  }

  const thisOnClick = onClick ?? defaultOnClick

  return (
    <Icon
      {...props}
      src={isDarkMode ? flowclassLogoWhite : flowclassLogoBlack}
      onClick={thisOnClick}
      alt="Flowclass Logo"
    />
  )
}

export default FlowclassLogo
