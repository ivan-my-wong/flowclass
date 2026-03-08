import Image from 'next/image'
import { useEffect, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { toDataURL } from 'qrcode'

import Button from '@/components/Buttons/Button'
import Modal from '@/components/Popups/Modal'
import { EnrolCourseResponse, PaymentState, StudentLesson } from '@/types/enrol'
import { InvoiceResponse } from '@/types/receipt'

export type QRCodeAttendanceDto = {
  enrollCourseId: number
  applicantId: number
  studentLessonIds: number[]
  invoiceId: number
}

const QRCodePopUp = ({ trigger, qrCodeUrl }: { trigger: React.ReactNode; qrCodeUrl: string }) => {
  return (
    <Modal trigger={trigger}>
      <Modal.Title>{''}</Modal.Title>
      <div className="box-col items-center justify-center">
        <Image src={qrCodeUrl} alt="QR Code" width={400} height={400} />
      </div>
    </Modal>
  )
}

const ApplicationQrCode = ({
  invoice,
  studentLessons,
  enrollmentDetail,
  applicantId,
  applicantName,
}: {
  invoice: InvoiceResponse
  studentLessons: StudentLesson[]
  enrollmentDetail: EnrolCourseResponse
  applicantId: number
  applicantName?: string
}): React.ReactElement => {
  const { t } = useTranslation()

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  console.log(qrCodeUrl)

  useEffect(() => {
    if (invoice.paymentState === PaymentState.PAID) {
      let qrCodeData: QRCodeAttendanceDto
      if (invoice.applicants && applicantId) {
        const studentLessonsOfApplicant = studentLessons.filter(
          lesson => lesson.userId === applicantId
        )

        qrCodeData = {
          studentLessonIds: studentLessonsOfApplicant.map(lesson => lesson.id),
          enrollCourseId: enrollmentDetail.id,
          applicantId,
          invoiceId: invoice.id,
        }
      } else {
        qrCodeData = {
          studentLessonIds: studentLessons.map(lesson => lesson.id),
          enrollCourseId: enrollmentDetail.id,
          applicantId,
          invoiceId: invoice.id,
        }
      }

      toDataURL(JSON.stringify(qrCodeData), { width: 200, margin: 2 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err))
    }
  }, [invoice.paymentState, invoice.id, enrollmentDetail.id])

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `${enrollmentDetail.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (!qrCodeUrl) return <></>

  return (
    <div className="box-col bg-primary-foreground mb-4 items-center rounded-md p-4">
      {applicantName && <p className="text-text mt-2 text-xl font-semibold">{applicantName}</p>}

      <QRCodePopUp
        trigger={<Image src={qrCodeUrl} alt="QR Code" width={200} height={200} />}
        qrCodeUrl={qrCodeUrl}
      />

      <p className="text-text mt-2 font-semibold">
        {t('enrol:successPayment.qrCode.showAtCounter')}
      </p>
      <Button
        variant="textPrimary"
        className="bg-primary hover:bg-primary-dark rounded-md px-4 py-2 text-white"
        onClick={handleDownloadQR}
      >
        {t('enrol:successPayment.qrCode.save')}
      </Button>
    </div>
  )
}

export default ApplicationQrCode
