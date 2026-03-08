import { t } from 'i18next'
import { useFormContext } from 'react-hook-form'

import Switch from '@/components/Toggle/Switch'
import FormControl from '@/components/ui/FormControl'
import FormField from '@/components/ui/FormField'
import FormItem from '@/components/ui/FormItem'
import { ClassesForm } from '@/types/classes'

const DropIn = (): JSX.Element => {
  const form = useFormContext<ClassesForm>()
  return (
    <div className="box-row-full py-2">
      <div className="box-col-full gap-4 items-start !max-w-2/3">
        <p className="text-lg font-bold" id="classScheduleHeading">
          {t('teachingService:class.dropInTitle')}
        </p>
        <p>{t('teachingService:class.dropInDescription')}</p>
      </div>
      <FormField
        control={form.control}
        name="dropIn"
        render={({ field }) => (
          <FormItem>
            <FormControl className="flex justify-end max-w-fit">
              <Switch
                data-testid="dropin-switch"
                className="w-fit"
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}

export default DropIn
