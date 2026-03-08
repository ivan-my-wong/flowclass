import { useState } from 'react'

import dayjs from 'dayjs'
import { useFormContext, UseFormReturn, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CgPlayListRemove } from 'react-icons/cg'
import { LuPenTool, LuPlus } from 'react-icons/lu'

import IconButton from '@/components/Buttons/IconButton'
import { Button } from '@/components/ui/Button'
import Text from '@/components/ui/Text'
import { cn } from '@/utils/cn'
import { parseDateOverride } from '@/utils/regular-class-schedule.utils'
import { formatChartDate } from '@/utils/timeString'

import AddDateOverride, { DateOverrideUid } from './AddDateOverride'

type DateOverrideProps = {
  form?: UseFormReturn<any, any, undefined>
  formName: string
  className?: string
  tabName?: string
}

const DateOverride = ({
  form: propForm,
  formName,
  className,
  tabName,
}: DateOverrideProps): React.ReactElement => {
  const { t } = useTranslation()
  const contextForm = useFormContext()

  // Use provided form or context form
  const form = propForm || contextForm

  if (!form) {
    throw new Error(
      'DateOverride must be used within a FormProvider or with a form prop'
    )
  }

  const watchedValue = useWatch({
    control: form.control,
    name: formName,
  })

  const dateOverrides = Array.isArray(watchedValue) ? watchedValue : []

  const [isCreateDateOverrideOpen, setIsCreateDateOverrideOpen] =
    useState(false)

  const sortedDateTime = dateOverrides.sort((a, b) => {
    // Convert dates to timestamps for comparison
    const aTimestamp = dayjs(
      `${a.date} ${a.startTime ?? '00:00'}`,
      'YYYY-MM-DD HH:mm'
    ).valueOf()
    const bTimestamp = dayjs(
      `${b.date} ${b.startTime ?? '00:00'}`,
      'YYYY-MM-DD HH:mm'
    ).valueOf()

    // Sort in ascending order (earliest date first)
    return aTimestamp - bTimestamp
  })

  // group by date
  const groupedDateTime = sortedDateTime.reduce((acc: any, date) => {
    const dateKey = formatChartDate(new Date(date.date))
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(date)
    return acc
  }, {})

  const handleDeleteDate = (item: DateOverrideUid) => {
    let updatedDateOverrides = dateOverrides
    if (item.uid) {
      updatedDateOverrides = dateOverrides.filter(date => date.uid !== item.uid)
    } else {
      updatedDateOverrides = dateOverrides.filter(
        date => date.date !== item.date
      )
    }

    form.setValue(formName, updatedDateOverrides, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  return (
    <div className={cn('p-2', className)}>
      <div className="box-row-full justify-between">
        <div className="box-row-full items-center gap-2 justify-start">
          <LuPenTool />
          <Text className="text-xl font-semibold">
            {t('availability:addDateOverride.explanation')}
          </Text>
        </div>
        <Button
          onClick={() => setIsCreateDateOverrideOpen(true)}
          variant="outline"
          iconBefore={<LuPlus />}
        >
          {t('availability:addDateOverride.title')}
        </Button>
      </div>

      <div className="space-y-4 pt-4">
        {Object.keys(groupedDateTime).map(dateKey => {
          const dateItems = groupedDateTime[dateKey]
          return (
            <div key={dateKey} className="p-4 bg-background-layer-2 rounded-lg">
              <Text className="font-bold mb-2 text-lg">
                {dayjs(dateKey).format('YYYY/MM/DD')}
              </Text>
              <ul className="list-disc">
                {dateItems.map((item: DateOverrideUid) => {
                  const { overrideStartDateTime, overrideEndDateTime } =
                    parseDateOverride(item)

                  return (
                    <li
                      key={item.uid}
                      className="flex justify-between items-center"
                    >
                      {dayjs(overrideStartDateTime).isValid() &&
                      dayjs(overrideEndDateTime).isValid() &&
                      item.isAvailable ? (
                        <p>
                          {`${dayjs(overrideStartDateTime).format(
                            'h:mm A'
                          )} - ${dayjs(overrideEndDateTime).format('h:mm A')}`}
                        </p>
                      ) : (
                        <p className="text-red-500">
                          {t('availability:addDateOverride.notAvailableDate')}
                        </p>
                      )}
                      <IconButton
                        plain
                        size="medium"
                        color="warn"
                        onClick={() => {
                          handleDeleteDate(item)
                        }}
                        icon={<CgPlayListRemove />}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      <AddDateOverride
        form={form}
        formName={formName}
        open={isCreateDateOverrideOpen}
        onOpenChange={setIsCreateDateOverrideOpen}
      />
    </div>
  )
}

export default DateOverride
