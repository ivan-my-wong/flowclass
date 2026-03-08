import { useCallback } from 'react'

import { Cross2Icon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'

interface StorageExceededAlertProps {
  onClose?: () => void
  className?: string
}

const StorageExceededAlert = ({
  onClose,
  className = '',
}: StorageExceededAlertProps) => {
  const { t } = useTranslation(['storage'])

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  return (
    <div
      className={`flex items-start justify-between p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-sm font-semibold text-red-800">
            {t(
              'storage:storageExceeded.title',
              'Uploaded files exceeds Google Drive remaining storage'
            )}
          </h3>
        </div>
        <p className="text-sm text-red-700 leading-relaxed ml-7">
          {t(
            'storage:storageExceeded.description',
            'The files you have uploaded exceeds the remaining storage of your Google Drive account. None of the files have been uploaded. Please review your files and upload again'
          )}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 ml-3 inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md p-1 transition-colors"
          aria-label="Close alert"
        >
          <Cross2Icon className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default StorageExceededAlert
