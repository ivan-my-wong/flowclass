import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { QueryObserverResult } from 'react-query'

import {
  WhatsAppConnectionStatus,
  WhatsAppStatusResponse,
} from '@/api/whatsappWeb'
import { Spinner } from '@/components/Loaders/Spinner'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useWhatsappWeb } from '@/hooks/useWhatsappWeb'
import { cn } from '@/utils/cn'

import RemoveWhatsAppConnection from './RemoveWhatsAppConnection'
import WhatsAppModalScanQrCode from './WhatsAppModalScanQrCode'

type Props = {
  whatsappSessionStatus: WhatsAppStatusResponse | undefined
  refetchSessionStatus: () => Promise<
    QueryObserverResult<WhatsAppStatusResponse>
  >
  isWhatsappSessionStatusLoading: boolean
}
const WhatsappConnection = ({
  whatsappSessionStatus,
  refetchSessionStatus,
  isWhatsappSessionStatusLoading,
}: Props): JSX.Element => {
  const { t } = useTranslation()
  const { useGetSession } = useWhatsappWeb()
  const { data: whatsappSession } = useGetSession()

  const [isConnectWhatsAppOpen, setIsConnectWhatsAppOpen] = useState(false)
  const [isRemoveSessionModalOpen, setIsRemoveSessionModalOpen] =
    useState(false)

  const isConnected = useMemo(() => {
    return (
      whatsappSessionStatus?.data?.status === WhatsAppConnectionStatus.READY
    )
  }, [whatsappSessionStatus?.data?.status])

  const whatsappStatus = useMemo(() => {
    return isConnected
      ? t('customMessage:whatsappWeb.connectedText')
      : t('customMessage:whatsappWeb.disconnectedText')
  }, [isConnected, t])

  const description = useMemo(() => {
    return isConnected
      ? t('customMessage:whatsappWeb.connectedDescription')
      : t('customMessage:whatsappWeb.disconnectedDescription')
  }, [isConnected, t])

  const handleShowQrCode = () => {
    setIsConnectWhatsAppOpen(true)
  }
  const handleRefreshStatus = () => {
    refetchSessionStatus()
  }

  return (
    <Card className="w-full bg-gray-100/70 border-none rounded-sm">
      {isWhatsappSessionStatusLoading || !whatsappSession ? (
        <div className="py-4">
          <Spinner />
        </div>
      ) : (
        <>
          <CardHeader>
            <CardTitle>
              {t('customMessage:whatsappWeb.whatsappConnectedWording')}{' '}
              <span
                className={cn({
                  'text-green-500': isConnected,
                  'text-red-500': !isConnected,
                })}
              >
                {whatsappStatus}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 justify-between items-center">
              <p>{description}</p>
              {!isConnected && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsRemoveSessionModalOpen(true)}
                    variant="destructive-outline"
                  >
                    {t('customMessage:whatsappWeb.removeSession')}
                  </Button>
                  <Button onClick={handleShowQrCode}>
                    {t('customMessage:whatsappWeb.showQrCode')}
                  </Button>
                </div>
              )}
              {isConnected && (
                <div className="flex gap-2">
                  <Button onClick={handleRefreshStatus}>
                    {t('customMessage:whatsappWeb.refreshStatus')}
                  </Button>
                  <Button
                    onClick={() => setIsRemoveSessionModalOpen(true)}
                    variant="destructive-outline"
                  >
                    {t('customMessage:whatsappWeb.removeSession')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </>
      )}
      <WhatsAppModalScanQrCode
        isOpen={isConnectWhatsAppOpen}
        onOpenChange={setIsConnectWhatsAppOpen}
      />
      <RemoveWhatsAppConnection
        isOpen={isRemoveSessionModalOpen}
        onOpenChange={setIsRemoveSessionModalOpen}
      />
    </Card>
  )
}

export default WhatsappConnection
