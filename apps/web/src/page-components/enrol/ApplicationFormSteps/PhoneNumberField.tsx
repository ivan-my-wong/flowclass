import { useEffect } from 'react'

import { RegisterOptions, UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel } from '@/components/Form'
import PhoneNumberInput from '@/components/Inputs/PhoneInput'
import { DataTestId } from '@/types/common'

type PropsType = {
  label?: string
  labelClass?: string
  name: string
  required?: boolean
  form: UseFormReturn<any, any>
  rules?: Omit<
    RegisterOptions<any, any>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >
  isDisabled?: boolean
  isDefault?: boolean
} & DataTestId

const PhoneNumberField = ({
  label,
  labelClass,
  form,
  required,
  name,
  rules,
  isDisabled = false,
  isDefault = false,
  dataTestId,
}: PropsType): JSX.Element => {
  const { error } = form.getFieldState(name)

  useEffect(() => {
    const existingForm = form.getValues('applicant')

    if (!existingForm || Object.keys(existingForm).length === 0) return

    if (isDefault) {
      const presetNumber = existingForm[0].Phone
      form.setValue(name, presetNumber)
    }
  }, [isDefault])

  return (
    <FormField
      control={form.control}
      rules={rules}
      name={name}
      render={({ field: { ref, ...field } }) => (
        <FormItem className="box-col-full flex flex-col items-stretch">
          <FormLabel className={labelClass} required={required}>
            {label}
          </FormLabel>
          <FormControl>
            <PhoneNumberInput
              isDisabled={isDisabled}
              fullWidth
              field={field}
              ref={ref}
              error={Boolean(error)}
              errorMessage={error?.message}
              dataTestId={dataTestId}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
export default PhoneNumberField
