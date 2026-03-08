import React from 'react'

import { useTranslation } from 'react-i18next'
import Select, { StylesConfig } from 'react-select'

import { OptionType } from '@/types/options'

import ImageAspect from '../Images/ImageAspect'

import { DynamicTypeSelectorItemProps } from './Select'
import { SelectorProps } from './TextSearchMultiSelector'

export type CourseSelectorItem = DynamicTypeSelectorItemProps<string> & {
  secondaryValue?: string
  image?: string
  icon?: JSX.Element
  classes?: OptionType[]
}

export type CourseSelectorProps = {
  options: CourseSelectorItem[]
  selectOption: CourseSelectorItem
  onChange: (e: any) => void
  isDisabled?: boolean
  width: string
}

const selectCustomStyles = (
  width?: string,

  autoHeight?: boolean
): StylesConfig => ({
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
  menu: styles => ({
    ...styles,
    // ...(!autoHeight && { height: '18rem' }),
  }),
  container: styles => ({
    ...styles,
    width,
    // ...(!autoHeight && { height: '6rem' }),
  }),
  menuList: styles => ({
    ...styles,
    padding: '1rem 0',
    // ...(!autoHeight && { height: '18rem' }),
  }),
})

const CourseSelector: React.FC<
  SelectorProps & {
    autoHeight?: boolean
  }
> = ({ options, selectOption, onChange, width, autoHeight = false }) => {
  const { t } = useTranslation()

  return (
    <Select
      defaultValue={[selectOption]}
      placeholder={t('component:select.selectCourse')}
      options={options}
      formatOptionLabel={data => (
        <div className="flex items-center justify-between w-full h-full text-text">
          {data.image && (
            <ImageAspect
              s3="public"
              ratio={1}
              width="20%"
              src={data.image}
              alt="Logo image"
            />
          )}

          <span>{data.label}</span>

          {data.icon && <span className="mx-2">{data.icon}</span>}
        </div>
      )}
      styles={selectCustomStyles(width, autoHeight)}
      onChange={onChange}
    />
  )
}

export default CourseSelector
