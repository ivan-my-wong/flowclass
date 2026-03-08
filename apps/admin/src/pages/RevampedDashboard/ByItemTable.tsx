import { useMemo, useRef } from 'react'

import { ColDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useTranslation } from 'react-i18next'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import { RevenueByItem, StudentByItem } from '@/types/enrollCourse'
import { formatCurrency } from '@/utils/currency'

export interface ByItemTableLabels {
  entityName: string
  emptyMessage: string
}

interface ByItemTableProps {
  data?: RevenueByItem[] | StudentByItem[]
  isLoading: boolean
  labels: ByItemTableLabels
}

export const ByItemTable = ({ data, isLoading, labels }: ByItemTableProps) => {
  const { t } = useTranslation(['onboarding'])
  const gridRef = useRef<AgGridReact>(null)

  // Transform data to ensure all required fields exist
  const tableData = useMemo(() => {
    if (!Array.isArray(data)) return []
    return (data || []).map(item => ({
      ...item,
      name: item.name || '-',
      totalRevenue: item.totalRevenue || 0,
      lessons: item.lessons || 0,
      students: item.students || 0,
    }))
  }, [data])

  // Define columns for the QuickFilterTable
  const columns: ColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: String(labels.entityName),
        sortable: true,
        filter: true,
        width: 300,
        cellRenderer: (params: any) => {
          return <div className="py-2 px-4">{params.value || '-'}</div>
        },
      },
      {
        field: 'totalRevenue',
        headerName: String(t('statistics:invoices.totalRevenue')),
        sortable: true,
        filter: false,
        width: 150,
        cellRenderer: (params: any) => {
          return (
            <div className="py-2 px-4 text-right font-medium">
              {formatCurrency(params.value || 0)}
            </div>
          )
        },
        comparator: (valueA: number, valueB: number) => valueA - valueB,
      },
      {
        field: 'lessons',
        headerName: String(t('statistics:common.lesson')),
        sortable: true,
        filter: false,
        width: 120,
        cellRenderer: (params: any) => {
          return (
            <div className="py-2 px-4 text-center">{params.value || 0}</div>
          )
        },
        comparator: (valueA: number, valueB: number) => valueA - valueB,
      },
      {
        field: 'students',
        headerName: String(t('statistics:common.students')),
        sortable: true,
        filter: false,
        width: 120,
        cellRenderer: (params: any) => {
          return (
            <div className="py-2 px-4 text-center">{params.value || 0}</div>
          )
        },
        comparator: (valueA: number, valueB: number) => valueA - valueB,
      },
    ],
    [labels.entityName, t]
  )

  // Handle reset (clear any filters)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6">{labels.entityName}</th>
              <th className="text-left py-4 px-6">
                {t('statistics:common.totalRevenue')}
              </th>
              <th className="text-left py-4 px-6">
                {t('statistics:common.lessons')}
              </th>
              <th className="text-left py-4 px-6">
                {t('statistics:common.students')}
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-4 px-6">
                  <SkeletonLoader className="h-5 w-32" />
                </td>
                <td className="py-4 px-6">
                  <SkeletonLoader className="h-5 w-20" />
                </td>
                <td className="py-4 px-6">
                  <SkeletonLoader className="h-5 w-12" />
                </td>
                <td className="py-4 px-6">
                  <SkeletonLoader className="h-5 w-12" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (tableData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">{labels.emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-96">
      <QuickFilterTable
        rowData={tableData}
        columns={columns}
        gridRef={gridRef}
        height="400px"
        showFilterBox={false}
        hasFilterSelection={false}
        hasSortSelection={false}
        searchPlaceholder="Search..."
        hasCheckboxSelection={false}
        useUrlSearch={false}
        alwaysMultiSort={false}
        isLoading={false}
      />
    </div>
  )
}
