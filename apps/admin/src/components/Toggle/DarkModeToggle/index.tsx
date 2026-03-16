import { ComponentProps } from 'react'

import { useTranslation } from 'react-i18next'
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import { useRecoilState } from 'recoil'

import { cn } from '@/utils/cn'

import { darkModeState } from '../../../stores/darkMode'
import IconButton from '../../Buttons/IconButton'
import Text from '../../Texts/Text'

const DarkModeToggle = ({
  iconOnly = false,
  iconSize = 'medium',
  className,
  ...props
}: {
  iconOnly?: boolean
  iconSize?: 'small' | 'medium'
} & ComponentProps<'div'>) => {
  const { t } = useTranslation()
  const [isDarkMode, setDarkMode] = useRecoilState(darkModeState)

  const toggleDarkMode = () => {
    setDarkMode(val => !val)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex items-center justify-center gap-4 cursor-pointer select-none',
        className
      )}
      onClick={toggleDarkMode}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleDarkMode()
        }
      }}
      {...props}
    >
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
    </div>
  )
}

export default DarkModeToggle
