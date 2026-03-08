import DatePicker, { DatePickerProps } from 'react-datepicker'
import { type FieldValues, type UseFormReturn } from 'react-hook-form'

import { DatePickerInput } from '@/components/DatePickers/DatePicker'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { getFormatDate } from '@/utils/timeFormat'

type PropsType = {
  label?: string
  labelClass?: string
  name: string
  form: UseFormReturn<FieldValues, any, undefined>
  inputProps?: Omit<
    DatePickerProps,
    'showMonthYearDropdown' | 'selectsRange' | 'selectsMultiple'
  >
  required?: boolean
}
const DateField = ({
  labelClass,
  label,
  name,
  form,
  required,
  inputProps,
}: PropsType): JSX.Element => {
  const { errors } = form.formState
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { ref, ...field } }) => (
        <FormItem className="box-col-full flex w-full flex-col items-stretch">
          <FormLabel className={labelClass} required={required}>
            {label}
          </FormLabel>
          <FormControl>
            <DatePicker
              {...inputProps}
              selected={
                field.value ? new Date(getFormatDate(field.value)) : undefined
              }
              customInput={
                <DatePickerInput
                  // label={label}
                  errors={errors}
                  fieldName={name}
                  type="begin"
                  ref={ref}
                />
              }
              dateFormat="yyyy/MM/dd"
              className="custom-datepicker"
              onChange={date => field.onChange(date)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
export default DateField
