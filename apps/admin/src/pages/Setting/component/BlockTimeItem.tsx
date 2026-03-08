import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'

import DeleteIcon from '@/assets/svgs/DeleteIcon'
import EditIcon from '@/assets/svgs/EditIcon'
import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import SvgIcon from '@/components/Images/SvgIcon'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import Text from '@/components/Texts/Text'
import useBlockTimeData from '@/hooks/useBlockTimeData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { BlockTime } from '@/types/settingBlockTime'
import { formatTs } from '@/utils/timeFormat'

interface Props {
  data: BlockTime
  isEditable?: boolean
}

const BlockTimeItem = ({ data, isEditable = true }: Props) => {
  const { t } = useTranslation()
  const [showEdit, setShowEdit] = useState<boolean>(false)
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const [isWholeDay, setIsWholeDay] = useState(false)
  const [selectedStartDate, setSelectedStartDate] = useState<Date>()
  const [selectedEndDate, setSelectedEndDate] = useState<Date>()
  const [invalidDate, setInvalidDate] = useState<boolean>(true)
  const { useDeleteBlockTime, useUpdateBlockTime, useFetchAllblockTimeData } =
    useBlockTimeData()
  const updateBlockTime = useUpdateBlockTime(data.id)
  const deletBlockTime = useDeleteBlockTime()
  const fetchBlockTimeRsult = useFetchAllblockTimeData()
  const { refetch } = fetchBlockTimeRsult

  const handleClearData = () => {
    setSelectedStartDate(undefined)
    setSelectedEndDate(undefined)
    setIsWholeDay(false)
  }
  const handleDelete = () => {
    if (data) {
      deletBlockTime.mutateAsync(data.id).then(() => {
        refetch()
      })
      handleClearData()
    }
  }

  const handleEdit = () => {
    if (!showEdit) {
      setShowEdit(true)
      setSelectedStartDate(new Date(data.startTime))
      setSelectedEndDate(new Date(data.endTime))
      setIsWholeDay(data.wholeDay)
    } else {
      setShowEdit(false)
      handleClearData()
    }
  }
  const handleUpdate = () => {
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
    if (data.id) {
      updateBlockTime
        .mutateAsync({
          startTime: startDate,
          endTime: endDate,
          wholeDay: isWholeDay,
        })
        .then(() => refetch())
      setShowEdit(false)
      handleClearData()
    }
  }
  const handleSelectStartDate = (date: Date) => {
    if (selectedEndDate && date > selectedEndDate) {
      const endDate = new Date(date)
      endDate.setHours(
        selectedEndDate.getHours(),
        selectedEndDate.getMinutes(),
        selectedEndDate.getSeconds()
      )
      setSelectedEndDate(endDate)
    }
    setSelectedStartDate(date)
    setInvalidDate(false)
  }
  const handleSelectEndDate = (date: Date) => {
    if (selectedStartDate && date < selectedStartDate) {
      const startDate = new Date(date)
      startDate.setHours(
        selectedStartDate.getHours(),
        selectedStartDate.getMinutes(),
        selectedStartDate.getSeconds()
      )
      setSelectedStartDate(startDate)
    }
    setSelectedEndDate(date)
    setInvalidDate(false)
  }
  return (
    <>
      <div className="box-row-full justify-between items-center bg-background-layer-2 p-4 rounded-lg">
        <div className="box-col-full items-start">
          {!data.wholeDay ? (
            <p className="text-md">
              {`${formatTs(
                data.startTime.toString(),
                'DD/MM/YYYY hh:mm A'
              )} - ${formatTs(data.endTime.toString(), 'DD/MM/YYYY hh:mm A')}`}
            </p>
          ) : (
            <p className="text-md">
              {`${formatTs(
                data.startTime.toString(),
                'DD/MM/YYYY'
              )} - ${formatTs(data.endTime.toString(), 'DD/MM/YYYY')}`}
            </p>
          )}
        </div>
        {isEditable && (
          <Box justify="flex-end" gap="large" css={{ width: '30%' }}>
            <SvgIcon css={{ cursor: 'pointer' }} onClick={() => handleEdit()}>
              <EditIcon fill="#808080" />
            </SvgIcon>
            <SvgIcon
              css={{ cursor: 'pointer' }}
              onClick={() => setShowConfirmPopup(true)}
            >
              <DeleteIcon fill="#F87575" />
            </SvgIcon>
          </Box>
        )}

        <CustomedAlertDialog
          open={showConfirmPopup}
          setOpen={setShowConfirmPopup}
          description={t('setting:systemSettings:descriptionDeleteBlockTime')}
          title={`${t('setting:systemSettings.titleDeleteDialog')}`}
          alertType={AlertTypes.WARN}
          cancelText={t('common:action:cancel') as string}
          actionText={t('common:action:confirm') as string}
          onActionClick={handleDelete}
        />
      </div>
      {showEdit && (
        <Box
          direction="column"
          css={{
            background: 'white',
            borderRadius: '$1',
          }}
        >
          <Box
            justify="space-between"
            css={{
              padding: '$2 $4',
              borderBottom: '1px solid $colors$textDisabled',
            }}
          >
            <Box justify="flex-start">{t('setting:systemSettings.start')}</Box>
            <Box
              css={{
                color: !selectedStartDate ? '$textSubtle' : '$primary',
              }}
            >
              <CustomDatePicker
                minDate={new Date()}
                // maxDate={selectedEndDate}
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
          <Box
            justify="space-between"
            css={{
              padding: '$2 $4',
              borderBottom: '1px solid $colors$textDisabled',
            }}
          >
            <Box justify="flex-start">{t('setting:systemSettings.end')}</Box>
            <Box
              css={{
                color: !selectedEndDate ? '$textSubtle' : '$primary',
              }}
            >
              <CustomDatePicker
                selected={selectedEndDate}
                disabled={!selectedStartDate}
                minDate={selectedStartDate}
                showTimeSelect={!isWholeDay}
                dateFormat="yyyy/MM/dd hh:mm aa"
                selectedDate={null}
                onChange={(newValue: Date | null) => {
                  if (!newValue) return
                  handleSelectEndDate(newValue)
                }}
              />
            </Box>
          </Box>
          <Box justify="flex-end" css={{ padding: '$2 $4' }}>
            <Button
              onClick={() => handleUpdate()}
              disabled={invalidDate || !selectedEndDate || !selectedStartDate}
            >
              {t('common:action.update')}
            </Button>
          </Box>
        </Box>
      )}
    </>
  )
}

export default BlockTimeItem
