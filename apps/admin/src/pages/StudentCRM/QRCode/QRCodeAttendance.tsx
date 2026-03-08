import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { TiTick } from 'react-icons/ti'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import Text from '@/components/Texts/Text'
import { AttendanceStatus } from '@/constants/course'
import useStudentData from '@/hooks/useStudentData'
import { QRCodeStudentAttendanceData } from '@/types/student'
import { calculateLessonFormatAndDuration } from '@/utils/timeString'

const QRCodeAttendance = ({
  setStep,
  qrCodeStudentAttendanceData,
  setSelectedLessonPrintIndex,
}: {
  setStep: Dispatch<SetStateAction<number>>
  qrCodeStudentAttendanceData: QRCodeStudentAttendanceData[]
  setSelectedLessonPrintIndex: Dispatch<SetStateAction<number | undefined>>
}): React.ReactElement => {
  const { t } = useTranslation()
  const { useStudentTakeAttendance } = useStudentData()
  const [studentLessonData, setStudentLessonData] = useState<
    QRCodeStudentAttendanceData[]
  >(qrCodeStudentAttendanceData)

  useEffect(() => {
    setStudentLessonData(qrCodeStudentAttendanceData)
  }, [qrCodeStudentAttendanceData])

  const handleSuccessResult = (res: any) => {
    const updatedData = studentLessonData.map(
      data =>
        data.studentLesson.id === res.id
          ? {
              ...data,
              studentLesson: res, // Update the studentLesson object
            }
          : data // Return the original object if id doesn't match
    )

    setStudentLessonData(updatedData)
    toast.success(t('student:qrCodeAttendance.successMarkAttendance'))
  }
  const takeAttendance = useStudentTakeAttendance(handleSuccessResult)

  return (
    <div className="box-col-full">
      <Text className="py-2 w-full" align="left" size="medium">
        {t('student:teachingService.studentName')}:{' '}
        {studentLessonData[0]?.name ?? ''}
      </Text>
      <Text align="left" className="py-1 w-full" size="medium">
        {t('student:qrCodeAttendance.selectLesson')}
      </Text>

      {studentLessonData.map((data, index) => {
        return (
          <div className="box-col-full" key={data.studentLesson.id}>
            <div className="box-col-full p-4 bg-background-layer-2">
              <div className="box-row-full justify-between px-4 ">
                <Text>
                  {data.courseName} ({t('student:class')}: {data.className})
                </Text>
                <Text>
                  {
                    calculateLessonFormatAndDuration(
                      data.studentLesson.startTime ?? '',
                      data.studentLesson.endTime ?? ''
                    )[0]
                  }
                </Text>
              </div>
              <div className="box-col-full justify-between px-4 sm:box-row-full">
                <Button
                  css={{
                    width: '100%',
                    padding: '$small',
                  }}
                  color={
                    data.studentLesson.attendance === AttendanceStatus.ATTENDED
                      ? 'success'
                      : undefined
                  }
                  onClick={() => {
                    takeAttendance.mutate({
                      studentLessonId: Number(data.studentLesson.id),
                      attendance: AttendanceStatus.ATTENDED,
                    })
                  }}
                >
                  {data.studentLesson.attendance ===
                  AttendanceStatus.ATTENDED ? (
                    <>
                      <TiTick /> {t('student:qrCodeAttendance.attended')}
                    </>
                  ) : (
                    t('student:qrCodeAttendance.confirmAttendance')
                  )}
                </Button>
                <Button
                  css={{ width: '100%', padding: '$small' }}
                  onClick={() => {
                    setSelectedLessonPrintIndex(index)
                    setStep((prevStep: number) => prevStep + 1)
                  }}
                >
                  {t('student:qrCodeAttendance.printLabel')}
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default QRCodeAttendance
