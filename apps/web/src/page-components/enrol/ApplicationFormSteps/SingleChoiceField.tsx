import useTranslation from 'next-translate/useTranslation'
import { UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form'

type PropsType = {
  labelClass?: string
  label?: string
  name: string
  required?: boolean
  options?: string[]
  form: UseFormReturn<any, any>
  isDisabled?: boolean
}

const SingleChoiceField = ({
  labelClass,
  label,
  required,
  form,
  name,
  options,
  isDisabled = false,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()
  return (
    <FormField
      name={name}
      control={form.control}
      rules={{
        validate: value => {
          if (required && (!value || value.length === 0)) {
            return t('errors:VALIDATE.FIELD_REQUIRED')
          }
          return true
        },
      }}
      render={({ field: { ref, value, ...field } }) => {
        return (
          <FormItem className="box-col-full items-start justify-start">
            <FormLabel className={labelClass} required={required}>
              {label}
            </FormLabel>
            <FormControl>
              <div className="box-col-full flex-wrap items-start">
                {(options || []).map(option => {
                  return (
                    <label
                      key={`checkbox-option_${option.replaceAll(' ', '_')}`}
                      className="text-wrap"
                    >
                      <input
                        {...field}
                        disabled={isDisabled}
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
