import { t } from 'i18next'
import { IoMdInformationCircle } from 'react-icons/io'

import AlertBox from '@/components/Boxes/AlertBox'
import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import LabelInput from '@/components/Inputs/LabelInput'
import Spacer from '@/components/Separators/Spacer'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import useSiteData from '@/hooks/useSiteData'
import { styled } from '@/styles'
import { Course } from '@/types/course'

interface RecruitmentProps {
  currentCourse: Course
  setCurrentCourse: (course: Course) => void
  setUnSavedChanges: (value: boolean) => void
}

const Recruitment = ({
  currentCourse,
  setCurrentCourse,
  setUnSavedChanges,
}: RecruitmentProps): JSX.Element => {
  const { convertDateToCurrentTimeZoneUTCString } = useSiteData()

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return
    const startTime = convertDateToCurrentTimeZoneUTCString(date)
    if (!startTime) return
    setCurrentCourse({
      ...currentCourse,
      recruitStart: startTime,
    })
    setUnSavedChanges(true)
  }

  const handleEndDateChange = (date: Date | null) => {
    if (!date) return
    const endTime = convertDateToCurrentTimeZoneUTCString(date)
    if (!endTime) return
    setCurrentCourse({
      ...currentCourse,
      recruitEnd: endTime,
    })
    setUnSavedChanges(true)
  }

  return (
    <StyledBox>
      <Box css={{ justifyContent: 'space-between' }}>
        <Heading>{t(`teachingService:tabBar.recruitment`)}</Heading>
        {/* <SaveButton /> */}
      </Box>

      <Box>
        <AlertBox
          size="small"
          icon={<IoMdInformationCircle />}
          content={t('teachingService:recruitment.recruitmentTitle').toString()}
        />
      </Box>

      <Box
        direction="row"
        justify="flex-start"
        responsive
        css={{ maxWidth: '100%', gap: '$8', '@md': { gap: '$2' } }}
      >
        <LabelInput label={t('teachingService:recruitment.startTime')}>
          <CustomDatePicker
            showTimeSelect
            selectedDate={currentCourse?.recruitStart}
            dateFormat="dd/MM/yyyy (EEE) hh:mm aa"
            onChange={handleStartDateChange}
          />
        </LabelInput>
        <Text size="large" bold>
          -
        </Text>
        <LabelInput label={t('teachingService:recruitment.endTime')}>
          <CustomDatePicker
            showTimeSelect
            selectedDate={currentCourse.recruitEnd}
            dateFormat="dd/MM/yyyy (EEE) hh:mm aa"
            onChange={handleEndDateChange}
          />
        </LabelInput>
        <Button
          variants="outlined"
          onClick={() => {
            setCurrentCourse({
              ...currentCourse,
              recruitStart: null,
              recruitEnd: null,
            })
            setUnSavedChanges(true)
          }}
        >
          {t('teachingService:recruitment.unsetButton')}
        </Button>
      </Box>
      <Spacer space="y1" />
    </StyledBox>
  )
}

const StyledBox = styled(Box, {
  display: 'flex',
  flexDirection: 'column !important',
  backgroundColor: '$backgroundLayer2',
  padding: '$4 !important',
  borderRadius: '$medium',
})

export default Recruitment
