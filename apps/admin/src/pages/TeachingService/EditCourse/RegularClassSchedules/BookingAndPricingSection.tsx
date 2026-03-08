import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuBookOpen } from 'react-icons/lu'

import Box from '@/components/ui/Box'
import { Card } from '@/components/ui/Card'
import { FormControl, FormField, FormItem } from '@/components/ui/Form'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import Text from '@/components/ui/Text'
import { ClassesForm, ClassRegularPeriodsSelectionMode } from '@/types/classes'

export const BookingAndPricingSection = (): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  const form = useFormContext<ClassesForm>()

  return (
    <Card className="box-col-full p-4 items-start">
      {/* Selection Mode */}
      <div className="box-row-full justify-start items-center">
        <LuBookOpen />
        <Text className="text-xl font-semibold">
          {t('teachingService:regularV2.selectionMode')}
        </Text>
      </div>
      <FormField
        name="regularScheduleV2.selectionMode"
        control={form.control}
        render={({ field }) => (
          <FormItem className="space-y-2 mt-2">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                className="flex flex-col space-y-4"
              >
                <div className="flex flex-col space-y-1">
                  <div className="box-row-full justify-start items-center">
                    <RadioGroupItem
                      value={
                        ClassRegularPeriodsSelectionMode.MUST_SELECT_ENTIRE_PERIOD
                      }
                      id="entire_period"
                    />
                    <div className="box-col-full items-start gap-2">
                      <p className="font-semibold">
                        {t('teachingService:regularV2.mustSelectEntirePeriod')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          'teachingService:regularV2.mustSelectEntirePeriodDesc'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <div className="box-row-full justify-start items-center">
                    <RadioGroupItem
                      value={
                        ClassRegularPeriodsSelectionMode.MUST_SELECT_UNTIL_END
                      }
                      id="until_end"
                    />
                    <div className="box-col-full items-start gap-2">
                      <p className="font-semibold">
                        {t('teachingService:regularV2.mustSelectUntilEnd')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('teachingService:regularV2.mustSelectUntilEndDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={
                        ClassRegularPeriodsSelectionMode.ALLOW_CUSTOM_SELECTION
                      }
                      id="custom"
                    />
                    <div className="box-col-full items-start gap-2">
                      <p className="font-semibold">
                        {t('teachingService:regularV2.allowCustomSelection')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          'teachingService:regularV2.allowCustomSelectionDesc'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
    </Card>
  )
}
