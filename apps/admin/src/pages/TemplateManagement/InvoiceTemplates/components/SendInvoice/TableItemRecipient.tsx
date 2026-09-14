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
}
const TableItemRecipient: FC<Props> = ({ student }) => {
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
    const parentData = {
      ...findParent,
    }

    parentData.email = parentData.email ?? student.email
    parentData.phone = parentData.user?.phone ?? student.phone

    return parentData ?? null
  }, [student, studentList])

  const updateInvoiceRecipient = (value: boolean) => {
    setAllInvoiceStudents(prev =>
      prev.map(item =>
        item.id === student.id ? { ...item, isSendToParent: value } : item
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
          {invoiceOfStudent?.total && currentSite?.currency
            ? formatCurrency(
                invoiceOfStudent.total ?? 0,
                currentSite?.currency ?? DEFAULT_CURRENCY
              )
            : '-'}
        </td>
      </tr>
      {parentOfCurrentStudent && (
        <tr>
          <td className="py-2 px-4 space-y-3" colSpan={4}>
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg flex items-center gap-2">
              <div className="font-medium text-blue-600">
                {t('editor.invoiceTable.sendToParent')}{' '}
                <span className="font-semibold">
                  {parentOfCurrentStudent.name}
                </span>
              </div>
              <Switch
                className="ml-auto"
                checked={student?.isSendToParent ?? false}
                onCheckedChange={updateInvoiceRecipient}
              />
            </div>
            {student.isSendToParent && (
              <div className="mb-4 rounded-lg border border-blue-300 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="py-4 bg-blue-100 rounded-tl-lg text-left pl-4">
                        {t('editor.invoiceTable.parentName')}
                      </th>
                      <th className="py-4 bg-blue-100 text-left pl-4">
                        {t('editor.invoiceTable.email')}
                      </th>
                      <th className="py-4 bg-blue-100 rounded-tr-lg text-left pl-4">
                        {t('editor.invoiceTable.phone')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4 pl-4 font-medium bg-blue-50 flex items-center gap-3 text-gray-800">
                        <div>{parentOfCurrentStudent.name}</div>
                        <Badge
                          variant="outline"
                          className="border-primary text-primary !bg-transparent"
                        >
                          {t('editor.invoiceTable.parentBadge')}
                        </Badge>
                      </td>
                      <td className="py-4 bg-blue-50">
                        {parentOfCurrentStudent.email ?? '-'}
                      </td>
                      <td className="py-4 bg-blue-50">
                        {parentOfCurrentStudent.phone
                          ? formatPhoneNumber(parentOfCurrentStudent.phone)
                          : '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
export default TableItemRecipient
