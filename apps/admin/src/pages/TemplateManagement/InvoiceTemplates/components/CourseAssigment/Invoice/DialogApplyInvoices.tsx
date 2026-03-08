import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import { FaCheck } from 'react-icons/fa'
import { FiAlertCircle } from 'react-icons/fi'
import { useRecoilCallback, useRecoilValue } from 'recoil'

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
  appliedPromotionsState,
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceClassesSelector,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
} from '@/stores/studentInvoice.store'
import {
  AppliedPromotion,
  InvoiceClassType,
  InvoiceSessionType,
  InvoiceSplitType,
  InvoiceStudent,
} from '@/types/studentInvoice.type'

import { useContextInvoiceEditDialog } from './EditInvoiceContext'

interface Props {
  open: boolean
  onCancel: () => void
  onClose: (open: boolean) => void
}

const DialogApplyInvoices: FC<Props> = ({
  open,
  onClose,
  onCancel,
}): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])

  const configsToOverride = [
    t('editor.discount.configsToOverride.coursesLessonsRemarks'),
    t('editor.discount.configsToOverride.discountSettings'),
  ]

  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const currentStudentClasses = useRecoilValue(
    invoiceClassesSelector({
      userAliasId: currentActiveStudent?.id ?? null,
      parentId: currentActiveParent?.id ?? null,
    })
  )
  const allStudents = useRecoilValue(invoiceStudentState)
  const allSessions = useRecoilValue(invoiceSessionState)
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)

  const {
    appliedPromotions,
    invoiceSplitType,
    invoiceSplitItems,
    remark,
    isPayByCredit,
    usedBalance,
    calculatedDiscount,
    totalPrice,
    finalPrice,
  } = useContextInvoiceEditDialog()

  const batchUpdateInvoiceStates = useRecoilCallback(
    ({ set }) =>
      (
        newClasses: InvoiceClassType[],
        newSessions: InvoiceSessionType[],
        newStudents: InvoiceStudent[],
        newAppliedPromotions: AppliedPromotion[]
      ) => {
        set(invoiceClassesState, newClasses)
        set(invoiceSessionState, newSessions)
        set(invoiceStudentState, newStudents)
        set(appliedPromotionsState, newAppliedPromotions)
      },
    []
  )

  const setNewStudentInvoice = (
    studentItem: InvoiceStudent,
    studentPromotions: AppliedPromotion[]
  ) => {
    const newStudentItem: InvoiceStudent = {
      ...studentItem,
      invoiceRemark: remark,
      appliedPromotions: studentPromotions,
      invoiceSplitType,
      subTotal: totalPrice?.totalPrice,
      totalDiscount: calculatedDiscount?.totalDiscount,
      isPayByCredit,
      usedBalance: usedBalance.value,
      total: finalPrice?.current,
    }
    if (invoiceSplitType === InvoiceSplitType.CUSTOM_SPLIT) {
      newStudentItem.invoiceSplitItems = invoiceSplitItems
    }

    return newStudentItem
  }

  const onConfirm = () => {
    if (currentActiveStudent) {
      const currentStudentSessions = allSessions.filter(
        session => session.studentItem?.id === currentActiveStudent?.id
      )
      const newClasses: InvoiceClassType[] = []
      const newSessions: InvoiceSessionType[] = []
      const newStudents: InvoiceStudent[] = []
      const newAppliedPromotions: AppliedPromotion[] = []
      const isCombined = invoiceCampaign?.isCombined ?? false

      allStudents.forEach(student => {
        // Create promotions for this student with correct studentId/parentId
        const studentPromotions: AppliedPromotion[] = (
          appliedPromotions ?? []
        ).map(promo => ({
          ...promo,
          studentId: isCombined ? null : student.id,
          parentId: isCombined ? student.id : null,
        }))

        // Add to global appliedPromotionsState
        studentPromotions.forEach(promo => {
          // Check if promotion already exists for this student
          const existingIndex = newAppliedPromotions.findIndex(item => {
            if (isCombined) {
              return item.id === promo.id && item.parentId === student.id
            }
            return item.id === promo.id && item.studentId === student.id
          })
          if (existingIndex === -1) {
            newAppliedPromotions.push(promo)
          } else {
            // Update existing promotion
            newAppliedPromotions[existingIndex] = promo
          }
        })

        const newStudentItem = setNewStudentInvoice(student, studentPromotions)
        // set classes
        const copyCurrentStudentClasses = [...currentStudentClasses]
        copyCurrentStudentClasses.forEach(classItem => {
          const newClassItem: InvoiceClassType = {
            ...classItem,
            studentItem: student,
          }
          newClasses.push(newClassItem)
        })

        currentStudentSessions.forEach(session => {
          const newSessionItem: InvoiceSessionType = {
            ...session,
            studentItem: student,
          }
          newSessions.push(newSessionItem)
        })

        if (currentActiveStudent.id !== newStudentItem.id) {
          newStudentItem.invoiceRemark = ''
        }
        newStudents.push(newStudentItem)
      })

      // Batch all Recoil state updates together
      batchUpdateInvoiceStates(
        newClasses,
        newSessions,
        newStudents,
        newAppliedPromotions
      )
      onClose(false)
    }
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="py-4 lg:!w-[700px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FiAlertCircle
              size={35}
              className="p-1 bg-red-50 text-red-600 rounded-lg"
              aria-hidden="true"
            />
            <div>{t('editor.discount.alertApplySettingTitle')}</div>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 font-medium">
            {t('editor.discount.alertApplySettingDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="p-4 bg-yellow-50 border border-yellow-400 rounded-lg">
          <p className="text-sm font-semibold mb-2 text-yellow-700">
            {t('editor.discount.overrideAlert')}
          </p>
          <div className="flex flex-col gap-1">
            {configsToOverride.map(item => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-yellow-600"
              >
                <FaCheck size={12} aria-hidden="true" />
                <div>{item}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-red-50 border border-red-400 rounded-lg text-red-600 text-sm">
          <span className="font-semibold text-red-800">
            {t('editor.discount.note')}:
          </span>{' '}
          {t('editor.discount.referralCodesAlert')}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="border-gray-300">
            {t('common:action.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('editor.discount.applyToAll')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DialogApplyInvoices
