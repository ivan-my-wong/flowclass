import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'

import ImageCropper from './ImageCropper'

// import 'react-image-crop/dist/ReactCrop.css'

type IProps = {
  fileSrc: string | undefined
  isOpen: boolean
  ratio?: number | undefined
  onActionSave: (result: string, blob: Blob) => void
  onActionCancel: () => void
}
const ModalCropImage = ({
  fileSrc,
  isOpen,
  ratio: aspectRatio,
  onActionCancel,
  onActionSave,
}: IProps): React.ReactElement => {
  const { t } = useTranslation()
  const [cropResult, setCropResult] = useState<{
    blob: Blob | null
    image: string | null
  }>({ blob: null, image: null })
  const handleSave = () => {
    if (cropResult.blob && cropResult.image) {
      onActionSave(cropResult.image, cropResult.blob)
    }
  }
  const onCropChange = (result: string, blob: Blob) => {
    setCropResult({ blob, image: result })
  }

  return (
    <ModalDialog
      open={isOpen}
      title={t('common:action:imageUpload') as string}
      footer={
        <>
          <Button
            type="button"
            className="w-1/2"
            variant="outline"
            onClick={onActionCancel}
          >
            {t('common:action:cancel')}
          </Button>
          <Button type="button" className="w-1/2" onClick={handleSave}>
            {t('common:action:confirm')}
          </Button>
        </>
      }
    >
      <ImageCropper
        fileSrc={fileSrc}
        onActionSave={onCropChange}
        ratio={aspectRatio}
      />
    </ModalDialog>
  )
}

export default ModalCropImage
