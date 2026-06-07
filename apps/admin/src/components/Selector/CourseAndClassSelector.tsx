import React from 'react'

import { useTranslation } from 'react-i18next'
import Select, { StylesConfig } from 'react-select'

import {
  CourseSelectorItemProps,
  OptionProps,
} from '@/types/courseSelector.type'
import { getCourseIcon } from '@/utils/options'

const selectCustomStyles = (
  width: string
): StylesConfig<OptionProps, true> => ({
  option: styles => ({
    ...styles,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  }),
  control: styles => ({
    ...styles,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-text-subtle)',
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

const CourseAndClassSelector: React.FC<CourseSelectorItemProps> = ({
  options,
  defaultValue = [],
  value,
  isDisabled = false,
  onChange,
  width,
  hideSelectAll = false,
  isMulti,
  placeholder,
  ...props
}) => {
  const { t } = useTranslation()

  // Use value prop if provided, otherwise fall back to defaultValue
  const currentValue = value || defaultValue

  const formatGroupLabel = (data: any) => {
    const handleSelectAll = (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      // Get all class options under this group (excluding the "All Classes" option)
      const classOptions = data.options.filter(
        (option: OptionProps) => !option.label.includes('All Classes of')
      )

      // Get current selected values
      const currentSelected = currentValue || []
      const currentSelectedValues = currentSelected.map(
        (item: OptionProps) => item.value
      )

      // Check if all classes in this group are already selected
      const isAllClassesSelected = classOptions.every((option: OptionProps) =>
        currentSelectedValues.includes(option.value)
      )

      let newSelected: OptionProps[]

      if (isAllClassesSelected) {
        // If all are selected, deselect all classes in this group
        newSelected = currentSelected.filter(
          (item: OptionProps) =>
            !classOptions.some(
              (classOption: OptionProps) => classOption.value === item.value
            )
        )
      } else {
        // If not all are selected, select all classes in this group
        newSelected = [...currentSelected, ...classOptions]
      }

      onChange(newSelected)
    }

    const classOptions = data.options.filter(
      (option: OptionProps) => !option.label.includes('All Classes of')
    )
    const currentSelected = currentValue || []
    const currentSelectedValues = currentSelected.map(
      (item: OptionProps) => item.value
    )
    const selectedInGroup = classOptions.filter((option: OptionProps) =>
      currentSelectedValues.includes(option.value)
    ).length
    const isAllSelected =
      selectedInGroup === classOptions.length && classOptions.length > 0

    return (
      <div className="flex items-center justify-between w-full py-1">
        <span className="font-medium text-sm">{data.label}</span>
        {classOptions.length > 0 && !hideSelectAll && (
          <button
            type="button"
            onClick={handleSelectAll}
            className={`cursor-pointer text-xs transition-colors bg-transparent border-none p-0 ${
              isAllSelected
                ? 'text-red-600 hover:text-red-800'
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            {isAllSelected
              ? t('component:select.deselectAll')
              : `${t('component:select.selectAll')} (${classOptions.length})`}
          </button>
        )}
      </div>
    )
  }

  return (
    <Select
      value={currentValue}
      placeholder={placeholder || t('component:select.selectCourse')}
      options={options}
      isDisabled={isDisabled}
      isMulti={isMulti !== undefined ? (isMulti as any) : true}
      closeMenuOnSelect={false}
      formatGroupLabel={formatGroupLabel}
      getOptionLabel={(data: OptionProps) => data.label}
      getOptionValue={(data: OptionProps) => String(data.value)}
      formatOptionLabel={(data: OptionProps, { context }) => {
        // In 'value' context (selected multi-value chip) return a plain string
        // so react-select's MultiValueRemove aria-label resolves to
        // "Remove <label>" instead of "Remove [object Object]".
        if (context === 'value') return data.label
        return (
          <div className="flex items-center justify-between w-full h-full text-text">
            <div className="flex items-center gap-2">
              {data.type && (
                <div className="flex items-center">
                  {getCourseIcon(data.type)}
                </div>
              )}
              <span className="p-1">{data.label}</span>
            </div>
          </div>
        )
      }}
      styles={selectCustomStyles(width)}
      onChange={(newValue: any) => onChange(newValue)}
      {...props}
    />
  )
}

export default CourseAndClassSelector
