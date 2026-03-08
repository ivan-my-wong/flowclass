import { useEffect } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { RegisterOptions, UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form'
import TextInput from '@/components/Inputs/TextInput'
import { TextArea } from '@/components/TextAreas/TextArea'

type PropsType = {
  labelClass?: string
  label?: string
  required?: boolean
  name: string
  type?: 'text' | 'number' | 'email'
  form: UseFormReturn<any, any>
  inputTag?: 'input' | 'textarea'
  rules?: Omit<
    RegisterOptions<any, any>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >
  isDisabled?: boolean
  dataTestId?: string
  isDefault?: boolean
}

const TextAnswerField = ({
  labelClass,
  label,
  required,
  form,
  type = 'text',
  name,
  rules,
  inputTag = 'input',
  isDisabled = false,
  isDefault = false,
  dataTestId,
}: PropsType): JSX.Element => {
  const { error } = form.getFieldState(name)
  const { t } = useTranslation()
  const ComponentMaps = {
    textarea: TextArea,
    input: TextInput,
  }

  useEffect(() => {
    const existingForm = form.getValues('applicant')

    if (!existingForm || Object.keys(existingForm).length === 0) return

    if (isDefault && type === 'text') {
      const presetName = existingForm[0].Name
      form.setValue(name, presetName)
    } else if (isDefault && type === 'email') {
      const presetEmail = existingForm[0].Email
      form.setValue(name, presetEmail)
    }
  }, [isDefault])

  const Component = ComponentMaps[inputTag]
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
        ...rules,
      }}
      render={({ field: { ref, ...field } }) => {
        return (
          <FormItem className="box-col-full flex flex-col items-stretch">
            <FormLabel className={labelClass} required={required}>
              {label}
            </FormLabel>
            <FormControl>
              <Component
                className="raw-input"
                type={type}
                vertical
                isError={Boolean(error)}
                ref={ref}
                required={required}
                disabled={isDisabled}
                {...field}
                onChange={(e: any) => {
                  const value = e.target.value
                  if (type === 'email') {
                    return field.onChange(value.toLowerCase())
                  }
                  return field.onChange(value)
                }}
                data-testid={dataTestId}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export default TextAnswerField
