import { useEffect, useMemo, useRef, useState } from 'react'

import { Title } from '@radix-ui/react-dialog'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import ImageAspect from '@/components/Images/ImageAspect'
import { TextInput } from '@/components/Inputs/TextInput'
import CreatableSelector from '@/components/Selector/CreatableSelector'
import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import ImageCropper from '@/components/ui/ImageCropper'
import ModalDialog from '@/components/ui/ModalDialog'
import useFileUpload from '@/hooks/useFileUpload'
import { InstitutionMediaUploadResponse } from '@/types/apiResponse'

const defaultTag: SimpleSelectorItemProps = {
  label: t(`school:gallery.imageTag.all`),
  value: 'all',
}

type ImageUploaderProps = {
  onSuccess: (data: InstitutionMediaUploadResponse) => void
  onUpdateSuccess?: (data: InstitutionMediaUploadResponse) => void
  aspect?: number
  institutionId: number
  siteId: number
  tagList: SimpleSelectorItemProps[]
  currentImageTag?: string
  isOpen: boolean
  onClose: () => void
  gallery?: InstitutionMediaUploadResponse | null
}

const SchoolGalleryImageUploader = ({
  onSuccess,
  onUpdateSuccess,
  aspect = 21 / 9,
  institutionId,
  siteId,
  tagList,
  gallery,
  currentImageTag,
  isOpen,
  onClose,
}: ImageUploaderProps): JSX.Element => {
  const { t } = useTranslation()
  const [imgSrc, setImgSrc] = useState('')
  const [imgName, setImgName] = useState('')
  const [blob, setBlob] = useState<Blob | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { useInstitutionGalleryImageUpload, useInstitutionGalleryImageUpdate } =
    useFileUpload()
  const isUpdate = useMemo(() => !!gallery, [gallery])
  const uploadGalleryMutation = useInstitutionGalleryImageUpload(
    (data: InstitutionMediaUploadResponse) => onSuccess(data)
  )
  const useInstitutionGalleryImageUpdateResult =
    useInstitutionGalleryImageUpdate((data: InstitutionMediaUploadResponse) =>
      onUpdateSuccess?.(data)
    )
  const [caption, setCaption] = useState<string>('')
  const [tags, setTags] = useState<SimpleSelectorItemProps>(defaultTag)
  const [tagOptions, setTagOptions] =
    useState<SimpleSelectorItemProps[]>(tagList)

  useEffect(() => {
    setTagOptions(tagList)
  }, [tagList])

  useEffect(() => {
    if (currentImageTag) {
      setTags(() => {
        const foundTag = tagList.find(tag => tag.value === currentImageTag)
        return foundTag ?? defaultTag
      })
    }
  }, [currentImageTag, tagList])

  useEffect(() => {
    if (isUpdate && gallery) {
      setCaption(gallery.caption)
      setTags({
        label: t(`school:gallery.imageTag.${gallery?.tags}`).replace(
          'gallery.imageTag.',
          ''
        ),
        value: gallery?.tags,
      })
    }
  }, [gallery, isUpdate, gallery?.tags])

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImgName(e.target.files[0].name)
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() ?? '')
      )
      reader.readAsDataURL(e.target.files[0])
    }
  }

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

      await uploadGalleryMutation.mutateAsync({
        file,
        institutionId,
        siteId,
        caption,
        tags: tags.value?.toString(),
      })
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  useEffect(() => {
    if (uploadGalleryMutation.isSuccess) {
      onClose?.()
    }
  }, [uploadGalleryMutation.isSuccess])

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleOpenChange = () => {
    onClose()
    setImgSrc('')
    setImgName('')
  }

  const updatedGallery = () => {
    if (!isUpdate || !gallery) return
    useInstitutionGalleryImageUpdateResult.mutate({
      id: gallery.id,
      institutionId,
      caption,
      tags: tags.value?.toString(),
    })
  }

  const submitChanges = () => {
    if (isUpdate && gallery) {
      updatedGallery()
    } else {
      getFileAndCallback()
    }
  }

  return (
    <>
      <ModalDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        onSubmit={submitChanges}
        footerClassName="justify-center"
        className="max-w-2xl"
        title={
          t(
            isUpdate
              ? `school:gallery.updateGallery`
              : `school:gallery.addGallery`
          ) as string
        }
        footer={
          <>
            <Button onClick={() => onClose()} variant="destructive">
              {t(`component:ImageUpload.cancel`)}
            </Button>
            <Button
              loading={uploadGalleryMutation.isLoading}
              disabled={
                isUpdate
                  ? !tags.value || uploadGalleryMutation.isLoading
                  : !blob || uploadGalleryMutation.isLoading
              }
              onClick={submitChanges}
              className="h-10"
              data-testid="confirm-upload-btn"
            >
              {t(
                isUpdate
                  ? `component:ImageUpload.update`
                  : `component:ImageUpload.confirm`
              )}
            </Button>
          </>
        }
      >
        <Box direction="col">
          {isUpdate ? (
            <Title>{t(`component:ImageUpload.updateTitle`)} </Title>
          ) : (
            <Title>{t(`component:ImageUpload.title`)} </Title>
          )}

          {!isUpdate && (
            <Button
              onClick={handleButtonClick}
              className="w-fit"
              aria-label={
                t('component:ImageUpload.selectImageButton') as string
              }
            >
              {t('component:ImageUpload.uploadImage')}
            </Button>
          )}
          <div className="flex gap-x-2 w-full">
            <Box className="m-4 !text-left" align="start" direction="col">
              <p className="whitespace-nowrap">
                {t('component:ImageUpload.tags')}:{' '}
              </p>
              <CreatableSelector
                value={tags}
                options={tagOptions}
                onChange={newValue => {
                  setTags(newValue as SimpleSelectorItemProps)
                }}
              />
            </Box>
            <Box className="my-4 !text-left" align="start" direction="col">
              <Text noWrap>{t('component:ImageUpload.caption')}:</Text>
              <TextInput
                value={caption}
                onChange={e => setCaption(e.target.value)}
              />
            </Box>
          </div>
          {!imgSrc && isUpdate && gallery && (
            <Box>
              <ImageAspect
                s3="public"
                width="40rem"
                ratio={aspect}
                alt="gallery image"
                src={gallery.imageUrl}
              />
            </Box>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg"
            ref={inputRef}
            onChange={onSelectImage}
            id="image-upload"
            hidden
          />
          {imgSrc && (
            <ImageCropper
              className="w-full"
              fileSrc={imgSrc}
              ratio={aspect}
              onActionSave={(result, blob) => {
                setBlob(blob)
              }}
            />
          )}
        </Box>
      </ModalDialog>
    </>
  )
}

export default SchoolGalleryImageUploader
