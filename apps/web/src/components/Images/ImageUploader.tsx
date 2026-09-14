import { useRef, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { BsUpload } from 'react-icons/bs'
import { centerCrop, Crop, makeAspectCrop } from 'react-image-crop'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import imageUrls from '@/constants/imageUrls'
import { compressImageFile, MAX_FILE_SIZE_BYTES } from '@/utils/imageCompression'

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

  const onSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProcessing(true)
      onProcessingChange?.(true)
      const originalFile = e.target.files[0]

      try {
        // Compress & resize image (HEIC -> JPEG, downscale to max 1920px, 80% quality)
        const processedFile = await compressImageFile(originalFile)

        // Validate max file size (10MB)
        if (processedFile.size > MAX_FILE_SIZE_BYTES) {
          toast.error(t('errors:PAYLOAD_TOO_LARGE') as string)
          setProcessing(false)
          onProcessingChange?.(false)
          if (inputRef.current) inputRef.current.value = ''
          return
        }

        const isPdf =
          processedFile.type === 'application/pdf' ||
          processedFile.name.toLowerCase().endsWith('.pdf')

        if (isPdf) {
          setImgName(processedFile.name)
          setCrop(undefined)
          onSuccess(processedFile)
        } else {
          setImgSrc(URL.createObjectURL(processedFile))
          setCrop(undefined)
          setImgName(processedFile.name)
          onSuccess(processedFile)
        }
      } catch (error) {
        console.error('Image processing failed:', error)
        toast.error(t('enrol:uploadReceipt.uploadFailed') as string)
      } finally {
        setProcessing(false)
        onProcessingChange?.(false)
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
            accept="image/*,application/pdf"
            ref={inputRef}
            onChange={onSelectImage}
            id="image-upload"
            hidden
          />
          <div className="box-responsive-full my-4 max-w-2xl justify-center rounded-md border border-gray-100">
            {imgName.endsWith('.pdf') ? (
              <div className="flex h-48 w-full flex-col items-center justify-center bg-gray-50 text-gray-500 md:w-2/3 lg:w-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-2 h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="px-4 text-center text-sm font-medium">{imgName}</span>
                <span className="mt-1 text-xs">(PDF Selected)</span>
              </div>
            ) : (
              <img
                ref={imgRef}
                alt=""
                src={imgSrc}
                onLoad={onImageLoad}
                className="h-full w-full object-contain md:w-2/3 lg:w-1/2"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
