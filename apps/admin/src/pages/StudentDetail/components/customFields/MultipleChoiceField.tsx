import { t } from 'i18next'
import { UseFormReturn } from 'react-hook-form'

import FormControl from '@/components/ui/FormControl'
import FormField from '@/components/ui/FormField'
import FormItem from '@/components/ui/FormItem'
import FormLabel from '@/components/ui/FormLabel'
import FormMessage from '@/components/ui/FormMessage'

type PropsType = {
  isDisabled?: boolean
  labelClass?: string
  formItemClass?: string
  optionLabelClass?: string
  label?: string
  name: string
  required?: boolean
  form: UseFormReturn<any, any>
  options?: { label: string }[]
}
const MultipleChoiceField = ({
  isDisabled,
  labelClass,
  formItemClass,
  optionLabelClass,
  label,
  form,
  options,
  required,
  name,
}: PropsType): JSX.Element => {
  return (
    <FormField
      control={form.control}
      name={name}
      disabled={isDisabled}
      rules={{
        validate: value => {
          if (required && (!Array.isArray(value) || value.length === 0)) {
            return t('common:errors.required') as string
          }
          return true
        },
      }}
      render={({ field }) => {
        let fieldValue: string[] = []

        if (field.value) {
          if (Array.isArray(field.value)) {
            fieldValue = field.value
          } else if (typeof field.value === 'string') {
            if (field.value.startsWith('[') && field.value.endsWith(']')) {
              try {
                fieldValue = JSON.parse(field.value)
              } catch (error) {
                console.error('Failed to parse JSON:', field.value, error)
                fieldValue = []
              }
            } else {
              fieldValue = [field.value]
            }
          }
        }

        return (
          <FormItem
            className={
              formItemClass ||
              'box-col-full flex flex-col items-start justify-start'
            }
          >
            <FormLabel className={labelClass} required={required}>
              {label}
            </FormLabel>
            <div className="flex flex-col items-start justify-center">
              <FormControl>
                <div
                  className={
                    optionLabelClass ||
                    'box-col-full flex flex-col flex-wrap items-start'
                  }
                >
                  {(options || []).map(option => {
                    const optionId = `option_${option.label.replaceAll(
                      ' ',
                      '_'
                    )}`
                    return (
                      <label key={optionId} htmlFor={optionId}>
                        <input
                          id={optionId}
                          type="checkbox"
                          className="accent-textSubtle mr-3"
                          value={option.label}
                          checked={
                            Array.isArray(fieldValue) &&
                            fieldValue.includes(option.label)
                          }
                          onChange={e => {
                            const currentValue = Array.isArray(fieldValue)
                              ? fieldValue
                              : []
                            const updatedValue = e.target.checked
                              ? [...currentValue, option.label]
                              : currentValue.filter(
                                  (val: string) => val !== option.label
                                )
                            field.onChange(JSON.stringify(updatedValue))
                          }}
                          disabled={isDisabled}
                        />
                        {option.label}
                      </label>
                    )
                  })}
                </div>
              </FormControl>
              <FormMessage className="ml-14 mt-2" />
            </div>
          </FormItem>
        )
      }}
    />
  )
}

export default MultipleChoiceField
