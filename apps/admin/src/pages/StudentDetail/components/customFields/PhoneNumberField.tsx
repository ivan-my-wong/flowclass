import { RegisterOptions, UseFormReturn } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form'
import PhoneNumberInput from '@/components/ui/PhoneInput'

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
}
const PhoneNumberField = ({
  label,
  labelClass,
  form,
  required,
  name,
  rules,
}: PropsType): JSX.Element => {
  const { error } = form.getFieldState(name)

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
              fullWidth
              field={field}
              ref={ref}
              error={Boolean(error)}
              errorMessage={error?.message}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
export default PhoneNumberField
