import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDebounce } from '@uidotdev/usehooks'
import { ColDef, ICellRendererParams, IRowNode } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  LuCopy,
  LuMoreHorizontal,
  LuTrash2,
  LuUsers,
  LuX,
} from 'react-icons/lu'

import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import Text from '@/components/ui/Text'
import useConfirm from '@/hooks/useGlobalConfirm'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { theme } from '@/styles'
import { InvoiceCampaign } from '@/types/templateManagement'
import dayjs from '@/utils/dayjs'
import {
  buildStudentNamesLabel,
  getUniqueStudentCount,
} from '@/utils/invoice-campaign.utils'

import InvoiceStatus from './InvoiceStatus'
import SearchInvoice from './SearchInvoice'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import '@/styles/components/table.css'

type Props = {
  onShowRecipients: (invoiceCampaign: InvoiceCampaign) => void
}

const PAGE_SIZE = 50

const ListInvoices: FC<Props> = ({ onShowRecipients }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const debouncedSearchTerm = useDebounce(search, 300)
  const [page] = useState(1)
  const { t } = useTranslation(['invoiceCampaign', 'common'])
  const gridRef = useRef<AgGridReact<InvoiceCampaign>>(null)
  const [selectedNodes, setSelectedNodes] = useState<
    IRowNode<InvoiceCampaign>[]
  >([])

  const {
    useFetchInvoiceCampaigns,
    useDuplicateInvoiceCampaign,
    useDeleteInvoiceCampaign,
  } = useInvoiceCampaignData()

  const { data: invoiceCampaignsData, isLoading } = useFetchInvoiceCampaigns({
    search: debouncedSearchTerm.trim() || undefined,
    status,
    page,
    limit: PAGE_SIZE,
  })

  const { mutateAsync: duplicateInvoiceCampaign, isLoading: isDuplicating } =
    useDuplicateInvoiceCampaign(invoiceCampaign => {
      navigate(`/invoice-templates/editor?documentId=${invoiceCampaign.id}`)
    })

  const { mutateAsync: deleteInvoiceCampaign, isLoading: isDeleting } =
    useDeleteInvoiceCampaign()

  const invoiceCampaigns = invoiceCampaignsData?.data || []
  const { setConfirm, closeConfirm } = useConfirm(isDeleting || isDuplicating)

  const selectedRows = useMemo(
    () =>
      selectedNodes.map(n => n.data).filter((d): d is InvoiceCampaign => !!d),
    [selectedNodes]
  )

  const handleClearSelection = useCallback(() => {
    gridRef.current?.api.deselectAll()
    setSelectedNodes([])
  }, [])

  const onSelectionChanged = useCallback(() => {
    setSelectedNodes(gridRef.current?.api.getSelectedNodes() ?? [])
  }, [])

  const onDuplicate = useCallback(
    (invoiceItem: InvoiceCampaign) => {
      setConfirm({
        title: t('invoiceCampaign:duplicate.title').toString(),
        description: t('invoiceCampaign:duplicate.description').toString(),
        alertType: AlertTypes.CONFIRM,
        cancelText: t('common:action.cancel').toString(),
        confirmText: t('common:action.yes').toString(),
        onConfirm: () => {
          if (invoiceItem.id)
            duplicateInvoiceCampaign(invoiceItem.id).then(() => closeConfirm())
        },
      }).open()
    },
    [setConfirm, t, duplicateInvoiceCampaign, closeConfirm]
  )

  const onDelete = useCallback(
    (invoiceItem: InvoiceCampaign) => {
      setConfirm({
        title: t('invoiceCampaign:delete.title').toString(),
        description: t('invoiceCampaign:delete.description').toString(),
        alertType: AlertTypes.WARN,
        cancelText: t('common:action.cancel').toString(),
        confirmText: t('common:action.yes').toString(),
        onConfirm: () => {
          if (invoiceItem.id)
            deleteInvoiceCampaign(invoiceItem.id).then(() => closeConfirm())
        },
      }).open()
    },
    [setConfirm, t, deleteInvoiceCampaign, closeConfirm]
  )

  const onBulkDelete = useCallback(() => {
    const ids = selectedRows.map(r => r.id).filter((id): id is number => !!id)
    if (ids.length === 0) return
    setConfirm({
      title: t('invoiceCampaign:delete.title').toString(),
      description: t('invoiceCampaign:delete.description').toString(),
      alertType: AlertTypes.WARN,
      cancelText: t('common:action.cancel').toString(),
      confirmText: t('common:action.yes').toString(),
      onConfirm: async () => {
        await Promise.all(ids.map(id => deleteInvoiceCampaign(id)))
        handleClearSelection()
        closeConfirm()
      },
    }).open()
  }, [
    selectedRows,
    setConfirm,
    t,
    deleteInvoiceCampaign,
    handleClearSelection,
    closeConfirm,
  ])

  const columnDefs = useMemo(
    (): ColDef<InvoiceCampaign>[] => [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 48,
        minWidth: 48,
        maxWidth: 48,
        filter: false,
        sortable: false,
        resizable: false,
        cellClass: '!flex !items-center !justify-center',
      },
      {
        headerName: '',
        field: 'id',
        width: 130,
        filter: false,
        sortable: false,
        cellClass: '!flex !items-center gap-1',
        cellRenderer: ({ data }: ICellRendererParams<InvoiceCampaign>) => {
          if (!data) return null
          return (
            <div
              className="flex items-center gap-1"
              role="presentation"
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
            >
              {(data.recipientList ?? []).length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => onShowRecipients(data)}
                  iconBefore={<LuUsers aria-hidden="true" size={14} />}
                >
                  {t('viewRecipients')}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-7 w-7 p-0">
                    <LuMoreHorizontal aria-hidden="true" size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-none outline-none shadow-md"
                >
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onDuplicate(data)}
                  >
                    <LuCopy className="mr-2" aria-hidden="true" />
                    {t('duplicate.title')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer space-x-2 text-red-500"
                    onClick={() => onDelete(data)}
                  >
                    <LuTrash2 className="mr-2" aria-hidden="true" />
                    {t('delete.title')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
      {
        headerName: t('invoiceCampaign:editor.invoiceTable.customer') as string,
        field: 'title',
        flex: 2,
        minWidth: 200,
        filter: false,
        cellClass: '!flex !items-center',
        cellRenderer: ({ data }: ICellRendererParams<InvoiceCampaign>) => {
          if (!data) return null
          const label = buildStudentNamesLabel(
            data,
            t('invoiceCampaign:untitledCampaign')
          )
          return <span className="font-medium text-gray-900">{label}</span>
        },
      },
      {
        headerName: t('student:column.lastUpdated') as string,
        field: 'createdAt',
        width: 175,
        filter: false,
        cellClass: '!flex !items-center',
        cellRenderer: ({ data }: ICellRendererParams<InvoiceCampaign>) => {
          if (!data) return null
          const parentInvoice = data.invoices?.find(d => d.isParent)
          const date =
            parentInvoice?.createdAt || data.updatedAt || data.createdAt
          return (
            <span className="text-sm text-gray-500">
              {date ? dayjs(date).format('DD MMM YYYY, HH:mm') : '-'}
            </span>
          )
        },
      },
      {
        headerName: t('invoiceCampaign:recipientsColumn') as string,
        field: 'recipients',
        width: 110,
        filter: false,
        cellClass: '!flex !items-center !justify-center',
        cellRenderer: ({ data }: ICellRendererParams<InvoiceCampaign>) => {
          if (!data) return null
          const count = getUniqueStudentCount(data)
          return (
            <span className="text-sm font-semibold text-gray-700">{count}</span>
          )
        },
      },
      {
        headerName: t('student:paymentProof.status') as string,
        field: 'status',
        width: 130,
        filter: false,
        cellClass: '!flex !items-center',
        cellRenderer: ({ data }: ICellRendererParams<InvoiceCampaign>) => {
          if (!data) return null
          return <InvoiceStatus status={data.status} />
        },
      },
    ],
    [t, onShowRecipients, onDuplicate, onDelete]
  )

  return (
    <div className="w-full p-4 flex flex-col gap-y-4">
      <SearchInvoice
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      <AnimatePresence>
        {selectedRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              className="bg-background-layer-3 shadow-sm px-2 py-2 rounded-md"
              justify="between"
            >
              <Box>
                <Button
                  onClick={handleClearSelection}
                  variant="ghost"
                  className="rounded-full h-8 w-8 hover:bg-background-disabled hover:text-text-sub justify-center text-center p-0"
                >
                  <LuX fill={theme.colors.primary.toString()} />
                </Button>
                <Text className="text-sm text-text-subtle">
                  {selectedRows.length}{' '}
                  {t('invoiceCampaign:editor.invoiceTable.invoice')}
                </Text>
              </Box>
              <Box className="gap-x-2" justify="end">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  loading={isDeleting}
                  iconBefore={<LuTrash2 />}
                  onClick={onBulkDelete}
                >
                  {t('invoiceCampaign:delete.title')}
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="ag-theme-alpine w-full rounded-md overflow-hidden border border-gray-200"
        style={{
          height: Math.min(40 + invoiceCampaigns.length * 48 + 48, 600),
        }}
      >
        <AgGridReact<InvoiceCampaign>
          ref={gridRef}
          rowData={invoiceCampaigns}
          columnDefs={columnDefs}
          rowHeight={48}
          headerHeight={40}
          loading={isLoading}
          suppressMovableColumns
          suppressCellFocus
          rowSelection="multiple"
          suppressRowClickSelection
          onSelectionChanged={onSelectionChanged}
          onRowClicked={({ data }) => {
            if (data?.id)
              navigate(`/invoice-templates/editor?documentId=${data.id}`)
          }}
          getRowClass={() => 'cursor-pointer hover:bg-gray-50'}
        />
      </div>
    </div>
  )
}

export default ListInvoices
