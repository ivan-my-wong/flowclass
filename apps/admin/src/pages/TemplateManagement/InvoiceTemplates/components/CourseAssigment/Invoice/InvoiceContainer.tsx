import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FiUser } from 'react-icons/fi'
import { IoBook, IoDocumentTextOutline } from 'react-icons/io5'
import { LuPhoneCall, LuUser } from 'react-icons/lu'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { Button } from '@/components/ui/Button'
import useSiteData from '@/hooks/useSiteData'
import {
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceClassesState,
  invoiceSessionState,
  isInvoiceExistOnCampaignSelector,
  studentListState,
} from '@/stores/studentInvoice.store'
import type { InvoiceClassType } from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'
import { formatPhoneNumber } from '@/utils/misc'

import NoItemPlaceholder from '../../../Editor/NoItemPlaceholder'

import DialogApplyInvoices from './DialogApplyInvoices'
import DialogEditInvoice from './DialogEditInvoice'
import { useContextInvoiceEditDialog } from './EditInvoiceContext'
import SelectedInvoiceCourse from './SelectedInvoiceCourse'

const InvoiceContainer = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const { currentSite } = useSiteData()
  const currency = currentSite?.currency ?? 'HKD'
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const allStudents = useRecoilValue(studentListState)
  const [allClasses, setAllClasses] = useRecoilState(invoiceClassesState)
  const setAllSessions = useSetRecoilState(invoiceSessionState)
  const currentClasses = useMemo(() => {
    return allClasses.filter(
      item => item.studentItem.id === currentActiveStudent?.id
    )
  }, [allClasses, currentActiveStudent])
  const { totalPrice, calculatedDiscount, finalPrice, usedBalance } =
    useContextInvoiceEditDialog()

  const [isOpenDialogEdit, setOpenDialogEdit] = useState<boolean>(false)
  const [isOpenConfirm, setOpenConfirm] = useState<boolean>(false)

  const removeClass = (classItem: InvoiceClassType) => {
    const removedClassIndex = allClasses.findIndex(
      item =>
        item.classId === classItem.classId &&
        item.studentItem.id === currentActiveStudent?.id
    )

    if (removedClassIndex !== -1) {
      setAllClasses(prev =>
        prev
          .slice(0, removedClassIndex)
          .concat(prev.slice(removedClassIndex + 1))
      )
    }
    setAllSessions(prev =>
      prev.filter(
        sessionItem =>
          !(
            sessionItem.classItem?.classId === classItem.classId &&
            sessionItem.studentItem?.id === currentActiveStudent?.id
          )
      )
    )
  }

  const onRemarkChange = (classItem: InvoiceClassType, remark: string) => {
    setAllClasses(prev => {
      const classIdx = prev.findIndex(
        item => item.classId === classItem.classId
      )
      if (classIdx < 0) return prev
      const newClassItem = [...prev]
      newClassItem[classIdx] = { ...newClassItem[classIdx], remark }
      return newClassItem
    })
  }

  const handleWaitConfirm = () => {
    setOpenDialogEdit(false)
    setOpenConfirm(true)
  }

  const reOpenDialogEdit = () => {
    setOpenConfirm(false)
    setOpenDialogEdit(true)
  }

  const parentUser = useMemo(() => {
    return allStudents.find(
      d => d.id === currentActiveStudent?.childOfUserAliasId
    )
  }, [allStudents, currentActiveStudent])

  const renderCourses = () => {
    if (currentClasses.length === 0)
      return (
        <NoItemPlaceholder
          icon={
            <IoBook
              className="text-gray-300 mb-3"
              size={50}
              aria-hidden="true"
            />
          }
          title={t('editor.noCoursesAssigned')}
          description={t('editor.addCourseFromList')}
        />
      )
    return (
      <>
        <div
          className="p-4 space-y-3 border-b border-gray-200 max-h-[60vh] pt-2 overflow-y-auto"
          role="list"
        >
          {currentClasses.map(item => (
            <SelectedInvoiceCourse
              key={`${item.classId}-${item.studentItem.id}`}
              courseItem={item}
              onRemoveClass={() => removeClass(item)}
              onRemarkChange={remark => onRemarkChange(item, remark)}
            />
          ))}
        </div>
        {!invoiceCampaign?.isCombined && (
          <div className="p-4 rounded-b-lg space-y-3 bg-gray-50">
            <div className="flex justify-between items-center font-semibold">
              <p className="text-gray-900">
                {t('editor.invoicePreview.subTotal')}
              </p>
              <p className="text-blue-600">{totalPrice?.totalPriceLabel}</p>
            </div>
            <div className="flex justify-between items-center font-semibold">
              <p className="text-gray-900">
                {t('editor.invoicePreview.discount')}
              </p>
              <p className="text-red-600">
                {`-${formatCurrency(
                  calculatedDiscount?.totalDiscount ?? 0,
                  currency
                )}`}
              </p>
            </div>

            {(calculatedDiscount?.additionalFee ?? 0) > 0 && (
              <div className="flex justify-between items-center font-semibold">
                <p className="text-gray-900">
                  {t('editor.invoicePreview.additionalFee')}
                </p>
                <p className="text-blue-600">
                  {`+${formatCurrency(
                    calculatedDiscount?.additionalFee ?? 0,
                    currency
                  )}`}
                </p>
              </div>
            )}
            <div className="flex justify-between items-center font-semibold">
              <p className="text-gray-900">
                {t('editor.invoicePreview.creditApplied')}
              </p>
              <p className="text-red-600">{usedBalance?.label}</p>
            </div>
            {usedBalance?.value > 0 && parentUser && (
              <div className="border flex items-center justify-between p-2 rounded-md border-red-300">
                <div className="flex flex-col gap-y-2">
                  <p className="mb-2 text-sm font-medium">
                    {t('editor.invoicePreview.deductedFromParent')}
                  </p>
                  <div className="flex items-center gap-2">
                    <LuUser />
                    <p className="text-sm">{parentUser.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuPhoneCall />
                    <p className="text-sm">
                      {formatPhoneNumber(parentUser.user.phone)}
                    </p>
                  </div>
                </div>
                <p className="text-red-600">{usedBalance?.label}</p>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold">
              <p className="text-gray-900">
                {t('editor.invoicePreview.total')}
              </p>
              <p className="text-blue-600">{finalPrice?.currentLabel}</p>
            </div>
            <Button
              className="w-full mt-4"
              iconBefore={<IoDocumentTextOutline aria-hidden="true" />}
              onClick={() => setOpenDialogEdit(true)}
            >
              {t('editor.editIndividualInvoice')}
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {currentActiveStudent || currentActiveParent ? (
          renderCourses()
        ) : (
          <NoItemPlaceholder
            icon={<FiUser className="text-gray-300 mb-3" size={50} />}
            title={t('editor.noStudentSelected')}
            description={t('editor.noStudentSelectedDescription')}
          />
        )}
      </div>
      <DialogApplyInvoices
        open={isOpenConfirm}
        onCancel={reOpenDialogEdit}
        onClose={setOpenConfirm}
      />
      <DialogEditInvoice
        open={isOpenDialogEdit}
        onWaitConfirm={handleWaitConfirm}
        onCloseModal={() => setOpenDialogEdit(false)}
      />
    </>
  )
}

export default InvoiceContainer
