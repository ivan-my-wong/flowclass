import React from 'react'

import { useTranslation } from 'react-i18next'
import Select, { StylesConfig } from 'react-select'

import { OptionType } from '@/types/options'

import { styled, theme } from '../../styles'
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
    // ...(!autoHeight && { height: '6rem' }),
  }),
  singleValue: styles => ({
    ...styles,
    padding: '0.25rem',
    color: theme.colors.text.toString(),
    // ...(!autoHeight && { height: '6rem' }),
  }),
  input: styles => ({
    ...styles,
    color: theme.colors.text.toString(),
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

const Wrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  color: '$text',
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
        <Wrapper>
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

          {data.icon && <span style={{ margin: '0 0.5rem' }}>{data.icon}</span>}
        </Wrapper>
      )}
      styles={selectCustomStyles(width, autoHeight)}
      onChange={onChange}
    />
  )
}

export default CourseSelector
