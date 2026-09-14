import React from 'react'

import Select, { StylesConfig } from 'react-select'

import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import { styled, theme } from '@/styles'

export type StudentSelectorItem = SimpleSelectorItemProps & {
  name: string
}

export type StudentSelectorProps = {
  options: StudentSelectorItem[]
  onChange: (e: any) => void
  width: string
  onInputChange?: (value: string) => void
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

const StudentSelector: React.FC<StudentSelectorProps> = ({
  options,
  onInputChange,
  onChange,
  width,
}) => {
  // const { t } = useTranslation()

  return (
    <Select
      defaultValue={[]}
      placeholder="Select Student"
      options={options}
      isMulti
      formatOptionLabel={(data: any) => (
        <Wrapper className="country-option">
          <span style={{ padding: '$4' }}>{data.label}</span>
        </Wrapper>
      )}
      styles={selectCustomStyles(width)}
      onChange={onChange}
      onInputChange={onInputChange}
    />
  )
}

export default StudentSelector
