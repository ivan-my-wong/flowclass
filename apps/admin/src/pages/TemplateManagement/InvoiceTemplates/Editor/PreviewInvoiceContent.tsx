/* eslint-disable prettier/prettier */

import { useCallback, useEffect, useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import {
  classesGroupedByStudentSelector,
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceClassesSelector,
} from '@/stores/studentInvoice.store'
import { formatCurrency } from '@/utils/currency'
import { formatTotalPriceInvoice } from '@/utils/invoice-campaign.utils'

import { useContextInvoiceEditDialog } from '../components/CourseAssigment/Invoice/EditInvoiceContext'

import PreviewInvoiceTableRow from './PreviewInvoiceTableRow'

const PreviewInvoiceContent = () => {
  const { currentSchool } = useSchoolData()
  const { t } = useTranslation(['invoiceCampaign'])
  const { currentSite } = useSiteData()
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const isCombined = invoiceCampaign?.isCombined ?? false
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const currentClasses = useRecoilValue(
    invoiceClassesSelector({
      userAliasId: currentActiveStudent?.id ?? null,
      parentId: currentActiveParent?.id ?? null,
    })
  )
  const allClasses = useRecoilValue(classesGroupedByStudentSelector({}))
  const currency = currentSite?.currency ?? DEFAULT_CURRENCY
  const {
    totalPrice,
    calculatedDiscount,
    finalPrice,
    usedBalance,
    setAppliedPromotions,
  } = useContextInvoiceEditDialog()

  useEffect(() => {
    setAppliedPromotions(currentActiveStudent?.appliedPromotions ?? [])
  }, [currentActiveStudent, setAppliedPromotions])

  const isEmpty = useMemo(() => {
    return isCombined
      ? Object.keys(allClasses).length === 0
      : currentClasses.length === 0
  }, [isCombined, allClasses, currentClasses])

  const studentName = useMemo(() => {
    return isCombined
      ? currentActiveParent?.name ?? ''
      : currentActiveStudent?.name ?? ''
  }, [isCombined, currentActiveParent, currentActiveStudent])

  const studentEmail = useMemo(() => {
    return isCombined
      ? currentActiveParent?.email ?? ''
      : currentActiveStudent?.email ?? ''
  }, [isCombined, currentActiveParent, currentActiveStudent])

  const studentPhone = useMemo(() => {
    return isCombined
      ? currentActiveParent?.phone ?? ''
      : currentActiveStudent?.phone ?? ''
  }, [isCombined, currentActiveParent, currentActiveStudent])

  const paymentDate = useMemo(() => {
    if (!currentActiveStudent) return null
    return currentActiveStudent.paymentDate
      ? new Date(currentActiveStudent.paymentDate)
      : null
  }, [currentActiveStudent])

  return (
    <div className="p-8">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {studentName}
          </h3>
          <p className="text-sm text-gray-500">
            {[studentEmail, studentPhone].filter(Boolean).join(' • ')}
          </p>
        </div>
        <div className="text-right text-gray-600">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {currentSchool?.name}
          </h2>
        </div>
      </div>

      {/* Payment Date */}
      {paymentDate && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">
            {t('editor.paymentDate')}:
          </span>
          <span>
            {paymentDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      )}

      {/* Invoice Table */}
      <div className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              {isCombined && (
                <TableHead>{t('editor.invoicePreview.student')}</TableHead>
              )}
              <TableHead>{t('editor.invoicePreview.course')}</TableHead>
              <TableHead>{t('editor.invoicePreview.qty')}</TableHead>
              <TableHead className="text-right">
                {t('editor.invoicePreview.price')}
              </TableHead>
              <TableHead className="text-right">
                {t('editor.invoicePreview.total')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  {t('editor.invoicePreview.noItems')}
                </TableCell>
              </TableRow>
            )}
            {isCombined
              ? Object.keys(allClasses).map(studentId =>
                  allClasses[studentId].map(invoice => (
                    <PreviewInvoiceTableRow
                      key={`${studentId}-${invoice.classId}`}
                      studentId={+studentId}
                      invoice={invoice}
                      currency={currency}
                      isCombined={isCombined}
                    />
                  ))
                )
              : currentClasses.map(invoice => (
                  <PreviewInvoiceTableRow
                    key={invoice.classId}
                    invoice={invoice}
                    currency={currency}
                    isCombined={isCombined}
                  />
                ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="py-1" colSpan={3}>
                {t('editor.invoicePreview.subTotal')}
              </TableCell>
              <TableCell className="text-right py-1">
                {totalPrice?.totalPriceLabel}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-1" colSpan={isCombined ? 5 : 4}>
                {t('editor.invoicePreview.discount')}
              </TableCell>
              <TableCell className="text-right text-red-600 py-1">
                {`-${formatCurrency(calculatedDiscount?.totalDiscount ?? 0, currency)}`}
              </TableCell>
            </TableRow>
            {(usedBalance?.value ?? 0) > 0 && (
              <TableRow>
                <TableCell className="py-1" colSpan={3}>
                  {t('editor.invoicePreview.creditApplied')}
                </TableCell>
                <TableCell className="text-right text-red-600 py-1">
                  {usedBalance.label}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="py-1" colSpan={3}>
                {t('editor.invoicePreview.totalAmount')}
              </TableCell>
              <TableCell className="text-right py-1">
                {finalPrice?.currentLabel}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
export default PreviewInvoiceContent
