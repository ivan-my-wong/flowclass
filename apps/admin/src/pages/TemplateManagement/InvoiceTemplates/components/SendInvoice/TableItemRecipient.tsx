import { FC, useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import { siteState } from '@/stores/siteData'
import {
  getInvoiceOfStudentSelector,
  invoiceCampaignState,
  invoiceStudentState,
  studentListState,
} from '@/stores/studentInvoice.store'
import { InvoiceStudent } from '@/types/studentInvoice.type'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'
import { formatPhoneNumber } from '@/utils/misc'

type Props = {
  student: InvoiceStudent
  showTotal?: boolean
}

const TableItemRecipient: FC<Props> = ({ student, showTotal = true }) => {
  const { t } = useTranslation('invoiceCampaign')
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const { currentSite } = useRecoilValue(siteState)
  const studentList = useRecoilValue(studentListState)
  const invoiceOfStudent = useRecoilValue(
    getInvoiceOfStudentSelector({
      userAliasId: student.id,
      isCombined: invoiceCampaign?.isCombined ?? false,
    })
  )
  const setAllInvoiceStudents = useSetRecoilState(invoiceStudentState)

  const parentOfCurrentStudent = useMemo(() => {
    if (!student.childOfUserAliasId) return null
    if (studentList.length === 0) return null

    const findParent = studentList.find(
      item => item.id === student.childOfUserAliasId
    )
    if (!findParent) return null

    return {
      ...findParent,
      email: findParent.email ?? student.email,
      phone: findParent.user?.phone ?? student.phone,
    }
  }, [student, studentList])

  // Parent is the default recipient; toggling ON sends to student instead
  const updateSendToStudent = (sendToStudent: boolean) => {
    setAllInvoiceStudents(prev =>
      prev.map(item =>
        item.id === student.id
          ? { ...item, isSendToParent: !sendToStudent }
          : item
      )
    )
  }

  return (
    <>
      <tr key={student.id} className="text-gray-600 border-t border-gray-200">
        <td className="py-4 pl-4 font-medium flex items-center gap-3 text-gray-800">
          <div>{student.name}</div>
          <Badge
            variant="outline"
            className={cn(
              'bg-gray-50 border-gray-300 text-gray-600',
              student.isStudentParent &&
                'border-primary text-primary !bg-transparent'
            )}
          >
            {student.isStudentParent
              ? t('editor.invoiceTable.parentBadge')
              : t('editor.invoiceTable.studentBadge')}
          </Badge>
        </td>
        <td className="py-4">{student.email ?? '-'}</td>
        <td className="py-4">
          {student.phone ? formatPhoneNumber(student.phone) : '-'}
        </td>
        <td className="py-4">
          {showTotal && invoiceOfStudent != null && currentSite?.currency
            ? formatCurrency(
                invoiceOfStudent.total ?? 0,
                currentSite?.currency ?? DEFAULT_CURRENCY
              )
            : '-'}
        </td>
      </tr>

      {parentOfCurrentStudent && (
        <tr>
          <td className="py-2 px-4 space-y-2" colSpan={4}>
            {/* Parent is always the default recipient — shown unconditionally */}
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium text-blue-700">
                    {parentOfCurrentStudent.name}
                  </div>
                  <div className="text-xs text-blue-500">
                    {parentOfCurrentStudent.email ?? '-'}
                    {parentOfCurrentStudent.phone
                      ? ` · ${formatPhoneNumber(parentOfCurrentStudent.phone)}`
                      : ''}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-primary text-primary !bg-transparent ml-1"
                >
                  {t('editor.invoiceTable.parentBadge')}
                </Badge>

                {/* Toggle: "Send to student [name]" — parent is default */}
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {t('editor.invoiceTable.sendToStudent')}{' '}
                    <span className="font-semibold">{student.name}</span>
                  </span>
                  <Switch
                    checked={!student.isSendToParent}
                    onCheckedChange={updateSendToStudent}
                  />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default TableItemRecipient
