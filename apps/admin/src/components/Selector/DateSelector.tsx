import { forwardRef, useImperativeHandle, useState } from 'react'

import { Content, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { DatePickerProps } from 'react-datepicker'
import { useTranslation } from 'react-i18next'

import useSiteData from '@/hooks/useSiteData'
import { keyframes, styled } from '@/styles'

import Button from '../Buttons/Button'
import CustomDatePicker from '../DatePickers/DatePicker'
import { StyledOverlay } from '../Popups/Modal'
import ModalCloseButton from '../Popups/ModalCloseButton'
import Separator from '../Separators/Separator'

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(.1)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
})

const StyledContent = styled(Content, {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$background',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90%',
  minWidth: '50%',
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: '$medium',
  padding: '$4',
  boxShadow: `$shadows[1]`,
  zIndex: '$modalContent',
  animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  '.react-datepicker__day': {
    width: '4rem',
  },
  '.react-datepicker__day-name': {
    width: '4rem',
  },
  '@sm': {
    minWidth: '90%',
    '.react-datepicker__day': {
      width: '1.5rem',
    },
    '.react-datepicker__day-name': {
      width: '1.5rem',
    },
  },
})

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
          <Button css={{ display: `${hidden ? 'none' : ''}` }}>
            {t(`school:addSchool`)}
          </Button>
        </Trigger>
        <Portal>
          <StyledOverlay />

          <StyledContent>
            <Title>{t(`component:dateSelector.title`)}</Title>
            <Separator css={{ marginBottom: '1rem' }} />
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
              css={{
                marginTop: '1rem',
                width: 'fit-content',
                marginLeft: 'auto',
                height: '3rem',
              }}
              onClick={handleButtonClick}
            >
              {t(`component:dateSelector.confirm`)}
            </Button>
            <ModalCloseButton />
          </StyledContent>
        </Portal>
      </Root>
    )
  }
)

export default DateSelector
