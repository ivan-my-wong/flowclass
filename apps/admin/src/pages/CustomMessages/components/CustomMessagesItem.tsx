import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FaWhatsapp } from 'react-icons/fa'
import { LuMail, LuPencil } from 'react-icons/lu'

import {
  WhatsAppConnectionStatus,
  WhatsAppStatusResponse,
} from '@/api/whatsappWeb'
import { Button } from '@/components/ui/Button'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { CustomMessage } from '@/types/customMessage'

type PropType = {
  item: CustomMessage
  whatsappSessionStatus: WhatsAppStatusResponse | undefined
  isWhatsappSessionStatusLoading: boolean
}
const CustomMessageItem = ({
  item,
  whatsappSessionStatus,
  isWhatsappSessionStatusLoading,
}: PropType): JSX.Element => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const goToEdit = () => {
    navigate(`/custom-messages/edit?id=${item.id}`)
  }

  // Always true for email
  const isEmailConnected = true

  const isWhatsappConnected =
    whatsappSessionStatus?.data?.status === WhatsAppConnectionStatus.READY

  let whatsappConnectionText = ''
  if (isWhatsappSessionStatusLoading) {
    whatsappConnectionText = t('common:action.loading') as string
  } else if (isWhatsappConnected) {
    whatsappConnectionText = t('customMessage:whatsappWeb.connected') as string
  } else {
    whatsappConnectionText = t(
      'customMessage:whatsappWeb.notConnected'
    ) as string
  }

  const channels = [
    {
      key: 'email',
      label: t('customMessage:form.emailNotification'),
      connectionText: isEmailConnected
        ? t('customMessage:email.connected')
        : t('customMessage:email.alertTitle'),
      icon: (
        <LuMail
          size={20}
          color={isEmailConnected ? 'text-green-600' : 'text-red-500'}
          className="inline"
        />
      ),
      enabled: isEmailConnected,
    },
    {
      key: 'whatsapp',
      label: t('customMessage:form.whatsappNotification'),
      connectionText: whatsappConnectionText,
      icon: (
        <FaWhatsapp
          size={20}
          color={isWhatsappConnected ? '#22c55e' : '#ef4444'}
          className="inline"
        />
      ),
      enabled: isWhatsappConnected,
    },
  ]

  return (
    <div className="flex flex-row p-4 rounded-md w-full bg-gray-100">
      <div className="w-full flex flex-col">
        <div className="box-row-full">
          <h3 className="font-bold flex-shrink-0">{item.name}</h3>

          <div className="flex w-full justify-end">
            <Button
              variant="ghost"
              onClick={goToEdit}
              aria-label={`Edit ${t(`customMessage:form.${item.type}`)}`}
              data-testid="edit-custom-message"
            >
              <LuPencil size={24} />
            </Button>
          </div>
        </div>

        <TooltipProvider>
          {channels.map(channel => (
            <div
              key={channel.key}
              className="flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-2">
                {channel.icon}
                <span>{channel.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-semibold ${
                    channel.enabled ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {channel.connectionText}
                </span>
              </div>
            </div>
          ))}
        </TooltipProvider>
        <p className="text-sm text-gray-500 mt-2">
          {t('customMessage:customMessage.updatedAt')}:{' '}
          {item.updatedAt
            ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm')
            : ''}
        </p>
      </div>
    </div>
  )
}

export default CustomMessageItem
