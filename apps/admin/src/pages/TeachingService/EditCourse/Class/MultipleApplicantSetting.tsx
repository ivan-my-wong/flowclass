import { t } from 'i18next'
import { useFormContext, useWatch } from 'react-hook-form'

import Switch from '@/components/Toggle/Switch'
import { FormControl, FormField, FormItem } from '@/components/ui/Form'
import { ClassesForm } from '@/types/classes'
import { ClassTypeEnum } from '@/types/course'

const MultipleApplicantSetting = (): JSX.Element | null => {
  const form = useFormContext<ClassesForm>()
  const type = useWatch({ control: form.control, name: 'type' })
  if (type === ClassTypeEnum.recurring || type === ClassTypeEnum.appointment) {
    return null
  }
  return (
    <div className="box-row-full py-2">
      <div className="box-col-full items-start !max-w-2/3">
        <p className="text-lg font-bold" id="classScheduleHeading">
          {t('teachingService:class.multipleApplicantTitle')}
        </p>
        <p> {t('teachingService:class.multipleApplicantDescription')}</p>
      </div>
      <div className="flex justify-end max-w-fit">
        <div className="flex justify-end">
          <FormField
            control={form.control}
            name="setMultipleApplicant"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    data-testid="multiple-applicant-switch"
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
    </div>
  )
}

export default MultipleApplicantSetting
