import React, { ComponentProps } from 'react'

import { useTranslation } from 'react-i18next'
import { StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'

const selectCustomStyles = (width: string): StylesConfig => ({
  option: styles => ({
    ...styles,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  }),
  control: styles => ({
    ...styles,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)',
  }),
  singleValue: styles => ({
    ...styles,
    padding: '0.25rem',
    color: 'var(--color-text)',
  }),
  input: styles => ({
    ...styles,
    color: 'var(--color-text)',
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
    backgroundColor: 'var(--color-background-layer-3)',
    color: 'var(--color-text)',
  }),
  multiValueLabel: styles => ({
    ...styles,
    width: '100%',
  }),
  multiValueRemove: styles => ({
    ...styles,
    ':hover': {
      backgroundColor: 'var(--color-primary-highlight)',
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
