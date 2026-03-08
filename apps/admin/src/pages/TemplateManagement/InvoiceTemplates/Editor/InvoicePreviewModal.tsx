/* eslint-disable simple-import-sort/imports */
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import {
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceStudentState,
} from '@/stores/studentInvoice.store'
import { InvoiceEditDialogProvider } from '../components/CourseAssigment/Invoice/EditInvoiceContext'
import PreviewInvoiceContent from './PreviewInvoiceContent'

const InvoicePreviewModal = () => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const invoiceStudents = useRecoilValue(invoiceStudentState)
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const setCurrentActiveStudent = useSetRecoilState(currentActiveStudentState)
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()
  const isCombined = invoiceCampaign?.isCombined ?? false
  useEffect(() => {
    if (!isOpen) {
      navigate(-1)
    }
  }, [isOpen, navigate])
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }
  const handleNext = () => {
    setCurrentIndex(prev =>
      Math.min(invoiceStudents.length - 1, Math.max(0, prev + 1))
    )
  }
  useEffect(() => {
    setCurrentActiveStudent(invoiceStudents[currentIndex] ?? null)
  }, [currentIndex, invoiceStudents, setCurrentActiveStudent])
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('invoiceCampaign:editor.invoicePreview.title')}
              </h2>
              {!isCombined && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="p-1"
                  >
                    <LuChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <span className="text-sm text-gray-600 px-2">
                    {currentIndex + 1} of {invoiceStudents.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentIndex === invoiceStudents.length - 1}
                    className="p-1"
                  >
                    <LuChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Content */}
          <InvoiceEditDialogProvider>
            <PreviewInvoiceContent />
          </InvoiceEditDialogProvider>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

export default InvoicePreviewModal
