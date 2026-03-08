import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'
import { formatFileSize } from '@/utils/number.utils'

import { useContextBulkUpload } from './BulkUploadContext'
import LessonAndStudentSelection from './LessonAndStudentSelection'

const LessonMapping = (): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const { selectedFiles } = useContextBulkUpload()
  return (
    <div>
      {selectedFiles.map(fileItem => (
        <div
          key={fileItem.fileName}
          className="p-4 border border-gray-300 rounded-lg mb-2 flex items-start gap-2"
        >
          <div className="space-y-1 w-full md:w-5/12">
            <div className="text-sm text-gray-700">
              {fileItem.fileName} - {formatFileSize(fileItem.fileSize)}
            </div>
            <div
              className={cn(
                'text-xs font-medium text-green-600 bg-green-100 w-fit px-4 py-1 rounded-lg',
                !fileItem.isMatch && 'bg-yellow-100 text-yellow-600'
              )}
            >
              {t(`bulkUpload.${fileItem.isMatch ? 'matched' : 'notMatched'}`)}
            </div>
          </div>
          <div className="w-full md:w-7/12 space-y-2">
            <LessonAndStudentSelection fileDetail={fileItem} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LessonMapping
