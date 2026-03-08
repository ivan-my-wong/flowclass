import useTranslation from 'next-translate/useTranslation'
import { UseFormReturn } from 'react-hook-form'
import Select from 'react-select'

import { FormControl, FormField, FormLabel, FormMessage } from '@/components/Form'
import { DataTestId } from '@/types/common'

type OptionsType = {
  value: string | number
  label: string
}
type PropsType = {
  labelClass?: string
  label?: string
  placeholder?: string
  options?: OptionsType[]
  form: UseFormReturn<any, any>
  required?: boolean
  name: string
  isDisabled?: boolean
  isClearable?: boolean
} & DataTestId

const DropdownField = ({
  required,
  name,
  labelClass,
  label,
  placeholder,
  options,
  form,
  isDisabled = false,
  isClearable = true,
  dataTestId,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()

  return (
    <FormField
      name={name}
      control={form.control}
      rules={{
        validate: value => {
          if (required && (!value || value.length === 0)) {
            return t('errors:VALIDATE.AT_LEAST_ONE_OPTION')
          }
          return true
        },
      }}
      render={({ field: { ref, value, onChange, ...field } }) => {
        const defaultValue = value ? options?.find(v => v.value === value) : null
        return (
          <div className="box-col-full flex flex-col items-start justify-start">
            <FormLabel className={labelClass} required={required}>
              {label}
            </FormLabel>
            <FormControl>
              <Select
                {...field}
                ref={ref}
                id={name}
                defaultValue={defaultValue}
                options={options || []}
                placeholder={placeholder}
                onChange={val => onChange(val?.value || null)}
                className="w-full"
                required={required}
                isClearable={isClearable}
                isSearchable
                isDisabled={isDisabled}
                value={defaultValue}
                data-testid={dataTestId}
              />
            </FormControl>
            <FormMessage />
          </div>
        )
      }}
    />
  )
}
export default DropdownField
