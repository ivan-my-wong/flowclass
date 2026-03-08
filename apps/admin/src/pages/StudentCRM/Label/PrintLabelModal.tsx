import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'

import { Portal, Root } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'

import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import LabelPrint from '@/pages/StudentCRM/Label/LabelPrint'

import { QRCodeAttendanceModalHandle } from '../QRCode/QRCodeAttendanceModal'

type PrintLabelModalProps = {
  hidden?: boolean
  qrCodeModalRef?: React.RefObject<QRCodeAttendanceModalHandle>
  labelData: any
}

export type PrintLabelModalHandle = {
  handleOpenChange: () => void
}

const PrintLabelModal = forwardRef<PrintLabelModalHandle, PrintLabelModalProps>(
  ({ hidden, labelData, qrCodeModalRef }, ref) => {
    const [open, setOpen] = useState<boolean>(false)

    const { t } = useTranslation()

    const handleOpenChange = () => {
      setOpen(!open)
    }

    useImperativeHandle(ref, () => ({
      handleOpenChange,
    }))

    useEffect(() => {
      // We need to set style of body to empty string because:
      // When go to edit page that the dropdown state is open, the dropdown component set style of body to cursor-pointer: none
      // And after user back to setting payments page there is nothing the user can click. So we need to set style of body to empty string
      if (open) {
        document.body.style.cursor = 'default'
        document.body.style.pointerEvents = 'auto'
      }
    }, [open])

    return (
      <Root open={open} onOpenChange={handleOpenChange}>
        <Portal>
          <StyledOverlay />
          <StyledContent
            style={{
              height: 'auto',
              maxHeight: '100%',
              width: '100%',
              padding: '$4',
            }}
          >
            <h2 className="text-2xl font-bold">
              {t('student:menu:printLabel')}
            </h2>

            <Separator />

            <LabelPrint
              labelData={labelData}
              onBack={() => {
                setOpen(false)
                if (qrCodeModalRef) {
                  qrCodeModalRef.current?.handleOpenChange()
                }
              }}
            />

            <ModalCloseButton />
          </StyledContent>
        </Portal>
      </Root>
    )
  }
)

export default PrintLabelModal
