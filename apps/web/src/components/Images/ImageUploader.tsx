// import { Close, Title } from '@radix-ui/react-dialog'
// import heic2any from 'heic2any'
import { useRef, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { BsUpload } from 'react-icons/bs'
import { centerCrop, Crop, makeAspectCrop } from 'react-image-crop'

// import { styled } from 'react-query/types/devtools/utils'
import Button from '@/components/Buttons/Button'
import imageUrls from '@/constants/imageUrls'

import SkeletonLoader from '../Loaders/SkeletonLoader'

interface ImageUploaderProps {
  onSuccess: (data: File) => void
  aspect?: number
  onProcessingChange?: (processing: boolean) => void
}

const ImageUploader = ({
  onSuccess,
  aspect = 16 / 9,
  onProcessingChange,
}: ImageUploaderProps): JSX.Element => {
  const [imgSrc, setImgSrc] = useState(imageUrls.defaultFallback)
  const [imgName, setImgName] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProcessing(true)
      onProcessingChange?.(true)
      const originalFile = e.target.files[0]
      let imgName = originalFile.name.toLowerCase()
      const fileType = originalFile.type.toLowerCase()
      const isHeic =
        imgName.endsWith('.heic') ||
        imgName.endsWith('.heif') ||
        fileType.includes('heic') ||
        fileType.includes('heif')

      if (isHeic) {
        const blob = new Blob([originalFile], { type: originalFile.type || 'image/heic' })
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const heic2any = require('heic2any')
          heic2any({ blob })
            .then((convertedFile: any) => {
              // Handle array response (heic2any can return array)
              const blobResult = Array.isArray(convertedFile) ? convertedFile[0] : convertedFile
              imgName = imgName.replace(/\.(HEIC|HEIF)$/i, '.png')
              const convertedBlob = blobResult as Blob
              const file = new File([convertedBlob], imgName, {
                type: convertedBlob.type || 'image/png',
              })
              setImgSrc(URL.createObjectURL(convertedBlob))
              setCrop(undefined)
              setImgName(imgName)
              onSuccess(file)
              setProcessing(false)
              onProcessingChange?.(false)
            })
            .catch((error: any) => {
              console.error('HEIC conversion failed:', error)
              // Fallback: try to use original file if conversion fails
              const reader = new FileReader()
              reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() ?? '')
                setCrop(undefined)
                setImgName(imgName)
                onSuccess(originalFile)
                setProcessing(false)
                onProcessingChange?.(false)
              })
              reader.readAsDataURL(originalFile)
            })
        } else {
          setProcessing(false)
          onProcessingChange?.(false)
        }
      } else {
        const reader = new FileReader()
        reader.addEventListener('load', async () => {
          setImgSrc(reader.result?.toString() ?? '')
          setCrop(undefined)
          setImgName(imgName)
          onSuccess(originalFile)
          setProcessing(false)
          onProcessingChange?.(false)
        })
        reader.readAsDataURL(originalFile)
      }
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(
        centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 100,
            },
            aspect,
            width,
            height
          ),
          width,
          height
        )
      )
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="box-col-full">
      <Button
        onClick={handleButtonClick}
        className="w-fit px-5 py-3"
        iconAfter={<BsUpload />}
        isLoading={processing}
        disabled={processing}
        // variant="outlined"
      >
        {t('component:ImageUpload.uploadImage')}
      </Button>
      {processing ? (
        <div className="w-1/2">
          <SkeletonLoader height={200} />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
            alignItems: 'center',
            backgroundColor: '$background',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={onSelectImage}
            id="image-upload"
            hidden
          />
          <div className="box-responsive-full my-4 max-w-2xl justify-center rounded-md border border-gray-100">
            <img
              ref={imgRef}
              alt=""
              src={imgSrc}
              onLoad={onImageLoad}
              className="h-full w-full object-contain md:w-2/3 lg:w-1/2"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
