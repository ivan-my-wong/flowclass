import React from 'react'

import { useTranslation } from 'react-i18next'
import Select, { StylesConfig } from 'react-select'
import { SocialIcon } from 'react-social-icons'

import { useResponsive } from '@/hooks/useResponsive'

import Box from '../ui/Box'

import { SimpleSelectorItemProps } from './Select'

export type SocialMediaSelectorProps = {
  options: SimpleSelectorItemProps[]
  selectOption: SimpleSelectorItemProps
  onChange: (e: SimpleSelectorItemProps) => void
}

const selectCustomStyles = (width?: string): StylesConfig => ({
  option: styles => ({
    ...styles,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  }),
  control: styles => ({
    ...styles,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  }),
  singleValue: styles => ({
    ...styles,
    color: 'var(--color-text)',
  }),
  input: styles => ({
    ...styles,
    color: 'var(--color-text)',
  }),
  menu: styles => ({
    ...styles,
    // ...(!autoHeight && { height: '18rem' }),
  }),
  container: styles => ({
    ...styles,
    width,
    // ...(!autoHeight && { height: '6rem' }),
  }),
  menuList: styles => ({
    ...styles,
    // ...(!autoHeight && { height: '18rem' }),
  }),
})

const SocialMediaSelector: React.FC<SocialMediaSelectorProps> = ({
  options,
  selectOption,

  onChange,
}) => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useResponsive()

  return (
    <Select
      defaultValue={[selectOption]}
      placeholder={t('component:select.selectSocialMedia')}
      options={options}
      formatOptionLabel={(data: any) => (
        <Box>
          <div>
            <SocialIcon
              network={data.value}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          <Box>
            <span>{data.label}</span>
          </Box>
        </Box>
      )}
      styles={selectCustomStyles(!isMobile && !isTablet ? '50%' : '100%')}
      onChange={(newValue: any) => {
        onChange(newValue as SimpleSelectorItemProps)
      }}
    />
  )
}

export default SocialMediaSelector
