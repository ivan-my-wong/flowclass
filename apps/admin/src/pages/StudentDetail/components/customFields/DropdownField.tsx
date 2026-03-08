import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'

import FormControl from '@/components/ui/FormControl'
import FormField from '@/components/ui/FormField'
import FormLabel from '@/components/ui/FormLabel'
import FormMessage from '@/components/ui/FormMessage'

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
  formItemClass?: string
  selectClass?: string
  defaultValue?: string
  disabled?: boolean
  enableFormMessage?: boolean
  'data-testid'?: string
  onValueChange?: (value: string) => void
}

const DropdownField = ({
  formItemClass,
  required,
  name,
  labelClass,
  label,
  placeholder,
  options,
  form,
  selectClass,
  defaultValue,
  disabled,
  enableFormMessage = true,
  'data-testid': dataTestId,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()

  return (
    <FormField
      name={name}
      control={form.control}
      disabled={disabled}
      defaultValue={defaultValue}
      rules={{
        validate: value => {
          if (required && (!value || value.length === 0)) {
            return t('common:errors.AT_LEAST_ONE_OPTION') as string
          }
          return true
        },
      }}
      render={({ field: { ref, value, onChange, ...field } }) => {
        const originalDefaultValue = value
          ? options?.find(v => v.value === value)
          : null
        return (
          <div
            className={
              formItemClass ||
              'box-col-full flex flex-col items-start justify-start'
            }
            data-testid={dataTestId}
          >
            <FormLabel className={labelClass} required={required}>
              {label}
            </FormLabel>

            <FormControl className={selectClass}>
              <Select
                {...field}
                ref={ref}
                value={value}
                defaultValue={originalDefaultValue}
                options={options || []}
                placeholder={originalDefaultValue?.label || placeholder}
                onChange={val => {
                  const raw = val ? val.value : null
                  onChange(raw)
                }}
                className="w-full"
                required={required}
                isDisabled={disabled}
                isClearable
                isSearchable
              />
            </FormControl>
            {enableFormMessage && <FormMessage />}
          </div>
        )
      }}
    />
  )
}
export default DropdownField
