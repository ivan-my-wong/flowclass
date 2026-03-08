import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import { FiAlertCircle } from 'react-icons/fi'
import { useResetRecoilState } from 'recoil'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import {
  currentActiveStudentState,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
} from '@/stores/studentInvoice.store'

interface Props {
  open: boolean
  onCancel?: () => void
  onClose?: (open: boolean) => void
}
const RemoveStudentsConfirmation: FC<Props> = ({
  open,
  onCancel,
  onClose,
}): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const resetAllSutudents = useResetRecoilState(invoiceStudentState)
  const resetAllClasses = useResetRecoilState(invoiceClassesState)
  const resetAllSessions = useResetRecoilState(invoiceSessionState)
  const resetCurrentActiveStudent = useResetRecoilState(
    currentActiveStudentState
  )

  const onConfirm = () => {
    resetAllSutudents()
    resetAllClasses()
    resetAllSessions()
    resetCurrentActiveStudent()
  }
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="py-4 lg:!w-[700px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FiAlertCircle
              size={35}
              className="p-1 bg-red-50 text-red-600 rounded-lg"
              aria-hidden="true"
            />
            <div>{t('studentCard.removeAllStudents')}</div>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 font-medium">
            {t('studentCard.ensureRemoveAllStudents')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="p-4 bg-yellow-50 border border-yellow-400 rounded-lg text-sm font-medium mb-2 text-yellow-700">
          <p>{t('studentCard.warningRemoveAllStudents')}</p>
          <p>{t('studentCard.undoneRemoveAllStudents')}</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="border-gray-300">
            {t('common:action.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            {t('studentCard.confirmRemove')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default RemoveStudentsConfirmation
