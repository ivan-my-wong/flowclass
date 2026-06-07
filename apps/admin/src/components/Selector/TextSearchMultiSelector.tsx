import React from 'react'

import { useTranslation } from 'react-i18next'
import Select, { StylesConfig } from 'react-select'

export type SelectorProps = {
  options: any[]
  selectOption: any
  onChange: (e: any) => void
  width?: string
}

export const selectCustomStyles = (width?: string): StylesConfig => ({
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

const TextSearchMultiSelector: React.FC<SelectorProps> = ({
  options,
  selectOption,
  onChange,
  width,
}) => {
  const { t } = useTranslation()

  return (
    <Select
      closeMenuOnSelect={false}
      defaultValue={[selectOption]}
      placeholder={t('promotion:select')}
      isMulti
      options={options}
      formatOptionLabel={(data, formatMeta) => {
        if (formatMeta?.context === 'value') return String(data.label ?? '')
        return (
          <div className="flex items-center justify-between w-full h-full text-text">
            <img
              src={data.image}
              alt="country"
              style={{ width: '60px', height: '60px' }}
            />
            <span style={{ padding: '0px 50px' }}>{data.label}</span>

            <span style={{ paddingRight: '10px' }}>{data.icon}</span>
          </div>
        )
      }}
      styles={selectCustomStyles(width)}
      onChange={onChange}
    />
  )
}

export default TextSearchMultiSelector
