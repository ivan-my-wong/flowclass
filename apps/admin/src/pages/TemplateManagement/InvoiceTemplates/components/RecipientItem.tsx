import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import { FaWhatsapp } from 'react-icons/fa'
import {
  LuBan,
  LuCheck,
  LuClock,
  LuDownload,
  LuMail,
  LuSend,
} from 'react-icons/lu'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NotificationChannel } from '@/types/studentInvoice.type'
import {
  RecipientCampaign,
  RecipientCampaignStatus,
} from '@/types/templateManagement'
import { formatCurrency } from '@/utils/currency'
import { formatPhoneNumber } from '@/utils/misc'

type Props = {
  recipient: RecipientCampaign
  onSelect?: () => void
  onDownload?: () => void
}
const RecipientItem: FC<Props> = ({ recipient, onSelect, onDownload }) => {
  const { t } = useTranslation(['invoiceCampaign'])

  const getStatusIcon = (status: RecipientCampaignStatus) => {
    switch (status) {
      case RecipientCampaignStatus.DELIVERED:
        return <LuCheck className="w-4 h-4 text-green-600" />
      case RecipientCampaignStatus.PENDING:
        return <LuClock className="w-4 h-4 text-amber-600" />
      case RecipientCampaignStatus.FAILED:
        return <LuBan className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: RecipientCampaignStatus) => {
    switch (status) {
      case RecipientCampaignStatus.DELIVERED:
        return 'success'
      case RecipientCampaignStatus.PENDING:
        return 'warning'
      case RecipientCampaignStatus.FAILED:
        return 'error'
      default:
        return 'default'
    }
  }

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case NotificationChannel.Email:
        return <LuMail className="w-4 h-4 text-muted-foreground" />
      case NotificationChannel.WhatsApp:
        return <FaWhatsapp className="w-4 h-4 text-muted-foreground" />
      default:
        return null
    }
  }
  const getInitials = (name: string): string => {
    if (!name) return 'NA'
    return name
      .trim()
      .split(/\s+/) // split by spaces
      .map(word => word[0].toUpperCase())
      .join('')
  }
  return (
    <div className="bg-slate-50 shadow-md p-6 flex justify-between items-start space-x-6 border-b border-background-layer-4">
      <div className="flex items-start space-x-4 justify-between w-full">
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Avatar>
              <AvatarFallback>
                {getInitials(recipient.student.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Recipient Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground text-lg mb-1">
              {recipient.student.name || 'Unknown Recipient'}
            </h3>
            <p className="text-muted-foreground text-sm mb-2">
              {[
                recipient.student?.email,
                formatPhoneNumber(recipient.student?.user?.phone),
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>

            {/* Invoice Summary */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('invoice.total')}:{' '}
                {formatCurrency(recipient.invoice?.payAmount ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <div className="flex flex-col justify-center gap-2 items-end">
          <div className="flex">
            <Button className="ml-4" onClick={onSelect}>
              <LuSend className="w-4 h-4 mr-2" />
              {t('campaignRecipient.resendInvoice')}
            </Button>
            <Button
              className="ml-4"
              variant="primary-outline"
              onClick={onDownload}
              disabled={!onDownload || !recipient?.documentUrl}
              aria-label={t('campaignRecipient.downloadInvoice') as string}
            >
              <LuDownload className="w-4 h-4 mr-2" />
              {t('campaignRecipient.downloadInvoice')}
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Badge
              variant={getStatusVariant(recipient.status)}
              className="gap-x-2 items-center"
            >
              {getStatusIcon(recipient.status)}
              <span className="font-medium capitalize">{recipient.status}</span>
            </Badge>
            <Badge className="gap-x-2 justify-center flex" variant="light">
              {getChannelIcon(recipient.channel)}
              <span className="text-muted-foreground text-sm h-full">
                {recipient.channel}
              </span>
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
export default RecipientItem
