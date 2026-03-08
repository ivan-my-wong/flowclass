import { forwardRef } from 'react'

import { clsx } from 'clsx'
import { RegisterOptions, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { TextInput } from '@/components/ui/Inputs/TextInput'
import { TextArea } from '@/components/ui/TextArea'

type PropsType = {
  labelClass?: string
  label?: string
  required?: boolean
  name: string
  type?: 'text' | 'number'
  form: UseFormReturn<any, any>
  inputTag?: 'input' | 'textarea'
  rules?: Omit<
    RegisterOptions<any, any>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >
  onFocus?: () => void
}

const TextAnswerField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  PropsType
>(
  (
    {
      labelClass,
      label,
      required,
      form,
      type = 'text',
      name,
      rules,
      inputTag = 'input',
      onFocus,
    },
    ref
  ) => {
    const { error } = form.getFieldState(name)
    const { t } = useTranslation()

    const ComponentMaps = {
      textarea: TextArea,
      input: TextInput,
    }
    const Component = ComponentMaps[inputTag]

    return (
      <FormField
        control={form.control}
        name={name}
        rules={{
          validate: value => {
            if (required && (!value || value.length === 0)) {
              return t('errors:VALIDATE.FIELD_REQUIRED').toString()
            }
            return true
          },
          ...rules,
        }}
        render={({ field: { ...field } }) => (
          <FormItem className="box-col-full flex flex-col items-stretch">
            <FormLabel className={clsx(labelClass)} required={required}>
              {label}
            </FormLabel>
            <FormControl>
              <Component
                onFocus={onFocus}
                className="raw-input w-full h-10 py-2 px-3"
                type={type}
                vertical
                isError={Boolean(error)}
                required={required}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }
)

export default TextAnswerField
