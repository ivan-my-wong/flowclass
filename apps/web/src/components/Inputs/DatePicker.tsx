import React, { ChangeEvent, forwardRef, MouseEventHandler } from 'react'

import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { Control, Controller, FieldErrors, FieldValues, RegisterOptions } from 'react-hook-form'

import { getFormatDate } from '@/utils/calculateTime'

import TextInput, { TextInputProps } from './TextInput'

import 'react-datepicker/dist/react-datepicker.css'

type DatePickProps = ReactDatePickerProps & {
  selectedDate: string | null
  label?: string
  validation?: {
    control: Control<FieldValues>
    name: string
    rules?:
      | Omit<
          RegisterOptions<FieldValues>,
          'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
        >
      | undefined
    errors?: FieldErrors<FieldValues>
  }
  type?: 'begin' | 'end'
}

type DateInputProps = {
  value?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onClick?: MouseEventHandler<HTMLInputElement>
  fieldName?: string
  errors?: FieldErrors<FieldValues>
  type: 'begin' | 'end'
} & TextInputProps

// eslint-disable-next-line react/display-name
export const ExampleCustomInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, onClick, label, fieldName = '', errors, type, ...other }, ref) => {
    return (
      <TextInput
        {...other}
        ref={ref}
        name={fieldName}
        id={fieldName}
        value={value}
        onChange={onChange}
        onClick={onClick}
        label={label}
        isError={!!errors?.[fieldName]}
        helperText={errors?.[fieldName]?.message as string}
        readOnly={type === 'end'}
        disabled={type === 'end'}
      />
    )
  }
)

const CustomDatePicker: React.FC<DatePickProps> = ({
  selectedDate,
  label,
  validation,
  onChange,
  type = 'begin',
  ...props
}) => {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
      }}
    >
      {validation && (
        <Controller
          control={validation.control}
          name={validation.name}
          rules={validation.rules}
          render={({ field: { ref, ...field } }) => {
            return (
              <DatePicker
                {...props}
                selected={field.value ? new Date(getFormatDate(field.value)) : undefined}
                customInput={
                  <ExampleCustomInput
                    label={label}
                    errors={validation.errors}
                    fieldName={validation.name}
                    type={type}
                    ref={ref}
                  />
                }
                dateFormat="yyyy/MM/dd"
                className="custom-datepicker"
                onChange={date => field.onChange(date)}
              />
            )
          }}
        />
      )}
      {!validation && (
        <DatePicker
          // showTimeSelect
          selected={new Date(selectedDate ?? '')}
          dateFormat="yyyy/MM/dd"
          {...props}
          onChange={onChange}
          customInput={<ExampleCustomInput label={label} type={type} />}
        />
      )}
    </div>
  )
}

export default CustomDatePicker
