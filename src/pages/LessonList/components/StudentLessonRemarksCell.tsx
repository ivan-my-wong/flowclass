import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { HiOutlinePencilSquare } from 'react-icons/hi2'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { LESSON_REMARK_PRESETS } from '@/constants/lessonRemarks'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'

type Props = {
  studentLessonId: number
  initialRemark: string | null | undefined
}

const StudentLessonRemarksCell = ({
  studentLessonId,
  initialRemark,
}: Props): JSX.Element => {
  const { t } = useTranslation()
  const [remark, setRemark] = useState(initialRemark ?? '')
  const [draft, setDraft] = useState(remark)
  const [isOpen, setIsOpen] = useState(false)

  const { useUpdateStudentLessonRemarks } = useLessonDateTimeData()
  const { mutateAsync: saveRemarks, isLoading } = useUpdateStudentLessonRemarks()

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDraft(remark)
    setIsOpen(true)
  }

  const handleSave = async () => {
    const value = draft.trim() || null
    await saveRemarks({ studentLessonId, remarks: value })
    setRemark(value ?? '')
    setIsOpen(false)
  }

  const handleClear = async () => {
    await saveRemarks({ studentLessonId, remarks: null })
    setRemark('')
    setDraft('')
    setIsOpen(false)
  }

  return (
    <>
      {/* Always-visible remarks row at the bottom of the cell */}
      <div
        className="group flex items-center gap-1 mt-1 w-full min-h-[16px] cursor-pointer"
        onClick={openModal}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && openModal(e as any)}
        title={t('lessonList:remarks.label') as string}
      >
        {remark ? (
          <span className="text-[9px] leading-tight text-amber-700 bg-amber-50 rounded px-1 py-0.5 max-w-[80px] truncate">
            {remark}
          </span>
        ) : (
          <span className="text-[9px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
            {t('lessonList:remarks.placeholder')}
          </span>
        )}
        <HiOutlinePencilSquare
          size={10}
          className={[
            'shrink-0 transition-opacity',
            remark
              ? 'text-amber-500 opacity-0 group-hover:opacity-100'
              : 'text-gray-400 opacity-0 group-hover:opacity-100',
          ].join(' ')}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={v => !v && setIsOpen(false)}>
        <DialogContent className="max-w-sm" onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{t('lessonList:remarks.modalTitle')}</DialogTitle>
          </DialogHeader>

          {/* Quick-select presets */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500">
              {t('lessonList:remarks.quickSelect')}
            </p>
            <div className="flex flex-wrap gap-1">
              {LESSON_REMARK_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDraft(preset.value)}
                  className={[
                    'rounded-full border px-2 py-0.5 text-xs transition-colors',
                    draft === preset.value
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50',
                  ].join(' ')}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Free-text area */}
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={t('lessonList:remarks.placeholder') as string}
            rows={3}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
          />

          <div className="flex gap-2 justify-end">
            {remark && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleClear}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {t('lessonList:remarks.clear')}
              </button>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSave}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {t('lessonList:remarks.save')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default StudentLessonRemarksCell
