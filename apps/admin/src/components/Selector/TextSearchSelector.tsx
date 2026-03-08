import React from 'react'

import Select, { StylesConfig } from 'react-select'

export type CountrySelectorProps = {
  options: any[]
  selectOption: any
  onChange: (e: any) => void
  width: string
}

const TextSearchSelector: React.FC<CountrySelectorProps> = ({
  options,
  selectOption,
  onChange,
  width,
}) => {
  const selectCustomStyles: StylesConfig = {
    option: styles => ({
      ...styles,
      margin: '0.5rem 0',
      color: 'var(--color-text)',
      backgroundColor: 'var(--color-background)',
      '&:hover': {
        backgroundColor: 'var(--color-background-layer-2)',
      },
      '&:active': {
        backgroundColor: 'var(--color-background-layer-3)',
      },
    }),
    control: styles => ({
      ...styles,
      backgroundColor: 'var(--color-background)',
      border: '1px solid var(--color-border)',
      minHeight: '3rem',
      color: 'var(--color-text)',
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
    }),
  }
  return (
    <Select
      options={options}
      styles={selectCustomStyles}
      value={selectOption}
      onChange={onChange}
    />
  )
}

export default TextSearchSelector
