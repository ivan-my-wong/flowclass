import { UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form'

type PropsType = {
  labelClass?: string
  label?: string
  name: string
  required?: boolean
  form: UseFormReturn<any, any>
  options?: { label: string }[]
  isDisabled?: boolean
}
const MultipleChoiceField = ({
  labelClass,
  label,
  form,
  options,
  required,
  name,
  isDisabled = false,
}: PropsType): JSX.Element => {
  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        validate: value => {
          if (required && (!value || value.length === 0)) {
            return 'Please select at least one option'
          }
          return true
        },
      }}
      render={({ field }) => (
        <FormItem className="box-col-full flex flex-col items-start justify-start">
          <FormLabel className={labelClass} required={required}>
            {label}
          </FormLabel>
          <FormControl>
            <div className="box-col-full flex-wrap items-start">
              {(options || []).map(option => (
                <label key={`option_${option.label.replaceAll(' ', '_')}`}>
                  <input
                    type="checkbox"
                    className="accent-textSubtle mr-3"
                    value={option.label}
                    disabled={isDisabled}
                    checked={Array.isArray(field.value) && field.value.includes(option.label)}
                    onChange={e => {
                      const currentValue = Array.isArray(field.value) ? field.value : []
                      const updatedValue = e.target.checked
                        ? [...currentValue, option.label]
                        : currentValue.filter((val: string) => val !== option.label)
                      field.onChange(updatedValue)
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default MultipleChoiceField
