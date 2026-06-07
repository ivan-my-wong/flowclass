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

import { DataTestId } from '@/types/common'

import Button from '../Buttons/Button'
import ImageAspect from '../Images/ImageAspect'
import Text from '../Texts/Text'

import { SelectItemValuesProps } from './Select'

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
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    ':hover': {
      backgroundColor: 'var(--color-primary-highlight-subtle)',
    },
  }),
  control: styles => ({
    ...styles,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)',
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
    backgroundColor: 'var(--color-background-layer-2)',
  }),
  multiValue: styles => ({
    ...styles,
    width: 'fit-content',
    backgroundColor: 'var(--color-background-layer-3)',
    color: 'var(--color-text)',
    borderRadius: '0.5rem',
  }),
  multiValueLabel: styles => ({
    ...styles,
    width: '100%',
  }),
  multiValueRemove: styles => ({
    ...styles,
    ':hover': {
      backgroundColor: 'var(--color-primary-highlight)',
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

const ExtraOptionsLabel = ({
  children,
  ...props
}: React.ComponentProps<'div'>) => (
  <div
    className="bg-background-layer-3 text-text py-0.5 px-2 rounded-xl my-0.5 text-[0.8em]"
    {...props}
  >
    {children}
  </div>
)

const SelectedItemsContainer = ({
  children,
  ...props
}: React.ComponentProps<'div'>) => (
  <div className="flex flex-wrap p-2 border-b border-border gap-2" {...props}>
    {children}
  </div>
)

const SelectedItem = ({ children, ...props }: React.ComponentProps<'div'>) => (
  <div
    className="flex items-center py-0.5 px-1.5 bg-background-layer-3 text-text rounded-xl gap-1"
    {...props}
  >
    {children}
  </div>
)

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
                className="ml-auto p-0"
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
        formatOptionLabel={(data: SelectItemValuesProps, formatMeta) => {
          // For chip Remove aria-label and screenreader announcement, return a
          // plain string. JSX would be stringified to "[object Object]".
          if (formatMeta?.context === 'value') return String(data.label ?? '')
          return (
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
              <span className="p-4">{data.label}</span>
            </div>
          )
        }}
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
