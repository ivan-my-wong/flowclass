import React from 'react'

import Select, { StylesConfig } from 'react-select'

import { SimpleSelectorItemProps } from '@/components/Selector/Select'

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
      formatOptionLabel={(data: any, formatMeta) => {
        if (formatMeta?.context === 'value') return String(data.label ?? '')
        return (
          <div className="flex items-center justify-between w-full h-full text-text country-option">
            <span className="p-4">{data.label}</span>
          </div>
        )
      }}
      styles={selectCustomStyles(width)}
      onChange={onChange}
      onInputChange={onInputChange}
    />
  )
}

export default StudentSelector
