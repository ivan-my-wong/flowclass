import { forwardRef, useEffect, useState } from 'react'

import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
} from 'date-fns'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FiEdit } from 'react-icons/fi'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import { TextInput } from '@/components/Inputs/TextInput'
import Modal from '@/components/Popups/Modal'
import DurationUnitSelector from '@/components/Selector/DurationUnitSelector'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import { defaultRepeatFormat } from '@/constants/course'
import { RegularPeriods } from '@/types/classes'
import dayjs from '@/utils/dayjs'
import {
  addDaysToDate,
  addMinutesToDate,
  addMonthsToDate,
} from '@/utils/timeFormat'

type EditPeriodModalProps = {
  hidden?: boolean
  triggerButton?: JSX.Element
  periodData: RegularPeriods
  handlePeriodDataSubmit: (periodData: RegularPeriods) => void
}

export type EditPeriodModalHandle = {
  handleOpenChange: () => void
}

const EditPeriodModal = forwardRef<EditPeriodModalHandle, EditPeriodModalProps>(
  ({ hidden, periodData, handlePeriodDataSubmit, triggerButton }) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm()

    const [open, setOpen] = useState<boolean>(false)
    const [copiedPeriodData, setCopiedPeriodData] =
      useState<RegularPeriods>(periodData)

    const [startDate, setStartDate] = useState<string>(new Date().toISOString())
    const [endDate, setEndDate] = useState<string>(new Date().toISOString())

    const [finishStartDate, setFinishStartDate] = useState<string>(
      dayjs().add(1, 'days').add(1, 'months').toISOString()
    )
    const [finishEndDate, setFinishEndDate] = useState<string>(
      new Date().toISOString()
    )

    const { t } = useTranslation(['teachingService'])

    useEffect(() => {
      setCopiedPeriodData(periodData)
      const lessonArray = periodData?.lessons ?? []
      const finishLessonArray = periodData?.lessons ?? []
      const formattedFinishDate = finishLessonArray[0]?.startTime
      setStartDate(
        lessonArray && lessonArray.length > 0
          ? dayjs(formattedFinishDate).add(1, 'weeks').toISOString()
          : dayjs().add(1, 'd').toISOString()
      )
      setEndDate(
        lessonArray && lessonArray.length > 0
          ? addMinutesToDate(
              dayjs(formattedFinishDate).add(1, 'weeks').toISOString(),
              periodData.duration
            )
          : addMinutesToDate(
              dayjs().add(1, 'd').toISOString(),
              periodData.duration
            )
      )

      setFinishStartDate(
        finishLessonArray && finishLessonArray.length > 0
          ? dayjs(formattedFinishDate)
              .add(1, 'weeks')
              .add(1, 'days')
              .add(1, 'months')
              .toISOString()
          : dayjs().add(1, 'days').add(1, 'months').toISOString()
      )
      setFinishEndDate(
        finishLessonArray && finishLessonArray.length > 0
          ? addMinutesToDate(
              dayjs(formattedFinishDate)
                .add(1, 'weeks')
                .add(1, 'days')
                .add(1, 'months')
                .toISOString(),
              periodData.duration
            )
          : addMinutesToDate(
              dayjs().add(1, 'days').add(1, 'months').toISOString(),
              periodData.duration
            )
      )
    }, [periodData])

    const onSubmit = (data: FieldValues) => {
      const { every } = data
      const { repeatFormat } = copiedPeriodData
      if (!every) {
        handlePeriodDataSubmit(copiedPeriodData)
      } else {
        const dateArray: string[] = []
        const parsedStartDate = new Date(startDate)
        const parsedFinishStartDate = new Date(finishStartDate)
        let times = 0
        if (repeatFormat?.unit === 'days') {
          const totalDays = differenceInDays(
            parsedFinishStartDate,
            parsedStartDate
          )
          times = Math.floor(totalDays / every) + 1
        } else if (repeatFormat?.unit === 'weeks') {
          const totalWeeks = differenceInWeeks(
            parsedFinishStartDate,
            parsedStartDate
          )
          times = Math.floor(totalWeeks / every) + 1
        } else if (repeatFormat?.unit === 'months') {
          const totalMonths = differenceInMonths(
            parsedFinishStartDate,
            parsedStartDate
          )
          times = Math.floor(totalMonths / every) + 1
        }

        for (let offset = 0; offset < times; offset += 1) {
          let newStartDate = addDaysToDate(startDate, every * offset)
          if (repeatFormat?.unit === 'weeks') {
            newStartDate = addDaysToDate(startDate, every * 7 * offset)
          } else if (repeatFormat?.unit === 'months') {
            newStartDate = addMonthsToDate(startDate, every * offset)
          }
          dateArray.push(
            `${newStartDate} ${addMinutesToDate(
              newStartDate,
              copiedPeriodData.duration
            )}`
          )
        }

        const newPeriodData = {
          ...copiedPeriodData,
          period: {
            ...copiedPeriodData,
            lessons: dateArray,
          },
        }
        handlePeriodDataSubmit(newPeriodData)
      }
      setOpen(false)
    }

    return (
      <Modal
        open={open}
        onOpenChange={() => {
          setOpen(!open)
        }}
        trigger={
          triggerButton ?? (
            <Button hidden={hidden} variants="plain" iconBefore={<FiEdit />}>
              {t('teachingService:class.editPhase')}
            </Button>
          )
        }
      >
        <Box direction="column" align="flex-start" justify="flex-start">
          <Modal.Title>
            {t(`teachingService:class.editPeriod`)} - {copiedPeriodData.name}
          </Modal.Title>
          <Separator />

          <Box
            responsive
            align="center"
            css={{ '@sm': { alignItems: 'flex-start' } }}
          >
            <Text
              bold
              css={{
                flexShrink: 0,
                marginRight: '$12',
                '@md': { marginRight: 'unset' },
              }}
            >
              {t('teachingService:class.startingLesson')}
            </Text>

            <Box responsive>
              <CustomDatePicker
                showTimeSelect
                timeIntervals={5}
                dateFormat="dd/MM/yyyy (EEE) hh:mm aa"
                selectedDate={startDate}
                onChange={date => {
                  if (date) {
                    setStartDate(date.toISOString())
                    setEndDate(
                      addMinutesToDate(date.toISOString(), periodData.duration)
                    )
                  }
                }}
              />
              <Text> - </Text>
              <CustomDatePicker
                type="end"
                // dateFormat="dd/MM/yy (EEE) h:mm aa"
                dateFormat="dd/MM/yyyy (EEE) hh:mm aa"
                selectedDate={endDate}
                onChange={() => {}}
              />
            </Box>
          </Box>

          {copiedPeriodData.repeatFormat?.repeat && (
            <Box
              responsive
              align="center"
              css={{ '@sm': { alignItems: 'flex-start' } }}
            >
              <Text
                bold
                css={{
                  flexShrink: 0,
                  marginRight: '$12',
                  '@md': { marginRight: 'unset' },
                }}
              >
                {t('teachingService:class.EndingLesson')}
              </Text>

              <Box responsive>
                <CustomDatePicker
                  showTimeSelect
                  timeIntervals={5}
                  dateFormat="dd/MM/yyyy (EEE) hh:mm aa"
                  selectedDate={finishStartDate}
                  onChange={date => {
                    if (date) {
                      setFinishStartDate(date.toISOString())
                      setFinishEndDate(
                        addMinutesToDate(
                          date.toISOString(),
                          periodData.duration
                        )
                      )
                    }
                  }}
                />
                <Text> - </Text>
                <CustomDatePicker
                  type="end"
                  // dateFormat="dd/MM/yy (EEE) h:mm aa"
                  dateFormat="dd/MM/yyyy (EEE) hh:mm aa"
                  selectedDate={finishEndDate}
                  onChange={() => {}}
                />
              </Box>
            </Box>
          )}

          <Separator />

          <Box
            justify="space-between"
            responsive
            css={{
              '@sm': {
                gap: '$6',
                alignItems: 'flex-start',
              },
            }}
          >
            {copiedPeriodData.repeatFormat?.repeat && (
              <Box
                responsive
                justify="flex-end"
                css={{ '@sm': { alignItems: 'flex-start' } }}
              >
                <Box css={{ width: '210px' }}>
                  <Text>{t(`teachingService:class.every`).toLowerCase()}</Text>
                  <TextInput
                    css={{ width: '50px' }}
                    value={copiedPeriodData.repeatFormat?.every}
                    id="every"
                    type="number"
                    isError={!!errors.every}
                    {...register('every', {
                      required: t('login:errors.required') as string,
                      validate: {
                        positive: (value: string) =>
                          parseInt(value, 10) > 0 ||
                          (t('login:errors.positive') as string),
                      },
                      onChange: e => {
                        setCopiedPeriodData({
                          ...copiedPeriodData,

                          repeatFormat: {
                            ...(copiedPeriodData.repeatFormat ??
                              defaultRepeatFormat),
                            every: parseInt(e.target.value, 10),
                          },
                        })
                      },
                    })}
                  />
                  <DurationUnitSelector
                    currentSelect={
                      copiedPeriodData.repeatFormat?.unit ??
                      defaultRepeatFormat.unit
                    }
                    onValueChange={(value: any) => {
                      setCopiedPeriodData({
                        ...copiedPeriodData,

                        repeatFormat: {
                          ...(copiedPeriodData.repeatFormat ??
                            defaultRepeatFormat),
                          unit: value,
                        },
                      })
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>

          <Modal.Close asChild onClick={handleSubmit(onSubmit)}>
            <Button
              css={{
                width: 'fit-content',
                alignSelf: 'flex-end',
                marginTop: 'auto',
              }}
            >
              {t(`enrollment.enrollmentModal.confirm`)}
            </Button>
          </Modal.Close>
        </Box>
      </Modal>
    )
  }
)

export default EditPeriodModal
