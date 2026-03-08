import { t } from 'i18next'
import { useFormContext } from 'react-hook-form'

import Switch from '@/components/Toggle/Switch'
import { FormItem } from '@/components/ui/Form'
import FormControl from '@/components/ui/FormControl'
import FormField from '@/components/ui/FormField'
import { ClassesForm } from '@/types/classes'

const MultipleClassesSetting = (): JSX.Element => {
  const localForm = useFormContext<ClassesForm>()
  return (
    <div className="box-row-full justify-start">
      <label
        htmlFor="multiple-classes-switch"
        className="text-sm font-bold w-full md:w-[30%] mr-2"
      >
        {t('teachingService:class.multipleClassesDescription')}
      </label>

      <div className="flex justify-end">
        <FormField
          name="setMultipleClass"
          control={localForm.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  id="multiple-classes-switch"
                  data-testid="multiple-classes-switch"
                  className="w-fit"
                  checked={field.value ?? false}
                  onCheckedChange={value => {
                    field.onChange(value)
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export default MultipleClassesSetting
