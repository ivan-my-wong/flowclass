import { useRef, useState } from 'react'

import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

import ModalDialog from '@/components/ui/ModalDialog'
import { DataTestId } from '@/types/common'

import { useResponsive } from '../../hooks/useResponsive'
import ZoomableImage from '../Images/ZoomableImage'
import { Button } from '../ui/Button'

type ConfirmPopupProps = {
  className?: string
  title: string
  description?: string
  imgUrl?: string
  trigger: React.ReactNode
  onConfirm?: () => void
  onReject?: () => void
  confirmText?: string
  rejectText?: string
  objectFit?: 'cover' | 'fill' | 'contain'
} & DataTestId

export const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
  title,
  description,
  imgUrl,
  trigger,
  onConfirm,
  onReject,
  confirmText = t('common:action.confirm'),
  rejectText = t('common:action.reject'),
  objectFit,
  dataTestId,
  className,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm?.()
    setOpen(false)
  }

  const handleReject = () => {
    onReject?.()
    setOpen(false)
  }

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(true)
        }}
        style={{ display: 'inline-block' }}
        data-testid={dataTestId}
      >
        {trigger}
      </span>
      <ModalDialog
        open={open}
        onOpenChange={setOpen}
        className={className}
        title={title}
        footer={
          <div className="box-row-full">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              ref={closeBtnRef}
            >
              {t('common:action.cancel')}
            </Button>
            {onConfirm && (
              <Button onClick={handleConfirm} data-testid="confirm-button">
                {confirmText}
              </Button>
            )}
            {onReject && (
              <Button
                variant="destructive"
                onClick={handleReject}
                data-testid="reject-button"
              >
                {rejectText}
              </Button>
            )}
          </div>
        }
      >
        <div className="box-col-full">
          {imgUrl && (
            <ZoomableImage
              src={imgUrl}
              alt={title as string}
              s3="private"
              width={isDesktop ? '45rem' : '100%'}
              objectFit={objectFit}
              zoomInAriaLabel={t('student:paymentProof.zoomIn') as string}
              zoomOutAriaLabel={t('student:paymentProof.zoomOut') as string}
            />
          )}
          <div className="text-[15px] leading-normal text-slate-500">
            {description}
          </div>
        </div>
      </ModalDialog>
    </>
  )
}

export default ConfirmPopup
