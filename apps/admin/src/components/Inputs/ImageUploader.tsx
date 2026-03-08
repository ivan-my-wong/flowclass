import { useEffect, useRef, useState } from 'react'

import { Title } from '@radix-ui/react-dialog'
import heic2any from 'heic2any'
import { t } from 'i18next'
import { toast } from 'sonner'

import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import useFileUpload from '@/hooks/useFileUpload'
import { MediaUploadResponse } from '@/types/apiResponse'

import Modal from '../Popups/Modal'
import Box from '../ui/Box'
import { Button } from '../ui/Button'
import ImageCropper from '../ui/ImageCropper'

type PropTypes = {
  onSuccess: (data: MediaUploadResponse) => void
  directory: MediaFileDirectory
  userRole?: 'admin' | 'student'
  aspect?: number
}

const ImageUploader = ({
  onSuccess,
  userRole = 'admin',
  directory,
  aspect = 16 / 9,
}: PropTypes): JSX.Element => {
  const [imgSrc, setImgSrc] = useState('')
  const [imgName, setImgName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { useImageUpload, useImageUploadPublic } = useFileUpload()
  const uploadImageResult = useImageUpload(directory, onSuccess)
  const uploadImageResultPublic = useImageUploadPublic(directory, onSuccess)

  const onSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      let file = e.target.files[0]

      let imgName = e.target.files[0].name.toLowerCase()
      if (imgName.endsWith('.heic')) {
        const blob = new Blob([e.target.files[0]], { type: 'heic' })
        let objectUrl: string | null = null
        try {
          const originalFile = await heic2any({ blob })
          imgName = imgName.replace(/\.HEIC$/i, '.png')

          file = new File([originalFile as Blob], imgName, {
            type: 'image/png',
          })
          objectUrl = URL.createObjectURL(file)
          setImgSrc(objectUrl)
        } catch (error) {
          toast.error(t('component:ImageUpload.heicConversionError'))
          if (objectUrl) URL.revokeObjectURL(objectUrl as string)
          return null
        }
      } else {
        const reader = new FileReader()
        reader.addEventListener('load', async () => {
          setImgSrc(reader.result?.toString() ?? '')
        })
        reader.readAsDataURL(file)
      }
      setImgName(imgName)
    }
    return null
  }
  const [blob, setBlob] = useState<Blob | null>(null)

  const getFileAndCallback = async () => {
    try {
      if (!blob) {
        const message = t(`component:ImageUpload.wrongFormat`)
        throw new Error(message)
      }
      const file = new File([blob], imgName, {
        lastModified: new Date().getTime(),
        type: blob.type,
      })

      if (userRole === 'student') {
        uploadImageResultPublic.mutate(file)
      } else {
        uploadImageResult.mutate(file)
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleOpenChange = () => {
    setIsOpen(!isOpen)
    setImgSrc('')
    setImgName('')
  }

  const handleSave = (croppedImage: string, blob: Blob) => {
    setBlob(blob)
  }

  useEffect(() => {
    if (uploadImageResult.isSuccess) {
      setIsOpen(false)
      setBlob(null)
      setImgSrc('')
      setImgName('')
    }
  }, [uploadImageResult.isSuccess])

  const isLoader = !blob && !!imgSrc

  return (
    <>
      <Modal
        open={isOpen}
        onOpenChange={handleOpenChange}
        trigger={
          <Button variant="outline">
            {t(`component:ImageUpload.uploadImage`)}
          </Button>
        }
      >
        <Box direction="col">
          <Box
            direction="col"
            border
            className="mt-4 py-3"
            role="region"
            aria-label={t('component:ImageUpload.uploadSection') as string}
          >
            <Title>{t(`component:ImageUpload.title`)} </Title>
            <Button
              onClick={handleButtonClick}
              className="w-fit"
              aria-label={
                t('component:ImageUpload.selectImageButton') as string
              }
            >
              {t('component:ImageUpload.uploadImage')}
            </Button>
          </Box>
          <input
            type="file"
            accept="image/png, image/jpeg, .HEIC"
            ref={inputRef}
            onChange={onSelectImage}
            id="image-upload"
            hidden
          />
          {imgSrc && (
            <Box responsive className="mx-md" justify="center">
              <ImageCropper
                className="w-full"
                fileSrc={imgSrc}
                onActionSave={handleSave}
                ratio={aspect}
              />
            </Box>
          )}
          <Box gap="lg">
            <Button
              variant="destructive"
              disabled={uploadImageResult.isLoading}
              onClick={() => setIsOpen(!isOpen)}
            >
              {t(`component:ImageUpload.cancel`)}
            </Button>
            <Button
              loading={uploadImageResult.isLoading || isLoader}
              disabled={!blob || uploadImageResult.isLoading}
              onClick={getFileAndCallback}
              data-testid="confirm-upload-btn"
              className="h-10"
            >
              {isLoader
                ? t(`component:ImageUpload.loader`)
                : t(`component:ImageUpload.confirm`)}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default ImageUploader
