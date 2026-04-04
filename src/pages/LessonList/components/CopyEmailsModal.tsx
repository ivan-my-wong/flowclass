import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FiCheck, FiCopy } from 'react-icons/fi'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

const PAGE_SIZE = 100

type CopyEmailsModalProps = {
  isOpen: boolean
  onClose: () => void
  emails: string[]
}

const CopyEmailsModal = ({ isOpen, onClose, emails }: CopyEmailsModalProps) => {
  const { t } = useTranslation()
  const [copiedPage, setCopiedPage] = useState<number | null>(null)

  const pages: string[][] = []
  for (let i = 0; i < emails.length; i += PAGE_SIZE) {
    pages.push(emails.slice(i, i + PAGE_SIZE))
  }

  const handleCopy = async (pageIndex: number) => {
    await navigator.clipboard.writeText(pages[pageIndex].join('\n'))
    setCopiedPage(pageIndex)
    setTimeout(() => setCopiedPage(null), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent scrollable className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t('lessonList:copyEmails')} ({emails.length})
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          {pages.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              {t('lessonList:noEmailsToCopy')}
            </p>
          )}
          {pages.map((pageEmails, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-md border border-gray-200 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  {pages.length > 1
                    ? `${t('lessonList:part')} ${i + 1} / ${pages.length} · `
                    : ''}
                  {pageEmails.length} {t('lessonList:emails')}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(i)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {copiedPage === i ? (
                    <>
                      <FiCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">
                        {t('common:action.copied')}
                      </span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="h-3.5 w-3.5" />
                      {t('common:action.copy')}
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={pageEmails.join('\n')}
                rows={Math.min(pageEmails.length, 8)}
                className="w-full resize-none rounded border border-gray-200 bg-gray-50 p-2 font-mono text-xs text-gray-700 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CopyEmailsModal
