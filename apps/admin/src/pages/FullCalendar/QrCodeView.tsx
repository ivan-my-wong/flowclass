import { useCallback, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { QRCodeCanvas } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { LuMail, LuPhone } from 'react-icons/lu'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import Text from '@/components/ui/Text'
import { DATE_TIME_AM_FORMAT } from '@/constants/dateTimeFormat'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import { downloadStringAsFile } from '@/utils/download.utils'
import { formatTime } from '@/utils/timeFormat'

const QrCodeView = (): React.ReactElement => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [searchParams] = useSearchParams()

  const studentLessonId = Number(searchParams.get('studentLessonId'))

  const { useGetLessonProofToken } = useLessonDateTimeData()

  const { data: payloadQrCode, isLoading: isLoadingPayload } =
    useGetLessonProofToken(studentLessonId)

  const studentData = payloadQrCode?.studentData
  const applicationData = payloadQrCode?.applicationData
  const qrCodeData = useMemo(() => {
    return {
      studentLessonIds: payloadQrCode?.studentLessonIds,
      enrollCourseId: payloadQrCode?.enrollCourseId,
      applicantId: payloadQrCode?.applicantId,
      invoiceId: payloadQrCode?.invoiceId,
    }
  }, [payloadQrCode])
  const onSVGButtonClick = useCallback(() => {
    const node = canvasRef.current
    if (node == null) {
      return
    }
    if (!studentData || !payloadQrCode) return
    // For canvas, we just extract the image data and send that directly.
    const dataURI = node.toDataURL('image/png')
    downloadStringAsFile(
      dataURI,
      `${studentData.name}-${payloadQrCode.studentLessonIds[0]}.png`
    )
  }, [studentData, payloadQrCode])

  return (
    <ModalDialog
      title={t('lessonDateTime:viewQrCode') as string}
      open
      onOpenChange={() => navigate(-1)}
      classBody="py-4"
      footer={
        <Button className="w-full" onClick={onSVGButtonClick}>
          {t('lessonDateTime:downloadQrCode')}
        </Button>
      }
    >
      <Box>
        <Box direction="col" justify="start" align="start">
          <Box direction="col" justify="start" align="start">
            <Text className="font-extrabold text-xl">
              {applicationData?.courseName}
            </Text>
            <Text>{applicationData?.className}</Text>
            {applicationData && (
              <Text>
                {formatTime(applicationData.startTime, DATE_TIME_AM_FORMAT)} -{' '}
                {formatTime(applicationData.endTime, DATE_TIME_AM_FORMAT)}
              </Text>
            )}
          </Box>

          {studentData && (
            <Box direction="col" justify="start" align="start">
              <Text className="font-extrabold text-xl">{studentData.name}</Text>
              <Text className="flex gap-x-2 items-center">
                <LuMail />
                {studentData.email}
              </Text>
              <Text className="flex gap-x-2 items-center">
                <LuPhone />+{studentData.phone}
              </Text>
            </Box>
          )}
        </Box>
        <Box>
          {isLoadingPayload ? (
            <SkeletonLoader className="h-40 w-40" />
          ) : (
            <QRCodeCanvas
              ref={canvasRef}
              size={192}
              level="Q"
              className="!h-48 !w-48"
              value={JSON.stringify(qrCodeData)}
              // imageSettings={{
              //   src: flowClassIcon,
              //   excavate: true,
              //   height: 32,
              //   width: 32,
              // }}
            />
          )}
        </Box>
      </Box>
    </ModalDialog>
  )
}
export default QrCodeView
