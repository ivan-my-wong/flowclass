import { t } from 'i18next'
import { useFormContext } from 'react-hook-form'

import AlertBox from '@/components/Boxes/AlertBox'
import Separator from '@/components/Separators/Separator'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import { ClassesForm } from '@/types/classes'
import { PriceType } from '@/types/course'

import WeekdayList from './WeekdayList'

const RecurringScheduleTable = (): JSX.Element => {
  const form = useFormContext<ClassesForm>()

  const priceType = form.watch('priceType')

  const showTimesField = priceType !== PriceType.MULTIPLE_OPTIONS

  return (
    <Box direction="col" gap="lg">
      <Box direction="col" gap="base">
        {showTimesField && (
          <>
            <FormField
              control={form.control}
              name="recurringFormat.times"
              rules={{
                required: t('login:errors.required') as string,
                validate: (val: number) => {
                  if (val <= 0) {
                    return t('embed:configuration.negative') as string
                  }
                  if (val > 99) {
                    return t(
                      'teachingService:recurringClass.maxLesson'
                    ) as string
                  }
                  return true
                },
              }}
              render={({ field }) => (
                <FormItem className="flex gap-x-4 w-full items-center leading-5">
                  <FormLabel className="w-[45%] font-bold">
                    {t('teachingService:class.numOfLessons')}
                  </FormLabel>
                  <FormControl>
                    <Input min={1} max={99} id="times" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
          </>
        )}
        <Heading>{t(`teachingService:recurringClass.weeklyHours`)}</Heading>
        <AlertBox content={t('teachingService:class.repeatByWeek')} />
        <Box border direction="col">
          <WeekdayList />
        </Box>
      </Box>
    </Box>
  )
}

export default RecurringScheduleTable
