import { FC, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import {
  LuCalendar,
  LuCopy,
  LuInbox,
  LuMoreHorizontal,
  LuTrash2,
  LuUsers,
} from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import type { InvoiceCampaign } from '@/types/templateManagement'
import dayjs from '@/utils/dayjs'

import InvoiceStatus from './InvoiceStatus'

type Props = {
  invoiceItem: InvoiceCampaign
  onDuplicate: (invoiceItem: InvoiceCampaign) => void
  onDelete: (invoiceItem: InvoiceCampaign) => void
  onShowRecipients: (invoiceItem: InvoiceCampaign) => void
}

const InvoiceItem: FC<Props> = ({
  invoiceItem,
  onDelete,
  onDuplicate,
  onShowRecipients,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation(['invoiceCampaign'])
  const parentInvoice = useMemo(() => {
    return invoiceItem.invoices?.find(d => d.isParent)
  }, [invoiceItem.invoices])
  const invoiceDate = useMemo(() => {
    const tempDate = parentInvoice?.createdAt || invoiceItem?.createdAt
    return tempDate ? dayjs(tempDate).format('DD MMM YYYY') : '-'
  }, [parentInvoice, invoiceItem])

  // Calculate the number of unique students from invoices
  // Use metadata.invoices if available (InvoiceCampaignDetailDto[]), otherwise use invoices (Invoice[])
  const studentCount = useMemo(() => {
    // First try metadata.invoices (InvoiceCampaignDetailDto[]) which has userAliasId
    if (
      invoiceItem.metadata?.invoices &&
      invoiceItem.metadata.invoices.length > 0
    ) {
      const uniqueStudentIds = new Set(
        invoiceItem.metadata.invoices.map(invoice => invoice.userAliasId)
      )
      return uniqueStudentIds.size
    }
    // Fallback to invoices (Invoice[]) which has userAlias.id
    if (invoiceItem.invoices && invoiceItem.invoices.length > 0) {
      const uniqueStudentIds = new Set(
        invoiceItem.invoices
          .map(invoice => invoice.userAlias?.id)
          .filter((id): id is number => id !== undefined)
      )
      return uniqueStudentIds.size
    }
    return 0
  }, [invoiceItem.invoices, invoiceItem.metadata?.invoices])

  const studentNamesLabel = useMemo(() => {
    const names: string[] = []
    if (invoiceItem.metadata?.invoices && invoiceItem.metadata.invoices.length > 0) {
      const seen = new Set<number>()
      for (const inv of invoiceItem.metadata.invoices) {
        if (!seen.has(inv.userAliasId) && inv.name) {
          seen.add(inv.userAliasId)
          names.push(inv.name)
          if (names.length === 3) break
        }
      }
    } else if (invoiceItem.invoices && invoiceItem.invoices.length > 0) {
      const seen = new Set<number>()
      for (const inv of invoiceItem.invoices) {
        const id = inv.userAlias?.id
        const name = inv.userAlias?.name
        if (id !== undefined && !seen.has(id) && name) {
          seen.add(id)
          names.push(name)
          if (names.length === 3) break
        }
      }
    }
    if (names.length === 0) return t('invoiceCampaign:untitledCampaign')
    const extra = studentCount - names.length
    return extra > 0
      ? `${names.join(', ')} +${extra}`
      : names.join(', ')
  }, [invoiceItem.metadata?.invoices, invoiceItem.invoices, studentCount, t])

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <Card
      className="flex justify-between items-start cursor-pointer p-4 md:p-6 w-full"
      onClick={() => {
        navigate(`/invoice-templates/editor?documentId=${invoiceItem.id}`)
      }}
    >
      <div className="flex items-start space-x-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <LuInbox aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {studentNamesLabel}
          </h3>
          <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4 mt-1">
            <Badge variant="light">{t('editor.invoiceTable.invoice')}</Badge>
            <span className="flex items-center space-x-1">
              <LuCalendar aria-hidden="true" />
              <span>{invoiceDate}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-end space-y-2 justify-center gap-x-4">
        <div className="flex items-center space-x-6 text-sm text-gray-700">
          <div className="flex flex-col text-center text-xs min-w-16">
            <span className="font-bold text-lg">{studentCount}</span>
            {t('invoiceCampaign:editor.recipients', { count: studentCount })}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <InvoiceStatus status={invoiceItem.status} />
          {(invoiceItem.recipientList ?? [])?.length > 0 && (
            <Button
              type="button"
              variant="primary-outline"
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                onShowRecipients(invoiceItem)
              }}
              iconBefore={<LuUsers aria-hidden="true" />}
            >
              {t('viewRecipients')}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <LuMoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-none outline-none shadow-md"
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDuplicate(invoiceItem)
                }}
              >
                <LuCopy className="mr-2" aria-hidden="true" />
                {t('duplicate.title')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer space-x-2 text-red-500"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(invoiceItem)
                }}
              >
                <LuTrash2 className="mr-2" aria-hidden="true" />{' '}
                {t('delete.title')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )
}

export default InvoiceItem
