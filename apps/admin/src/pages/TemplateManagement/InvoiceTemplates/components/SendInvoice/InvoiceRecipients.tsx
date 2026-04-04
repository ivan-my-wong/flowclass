import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { FiUsers } from 'react-icons/fi'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { useContextInvoiceEditDialog } from '@/pages/TemplateManagement/InvoiceTemplates/components/CourseAssigment/Invoice/EditInvoiceContext'
import { siteState } from '@/stores/siteData'
import {
  getInvoiceOfStudentSelector,
  invoiceCampaignState,
  invoiceStudentState,
  studentListState,
} from '@/stores/studentInvoice.store'
import { InvoiceStudent } from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'
import { formatPhoneNumber } from '@/utils/misc'

type RecipientRow =
  | { kind: 'student'; student: InvoiceStudent }
  | {
      kind: 'parent'
      parentId: number
      name: string
      email: string
      phone: string
      forStudentId: number
      isStudentParent: boolean
    }

const StudentRow = ({
  student,
  showTotal,
}: {
  student: InvoiceStudent
  showTotal: boolean
}) => {
  const { currentSite } = useRecoilValue(siteState)
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const invoiceOfStudent = useRecoilValue(
    getInvoiceOfStudentSelector({
      userAliasId: student.id,
      isCombined: invoiceCampaign?.isCombined ?? false,
    })
  )
  const setAllInvoiceStudents = useSetRecoilState(invoiceStudentState)

  const toggleSend = (checked: boolean) => {
    setAllInvoiceStudents(prev =>
      prev.map(s =>
        s.id === student.id ? { ...s, isSendToParent: !checked } : s
      )
    )
  }

  return (
    <tr className="text-gray-600 border-t border-gray-200">
      <td className="py-4 pl-4 font-medium flex items-center gap-2 text-gray-800">
        {student.name}
        <Badge
          variant="outline"
          className="bg-gray-50 border-gray-300 text-gray-600 text-xs"
        >
          Student
        </Badge>
      </td>
      <td className="py-4">{student.email ?? '-'}</td>
      <td className="py-4">
        {student.phone ? formatPhoneNumber(student.phone) : '-'}
      </td>
      <td className="py-4">
        {showTotal && invoiceOfStudent != null && currentSite?.currency
          ? formatCurrency(invoiceOfStudent.total ?? 0, currentSite.currency)
          : '-'}
      </td>
      <td className="py-4 pr-4">
        <Switch
          checked={!student.isSendToParent}
          onCheckedChange={toggleSend}
        />
      </td>
    </tr>
  )
}

const ParentRow = ({
  name,
  email,
  phone,
  forStudentId,
  isStudentParent,
}: {
  name: string
  email: string
  phone: string
  forStudentId: number
  isStudentParent: boolean
}) => {
  const allStudents = useRecoilValue(invoiceStudentState)
  const setAllInvoiceStudents = useSetRecoilState(invoiceStudentState)
  const isSendToParent =
    allStudents.find(s => s.id === forStudentId)?.isSendToParent ?? true

  const toggleSend = (checked: boolean) => {
    setAllInvoiceStudents(prev =>
      prev.map(s =>
        s.id === forStudentId ? { ...s, isSendToParent: checked } : s
      )
    )
  }

  return (
    <tr className="text-gray-500 bg-blue-50 border-t border-gray-100">
      <td className="py-3 pl-4 font-medium flex items-center gap-2 text-gray-700">
        {name}
        <Badge
          variant="outline"
          className="border-primary text-primary !bg-transparent text-xs"
        >
          {isStudentParent ? 'Student Parent' : 'Parent'}
        </Badge>
      </td>
      <td className="py-3">{email || '-'}</td>
      <td className="py-3">{phone ? formatPhoneNumber(phone) : '-'}</td>
      <td className="py-3">-</td>
      <td className="py-3 pr-4">
        <Switch checked={isSendToParent} onCheckedChange={toggleSend} />
      </td>
    </tr>
  )
}

const InvoiceRecipients = (): JSX.Element => {
  const { t } = useTranslation()
  const allStudents = useRecoilValue(invoiceStudentState)
  const studentList = useRecoilValue(studentListState)
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const { finalPrice, totalPrice, calculatedDiscount } =
    useContextInvoiceEditDialog()
  const isCombined = invoiceCampaign?.isCombined ?? false

  // eslint-disable-next-line no-console
  console.log('[InvoiceRecipients]', {
    isCombined,
    totalPrice,
    calculatedDiscount,
    finalPrice,
    students: allStudents.map(s => ({
      id: s.id,
      name: s.name,
      promotions: s.appliedPromotions,
    })),
  })

  const rows = useMemo<RecipientRow[]>(() => {
    const result: RecipientRow[] = []
    const studentIds = new Set(allStudents.map(s => s.id))
    const addedParentIds = new Set<number>()

    allStudents.forEach(student => {
      result.push({ kind: 'student', student })

      if (student.childOfUserAliasId) {
        const parentId = student.childOfUserAliasId
        // Skip parent row if the parent is already in the student list
        if (!addedParentIds.has(parentId) && !studentIds.has(parentId)) {
          addedParentIds.add(parentId)
          const parent = studentList.find(s => s.id === parentId)
          if (parent) {
            result.push({
              kind: 'parent',
              parentId: parent.id,
              name: parent.name,
              email: parent.email ?? student.email,
              phone: parent.user?.phone ?? student.phone,
              forStudentId: student.id,
              isStudentParent: parent.isStudentParent ?? false,
            })
          }
        }
      }
    })

    return result
  }, [allStudents, studentList])

  return (
    <>
      <div className="flex items-center gap-2 mb-4 text-gray-900">
        <FiUsers />
        <div className="font-semibold">
          {t('invoiceCampaign:editor.recipients', {
            count: allStudents.length,
          })}
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-gray-300 overflow-x-auto">
        <table className="text-sm w-full">
          <thead>
            <tr>
              <th className="py-4 bg-gray-50 rounded-tl-lg text-left pl-4">
                {t('invoiceCampaign:editor.invoiceTable.customer')}
              </th>
              <th className="py-4 bg-gray-50 text-left">
                {t('invoiceCampaign:editor.invoiceTable.email')}
              </th>
              <th className="py-4 bg-gray-50 text-left">
                {t('invoiceCampaign:editor.invoiceTable.phone')}
              </th>
              <th className="py-4 bg-gray-50 text-left">
                {t('invoiceCampaign:editor.invoicePreview.invoiceItem.total')}
              </th>
              <th className="py-4 bg-gray-50 rounded-tr-lg text-left">
                {t('invoiceCampaign:editor.invoiceTable.send')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              if (row.kind === 'student') {
                return (
                  <StudentRow
                    key={`student-${row.student.id}`}
                    student={row.student}
                    showTotal={!isCombined}
                  />
                )
              }
              return (
                <ParentRow
                  key={`parent-${row.parentId}`}
                  name={row.name}
                  email={row.email}
                  phone={row.phone}
                  forStudentId={row.forStudentId}
                  isStudentParent={row.isStudentParent}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default InvoiceRecipients
