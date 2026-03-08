import React from 'react'

import useTranslation from 'next-translate/useTranslation'
import Select, { StylesConfig } from 'react-select'

export interface TagOption {
  value: string
  label: string
  category: string
  isSelected?: boolean
}

export interface GroupedOption {
  label: string
  options: TagOption[]
  isEnabled: boolean
}

const colourStyles: StylesConfig<TagOption, true, GroupedOption> = {
  control: styles => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isDisabled ? 'gray' : 'white', // Set to appropriate color values
      color: isDisabled ? 'red' : 'black', // Set to appropriate color values
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: 'white', // Set to appropriate color values
      },
      width: '100%',
    }
  },
  multiValue: (styles, { data }) => {
    return {
      ...styles,
    }
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    width: '100%',
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    ':hover': {
      color: 'white',
    },
  }),
}

type MultiGroupedSelectProps = {
  groupedOptions: GroupedOption[]
  selectedTagOptions?: TagOption[]
  onChange: (e: any) => void
}

const MultiGroupedSelect = ({
  groupedOptions,
  selectedTagOptions,
  onChange,
}: MultiGroupedSelectProps): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Select<TagOption, true, GroupedOption>
      id={`multi-grouped-select-${groupedOptions[0]?.label}`}
      closeMenuOnSelect={false}
      placeholder={t('course:searchByKeywords')}
      // defaultValue={[colourOptions[0], colourOptions[1]]}
      value={selectedTagOptions}
      isMulti
      options={groupedOptions}
      styles={colourStyles}
      onChange={onChange}
      noOptionsMessage={() => t('course:selectorNoOptions')}
      className="w-full"
    />
  )
}

export default MultiGroupedSelect
