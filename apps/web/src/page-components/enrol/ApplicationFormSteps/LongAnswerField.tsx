import { clsx } from 'clsx'
import { UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form'
import { TextArea } from '@/components/TextAreas/TextArea'

type PropsType = {
  labelClass?: string
  label?: string
  required?: boolean
  name: string
  form: UseFormReturn<any, any>
}

const LongAnswerField = ({ labelClass, label, name, required, form }: PropsType): JSX.Element => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { ref, ...field } }) => (
        <FormItem className="box-col-full flex flex-col items-stretch">
          <FormLabel className={clsx(labelClass)} required={required}>
            {label}
          </FormLabel>
          <FormControl>
            <TextArea className="raw-input" rows={5} ref={ref} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default LongAnswerField
