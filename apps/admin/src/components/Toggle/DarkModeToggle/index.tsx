import { ComponentProps } from 'react'

import { styled } from '@stitches/react'
import { useTranslation } from 'react-i18next'
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import { useRecoilState } from 'recoil'

import { darkModeState } from '../../../stores/darkMode'
import IconButton from '../../Buttons/IconButton'
import Text from '../../Texts/Text'

const DarkModeToggleWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$4',
  cursor: 'pointer',
  userSelect: 'none',
})

const DarkModeToggle = ({
  iconOnly = false,
  iconSize = 'medium',
  ...props
}: {
  iconOnly?: boolean
  iconSize?: 'small' | 'medium'
} & ComponentProps<typeof DarkModeToggleWrapper>) => {
  const { t } = useTranslation()
  const [isDarkMode, setDarkMode] = useRecoilState(darkModeState)

  const toggleDarkMode = () => {
    setDarkMode(val => !val)
  }

  return (
    <DarkModeToggleWrapper onClick={toggleDarkMode} {...props}>
      <IconButton
        icon={isDarkMode ? <MdLightMode /> : <MdDarkMode />}
        size={iconSize}
        title="Change color theme"
      />
      <Text>
        {!iconOnly &&
          (isDarkMode
            ? t(`component:darkModeToggle.lightMode`)
            : t(`component:darkModeToggle.darkMode`))}
      </Text>
    </DarkModeToggleWrapper>
  )
}

export default DarkModeToggle
