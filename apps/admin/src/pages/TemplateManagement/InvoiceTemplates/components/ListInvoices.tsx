import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDebounce } from '@uidotdev/usehooks'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/Loaders/Spinner'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/Pagination'
import useConfirm from '@/hooks/useGlobalConfirm'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { InvoiceCampaign } from '@/types/templateManagement'

import InvoiceItem from './InvoiceItem'
import SearchInvoice from './SearchInvoice'

type Props = {
  onShowRecipients: (invoiceCampaign: InvoiceCampaign) => void
}
const PAGE_SIZE = 10
const ListInvoices: FC<Props> = ({ onShowRecipients }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const debouncedSearchTerm = useDebounce(search, 300)
  const [page, setPage] = useState(1)
  const { t } = useTranslation(['invoiceCampaign', 'common'])
  const {
    useFetchInvoiceCampaigns,
    useDuplicateInvoiceCampaign,
    useDeleteInvoiceCampaign,
  } = useInvoiceCampaignData()
  const { data: invoiceCampaignsData, isLoading: isLoadingInvoiceCampaigns } =
    useFetchInvoiceCampaigns({
      search: debouncedSearchTerm.trim() || undefined,
      status,
      page,
      limit: PAGE_SIZE,
    })
  useEffect(() => {
    setPage(1)
  }, [search, status])

  const { mutateAsync: duplicateInvoiceCampaign, isLoading: isDuplicating } =
    useDuplicateInvoiceCampaign(invoiceCampaign => {
      navigate(`/invoice-templates/editor?documentId=${invoiceCampaign.id}`)
    })
  const { mutateAsync: deleteInvoiceCampaign, isLoading: isDeleting } =
    useDeleteInvoiceCampaign(() => {
      navigate(`/invoice-templates`)
    })
  const invoiceCampaigns = invoiceCampaignsData?.data || []
  const total = invoiceCampaignsData?.total || 0
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1
  const { setConfirm, closeConfirm } = useConfirm(isDeleting || isDuplicating)
  const onDuplicate = (invoiceItem: InvoiceCampaign) => {
    setConfirm({
      title: t('invoiceCampaign:duplicate.title').toString(),
      description: t('invoiceCampaign:duplicate.description').toString(),
      alertType: AlertTypes.CONFIRM,
      cancelText: t('common:action.cancel').toString(),
      confirmText: t('common:action.yes').toString(),
      onConfirm: () => {
        if (invoiceItem.id)
          duplicateInvoiceCampaign(invoiceItem.id).then(() => {
            closeConfirm()
          })
      },
    }).open()
  }
  const onDelete = (invoiceItem: InvoiceCampaign) => {
    setConfirm({
      title: t('invoiceCampaign:delete.title').toString(),
      description: t('invoiceCampaign:delete.description').toString(),
      alertType: AlertTypes.WARN,
      cancelText: t('common:action.cancel').toString(),
      confirmText: t('common:action.yes').toString(),
      onConfirm: () => {
        if (invoiceItem.id)
          deleteInvoiceCampaign(invoiceItem.id).then(() => {
            closeConfirm()
          })
      },
    }).open()
  }
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (page <= 3) {
      return [1, 2, 3, 4, '...', totalPages]
    }
    if (page >= totalPages - 2) {
      return [
        1,
        '...',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  const pageNumbers = getPageNumbers()
  return (
    <div className="w-full p-4 flex flex-col gap-y-4">
      <SearchInvoice
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />
      <div className="box-col-full rounded-md overflow-auto shadow-sm border border-background-layer-2">
        {isLoadingInvoiceCampaigns && <Spinner />}
        {invoiceCampaigns && invoiceCampaigns?.length > 0 ? (
          invoiceCampaigns?.map(invoiceItem => (
            <InvoiceItem
              key={invoiceItem.id}
              invoiceItem={invoiceItem}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onShowRecipients={onShowRecipients}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-2xl">{t('invoiceCampaign:noInvoices')}</p>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-4">
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={e => {
                    e.preventDefault()
                    if (page > 1) setPage(page - 1)
                  }}
                  aria-disabled={page === 1}
                />
              </PaginationItem>
              {pageNumbers.map((num, idx) =>
                num === '...' ? (
                  <PaginationItem key={`ellipsis-${page}-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`p-${num}-${idx}`}>
                    <PaginationLink
                      isActive={num === page}
                      onClick={e => {
                        e.preventDefault()
                        setPage(Number(num))
                      }}
                    >
                      {num}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={e => {
                    e.preventDefault()
                    if (page < totalPages) setPage(page + 1)
                  }}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
export default ListInvoices
