import React from 'react'

import { IoMdClose } from 'react-icons/io'
import Select, {
  components,
  CSSObjectWithLabel,
  GroupBase,
  MenuListProps,
  SelectInstance,
  StylesConfig,
  ValueContainerProps,
} from 'react-select'
import { atom } from 'recoil'

import { styled, theme } from '../../styles'
import Button from '../Buttons/Button'
import ImageAspect from '../Images/ImageAspect'
import Text from '../Texts/Text'

import { SelectItemValuesProps } from './Select'
import value = atom.value
import { DataTestId } from '@/types/common'

export type ClassSelectorProps = {
  options: SelectItemValuesProps[]
  selectOption?: SelectItemValuesProps[]
  onChange: (e: any) => void
  width?: string
  isDisabled?: boolean
  placeHolder: string
  selectStyles?: CustomStylesConfig
  isMulti?: boolean
  isSearchable?: boolean
  id?: string
  inputId?: string
} & DataTestId

type CustomStylesConfig = StylesConfig & {
  [key: string]: any // Allow string indexing
}
export type LabelSelectorRef = SelectInstance<SelectItemValuesProps, true>

export const selectCustomStyles = (width: string): CustomStylesConfig => ({
  option: styles => ({
    ...styles,
    backgroundColor: theme.colors.background.toString(),
    color: theme.colors.text.toString(),
    ':hover': {
      backgroundColor: theme.colors.primaryHighlightSubtle.toString(),
    },
  }),
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
    backgroundColor: theme.colors.backgroundLayer2.toString(),
  }),
  multiValue: styles => ({
    ...styles,
    width: 'fit-content',
    backgroundColor: theme.colors.backgroundLayer3.toString(),
    color: theme.colors.text.toString(),
    borderRadius: theme.sizes[2].toString(),
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
  valueContainer: styles => ({
    ...styles,
    width: 0,
    maxWidth: '80%',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    flexWrap: 'nowrap',
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

const ExtraOptionsLabel = styled('div', {
  backgroundColor: '$backgroundLayer3',
  color: '$text',
  padding: '3px 0.5rem',
  borderRadius: '$2',
  margin: '2px',
  fontSize: '0.8em',
})

const SelectedItemsContainer = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  padding: '$2',
  borderBottom: '1px solid $border',
  gap: '$2',
})

const SelectedItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  padding: '0.5px 5px',
  backgroundColor: '$backgroundLayer3',
  color: '$text',
  borderRadius: '$2',
  gap: '$1',
})

const ValueContainer = ({
  children,
  ...props
}: ValueContainerProps<
  SelectItemValuesProps,
  true,
  GroupBase<SelectItemValuesProps>
>) => {
  const [values, input] = children as [React.ReactNode[], React.ReactNode]
  const valueCount = Array.isArray(values) ? values.length : 0

  return (
    <components.ValueContainer {...props}>
      {valueCount > 1 ? (
        <>
          {values[0]}
          <ExtraOptionsLabel>{`+${valueCount - 1}`}</ExtraOptionsLabel>
          {input}
        </>
      ) : (
        children
      )}
    </components.ValueContainer>
  )
}

const MenuList = ({ children, ...props }: MenuListProps<any, true>) => {
  const { value, onChange, isMulti } = props.selectProps

  const selectedValues = Array.isArray(value) ? value : (value && [value]) || []

  const handleRemove = (itemToRemove: any) => {
    if (isMulti) {
      const newValue = selectedValues.filter(
        (item: SelectItemValuesProps) => item.value !== itemToRemove.value
      )
      onChange(newValue, { action: 'remove-value', removedValue: itemToRemove })
    }
  }

  return (
    <components.MenuList {...props}>
      {selectedValues.length > 0 && (
        <SelectedItemsContainer>
          {selectedValues.map((value: any) => (
            <SelectedItem key={value.value}>
              <Text size="small">{value.label}</Text>
              <Button
                css={{ marginLeft: 'auto', padding: 'unset' }}
                variants="cancel"
                onClick={() => handleRemove(value)}
                iconBefore={<IoMdClose />}
                size="small"
              />
            </SelectedItem>
          ))}
        </SelectedItemsContainer>
      )}
      {children}
    </components.MenuList>
  )
}

const LabelSelector = React.forwardRef<LabelSelectorRef, ClassSelectorProps>(
  (
    {
      options,
      selectOption,
      onChange,
      width = '100%',
      isDisabled,
      placeHolder,
      selectStyles,
      isMulti,
      isSearchable = true,
      id,
      inputId,
      dataTestId,
    },
    ref
  ) => {
    const customStyles = React.useMemo(() => {
      const baseStyles = selectCustomStyles(width)
      if (selectStyles) {
        // combine styles
        return Object.keys(baseStyles).reduce((acc, key) => {
          acc[key] = (provided: CSSObjectWithLabel, state: any) => ({
            ...provided,
            ...(baseStyles[key] && baseStyles[key](provided, state)),
            ...(selectStyles[key] && selectStyles[key](provided, state)),
          })
          return acc
        }, {} as Record<string, any>)
      }
      return baseStyles
    }, [width, selectStyles])

    return (
      <Select
        isSearchable={isSearchable}
        closeMenuOnSelect={!isMulti}
        // defaultValue={selectOption ? [selectOption] : undefined}
        defaultValue={selectOption ?? undefined}
        value={selectOption ?? undefined}
        placeholder={placeHolder}
        isMulti={isMulti || undefined}
        options={options}
        formatOptionLabel={(data: SelectItemValuesProps) => (
          <Wrapper className="country-option">
            {data.image && (
              <ImageAspect
                s3="public"
                ratio={1}
                width="20%"
                src={data.image}
                alt="Logo image"
              />
            )}
            <span style={{ padding: '$4' }}>{data.label}</span>
          </Wrapper>
        )}
        styles={customStyles}
        onChange={onChange}
        isDisabled={isDisabled ?? false}
        ref={ref}
        id={id}
        inputId={inputId}
        components={
          isMulti
            ? {
                ValueContainer,
                MenuList,
              }
            : undefined
        }
        data-testid={dataTestId}
      />
    )
  }
)

export default LabelSelector
