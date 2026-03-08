import { RefObject, useRef } from 'react'

import dayjs from 'dayjs'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CgPlayListRemove } from 'react-icons/cg'
import { IoMdAdd } from 'react-icons/io'
import { useRecoilState } from 'recoil'

import IconButton from '@/components/Buttons/IconButton'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Switch } from '@/components/ui/Switch'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import {
  Availability,
  SingleRecurringSchedule,
} from '@/types/availability.type'
import { getDateStringByTimeString, getWeekdaysArray } from '@/utils/timeString'

import AddTimeModal, { AddAvailabilityModalHandle } from './AddTimeModal'
import ApplyToClass, { ApplyToClassHandle } from './ApplyToClass'

type RecurringSchedulesWithUid = SingleRecurringSchedule & { uid: string }

type WeekdayListProps = {
  form: UseFormReturn<Availability, any, undefined>
  tabName?: string
  applyToClassHandle: RefObject<ApplyToClassHandle>
  refetchAvailability: () => void
}

const WeekdayList = ({
  form,
  applyToClassHandle,
  tabName,
  refetchAvailability,
}: WeekdayListProps): React.ReactElement => {
  const { t } = useTranslation()

  const addAvailabilityModalHandle = useRef<AddAvailabilityModalHandle>(null)

  const currentAvailability = form.getValues()

  const [userPermission] = useRecoilState(userPermissionState)

  const { fields, append, update, replace } = useFieldArray({
    control: form.control,
    keyName: `uid`,
    name: 'availableSchedules',
  })

  const sortedLessonDateTime = [...fields].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
    return (
      dayjs(a.startTime, 'HH:mm').utc().toDate().getTime() -
      dayjs(b.startTime, 'HH:mm').utc().toDate().getTime()
    )
  })

  const findIndexSchedule = (date: RecurringSchedulesWithUid) => {
    return fields.findIndex(field => field.uid === date.uid)
  }

  const updateLessonDateStartTime = (
    date: RecurringSchedulesWithUid,
    newStartTime: string
  ) => {
    const startTime = dayjs(newStartTime, 'HH:mm')
    const findIndex = findIndexSchedule(date)
    update(findIndex, {
      ...fields[findIndex],
      startTime: newStartTime,
      endTime: startTime.add(1, 'hour').format('HH:mm'),
    })
  }

  const updateLessonDateEndTime = (
    date: RecurringSchedulesWithUid,
    newEndTime: string
  ) => {
    const findIndex = findIndexSchedule(date)

    update(findIndex, {
      ...fields[findIndex],
      endTime: newEndTime,
    })
  }

  const handleDeleteLessonDate = (date: RecurringSchedulesWithUid) => {
    const findIndex = findIndexSchedule(date)
    replace(fields.filter((_, index) => index !== findIndex))
  }

  const openModal = (index: number) => {
    addAvailabilityModalHandle.current?.handleOpenChange()
    addAvailabilityModalHandle.current?.handleWeekdayChange(index)
  }

  return (
    <div className="p-2 w-full">
      {getWeekdaysArray(t).map((obj, index) => {
        const isChecked = sortedLessonDateTime.some(
          date => date.dayOfWeek === index && date.isEnabled
        )
        const listData = sortedLessonDateTime?.filter(
          date => date.dayOfWeek === index
        )
        return (
          <Box
            padding="base"
            className="border-b border-b-text-disabled"
            key={obj?.toString() ?? index}
            responsive
          >
            <Box justify="start" align="start" className="flex-1">
              <Switch
                onCheckedChange={(v: boolean) => {
                  if (listData.length === 0) {
                    return openModal(index)
                  }
                  return fields.forEach((date, i) => {
                    if (date.dayOfWeek === index) {
                      update(i, {
                        ...fields[i],
                        isEnabled: v,
                      })
                    }
                  })
                }}
                checked={isChecked}
              />
              <Text className="w-[80px]">{obj}</Text>
            </Box>
            <Box justify="between">
              <Box justify="start" direction="col" gap="3">
                {listData.length > 0 ? (
                  listData.map((date, dateIndex) => {
                    return (
                      <Box key={`${dateIndex}-${date.dayOfWeek}`}>
                        <CustomDatePicker
                          dateFormat="h:mm aa"
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={5}
                          noConvertTimeZone
                          selectedDate={(() => {
                            return getDateStringByTimeString(
                              date.startTime
                            ).toISOString()
                          })()}
                          onChange={val => {
                            const formattedTime = dayjs(val).format('HH:mm')
                            updateLessonDateStartTime(date, formattedTime)
                          }}
                        />
                        -
                        <CustomDatePicker
                          strictParsing
                          dateFormat="h:mm aa"
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={5}
                          noConvertTimeZone
                          selectedDate={(() => {
                            return getDateStringByTimeString(
                              date.endTime
                            ).toISOString()
                          })()}
                          onChange={val => {
                            const formattedTime = dayjs(val).format('HH:mm')
                            updateLessonDateEndTime(date, formattedTime)
                          }}
                        />
                        <IconButton
                          plain
                          size="medium"
                          color="warn"
                          onClick={() => {
                            handleDeleteLessonDate(date)
                          }}
                          icon={<CgPlayListRemove />}
                        />
                      </Box>
                    )
                  })
                ) : (
                  <div className="bg-background-layer-3 rounded-md w-full p-3 text-sm">
                    {t('teachingService:class.notHaveTimeslot')}
                  </div>
                )}
              </Box>
              <div
                className="flex gap-2 items-center"
                data-testid={`add-time-button-${obj}`}
              >
                <IconButton
                  id={obj}
                  onClick={() => openModal(index)}
                  plain
                  icon={<IoMdAdd />}
                  color="primary"
                />
              </div>
            </Box>

            <AddTimeModal
              ref={addAvailabilityModalHandle}
              currentAvailability={currentAvailability}
              append={append}
            />
          </Box>
        )
      })}
      {[
        UserRole.MasterAdmin,
        UserRole.SiteAdmin,
        UserRole.SchoolAdmin,
      ].includes(userPermission) && (
        <div className="mt-4">
          <ApplyToClass
            ref={applyToClassHandle}
            data={currentAvailability}
            refetchAvailability={refetchAvailability}
          />
        </div>
      )}
    </div>
  )
}

export default WeekdayList
