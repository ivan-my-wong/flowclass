import React from 'react'

import Select, { StylesConfig } from 'react-select'

import { theme } from '@/styles'

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
    option: styles => {
      return {
        ...styles,
        margin: '0.5rem 0',
        color: theme.colors.text.toString(),
        backgroundColor: theme.colors.background.toString(),
        '&:hover': {
          backgroundColor: theme.colors.backgroundLayer2.toString(),
        },
        '&:active': {
          backgroundColor: theme.colors.backgroundLayer3.toString(),
        },
      }
    },
    control: styles => ({
      ...styles,
      backgroundColor: theme.colors.background.toString(),
      border: `1px solid ${theme.colors.borderColor.toString()}`,
      minHeight: '3rem',
      color: theme.colors.text.toString(),
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
