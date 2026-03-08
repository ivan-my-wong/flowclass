import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form'
import { DataTestId } from '@/types/common'

import { SwitchCustomField } from './SwitchCustomField'

type PropsType = {
  labelClass?: string
  wrapperClass?: string
  label?: string
  name: string
  required?: boolean
  options?: string[]
  form: UseFormReturn<any, any>
  defaultValue?: boolean
  isDisabled?: boolean
} & DataTestId

const SwitchField = ({
  label,
  labelClass,
  required,
  name,
  form,
  wrapperClass,
  isDisabled = false,
  dataTestId,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()

  return (
    <FormField
      name={name}
      control={form.control}
      rules={{
        validate: value => {
          if (required && (typeof value === undefined || !value)) {
            return t('errors:VALIDATE.MUST_SELECT_YES')
          }
          return true
        },
      }}
      render={({ field }) => (
        <FormItem className={clsx([`box-col-full items-start justify-start`, wrapperClass])}>
          <FormLabel
            className={clsx(['switch flex flex-row items-center', labelClass])}
            required={required}
          >
            {label}
          </FormLabel>
          <FormControl>
            <SwitchCustomField
              data-testid={dataTestId}
              disabled={isDisabled}
              onCheckedChange={val =>
                form.setValue(name, val, {
                  shouldDirty: true,
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }
              checked={field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
export default SwitchField
