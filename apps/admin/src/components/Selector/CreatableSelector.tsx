import React, { ComponentProps } from 'react'

import { useTranslation } from 'react-i18next'
import { StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { theme } from '../../styles'

const selectCustomStyles = (width: string): StylesConfig => ({
  option: styles => {
    return {
      ...styles,
      backgroundColor: theme.colors.background.toString(),
      color: theme.colors.text.toString(),
    }
  },
  control: styles => ({
    ...styles,
    backgroundColor: theme.colors.background.toString(),
    color: theme.colors.text.toString(),
    borderColor: theme.colors.borderColor.toString(),
  }),
  singleValue: styles => ({
    ...styles,
    padding: '0.25rem',
    color: theme.colors.text.toString(),
  }),
  input: styles => ({
    ...styles,
    color: theme.colors.text.toString(),
  }),
  container: styles => ({
    ...styles,
    width,
  }),
  menuList: styles => ({
    ...styles,
    padding: 0,
  }),
  multiValue: styles => ({
    ...styles,
    // width: '100%',
    backgroundColor: theme.colors.backgroundLayer3.toString(),
    color: theme.colors.text.toString(),
  }),
  multiValueLabel: styles => ({
    ...styles,
    width: '100%',
  }),
  multiValueRemove: styles => ({
    ...styles,
    ':hover': {
      backgroundColor: theme.colors.primaryHighlight.toString(),
    },
  }),
})

const CreatableSelector: React.FC<
  ComponentProps<
    typeof CreatableSelect & {
      placeholder?: string
    }
  >
> = ({ ...props }) => {
  const { t } = useTranslation()

  return (
    <CreatableSelect
      // isClearable
      // isDisabled={isLoading}
      // isLoading={isLoading}
      placeholder={
        props.placeholder ?? t('teachingService:tag.createMultipleValues')
      }
      styles={selectCustomStyles('100%')}
      {...props}
    />
  )
}

export default CreatableSelector
