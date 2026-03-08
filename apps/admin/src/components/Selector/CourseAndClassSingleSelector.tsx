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

const CourseAndClassSingleSelector: React.FC<CourseSelectorItemProps> = ({
  options,
  defaultValue = [],
  value,
  isDisabled = false,
  onChange,
  width,
  isMulti,
  isLoading = false,
  ...props
}) => {
  const { t } = useTranslation()

  // Use value prop if provided, otherwise fall back to defaultValue
  const currentValue = value || defaultValue

  return (
    <Select
      value={currentValue}
      placeholder={
        isLoading
          ? t('student:teachingService.loadingCourses')
          : t('component:select.selectCourse')
      }
      options={options}
      isDisabled={isDisabled || isLoading}
      isLoading={isLoading}
      isMulti={isMulti !== undefined ? (isMulti as any) : true}
      formatOptionLabel={(data: OptionProps) => (
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
      )}
      styles={selectCustomStyles(width)}
      onChange={(newValue: any) => onChange(newValue)}
      {...props}
    />
  )
}

export default CourseAndClassSingleSelector
