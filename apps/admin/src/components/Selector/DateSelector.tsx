import { forwardRef, useImperativeHandle, useState } from 'react'

import { Content, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { DatePickerProps } from 'react-datepicker'
import { useTranslation } from 'react-i18next'

import useSiteData from '@/hooks/useSiteData'
import { cn } from '@/utils/cn'

import Button from '../Buttons/Button'
import CustomDatePicker from '../DatePickers/DatePicker'
import { StyledOverlay } from '../Popups/Modal'
import ModalCloseButton from '../Popups/ModalCloseButton'
import Separator from '../Separators/Separator'

type DateSelectorProps = Omit<
  DatePickerProps,
  'onChange' | 'showMonthYearDropdown' | 'selectsRange' | 'selectsMultiple'
> & {
  hidden?: boolean
  successCallback: (date: string) => void
}

export type DateSelectorHandle = {
  handleOpenChange: () => void
}

const DateSelector = forwardRef<DateSelectorHandle, DateSelectorProps>(
  ({ hidden, successCallback, ...props }, ref) => {
    const [open, setOpen] = useState<boolean>(false)
    const [date, setDate] = useState<string>(new Date().toISOString())

    const { convertDateToCurrentTimeZoneUTCString } = useSiteData()

    const { t } = useTranslation()

    const handleOpenChange = () => {
      setOpen(!open)
    }

    useImperativeHandle(ref, () => ({
      handleOpenChange,
    }))

    const handleButtonClick = () => {
      successCallback(date)
    }

    return (
      <Root open={open} onOpenChange={handleOpenChange}>
        <Trigger asChild>
          <Button className={hidden ? 'hidden' : ''}>
            {t(`school:addSchool`)}
          </Button>
        </Trigger>
        <Portal>
          <StyledOverlay />

          <Content
            className={cn(
              'flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'max-w-[90%] min-w-[50%] md:min-w-[90%] max-h-[90vh] overflow-y-auto',
              'rounded-lg p-4 bg-background z-[1050]',
              'data-[state=open]:animate-dialog-content data-[state=closed]:animate-none',
              '[&_.react-datepicker__day]:w-16 [&_.react-datepicker__day-name]:w-16',
              'md:[&_.react-datepicker__day]:w-6 md:[&_.react-datepicker__day-name]:w-6'
            )}
          >
            <Title>{t(`component:dateSelector.title`)}</Title>
            <Separator className="mb-4" />
            <CustomDatePicker
              inline
              {...props}
              selectedDate={date}
              onChange={(date: Date | null) => {
                if (!date) return
                // typescript is not happy with this if setDate with convertDateToCurrentTimeZoneUTCString directly
                const dateString = convertDateToCurrentTimeZoneUTCString(date)
                if (!dateString) return
                setDate(dateString)
              }}
            />
            <Button
              className="mt-4 w-fit ml-auto h-12"
              onClick={handleButtonClick}
            >
              {t(`component:dateSelector.confirm`)}
            </Button>
            <ModalCloseButton />
          </Content>
        </Portal>
      </Root>
    )
  }
)

export default DateSelector
