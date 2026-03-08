import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { Portal, Root } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { IoIosArrowBack } from 'react-icons/io'

import Box from '@/components/Containers/Box'
import SvgIcon from '@/components/Images/SvgIcon'
import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import useSchoolData from '@/hooks/useSchoolData'
import useStudentCRMData from '@/hooks/useStudentCRMData'
import LabelPrint from '@/pages/StudentCRM/Label/LabelPrint'
import QRCodeAttendance from '@/pages/StudentCRM/QRCode/QRCodeAttendance'
import QRCodeScan from '@/pages/StudentCRM/QRCode/QRCodeScan'
import { QRCodeStudentAttendanceData } from '@/types/student'

export type QRCodeAttendanceModalHandle = {
  handleOpenChange: () => void
  setStep: (step: number) => void
  getStudentLessonByUser: (userId: number) => void
}

const QRCodeAttendanceModal = forwardRef<QRCodeAttendanceModalHandle>(
  (props, ref) => {
    const [open, setOpen] = useState<boolean>(false)
    const [qrCodeStudentAttendanceData, setQrCodeStudentAttendanceData] =
      useState<QRCodeStudentAttendanceData[]>([])
    const [step, setStep] = useState<number>(1)

    const { currentSchool } = useSchoolData()

    const [selectedLessonPrintIndex, setSelectedLessonPrintIndex] = useState<
      number | undefined
    >()

    const { t } = useTranslation()

    const handleOpenChange = () => {
      setOpen(!open)
      setStep(1)
    }

    const { useGetCurrentStudentQrCodeAttendanceData } = useStudentCRMData()

    const { mutate: getAttendanceData } =
      useGetCurrentStudentQrCodeAttendanceData(
        currentSchool?.id ?? 0,
        setQrCodeStudentAttendanceData
      )

    const getStudentLessonByUser = async (userId: number) => {
      getAttendanceData(userId)
    }

    useImperativeHandle(ref, () => ({
      handleOpenChange,
      setStep,
      getStudentLessonByUser,
    }))

    const renderStepContent = (step: number) => {
      switch (step) {
        case 1:
          return (
            <>
              <QRCodeScan
                setStep={setStep}
                setQrCodeStudentAttendanceData={setQrCodeStudentAttendanceData}
              />
            </>
          )
        case 2:
          return (
            <>
              <QRCodeAttendance
                setStep={setStep}
                qrCodeStudentAttendanceData={qrCodeStudentAttendanceData}
                setSelectedLessonPrintIndex={setSelectedLessonPrintIndex}
              />
            </>
          )

        case 3:
          if (selectedLessonPrintIndex !== undefined)
            return (
              <>
                <LabelPrint
                  labelData={
                    qrCodeStudentAttendanceData[selectedLessonPrintIndex]
                  }
                  onBack={() => {
                    setStep(1)
                  }}
                />
              </>
            )
          return <>{selectedLessonPrintIndex}</>

        default:
          return <></>
      }
      return null
    }

    return (
      <Root open={open} onOpenChange={handleOpenChange}>
        {/* <Trigger asChild> */}
        {/*  <Button hidden={hidden} variants="plain" iconBefore={<FiEdit />}> */}
        {/*    {t('teachingService:class.editPhase')} */}
        {/*  </Button> */}
        {/* </Trigger> */}
        <Portal>
          <StyledOverlay />
          <StyledContent
            style={{
              height: 'auto',
              maxHeight: '100%',
              width: '100%',
              padding: '$4 $4',
            }}
          >
            <Box justify="flex-start">
              {step !== 1 && (
                <>
                  {' '}
                  <SvgIcon
                    css={{ cursor: 'pointer' }}
                    // baseColor={theme.colors.primary.toString()}
                    onClick={() => {
                      setStep(
                        ((prevStep: number) =>
                          prevStep - 1) as unknown as number
                      )
                    }}
                  >
                    <IoIosArrowBack />
                  </SvgIcon>
                </>
              )}

              <Text
                size="mediumLarge"
                css={{ padding: '$small 0', width: '100%' }}
                align="left"
              >
                {step === 1
                  ? t('student:qrCodeAttendance.scanQrCode')
                  : t('student:qrCodeAttendance.attendance')}
              </Text>
            </Box>

            <Separator />
            {renderStepContent(step)}

            <ModalCloseButton />
          </StyledContent>
        </Portal>
      </Root>
    )
  }
)

export default QRCodeAttendanceModal
