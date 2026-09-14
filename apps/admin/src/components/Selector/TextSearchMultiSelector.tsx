import React from 'react'

import { useTranslation } from 'react-i18next'
import Select, { StylesConfig } from 'react-select'

import { styled, theme } from '../../styles'

export type SelectorProps = {
  options: any[]
  selectOption: any
  onChange: (e: any) => void
  width?: string
}

export const selectCustomStyles = (width?: string): StylesConfig => ({
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

const Wrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  color: '$text',
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
      formatOptionLabel={data => (
        <Wrapper className="country-option">
          <img
            src={data.image}
            alt="country"
            style={{ width: '60px', height: '60px' }}
          />
          <span style={{ padding: '0px 50px' }}>{data.label}</span>

          <span style={{ paddingRight: '10px' }}>{data.icon}</span>
        </Wrapper>
      )}
      styles={selectCustomStyles(width)}
      onChange={onChange}
    />
  )
}

export default TextSearchMultiSelector
