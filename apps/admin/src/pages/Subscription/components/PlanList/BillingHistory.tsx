import { useRef } from 'react'

import { ColDef, ICellRendererParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FiDownload } from 'react-icons/fi'
import { TbEye } from 'react-icons/tb'

import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import useSiteData from '@/hooks/useSiteData'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import { StripeBillingHistory } from '@/types/schoolSubscriptionPlan'
import { formatCurrency } from '@/utils/currency'

const BillingHistory = (): JSX.Element => {
  const { t } = useTranslation()
  const { currentSite } = useSiteData()
  const gridRef = useRef<AgGridReact<StripeBillingHistory>>(null)
  const { useGetBillingHistory } = usePlanData()
  const { data: billingHistory } = useGetBillingHistory()

  const billingHistoryColumns: ColDef<StripeBillingHistory>[] = [
    {
      field: 'created',
      headerName: t('subscription:billingHistory.column.date') as string,
      filter: false,
      valueFormatter: ({ data }) => {
        return (
          data?.created ? dayjs(data.created * 1000).format('DD MMMM YYYY') : ''
        ) as string
      },
    },
    {
      headerName: t('subscription:billingHistory.column.amount') as string,
      field: 'total',
      filter: false,
      valueFormatter: ({ data }) => {
        return data?.total
          ? `${formatCurrency(data.total, currentSite?.currency || 'usd')}`
          : '-'
      },
    },
    {
      headerName: t('subscription:billingHistory.column.status') as string,
      field: 'status',
      filter: false,
      cellRenderer: ({ data }: ICellRendererParams<StripeBillingHistory>) => {
        if (!data?.status) return ''
        return (
          <Badge
            variant={data.status === 'paid' ? 'success' : 'warning'}
            className="capitalize"
          >
            {data.status}
          </Badge>
        )
      },
    },
    {
      headerName: t('subscription:billingHistory.column.actions') as string,
      field: 'status',
      filter: false,
      width: 320,
      cellRenderer: ({ data }: ICellRendererParams<StripeBillingHistory>) => {
        if (!data) return '-'
        return (
          <>
            <Button
              className="text-xs py-1.5 h-6 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium px-3 mr-2"
              iconBefore={<TbEye />}
              onClick={() => window.open(data.hosted_invoice_url, '_blank')}
            >
              {t('subscription:billingHistory.tableActions.detailInvoice')}
            </Button>
            <Button
              className="text-xs py-1.5 h-6 bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium px-3"
              iconBefore={<FiDownload />}
              onClick={() => window.open(data.invoice_pdf, '_blank')}
            >
              {t('subscription:billingHistory.tableActions.downloadInvoice')}
            </Button>
          </>
        )
      },
    },
  ]

  return (
    <QuickFilterTable
      rowData={billingHistory || []}
      columns={billingHistoryColumns}
      gridRef={gridRef}
      showFilterBox={false}
    />
  )
}

export default BillingHistory
