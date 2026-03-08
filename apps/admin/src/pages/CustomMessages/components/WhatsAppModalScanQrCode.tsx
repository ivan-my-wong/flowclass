import { useEffect, useRef } from 'react'

import { QRCodeCanvas } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WhatsAppConnectionStatus } from '@/api/whatsappWeb'
import { Spinner } from '@/components/Loaders/Spinner'
import ModalDialog from '@/components/ui/ModalDialog'
import { useWhatsappWeb } from '@/hooks/useWhatsappWeb'

const WhatsAppModalScanQrCode = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}): React.ReactElement => {
  const { t } = useTranslation()
  const previousQrCodeRef = useRef<string | null>(null)

  const { useGetSessionStatus } = useWhatsappWeb()

  const {
    data: sessionStatus,
    isLoading: isLoadingSessionStatus,
    error: sessionStatusError,
  } = useGetSessionStatus(isOpen) // Enable polling when modal is open

  const isReady = sessionStatus?.data?.status === WhatsAppConnectionStatus.READY
  const currentQrCode = sessionStatus?.data?.qrCode

  // Track QR code changes and show toast
  useEffect(() => {
    if (
      currentQrCode &&
      previousQrCodeRef.current &&
      currentQrCode !== previousQrCodeRef.current
    ) {
      toast.info(t('customMessage:whatsappWeb.qrCodeUpdated'))
    }
    previousQrCodeRef.current = currentQrCode || null
  }, [currentQrCode, t])

  const renderQrCode = () => {
    if (sessionStatus?.data?.status === WhatsAppConnectionStatus.READY) {
      return <div className="pb-4" />
    }

    if (sessionStatus?.data?.qrCode) {
      return (
        <div className="flex flex-col items-center justify-center text-center pb-4">
          <p>{t('customMessage:whatsappWeb.notYetConnected')}</p>
          <div data-testid="qr-code" className="p-4 bg-white rounded-lg">
            <QRCodeCanvas
              value={sessionStatus.data.qrCode}
              size={256}
              level="M"
              includeMargin
            />
          </div>
          <p>{t('customMessage:modalScanQrCode.mayTakeLongTime')}</p>
          <p>{t('customMessage:modalScanQrCode.retryScanIfNotWorking')}</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Spinner />
        <p>{t('customMessage:whatsappWeb.isInititializing')}</p>
      </div>
    )
  }

  return (
    <ModalDialog
      title={t('customMessage:modalScanQrCode.title').toString()}
      open={isOpen}
      onOpenChange={onOpenChange}
      className="max-w-screen md:!max-w-xl"
    >
      {isLoadingSessionStatus && <Spinner />}
      {isReady && <p>{t('customMessage:modalScanQrCode.connected')}</p>}
      {renderQrCode()}
      {sessionStatusError && (
        <div className="text-red-500 mb-4">
          {t('customMessage:modalScanQrCode.connectionError')}
        </div>
      )}
    </ModalDialog>
  )
}

export default WhatsAppModalScanQrCode
