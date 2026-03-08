import useTranslation from 'next-translate/useTranslation'
import DatePicker, { type ReactDatePickerProps } from 'react-datepicker'
import { type FieldValues, type UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form'
import { ExampleCustomInput } from '@/components/Inputs/DatePicker'
import { getFormatDate } from '@/utils/calculateTime'
import { cn } from '@/utils/cn'

type PropsType = Omit<ReactDatePickerProps, 'onChange'> & {
  label?: string
  labelClass?: string
  name: string
  form: UseFormReturn<FieldValues, any, undefined>
  inputProps?: ReactDatePickerProps
  required?: boolean
  isDisabled?: boolean
  dateOnly?: boolean
}

// This is because the onChange is not called when the date is selected

const DateField = ({
  labelClass,
  label,
  name,
  form,
  required,
  inputProps,
  isDisabled = false,
  dateOnly = false,
  ...props
}: PropsType): JSX.Element => {
  const { errors } = form.formState
  const { t } = useTranslation()

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        validate: value => {
          if (required && (!value || value.length === 0)) {
            return t('errors:VALIDATE.FIELD_REQUIRED')
          }
          return true
        },
      }}
      render={({ field: { ref, ...field } }) => (
        <FormItem className="box-col-full flex w-full flex-col items-stretch">
          <FormLabel className={labelClass} required={required}>
            {label}
          </FormLabel>
          <FormControl>
            <DatePicker
              {...inputProps}
              selected={
                field.value
                  ? new Date(dateOnly ? getFormatDate(field.value) : field.value)
                  : undefined
              }
              customInput={
                <ExampleCustomInput
                  // label={label}
                  errors={errors}
                  fieldName={name}
                  type={'begin'}
                  ref={ref}
                  className={cn(
                    'raw-input rounded-md border-gray-200 py-[6px]',
                    isDisabled && 'bg-background-disabled cursor-not-allowed'
                  )}
                />
              }
              dateFormat="yyyy/MM/dd"
              className="custom-datepicker"
              disabled={isDisabled}
              {...props}
              onChange={date => {
                field.onChange(date)
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
export default DateField
