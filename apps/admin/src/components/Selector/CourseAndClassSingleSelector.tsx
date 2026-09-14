import React from 'react'

import { useTranslation } from 'react-i18next'
import Select, { StylesConfig } from 'react-select'

import { styled, theme } from '@/styles'
import {
  CourseSelectorItemProps,
  OptionProps,
} from '@/types/courseSelector.type'
import { getCourseIcon } from '@/utils/options'

const selectCustomStyles = (
  width: string
): StylesConfig<OptionProps, true> => ({
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
    borderColor: theme.colors.textSubtle.toString(),
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
        <Wrapper className="country-option">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {data.type && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getCourseIcon(data.type)}
              </div>
            )}
            <span style={{ padding: '$4' }}>{data.label}</span>
          </div>
        </Wrapper>
      )}
      styles={selectCustomStyles(width)}
      onChange={(newValue: any) => onChange(newValue)}
      {...props}
    />
  )
}

export default CourseAndClassSingleSelector
