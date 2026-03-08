import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import FormControl from '@/components/ui/FormControl'
import FormField from '@/components/ui/FormField'
import FormItem from '@/components/ui/FormItem'
import FormLabel from '@/components/ui/FormLabel'
import FormMessage from '@/components/ui/FormMessage'

type PropsType = {
  labelClass?: string
  optionLabelClass?: string
  formItemClass?: string
  label?: string
  name: string
  required?: boolean
  options?: string[]
  disabled?: boolean
  form: UseFormReturn<any, any>
}

const SingleChoiceField = ({
  labelClass,
  optionLabelClass,
  formItemClass,
  label,
  required,
  form,
  name,
  options,
  disabled,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()

  return (
    <FormField
      name={name}
      disabled={disabled}
      control={form.control}
      rules={{
        validate: value => {
          if (required && (!value || value.length === 0)) {
            return t('common:errors.required') as string
          }
          return true
        },
      }}
      render={({ field: { ref, value, ...field } }) => {
        return (
          <FormItem
            className={
              formItemClass || 'box-col-full flex items-start justify-start'
            }
          >
            <FormLabel className={labelClass} required={required}>
              {label}
            </FormLabel>
            <FormControl>
              <div
                className={
                  optionLabelClass ||
                  'box-col-full flex flex-col flex-wrap items-start'
                }
              >
                {(options || []).map(option => {
                  const checkboxOptionId = `option_${option.replaceAll(
                    ' ',
                    '_'
                  )}`
                  return (
                    <label
                      htmlFor={checkboxOptionId}
                      className="text-wrap"
                      key={checkboxOptionId}
                    >
                      <input
                        id={checkboxOptionId}
                        {...field}
                        ref={ref}
                        className="accent-textSubtle mr-3"
                        type="radio"
                        value={option}
                        checked={value === option}
                      />
                      {option}
                    </label>
                  )
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export default SingleChoiceField
