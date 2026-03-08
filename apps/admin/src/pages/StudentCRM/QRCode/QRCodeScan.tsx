import React, { useCallback, useState } from 'react'

import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'
import { useTranslation } from 'react-i18next'
import { IoMdInformationCircle } from 'react-icons/io'
import { toast } from 'sonner'

import AlertBox from '@/components/Boxes/AlertBox'
import Box from '@/components/Containers/Box'
import useStudentData from '@/hooks/useStudentData'

export type QRCodeAttendanceDto = {
  enrollCourseId: number
  applicantId: number
  studentLessonIds: number[]
  invoiceId: number
}

const QRCodeScan = ({
  setStep,
  setQrCodeStudentAttendanceData,
}: {
  setStep: (val: number) => void
  setQrCodeStudentAttendanceData: (val: any) => void
}): React.ReactElement => {
  const { t } = useTranslation()
  const [qrCodeData, setQrCodeData] = useState<QRCodeAttendanceDto>()
  const [isScanning, setIsScanning] = useState(true)
  const { useFetchStudentEnrollLessonsForScanning } = useStudentData()

  const fetchSuccessfulCallback = (data: any) => {
    setStep(((prevStep: number) => prevStep + 1) as unknown as number)
    setQrCodeStudentAttendanceData(data)
  }

  const getStudentLessonsForScanning = useFetchStudentEnrollLessonsForScanning(
    fetchSuccessfulCallback,
    () => {
      toast.error(t('student:qrCodeAttendance.error.wrongContent'))
      resetScanner()
    }
  )

  const resetScanner = useCallback(() => {
    setQrCodeData(undefined)
    setIsScanning(false)
    // Force a re-render of the scanner by toggling isScanning
    setTimeout(() => setIsScanning(true), 100)
  }, [])

  const checkQrCodeValid = (codeResult: IDetectedBarcode) => {
    if (codeResult.format !== 'qr_code') {
      toast.error(t('student:qrCodeAttendance.error.wrongCodeFormat'))
      return false
    }

    try {
      const jsonData = JSON.parse(codeResult.rawValue)

      if (!jsonData.studentLessonIds) {
        toast.error(t('student:qrCodeAttendance.error.wrongContent'))
        return false
      }
      if (typeof jsonData.invoiceId !== 'number') {
        toast.error(t('student:qrCodeAttendance.error.wrongContent'))
        return false
      }
    } catch (error) {
      toast.error(t('student:qrCodeAttendance.error.wrongContent'))
      return false
    }

    return true
  }

  return (
    <Box
      direction="column"
      css={{ width: '100%' }}
      className="h-dvh justify-start"
    >
      <Box css={{ width: '100%' }}>
        <AlertBox
          icon={<IoMdInformationCircle size="24px" />}
          content={t('student:qrCodeAttendance.grantAccess')}
          css={{ fontWeight: 500 }}
        />
      </Box>

      <div style={{ width: '50%' }}>
        {isScanning && (
          <Scanner
            onScan={result => {
              try {
                if (
                  result[0] &&
                  checkQrCodeValid(result[0]) &&
                  result[0].rawValue
                ) {
                  setQrCodeData(
                    JSON.parse(result[0].rawValue) as QRCodeAttendanceDto
                  )
                  const jsonData = JSON.parse(result[0].rawValue)
                  getStudentLessonsForScanning.mutate(
                    {
                      studentLessonIds: jsonData?.studentLessonIds,
                      invoiceId: +jsonData?.invoiceId,
                    },
                    {
                      onError: () => {
                        resetScanner()
                      },
                    }
                  )
                }
              } catch (error) {
                console.error('QR Code scan error:', error)
                resetScanner()
              }
            }}
            components={{ zoom: true }}
            allowMultiple={false}
            scanDelay={1000}
            onError={error => {
              console.error('Scanner error:', error)
              resetScanner()
            }}
          />
        )}
      </div>
    </Box>
  )
}

export default QRCodeScan
