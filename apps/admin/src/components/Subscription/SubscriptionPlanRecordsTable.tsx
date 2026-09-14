import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuPencil, LuPlus } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Inputs/Input'
import {
  SubscriptionPlanRecord,
  SubscriptionPlanRecordWithSite,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency } from '@/utils/currency'

type SubscriptionPlanRecordsTableProps = {
  isAdminView?: boolean
  showAddButton?: boolean
  maxHeight?: string
  onClientEdit?: (client: TransformedClient) => void
  subscriptionPlanRecords?: SubscriptionPlanRecordWithSite[]
}

export type TransformedClient = {
  id: number
  siteId: number
  name: string
  email: string
  status: string
  totalAmount: string
  nextBilling: string
  planRecord: SubscriptionPlanRecord
}

const SubscriptionPlanRecordsTable = ({
  isAdminView = false,
  showAddButton = false,
  maxHeight = 'max-h-64',
  onClientEdit,
  subscriptionPlanRecords,
}: SubscriptionPlanRecordsTableProps): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [clientSearch, setClientSearch] = useState('')

  // Transform subscription records to client format for display
  const clients: TransformedClient[] =
    subscriptionPlanRecords?.map(record => ({
      id: record.id || 0,
      siteId: record.siteId,
      name: record.site?.name || '',
      email: record.site?.email || '', // Email not available in subscription records
      status: record.isTrial
        ? t('subscription:client.subscriptionPlanRecordsTable.trial')
        : t('subscription:client.subscriptionPlanRecordsTable.active'),
      totalAmount: record.totalPrice
        ? formatCurrency(record.totalPrice, record.currency || 'HKD')
        : 'N/A',
      nextBilling: record.expiryDate
        ? new Date(record.expiryDate).toLocaleDateString()
        : 'N/A',
      planRecord: record,
    })) || []

  const filteredClients = clients.filter(client => {
    if (!client.name) return true
    return client.name.toLowerCase().includes(clientSearch.toLowerCase())
  })

  const handleClientEdit = (client: TransformedClient) => {
    if (onClientEdit) {
      onClientEdit(client)
    } else {
      // Default behavior - navigate to edit page or show details
      console.log('Edit client:', client)
    }
  }

  return (
    <Card>
      <CardHeader>
        <Box justify="between" align="center">
          <CardTitle>
            {isAdminView
              ? t(
                  'subscription:client.subscriptionPlanRecordsTable.allClientSubscriptions'
                )
              : t(
                  'subscription:client.subscriptionPlanRecordsTable.mySubscriptions'
                )}
          </CardTitle>
          {showAddButton && (
            <Button onClick={() => navigate('/admin/manage-clients')} size="sm">
              <LuPlus className="h-4 w-4 mr-2" />
              {t('subscription:client.subscriptionPlanRecordsTable.addClient')}
            </Button>
          )}
        </Box>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder={
              isAdminView
                ? t(
                    'subscription:client.subscriptionPlanRecordsTable.searchAllClients'
                  ).toString()
                : t(
                    'subscription:client.subscriptionPlanRecordsTable.searchSubscriptions'
                  ).toString()
            }
            value={clientSearch}
            onChange={e => setClientSearch(e.target.value)}
            className="max-w-sm"
          />

          <div className={`space-y-2 ${maxHeight} overflow-y-auto`}>
            {filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <div
                  key={`${client.siteId}-${client.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {client.totalAmount}
                    </div>
                    {isAdminView && (
                      <div className="text-xs text-muted-foreground">
                        {t(
                          'subscription:client.subscriptionPlanRecordsTable.nextBilling'
                        )}
                        : {client.nextBilling}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={
                        client.status ===
                        t(
                          'subscription:client.subscriptionPlanRecordsTable.active'
                        )
                          ? 'success'
                          : 'outline'
                      }
                    >
                      {client.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClientEdit(client)}
                    >
                      <LuPencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {isAdminView
                  ? t(
                      'subscription:client.subscriptionPlanRecordsTable.noClientsFound'
                    )
                  : t(
                      'subscription:client.subscriptionPlanRecordsTable.noSubscriptionsFound'
                    )}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {filteredClients.length > 0 && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {t(
                      'subscription:client.subscriptionPlanRecordsTable.totalRecords'
                    )}
                    :
                  </span>
                  <span className="font-medium ml-2">
                    {filteredClients.length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t(
                      'subscription:client.subscriptionPlanRecordsTable.active'
                    )}
                    :
                  </span>
                  <span className="font-medium ml-2">
                    {
                      filteredClients.filter(
                        c =>
                          c.status ===
                          t(
                            'subscription:client.subscriptionPlanRecordsTable.active'
                          )
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionPlanRecordsTable
