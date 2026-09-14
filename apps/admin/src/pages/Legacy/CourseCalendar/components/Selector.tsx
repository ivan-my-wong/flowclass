import React from 'react'

import Select, { StylesConfig } from 'react-select'

import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import { styled, theme } from '@/styles'

export type SelectorProps = {
  options: SimpleSelectorItemProps[]
  onChange: (e: any) => void
  width: string
  label: string
  selectOption?: SimpleSelectorItemProps
}

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
})

const Wrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  color: '$text',
})

const Selector: React.FC<SelectorProps> = ({
  options,
  selectOption,
  label,
  onChange,
  width,
}) => {
  // const { t } = useTranslation()

  return (
    <Select
      value={[selectOption]}
      placeholder={label}
      options={options}
      formatOptionLabel={(data: any) => (
        <Wrapper className="country-option">
          <span style={{ padding: '$4' }}>{data.label}</span>
        </Wrapper>
      )}
      styles={selectCustomStyles(width)}
      onChange={onChange}
    />
  )
}

export default Selector
