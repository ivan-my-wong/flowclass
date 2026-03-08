import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import Text from '@/components/Texts/Text'
import FormControl from '@/components/ui/FormControl'
import FormField from '@/components/ui/FormField'
import FormItem from '@/components/ui/FormItem'
import FormMessage from '@/components/ui/FormMessage'
import RequiredLabel from '@/pages/StudentDetail/components/customFields/RequiredLabel'
import SwitchCustomField from '@/pages/StudentDetail/components/customFields/SwitchCustomField'

type PropsType = {
  labelClass?: string
  formItemClass?: string
  label?: string
  name: string
  required?: boolean
  switchClass?: string
  options?: string[]
  form: UseFormReturn<any, any>
}
const SwitchField = ({
  label,
  labelClass,
  formItemClass,
  required,
  switchClass,
  name,
  form,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()
  return (
    <FormField
      name={name}
      control={form.control}
      rules={{
        validate: value => {
          if (required && !value) {
            return t('common:errors.required') as string
          }
          return true
        },
      }}
      render={({ field }) => (
        <FormItem
          className={formItemClass || 'box-col-full items-start justify-start'}
        >
          <label className="switch flex flex-row items-center " htmlFor={name}>
            <Text className={labelClass}>
              {label}
              {required && <RequiredLabel />}
            </Text>
          </label>
          <div className={switchClass}>
            <FormControl>
              <SwitchCustomField
                {...field}
                setValue={form.setValue}
                label=""
                name={name}
              />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}
export default SwitchField
