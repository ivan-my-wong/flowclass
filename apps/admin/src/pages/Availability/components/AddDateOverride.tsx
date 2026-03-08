import { useMemo, useState } from 'react'

import dayjs from 'dayjs'
import {
  FieldValues,
  Path,
  useFieldArray,
  useForm,
  UseFormReturn,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CgPlayListRemove } from 'react-icons/cg'
import { IoMdAdd } from 'react-icons/io'

import { DayPicker } from 'react-day-picker'

import IconButton from '@/components/Buttons/IconButton'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import { Switch } from '@/components/ui/Switch'
import { DateOverride } from '@/types/availability.type'
import { formatChartDate, getDateStringByTimeString } from '@/utils/timeString'

export type DateOverrideUid = DateOverride & { uid: string }

type FormValues = {
  [key: string]: DateOverrideUid[]
}

type AddDateOverrideProps = {
  form: UseFormReturn<FormValues>
  formName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultTime = {
  startTime: new Date(new Date().setHours(9, 0, 0, 0)),
  endTime: new Date(new Date().setHours(18, 0, 0, 0)),
}

const AddDateOverride = ({
  form,
  formName,
  open,
  onOpenChange,
}: AddDateOverrideProps): React.ReactElement => {
  const { t } = useTranslation()

  const { append: currentAppend } = useFieldArray({
    control: form.control,
    keyName: 'uid',
    name: formName as Path<FormValues>,
  })

  const formAdd = useForm<FormValues>()

  const { fields, append, update, replace, remove } = useFieldArray({
    control: formAdd.control,
    keyName: 'uid',
    name: formName as Path<FormValues>,
  })

  const [dateSelection, setDateSelection] = useState<Date>()

  const findIndexSchedule = (date: DateOverrideUid) => {
    return fields.findIndex(field => field.uid === date.uid)
  }

  const updateDateStartTime = (date: DateOverrideUid, newStartTime: string) => {
    const startTime = dayjs(newStartTime, 'HH:mm')
    const findIndex = findIndexSchedule(date)
    update(findIndex, {
      ...fields[findIndex],
      startTime: newStartTime,
      endTime: startTime.add(1, 'hour').format('HH:mm'),
    })
  }

  const updateDateEndTime = (date: DateOverrideUid, newEndTime: string) => {
    const findIndex = findIndexSchedule(date)
    update(findIndex, {
      ...fields[findIndex],
      endTime: newEndTime,
    })
  }

  const handleDeleteDate = (date: DateOverrideUid) => {
    const findIndex = findIndexSchedule(date)
    replace(fields.filter((_, index) => index !== findIndex))
  }

  const sortedDateTime = [...fields]
    .filter(o => {
      if (!dateSelection) return false
      return (
        formatChartDate(new Date(o.date)) === formatChartDate(dateSelection)
      )
    })
    .sort((a, b) => {
      return (
        dayjs(a.startTime, 'HH:mm').utc().toDate().getTime() -
        dayjs(b.startTime, 'HH:mm').utc().toDate().getTime()
      )
    })

  const handleChangeAvailable = (value: boolean) => {
    const formattedDate = formatChartDate(dateSelection)
    const existingIndex = fields.findIndex(
      field => field.date === formattedDate
    )
    const updatedFields = fields.filter((_, index) => index !== existingIndex)

    if (value) {
      replace([
        ...updatedFields,
        {
          uid: `${formattedDate}-${Date.now()}`,
          date: formatChartDate(dateSelection),
          startTime: dayjs(defaultTime.startTime).format('HH:mm'),
          endTime: dayjs(defaultTime.endTime).format('HH:mm'),
          isAvailable: true,
        },
      ] as DateOverrideUid[])
    } else {
      replace([
        ...updatedFields,
        {
          uid: `${formattedDate}-${Date.now()}`,
          date: formattedDate,
          isAvailable: false,
        },
      ] as DateOverrideUid[])
    }
  }

  const isChecked = useMemo(() => {
    const formattedDate = formatChartDate(dateSelection)
    const selected = fields.find(field => field.date === formattedDate)

    if (!selected) return true

    return !!selected.date && !!selected.startTime
  }, [dateSelection, fields])

  const isSubmitDisabled = useMemo(() => {
    return (
      fields.length === 0 ||
      fields.some(field => isChecked && (!field.date || !field.startTime))
    )
  }, [fields, isChecked])

  return (
    <ModalDialog
      title={t('availability:addDateOverride.description') as string}
      open={open}
      onOpenChange={onOpenChange}
      className="max-h-[90vh]"
      scrollable
    >
      <div className="box-responsive-full gap-4">
        <DayPicker
          className="[&_.rdp-nav]:z-[1050]"
          mode="single"
          selected={dateSelection}
          onSelect={setDateSelection}
          required
        />
        {!!dateSelection && (
          <div className="py-4 bg-background-layer-2 min-w-[16rem]">
            <div className="flex justify-between items-center mx-8">
              <p className="font-bold text-sm">
                {t('availability:addDateOverride.availableDate')} ?
              </p>
              <div className="flex gap-2 items-center">
                <Switch
                  onCheckedChange={v => handleChangeAvailable(v)}
                  checked={isChecked}
                  className="shadow-md border-gray-100"
                />
              </div>
            </div>
            {isChecked && (
              <>
                <div className="bg-background-layer-2 h-[1px] w-full mt-4 mb-3" />
                <div className="flex justify-between items-center mx-8 ">
                  <div className="font-bold text-sm">
                    {t('availability:addDateOverride.availableHours')}
                  </div>
                  <div className="flex gap-2 items-center">
                    <IconButton
                      onClick={() => {
                        const formattedDate = formatChartDate(dateSelection)
                        append({
                          uid: `${formattedDate}-${Date.now()}`,
                          date: formattedDate,
                          startTime: dayjs(defaultTime.startTime).format(
                            'HH:mm'
                          ),
                          endTime: dayjs(defaultTime.endTime).format('HH:mm'),
                          isAvailable: true,
                        })
                      }}
                      plain
                      icon={<IoMdAdd />}
                      color="primary"
                    />
                  </div>
                </div>
                <div className="w-[350px] space-y-2 mx-8">
                  {sortedDateTime?.map(date => {
                    return (
                      <Box key={date.uid}>
                        <div className="relative z-10">
                          <CustomDatePicker
                            dateFormat="h:mm aa"
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={5}
                            noConvertTimeZone
                            selectedDate={(() => {
                              if (!date?.startTime) return null
                              return getDateStringByTimeString(
                                date.startTime
                              ).toISOString()
                            })()}
                            onChange={val => {
                              const formattedTime = dayjs(val).format('HH:mm')
                              try {
                                updateDateStartTime(date, formattedTime)
                              } catch (error) {
                                console.error(error)
                              }
                            }}
                          />
                        </div>
                        -
                        <div className="relative z-10">
                          <CustomDatePicker
                            strictParsing
                            dateFormat="h:mm aa"
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={5}
                            noConvertTimeZone
                            selectedDate={(() => {
                              if (!date?.endTime) return null
                              return getDateStringByTimeString(
                                date.endTime
                              ).toISOString()
                            })()}
                            onChange={val => {
                              const formattedTime = dayjs(val).format('HH:mm')
                              updateDateEndTime(date, formattedTime)
                            }}
                          />
                        </div>
                        <IconButton
                          plain
                          size="medium"
                          color="warn"
                          onClick={() => {
                            handleDeleteDate(date)
                          }}
                          icon={<CgPlayListRemove />}
                        />
                      </Box>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center px-8 py-4 w-full gap-4 border-t border-solid border-gray-200">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setDateSelection(undefined)
            remove()
            onOpenChange(false)
          }}
        >
          {t('common:action.cancel')}
        </Button>
        <Button
          disabled={isSubmitDisabled}
          className="w-full"
          onClick={() => {
            currentAppend(fields)
            setDateSelection(undefined)
            remove()
            onOpenChange(false)
          }}
        >
          {t('common:action.apply')}
        </Button>
      </div>
    </ModalDialog>
  )
}

export default AddDateOverride
