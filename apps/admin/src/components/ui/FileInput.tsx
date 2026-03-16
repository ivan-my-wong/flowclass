import {
  ChangeEvent,
  DragEvent,
  forwardRef,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

import { ControllerRenderProps, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuX } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import { getPrivateFileAccessUrl } from '@/api/uploadFile'
import { Label } from '@/components/ui/Label'
import ModalCropImage from '@/components/ui/ModalCropImage'
import {
  isPrivateMediaDirectory,
  MediaFileDirectory,
} from '@/constants/MediaFileDirectory'
import useFileUpload from '@/hooks/useFileUpload'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { cn } from '@/utils/cn'
import { getMediaFileUrl } from '@/utils/generate-link.utils'

import SkeletonLoader from '../Loaders/SkeletonLoader'

import { Button } from './Button'

type IProps = {
  croppable?: boolean
  onFileUpload?: (url: string) => void
  directory: MediaFileDirectory
  imageUrl?: string
  label?: string
  field?: ControllerRenderProps<any, any>
  form?: UseFormReturn<any, any>
  classDropZone?: string
  ['data-testid']?: string
  aspectRatio?: number
  onUploadStart?: () => void
}

const DraggableFileInput = forwardRef<HTMLInputElement, IProps>(
  (
    {
      croppable,
      label,
      onFileUpload,
      imageUrl,
      directory,
      classDropZone,
      'data-testid': dataTestId,
      aspectRatio,
      onUploadStart,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation()
    const schoolData = useRecoilValue(schoolState)
    const siteData = useRecoilValue(siteState)
    const currentSchoolId = schoolData.currentSchool?.id
    const currentSiteId = siteData.currentSite?.id
    const [isOpenModalCrop, setIsOpenModalCrop] = useState(false)
    const [fileState, setFileState] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imageToCrop, setImageToCrop] = useState<string | undefined>(
      undefined
    )
    const [preview, setPreview] = useState<string | undefined>(undefined)

    const { useImageUpload, useImageUploadPublic } = useFileUpload()
    const { isLoading: isUploading, mutateAsync: uploadImage } = useImageUpload(
      directory,
      data => {
        if (props.form && props.field && props.field.name) {
          props.form.setValue(props.field.name, data.url)
        }
        onFileUpload?.(data.url)
      }
    )

    const { isLoading: isPublicUploading, mutateAsync: uploadImagePublic } =
      useImageUploadPublic(directory, data => {
        if (props.form && props.field && props.field.name) {
          props.form.setValue(props.field.name, data.url)
        }
        onFileUpload?.(data.url)
      })

    const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
      e.preventDefault()
      e.stopPropagation()
      const { files } = e.dataTransfer
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
      const { files } = e.target
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    }

    const handleFile = (file: File): void => {
      setFileState(file)
      onUploadStart?.()
      const reader = new FileReader()
      reader.onloadend = () => {
        if (croppable) {
          setImageToCrop(reader.result as string)
          setIsOpenModalCrop(true)
        } else {
          setPreview(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }

    const handleModalCrop = (result: string, blob: Blob): void => {
      setIsOpenModalCrop(false)
      setPreview(result)

      const fileRes = new File([blob], fileState?.name || `Unnamed.png`, {
        lastModified: new Date().getTime(),
        type: blob.type,
      })

      if (currentSiteId && currentSchoolId) uploadImage(fileRes)
      else uploadImagePublic(fileRes)
    }

    const handleClick = (): void => {
      fileInputRef.current?.click()
    }

    const handleRemoveFile = (): void => {
      setFileState(null)
      setPreview(undefined)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (props.form && props.field && props.field.name) {
        props.form.setValue(props.field.name, '')
      }

      onFileUpload?.('')
    }

    useEffect(() => {
      const readFileUrl = async (fileUrl: string) => {
        if (
          isPrivateMediaDirectory[
            directory as keyof typeof isPrivateMediaDirectory
          ]
        ) {
          const result = await getPrivateFileAccessUrl(fileUrl)
          setPreview(result)
        } else {
          setPreview(getMediaFileUrl(fileUrl))
        }
      }
      if (props.field?.value) {
        if (!props.field.value.includes('https://')) {
          readFileUrl(props.field.value)
        }
      }
      if (imageUrl) {
        readFileUrl(imageUrl)
      }
    }, [props.field?.value])

    return (
      <>
        <div className="flex flex-col w-full pb-2">
          {label && (
            <div
              className={cn(
                'flex justify-between items-center border-b border-gray-300 mb-4'
              )}
            >
              <Label>{label}</Label>
              <Button
                type="button"
                variant="ghost"
                className="text-primary px-0"
                onClick={handleClick}
                data-testid={dataTestId}
              >
                {t('common:action.upload')}
              </Button>
            </div>
          )}

          <div className="flex flex-col items-start justify-center">
            <div
              tabIndex={0}
              className={cn(
                'overflow-hidden flex flex-col items-center justify-center w-52 h-52 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-sky-500/20',
                classDropZone
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleClick}
              onKeyDown={handleClick}
              role="button"
              data-testid={dataTestId}
            >
              <input
                type="file"
                ref={el => {
                  ;(
                    fileInputRef as React.MutableRefObject<HTMLInputElement | null>
                  ).current = el
                  if (typeof ref === 'function') ref(el)
                  else if (ref) {
                    const refToAssign =
                      ref as React.MutableRefObject<HTMLInputElement | null>
                    refToAssign.current = el
                  }
                }}
                className="hidden"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
              />
              {preview ? (
                <div className="relative w-full h-full overflow-hidden box-border p-0">
                  {isUploading || isPublicUploading ? (
                    <SkeletonLoader height="100%" width="100%" />
                  ) : (
                    <img
                      src={preview}
                      alt="Preview"
                      className="object-contain object-center select-none w-full h-full"
                    />
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full w-8 h-8 focus:outline-none"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation()
                      handleRemoveFile()
                    }}
                  >
                    <LuX className="w-6 h-6" />
                  </Button>
                </div>
              ) : (
                <p className=" text-sm text-center text-gray-700 px-4">
                  {t('component:courseEditDialog.uploadImage.dragAndDrop')}
                </p>
              )}
            </div>
          </div>
        </div>
        {croppable && imageToCrop && (
          <ModalCropImage
            fileSrc={imageToCrop}
            isOpen={isOpenModalCrop}
            onActionSave={handleModalCrop}
            onActionCancel={(): void => setIsOpenModalCrop(false)}
            ratio={aspectRatio}
          />
        )}
      </>
    )
  }
)

export default DraggableFileInput
