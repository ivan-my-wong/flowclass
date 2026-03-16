import React, { ChangeEvent, forwardRef, MouseEventHandler } from 'react'

import { get } from 'lodash-es'
import DatePicker, { DatePickerProps } from 'react-datepicker'
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form'

import useSiteData from '@/hooks/useSiteData'
import { theme } from '@/styles'

import Box from '../Containers/Box'
import { TextInput, TextInputProps } from '../Inputs/TextInput'

import 'react-datepicker/dist/react-datepicker.css'

type DatePickProps = DatePickerProps & {
  selectedDate: string | null
  label?: string
  noConvertTimeZone?: boolean
  validation?: {
    control: Control<FieldValues>
    name: string
    rules:
      | Omit<
          RegisterOptions<FieldValues>,
          'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
        >
      | undefined
    errors: FieldErrors<FieldValues>
  }
  type?: 'begin' | 'end'
  dataTestId?: string
  readOnly?: boolean
  disabled?: boolean
}

type DateInputProps = {
  value?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onClick?: MouseEventHandler<HTMLInputElement>
  fieldName?: string
  errors?: FieldErrors<FieldValues>
  type: 'begin' | 'end'
  dataTestId?: string
} & TextInputProps

export const DatePickerInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      value,
      onChange,
      onClick,
      label,
      fieldName = '',
      errors,
      type,
      disabled,
      readOnly,
      dataTestId,
      containerClassName,
      ...rest
    },
    ref
  ) => {
    const errorMessage = get(errors, fieldName, { message: '' })
    return (
      <TextInput
        ref={ref}
        name={fieldName}
        id={fieldName}
        value={value}
        onChange={onChange}
        onClick={onClick}
        label={label}
        isError={!!errorMessage?.message}
        helperText={errorMessage?.message as string}
        readOnly={readOnly || type === 'end'}
        disabled={disabled || type === 'end'}
        dataTestId={dataTestId}
        containerClassName={containerClassName}
        className="w-full"
        {...rest}
      />
    )
  }
)

const CustomDatePicker = ({
  selectedDate,
  label,
  validation,
  type = 'begin',
  noConvertTimeZone,
  readOnly,
  dataTestId,
  ...props
}: DatePickProps) => {
  const { getCurrentSiteTimeZoneDate } = useSiteData()

  let zonedTime: Date | null = null
  if (selectedDate) {
    zonedTime = noConvertTimeZone
      ? new Date(selectedDate)
      : getCurrentSiteTimeZoneDate(selectedDate)
  }

  return (
    <Box
      className="w-full"
      css={{
        width: '100%',
        '.react-datepicker-popper': {
          zIndex: theme.zIndices.tooltip,
        },
        '.react-datepicker': {
          display: 'flex',
        },
        '.react-datepicker-wrapper': {
          width: '100%',
        },
        '.react-datepicker__time-list-item--disabled': {
          display: 'none',
        },
        '.react-datepicker__time-list': {
          height: '13rem!important',
        },
      }}
    >
      {validation && (
        <Controller
          control={validation.control}
          name={validation.name}
          rules={validation.rules}
          render={() => (
            <DatePicker
              showTimeSelect
              selected={zonedTime}
              customInput={
                <DatePickerInput
                  disabled={props.disabled}
                  id="datepicker"
                  label={label}
                  errors={validation.errors}
                  fieldName={validation.name}
                  type={type}
                  readOnly={readOnly}
                  dataTestId={dataTestId}
                />
              }
              dateFormat="yyyy/MM/dd hh:mm aa"
              {...props}
            />
          )}
        />
      )}
      {!validation && (
        <DatePicker
          id="datepicker"
          showTimeSelect
          selected={zonedTime}
          dateFormat="yyyy/MM/dd hh:mm aa"
          data-testid={dataTestId}
          customInput={
            <DatePickerInput
              id="datepicker"
              className="w-full"
              containerClassName="w-full"
              label={label}
              type={type}
              readOnly={readOnly}
              dataTestId={dataTestId}
            />
          }
          {...props}
        />
      )}
    </Box>
  )
}

export default CustomDatePicker
