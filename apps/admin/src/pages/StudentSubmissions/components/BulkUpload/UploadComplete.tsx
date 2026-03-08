import { useTranslation } from 'react-i18next'
import { LuCheck, LuDot } from 'react-icons/lu'

import { useContextBulkUpload } from './BulkUploadContext'

const UploadComplete = (): JSX.Element => {
  const { selectedFiles } = useContextBulkUpload()
  const { t } = useTranslation(['studentSubmission'])
  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <LuCheck
        className="p-3 bg-green-100 text-green-500 rounded-full"
        size={55}
      />
      <div className="font-medium">{t('bulkUpload.uploadComplete')}</div>
      <div className="text-sm text-gray-600">
        {t('bulkUpload.uploadCompleteDesc', {
          fileCount: selectedFiles.length,
        })}
      </div>
      <div className="p-4 min-w-[400px] bg-blue-50 border border-blue-400 rounded-lg text-sm text-blue-600">
        <div className="text-blue-700 font-medium">
          {t('bulkUpload.summary')}
        </div>
        <div className="flex items-center">
          <LuDot size={24} /> {t('bulkUpload.storedToDrive')}
        </div>
        <div className="flex items-center">
          <LuDot size={24} /> {t('bulkUpload.studentNotified')}
        </div>
        <div className="flex items-center">
          <LuDot size={24} /> {t('bulkUpload.notificationSent')}
        </div>
      </div>
    </div>
  )
}

export default UploadComplete
