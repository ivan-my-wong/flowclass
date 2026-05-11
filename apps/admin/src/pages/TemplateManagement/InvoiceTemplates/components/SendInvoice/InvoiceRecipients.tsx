import { FC, useMemo, useRef } from 'react'

import { ColDef, ICellRendererParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
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

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import '@/styles/components/table.css'

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

const SendCellRenderer: FC<ICellRendererParams<RecipientRow>> = ({ data }) => {
  const allStudents = useRecoilValue(invoiceStudentState)
  const setAllInvoiceStudents = useSetRecoilState(invoiceStudentState)

  if (!data) return null

  if (data.kind === 'student') {
    const student = allStudents.find(s => s.id === data.student.id)
    const isSendToStudent =
      student?.isSendToStudent ?? !(student?.isSendToParent ?? false)
    return (
      <Switch
        checked={isSendToStudent}
        onCheckedChange={checked => {
          setAllInvoiceStudents(prev =>
            prev.map(s =>
              s.id === data.student.id ? { ...s, isSendToStudent: checked } : s
            )
          )
        }}
      />
    )
  }

  const isSendToParent =
    allStudents.find(s => s.id === data.forStudentId)?.isSendToParent ?? true
  return (
    <Switch
      checked={isSendToParent}
      onCheckedChange={checked => {
        setAllInvoiceStudents(prev =>
          prev.map(s =>
            s.id === data.forStudentId ? { ...s, isSendToParent: checked } : s
          )
        )
      }}
    />
  )
}

const TotalCellRenderer: FC<ICellRendererParams<RecipientRow>> = ({ data }) => {
  const { currentSite } = useRecoilValue(siteState)
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const isCombined = invoiceCampaign?.isCombined ?? false
  const userAliasId = data?.kind === 'student' ? data.student.id : 0
  const invoiceOfStudent = useRecoilValue(
    getInvoiceOfStudentSelector({ userAliasId, isCombined })
  )

  if (!data || data.kind === 'parent') {
    return <span className="text-gray-400">-</span>
  }
  if (invoiceOfStudent == null || !currentSite?.currency) {
    return <span className="text-gray-400">-</span>
  }
  return (
    <span>
      {formatCurrency(invoiceOfStudent.total ?? 0, currentSite.currency)}
    </span>
  )
}

const NameCellRenderer: FC<ICellRendererParams<RecipientRow>> = ({ data }) => {
  if (!data) return null

  if (data.kind === 'student') {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">{data.student.name}</span>
        <Badge
          variant="outline"
          className="bg-gray-50 border-gray-300 text-gray-600 text-xs"
        >
          Student
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-gray-700">{data.name}</span>
      <Badge
        variant="outline"
        className="border-primary text-primary !bg-transparent text-xs"
      >
        {data.isStudentParent ? 'Student Parent' : 'Parent'}
      </Badge>
    </div>
  )
}

const InvoiceRecipients = (): JSX.Element => {
  const { t } = useTranslation()
  const gridRef = useRef<AgGridReact<RecipientRow>>(null)
  const allStudents = useRecoilValue(invoiceStudentState)
  const studentList = useRecoilValue(studentListState)
  useContextInvoiceEditDialog()

  const rows = useMemo<RecipientRow[]>(() => {
    const result: RecipientRow[] = []
    const studentIds = new Set(allStudents.map(s => s.id))
    const addedParentIds = new Set<number>()

    allStudents.forEach(student => {
      result.push({ kind: 'student', student })

      if (student.childOfUserAliasId) {
        const parentId = student.childOfUserAliasId
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

  const columnDefs = useMemo(
    (): ColDef<RecipientRow>[] => [
      {
        headerName: t('invoiceCampaign:editor.invoiceTable.send') as string,
        width: 80,
        minWidth: 80,
        maxWidth: 80,
        filter: false,
        sortable: false,
        resizable: false,
        cellClass: '!flex !items-center',
        cellRenderer: SendCellRenderer,
      },
      {
        headerName: t('invoiceCampaign:editor.invoiceTable.customer') as string,
        flex: 2,
        minWidth: 160,
        filter: false,
        sortable: false,
        cellClass: '!flex !items-center',
        cellRenderer: NameCellRenderer,
      },
      {
        headerName: t('invoiceCampaign:editor.invoiceTable.email') as string,
        flex: 2,
        minWidth: 140,
        filter: false,
        sortable: false,
        cellClass: '!flex !items-center text-sm text-gray-600',
        valueGetter: ({ data }) => {
          if (!data) return '-'
          return data.kind === 'student'
            ? data.student.email ?? '-'
            : data.email || '-'
        },
      },
      {
        headerName: t('invoiceCampaign:editor.invoiceTable.phone') as string,
        width: 150,
        filter: false,
        sortable: false,
        cellClass: '!flex !items-center text-sm text-gray-600',
        valueGetter: ({ data }) => {
          if (!data) return '-'
          const phone =
            data.kind === 'student' ? data.student.phone : data.phone
          return phone ? formatPhoneNumber(phone) : '-'
        },
      },
      {
        headerName: t(
          'invoiceCampaign:editor.invoicePreview.invoiceItem.total'
        ) as string,
        width: 120,
        filter: false,
        sortable: false,
        cellClass: '!flex !items-center text-sm',
        cellRenderer: TotalCellRenderer,
      },
    ],
    [t]
  )

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
      <div
        className="ag-theme-alpine mb-4 w-full rounded-lg overflow-hidden border border-gray-300"
        style={{ height: Math.min(40 + rows.length * 48 + 48, 480) }}
      >
        <AgGridReact<RecipientRow>
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          rowHeight={48}
          headerHeight={40}
          suppressMovableColumns
          suppressCellFocus
          suppressRowClickSelection
          getRowClass={({ data }) =>
            data?.kind === 'parent' ? 'bg-blue-50' : ''
          }
          getRowId={({ data }) =>
            data.kind === 'student'
              ? `student-${data.student.id}`
              : `parent-${data.parentId}`
          }
        />
      </div>
    </>
  )
}

export default InvoiceRecipients
