import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import { LuDownload } from 'react-icons/lu'

import { Spinner } from '@/components/Loaders/Spinner'
import { Button } from '@/components/ui/Button'
import useStudentSubmissionData from '@/hooks/useStudentSubmissionData'

interface DownloadButtonProps {
  studentSubmissionId: number
  className?: string
}

const DownloadButton: FC<DownloadButtonProps> = ({
  studentSubmissionId,
  className,
}) => {
  const { t } = useTranslation()
  const {
    useDownloadStudentSubmissionMaterial,
    downloadProgress,
    isDownloading,
  } = useStudentSubmissionData()

  const { mutate: downloadMaterial } = useDownloadStudentSubmissionMaterial()

  const handleDownload = () => {
    downloadMaterial({ studentSubmissionId })
  }

  return (
    <div className={className}>
      <Button
        variant="outline"
        iconBefore={<LuDownload />}
        onClick={handleDownload}
        disabled={isDownloading}
        loading={isDownloading}
      >
        {isDownloading ? (
          <div className="flex items-center gap-2">
            <Spinner size="small" />
            <span>Downloading... {downloadProgress}%</span>
          </div>
        ) : (
          'Download Materials'
        )}
      </Button>

      {isDownloading && (
        <div className="mt-2 w-full">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-1 text-center">
            {downloadProgress}% downloaded
          </div>
        </div>
      )}
    </div>
  )
}

export default DownloadButton
