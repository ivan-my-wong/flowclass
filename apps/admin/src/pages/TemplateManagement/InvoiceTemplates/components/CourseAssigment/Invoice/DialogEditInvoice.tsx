import DatePicker from 'react-datepicker'
import { useTranslation } from 'react-i18next'
import { LuCalendar, LuCheck, LuCopy } from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceClassesSelector,
  invoiceStudentState,
} from '@/stores/studentInvoice.store'
import {
  InvoiceSplitType,
  InvoiceStudent,
  PromotionTypeItem,
} from '@/types/studentInvoice.type'
import { isQualifiedPromotion } from '@/utils/invoice-campaign.utils'

import ApplyCreditBalance from './ApplyCreditBalance'
import { useContextInvoiceEditDialog } from './EditInvoiceContext'
import InvoiceDiscount from './InvoiceDiscount'
import InvoiceRemark from './InvoiceRemark'
import SelectedCourseTable from './SelectedCourseTable'

import 'react-datepicker/dist/react-datepicker.css'

interface Props {
  open: boolean
  onWaitConfirm: () => void
  onCloseModal: () => void
}

const DialogEditInvoice: React.FC<Props> = ({
  open,
  onWaitConfirm,
  onCloseModal,
}): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const [allStudents, setAllStudents] = useRecoilState(invoiceStudentState)
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const {
    totalPrice,
    finalPrice,
    calculatedDiscount,
    appliedPromotions,
    invoiceSplitType,
    invoiceSplitItems,
    isPayByCredit,
    remark,
    isInvoiceSplitValid,
  } = useContextInvoiceEditDialog()
  const currentClasses = useRecoilValue(
    invoiceClassesSelector({
      userAliasId: currentActiveStudent?.id ?? null,
      parentId: currentActiveParent?.id ?? null,
    })
  )

  const handleModalClose = (_open: boolean) => {
    onCloseModal()
  }

  const onConfirmInvoiceSetup = () => {
    const isCombined = invoiceCampaign?.isCombined ?? false

    // Filter applied promotions to only include those belonging to the current student
    const studentPromotions = appliedPromotions.filter(item => {
      if (isCombined) {
        return item.parentId === currentActiveParent?.id
      }
      return item.studentId === currentActiveStudent?.id
    })

    // Filter qualified promotions
    // For bundle discounts, if they're already applied (isApplicable !== false), keep them
    // For other promotions, check qualification
    const qualifiedPromotions = studentPromotions.filter(item => {
      if (item.type === PromotionTypeItem.BUNDLE) {
        // If bundle discount is already applied and marked as applicable, keep it
        // Otherwise, check qualification
        if (item.isApplicable !== false) {
          return true
        }
        return isQualifiedPromotion(currentClasses.length, item.minQty)
      }
      return true
    })

    if (currentActiveStudent) {
      const newStudentItem: InvoiceStudent = {
        ...currentActiveStudent,
        invoiceRemark: remark,
        invoiceSplitType,
        subTotal: totalPrice?.totalPrice ?? 0,
        totalDiscount: calculatedDiscount?.totalDiscount,
        isPayByCredit,
        total: finalPrice?.finalPrice ?? 0,
        appliedPromotions: qualifiedPromotions,
      }
      if (invoiceSplitType === InvoiceSplitType.CUSTOM_SPLIT) {
        newStudentItem.invoiceSplitItems = invoiceSplitItems
      }

      setAllStudents(prev => {
        const idx = prev.findIndex(item => item.id === newStudentItem.id)
        if (idx === -1) return prev
        const next = [...prev]
        next[idx] = newStudentItem
        return next
      })

      onCloseModal()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="w-full lg:w-[700px]">
        <DialogHeader className="flex flex-col items-start justify-center h-20 sticky top-0 z-10">
          <DialogTitle>{t('invoice.editInvoice')}</DialogTitle>
          <DialogDescription>
            {t('invoice.editInvoiceDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex items-center gap-2 mb-4">
            <LuCalendar className="text-gray-500 shrink-0" size={16} />
            <label
              htmlFor="dialog-payment-date"
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              {t('editor.paymentDate')}
            </label>
            <DatePicker
              id="dialog-payment-date"
              selected={
                currentActiveStudent?.paymentDate
                  ? new Date(currentActiveStudent.paymentDate)
                  : null
              }
              dateFormat="MMMM d, yyyy"
              className="h-9 rounded-md border text-sm border-gray-300 px-3 w-full"
              onChange={(date: Date | null) => {
                if (!currentActiveStudent) return
                setAllStudents(prev =>
                  prev.map(s =>
                    s.id === currentActiveStudent.id
                      ? { ...s, paymentDate: date }
                      : s
                  )
                )
              }}
              isClearable
              placeholderText={t('editor.selectPaymentDate') as string}
            />
          </div>
          <Card className="p-4 shadow-none border-gray-300 mb-6">
            <SelectedCourseTable currentClasses={currentClasses} />
          </Card>
          <InvoiceDiscount />
          <ApplyCreditBalance />
          {/* {finalPrice.current > 0 && <SplitInvoice />} */}
          {/* <InvoiceSummary /> */}
          <InvoiceRemark />
        </DialogBody>
        <div className="flex items-center border-t border-gray-300 justify-end px-2 gap-2 py-3 sticky bottom-0 z-10 bg-white">
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={() => handleModalClose(false)}
          >
            {t('invoice.cancel')}
          </Button>
          {allStudents.length > 1 && (
            <Button
              iconBefore={<LuCopy aria-hidden="true" />}
              disabled={!isInvoiceSplitValid}
              onClick={onWaitConfirm}
              variant="outline"
            >
              {t('invoice.applyToAllInvoices')}
            </Button>
          )}
          <Button
            className="mr-4 w-52"
            iconBefore={<LuCheck aria-hidden="true" />}
            disabled={!isInvoiceSplitValid}
            onClick={onConfirmInvoiceSetup}
          >
            {t('invoice.saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogEditInvoice
