import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { invoiceStudentState } from '@/stores/studentInvoice.store'
import { InvoiceStudent } from '@/types/studentInvoice.type'

import ClassSelectionContainer from './ClassSelectionContainer'
import DateSelection from './DateSelection'
import { useContextEnrolledClass } from './EnrolledClassContext'
import Paginator from './Paginator'

interface Props {
  open: boolean
  currentStudent: InvoiceStudent
  onClose: () => void
}
const EnrolledDialog: React.FC<Props> = ({
  open,
  currentStudent,
  onClose,
}): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const [activeStep, setActiveStep] = useState<number>(0)
  const {
    setStudentToEnroll,
    setEnrollAllStudents,
    setAllStudentsToEnroll,
    setAvailableClassesAndSessions,
    setSelectedClasses,
  } = useContextEnrolledClass()
  const allStudents = useRecoilValue(invoiceStudentState)

  const onCloseModal = () => {
    resetContextState()
    setActiveStep(0)
    onClose()
  }

  const resetContextState = () => {
    setStudentToEnroll(undefined)
    setEnrollAllStudents(false)
    setAvailableClassesAndSessions([])
    setSelectedClasses([])
  }

  const onBack = () => {
    setActiveStep(0)
    resetContextState()
  }

  const goToClassSelection = (isAllStudents: boolean) => {
    setEnrollAllStudents(isAllStudents)
    let enrolledStudent = currentStudent
    if (isAllStudents) {
      if (!allStudents.length) {
        setEnrollAllStudents(false)
        setStudentToEnroll(currentStudent)
      }
      const [firstStudent] = allStudents
      enrolledStudent = firstStudent
    }
    setStudentToEnroll(enrolledStudent)
    setActiveStep(prev => prev + 1)
  }

  // Sync into context only when the dialog opens, not on every Recoil change.
  // Continuous syncing caused an infinite loop: Recoil allStudents changed →
  // context updated → re-renders → InvoiceEditor effects fired → Recoil changed…
  useEffect(() => {
    if (!open) return
    setAllStudentsToEnroll(allStudents)
    setStudentToEnroll(currentStudent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onCloseModal()
      }}
    >
      <DialogContent className="w-full lg:w-[800px]">
        <DialogHeader className="flex flex-col items-start h-fit justify-center sticky top-0 z-10 border-none">
          <DialogTitle>{t('enrolledClass.addEnrolledClass')}</DialogTitle>
          <DialogDescription className="sr-only" />
          {activeStep > 0 && <Paginator />}
        </DialogHeader>
        <div className="px-4 pt-0">
          <div>
            {activeStep === 0 && <DateSelection next={goToClassSelection} />}
            {activeStep === 1 && (
              <ClassSelectionContainer
                back={onBack}
                closeDialog={onCloseModal}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EnrolledDialog
