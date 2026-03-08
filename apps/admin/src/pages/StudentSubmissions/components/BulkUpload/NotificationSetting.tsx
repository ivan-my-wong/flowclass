import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import CardDeliveryMethod from '@/pages/TemplateManagement/InvoiceTemplates/components/CardDeliveryMethod'
import { NotificationChannel } from '@/types/studentInvoice.type'
import { formatPhoneNumber } from '@/utils/misc'

import { FileDetail, useContextBulkUpload } from './BulkUploadContext'

const NotificationSetting = (): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const { selectedFiles } = useContextBulkUpload()
  const fileStudentMap = useMemo(() => {
    const studentFilesMap: Record<
      number,
      {
        studentId: number
        studentLabel: string
        studentEmail: string
        studentPhone: string
        files: FileDetail[]
      }
    > = {}
    selectedFiles.forEach(file => {
      if (!file.student?.value) return
      if (file.student.value in studentFilesMap) {
        studentFilesMap[file.student.value].files.push(file)
      } else {
        studentFilesMap[file.student.value] = {
          studentId: file.student.value,
          studentLabel: file.student.label ?? '',
          studentEmail: file.student.email ?? '',
          studentPhone: file.student.phone ?? '',
          files: [file],
        }
      }
    })
    return Object.values(studentFilesMap)
  }, [selectedFiles])
  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="w-full md:w-1/2">
        <div className="font-medium mb-2">
          {t('bulkUpload.deliveryMethods')}
        </div>
        <div className="space-y-2">
          <CardDeliveryMethod
            channel={NotificationChannel.Email}
            name="emailBody"
            switchName="sendViaEmail"
            withSwitch
            module="studentSubmission"
          />
          <CardDeliveryMethod
            channel={NotificationChannel.WhatsApp}
            name="whatsappContent"
            switchName="sendViaWhatsapp"
            withSwitch
            module="studentSubmission"
          />
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <div className="font-medium mb-2">
          {t('bulkUpload.recipientCount', { count: fileStudentMap.length })}
        </div>
        {fileStudentMap.map(studentItem => (
          <div
            key={studentItem.studentId}
            className="p-4 border border-gray-300 rounded-lg space-y-1 mb-2"
          >
            <div className="font-medium">{studentItem.studentLabel}</div>
            <div className="text-sm text-gray-700">
              {studentItem.studentEmail}{' '}
              {studentItem.studentPhone &&
                `(${formatPhoneNumber(studentItem.studentPhone)})`}
            </div>
            <div className="flex flex-wrap gap-2 text-gray-700">
              {studentItem.files.map(file => (
                <Badge key={file.fileName} variant="default-outline">
                  {file.fileName}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationSetting
