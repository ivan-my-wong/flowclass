import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuArrowRightLeft, LuMessageCircle } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { SharedVideoStatus } from '@/constants/course'

const SHARED_VIDEO_OPTIONS: { value: SharedVideoStatus; label: string }[] = [
  { value: SharedVideoStatus.SHARED, label: 'Shared' },
  { value: SharedVideoStatus.PENDING_SHARE, label: 'Pending Share' },
  { value: SharedVideoStatus.PENDING_REMOVE, label: 'Pending Remove' },
  { value: SharedVideoStatus.REMOVED, label: 'Removed' },
  { value: SharedVideoStatus.NO_PERMISSION, label: 'No Permission' },
]

type Props = {
  selectedCount: number
  onClear: () => void
  onCopyEmails: () => void
  onBulkVideoStatus: (status: SharedVideoStatus) => void
  isBulkUpdating: boolean
  onReassign: () => void
  canReassign: boolean
  onSendWhatsApp: () => void
}

const LessonSelectionActionBar = ({
  selectedCount,
  onClear,
  onCopyEmails,
  onBulkVideoStatus,
  isBulkUpdating,
  onReassign,
  canReassign,
  onSendWhatsApp,
}: Props): JSX.Element => {
  const { t } = useTranslation()
  const [pendingStatus, setPendingStatus] = useState<SharedVideoStatus>(
    SharedVideoStatus.SHARED
  )

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2 gap-3">
      <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
        <span>
          {selectedCount} {t('lessonList:cellsSelected')}
        </span>
        <Button
          variant="link"
          size="xs"
          onClick={onClear}
          className="text-blue-500 hover:text-blue-700 h-auto p-0"
        >
          {t('common:action.cancel')}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onCopyEmails}>
          {t('lessonList:copyEmails')}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onSendWhatsApp}
          className="border-green-200 text-green-700 hover:bg-green-50"
          iconBefore={<LuMessageCircle size={13} />}
        >
          {t('lessonList:sendWhatsApp')}
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={!canReassign}
          onClick={onReassign}
          title={
            !canReassign
              ? (t('lessonList:reassignSelectOne') as string)
              : undefined
          }
          iconBefore={<LuArrowRightLeft size={13} />}
        >
          {t('lessonList:reassign')}
        </Button>

        <div className="flex items-center gap-1">
          <select
            value={pendingStatus}
            onChange={e =>
              setPendingStatus(e.target.value as SharedVideoStatus)
            }
            className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {SHARED_VIDEO_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            loading={isBulkUpdating}
            onClick={() => onBulkVideoStatus(pendingStatus)}
            className="border-blue-300 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('lessonList:setVideoStatus')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LessonSelectionActionBar
