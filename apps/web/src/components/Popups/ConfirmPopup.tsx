import { useEffect, useRef } from 'react'

import useTranslation from 'next-translate/useTranslation'

import Button from '../Buttons/Button'
import Text from '../Texts/Text'

import Modal from './Modal'

type ConfirmPopupProps = {
  type?: 'confirm' | 'delete'
  title: string
  message?: string
  trigger: React.ReactNode
  onConfirm: () => Promise<void>
  isLoading?: boolean
  isAsyncPopup?: boolean
}

export const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
  title,
  message,
  trigger,
  onConfirm,
  type = 'confirm',
  isLoading = false,
  isAsyncPopup = false,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm()
    if (!isAsyncPopup) {
      closeBtnRef.current?.click()
    }
  }
  useEffect(() => {
    if (isAsyncPopup && !isLoading) {
      closeBtnRef.current?.click()
    }
  }, [isAsyncPopup, isLoading])

  return (
    <Modal trigger={trigger}>
      <Modal.Title className="font-medium">{title}</Modal.Title>
      <Text className="mt-2">{message}</Text>
      <Modal.ButtonGroup>
        <div className="mt-2 flex w-full justify-end gap-2">
          <Modal.Close asChild>
            <Button variant="text">{t('common:action.cancel')}</Button>
          </Modal.Close>
          <Button
            onClick={handleConfirm}
            isLoading={isLoading}
            variant={type === 'confirm' ? 'text' : 'danger'}
          >
            {t('common:action.confirm')}
          </Button>
        </div>
      </Modal.ButtonGroup>
    </Modal>
  )
}

export default ConfirmPopup
