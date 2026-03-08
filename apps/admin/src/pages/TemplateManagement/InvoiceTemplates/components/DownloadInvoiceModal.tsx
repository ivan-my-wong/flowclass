import { Dispatch, FC, SetStateAction } from 'react'

import { useTranslation } from 'react-i18next'

import ModalDialog from '@/components/ui/ModalDialog'

type Props = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  pdfUrl?: string | null
}

const DownloadInvoiceModal: FC<Props> = ({ isOpen, setIsOpen, pdfUrl }) => {
  const { t } = useTranslation(['invoiceCampaign'])
  return (
    <ModalDialog
      title={t('campaignRecipient.downloadInvoice')}
      open={isOpen}
      onOpenChange={setIsOpen}
      className="!w-screen-md h-screen"
      classBody="p-0 !w-screen-md h-screen"
    >
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          className="w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer"
          title={t('campaignRecipient.downloadInvoice') as string}
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-muted-foreground">
          {t('common:noData', { defaultValue: 'No document to preview.' })}
        </div>
      )}
    </ModalDialog>
  )
}

export default DownloadInvoiceModal
