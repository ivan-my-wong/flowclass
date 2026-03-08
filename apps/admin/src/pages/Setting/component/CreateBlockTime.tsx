import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'

import Box from '@/components/Containers/Box'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import Drawer from '@/components/Drawer/Drawer'
import { Button } from '@/components/ui/Button'
import useBlockTimeData from '@/hooks/useBlockTimeData'
import ContentLayout from '@/layouts/ContentLayout'

interface Props {
  open: boolean
  handleClose: () => void
}

const AddBlockTime = ({ open, handleClose }: Props) => {
  const { t } = useTranslation()
  const [isWholeDay, setIsWholeDay] = useState(false)

  const [selectedStartDate, setSelectedStartDate] = useState<Date>()
  const [selectedEndDate, setSelectedEndDate] = useState<Date>()
  const [invalidDate, setInvalidDate] = useState<boolean>(false)
  const { useCreateBlockTime, useFetchAllblockTimeData } = useBlockTimeData()
  const fetchLessonDataResult = useFetchAllblockTimeData()
  const { refetch } = fetchLessonDataResult
  const create = useCreateBlockTime()
  const handleCloseAndRemoveData = () => {
    setSelectedStartDate(undefined)
    setSelectedEndDate(undefined)
    setIsWholeDay(false)
    handleClose()
  }

  const createBlockTime = async () => {
    const startDate = selectedStartDate
      ? new Date(selectedStartDate)
      : new Date()
    const endDate = selectedEndDate ? new Date(selectedEndDate) : new Date()
    if (isWholeDay && selectedStartDate) {
      startDate.setHours(0)
      startDate.setMinutes(0)
      // setStartDate(startDate)
    }
    if (isWholeDay && selectedEndDate) {
      endDate.setHours(23)
      endDate.setMinutes(59)

      // setStartDate(startDate)
    }

    create
      .mutateAsync({
        wholeDay: isWholeDay,
        startTime: startDate,
        endTime: endDate,
      })
      .then(() => {
        handleCloseAndRemoveData()
        refetch()
      })
  }

  const rightHeaderContent = (
    <Box>
      <Button onClick={() => handleCloseAndRemoveData()} variant="ghost">
        {t('common:action.cancel')}
      </Button>
      <Button
        onClick={() => createBlockTime()}
        disabled={invalidDate || !selectedEndDate || !selectedStartDate}
      >
        {t('common:action.add')}
      </Button>
    </Box>
  )
  const handleSelectStartDate = (date: Date) => {
    const addMinutes = new Date(date.getTime() + 5 * 60000)
    if (!selectedEndDate) setSelectedEndDate(addMinutes)
    else if (selectedEndDate < date) setSelectedEndDate(addMinutes)

    setSelectedStartDate(date)
  }
  const handleSelectEndDate = (date: Date) => {
    if (selectedStartDate && date < selectedStartDate) {
      setInvalidDate(true)
    } else {
      setSelectedEndDate(date)
      setInvalidDate(false)
    }
  }
  return (
    <Drawer open={open}>
      <ContentLayout
        leftHeader={
          <div className="text-2xl">
            {t('setting:systemSettings.blockTimeSetting')}
          </div>
        }
        rightHeader={rightHeaderContent}
      >
        <Box direction="column">
          <Box
            direction="column"
            css={{
              background: 'white',
              borderRadius: '$1',
              marginTop: '$6',
            }}
          >
            <Box
              justify="space-between"
              css={{
                padding: '$2 $4',
                borderBottom: '1px solid $colors$textDisabled',
              }}
            >
              <Box justify="flex-start">
                {t('setting:systemSettings.start')}
              </Box>
              <Box
                css={{
                  color: !selectedStartDate ? '$textSubtle' : '$primary',
                }}
              >
                {/* This is the start date date picker */}
                <CustomDatePicker
                  minDate={new Date()}
                  selected={selectedStartDate}
                  showTimeSelect={!isWholeDay}
                  dateFormat="yyyy/MM/dd hh:mm aa"
                  onChange={(newValue: Date | null) => {
                    if (!newValue) return
                    handleSelectStartDate(newValue)
                  }}
                  selectedDate={null}
                />
              </Box>
            </Box>
            <Box justify="space-between" css={{ padding: '$2 $4' }}>
              <Box justify="flex-start">{t('setting:systemSettings.end')}</Box>
              <Box
                css={{
                  color: !selectedEndDate ? '$textSubtle' : '$primary',
                }}
              >
                {/* This is the end date date picker */}
                <CustomDatePicker
                  disabled={!selectedStartDate}
                  minDate={selectedStartDate}
                  timeIntervals={5}
                  selected={selectedEndDate}
                  showTimeSelect={!isWholeDay}
                  dateFormat="yyyy/MM/dd hh:mm aa"
                  onChange={(newValue: Date | null) => {
                    if (!newValue) return
                    handleSelectEndDate(newValue)
                  }}
                  selectedDate={null}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </ContentLayout>
    </Drawer>
  )
}

export default AddBlockTime
