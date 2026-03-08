import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuPencil, LuTrash2 } from 'react-icons/lu'

import AddIcon from '@/assets/svgs/AddIcon'
import ImageAspect from '@/components/Images/ImageAspect'
import SvgIcon from '@/components/Images/SvgIcon'
import { Spinner } from '@/components/Loaders/Spinner'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import BoxWithToggleGroup from '@/components/ToggleGroup/BoxWithToggleGroup'
import TourGuide from '@/components/Tour/TourGuide'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { TourGuideKeys } from '@/constants/guides'
import useFileUpload from '@/hooks/useFileUpload'
import useSchoolData from '@/hooks/useSchoolData'
import { useSchoolEditSave } from '@/hooks/useSchoolEditSave'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { InstitutionMediaUploadResponse } from '@/types/apiResponse'
import { ImageTag } from '@/types/school'

import SchoolGalleryImageUploader from './SchoolGalleryImageUploader'
import { getGalleryTourSteps } from './schoolTourSteps'

interface BasicProps {
  tabName: string
  allSaveMethods: (tabName: string, saveAll: () => Promise<void>) => void
}

export const imageTaglabels: ImageTag[] = [
  'all',
  'environment',
  'student',
  'courseReview',
  'teacherQualification',
]

const Gallery = ({ tabName, allSaveMethods }: BasicProps): JSX.Element => {
  const { t } = useTranslation()
  const [isOpenModalGallery, setIsOpenModalGallery] = useState(false)
  const [currentImageTag, setCurrentImageTag] = useState<ImageTag>('all')
  const { useDeleteInstitutionGalleryImage } = useFileUpload()
  const [showDeleteImagePopup, setShowDeleteImagePopup] = useState(false)
  const [galleryImageToDelete, setGalleryImageToDelete] =
    useState<InstitutionMediaUploadResponse | null>(null)
  const [tagList, setTagList] = useState<SimpleSelectorItemProps[]>([])
  const [selectedGallery, setSelectedGallery] =
    useState<InstitutionMediaUploadResponse | null>(null)
  const {
    currentSchool,
    setCurrentSchool,
    isUnsavedChanges,
    setIsUnsavedChanges,
  } = useSchoolEditSave()

  const [allGalleries, setAllGalleries] = useState<
    InstitutionMediaUploadResponse[]
  >([])
  useEffect(() => {
    if (currentSchool?.galleries) {
      setAllGalleries(currentSchool.galleries)
    }
  }, [currentSchool?.galleries])
  const { useUpdateSchool } = useSchoolData()
  const updateSchoolResult = useUpdateSchool(currentSchool?.id ?? 0, true)

  const initializeTagList = () => {
    const tagSet = new Set([
      // this is the default tag list
      ...imageTaglabels,
      ...(currentSchool?.galleries?.map(gallery => gallery.tags) ?? []),
    ])

    const tempTagList = Array.from(tagSet).map(value => ({
      value,
      label: t(`school:gallery.imageTag.${value}`).replace(
        'gallery.imageTag.',
        ''
      ),
    }))

    setTagList(tempTagList)
  }

  useEffect(() => {
    initializeTagList()
  }, [currentSchool])

  const onImageDeleteSuccess = (data: InstitutionMediaUploadResponse) => {
    if (!currentSchool) return

    const updatedGalleries = currentSchool.galleries?.filter(
      gallery => gallery.id !== data.id
    )
    if (updatedGalleries) {
      setCurrentSchool({
        ...currentSchool,
        galleries: updatedGalleries,
      })
      setAllGalleries(updatedGalleries)
    }
  }

  const deleteImageResult =
    useDeleteInstitutionGalleryImage(onImageDeleteSuccess)

  const onImageUploadSuccess = (data: InstitutionMediaUploadResponse) => {
    if (!currentSchool) return

    setCurrentSchool({
      ...currentSchool,
      galleries: [...(currentSchool?.galleries || []), data],
    })

    setAllGalleries([...(currentSchool?.galleries || []), data])

    setIsUnsavedChanges(true)
  }

  const onImageUpdateSuccess = (data: InstitutionMediaUploadResponse) => {
    if (!currentSchool) return

    const updatedGalleries = currentSchool.galleries?.map(gallery => {
      if (gallery.id === data.id) {
        return data
      }
      return gallery
    })
    if (updatedGalleries) {
      setCurrentSchool({
        ...currentSchool,
        galleries: updatedGalleries,
      })
      setAllGalleries(updatedGalleries)
    }

    setIsUnsavedChanges(true)
  }

  const handleSaveAll = useCallback(async () => {
    if (currentSchool && isUnsavedChanges) {
      await updateSchoolResult.mutateAsync({
        galleries: allGalleries,
      })
      setIsUnsavedChanges(false)
    }
  }, [currentSchool, isUnsavedChanges, updateSchoolResult])

  useEffect(() => {
    allSaveMethods(tabName, handleSaveAll)
  }, [allSaveMethods, tabName, handleSaveAll])

  if (!currentSchool) {
    return <></>
  }

  return (
    <div id={tabName} className="flex flex-col !important">
      <BoxWithToggleGroup
        toggleGroupLabels={tagList}
        title={t('school:selectSection')}
        currentSection={currentImageTag}
        setCurrentSection={setCurrentImageTag}
      >
        <Box
          id="galleryBox"
          direction="row"
          justify="start"
          className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4"
        >
          <Box
            direction="col"
            align="center"
            justify="center"
            className="border border-dashed border-text-subtle w-[250px] h-[250px] rounded-lg relative "
          >
            <Box
              className="absolute top-0 left-0 w-full h-full"
              direction="col"
              justify="center"
              align="center"
            >
              <SvgIcon size="extraLarge">
                <AddIcon />
              </SvgIcon>
              <Box style={{ marginTop: '1rem' }}>
                <Button onClick={() => setIsOpenModalGallery(true)}>
                  {t('school:gallery.addImage')}
                </Button>
              </Box>
            </Box>
          </Box>
          {deleteImageResult.isLoading && <Spinner />}
          {!deleteImageResult.isLoading &&
            currentSchool.galleries
              ?.filter(gallery => {
                if (currentImageTag === 'all') {
                  return true // display all images if currentImageTag is 'all'
                }
                return gallery.tags === currentImageTag // display only matching images
              })
              .map(gallery => {
                return (
                  <Box
                    key={gallery.id}
                    align="center"
                    justify="center"
                    border
                    className="w-[250px] h-[250px] overflow-hidden relative"
                  >
                    <Box className="relative">
                      <ImageAspect
                        s3="public"
                        width="40rem"
                        ratio={1}
                        alt="gallery image"
                        src={gallery.imageUrl}
                      />
                      <div className="flex justify-center items-center w-full h-full top-0 left-0 bottom-0 right-0 absolute bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 gap-2">
                        <Button
                          variant="default"
                          onClick={() => {
                            setSelectedGallery(gallery)
                            setIsOpenModalGallery(true)
                          }}
                        >
                          <LuPencil />
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => {
                            setShowDeleteImagePopup(true)
                            setGalleryImageToDelete(gallery)
                          }}
                        >
                          <LuTrash2 />
                        </Button>
                      </div>
                    </Box>
                  </Box>
                )
              })}
        </Box>
      </BoxWithToggleGroup>
      <SchoolGalleryImageUploader
        institutionId={currentSchool.id}
        siteId={currentSchool.siteId}
        onSuccess={onImageUploadSuccess}
        onUpdateSuccess={onImageUpdateSuccess}
        aspect={1}
        tagList={tagList}
        gallery={selectedGallery}
        onClose={() => {
          setSelectedGallery(null)
          setIsOpenModalGallery(false)
        }}
        isOpen={isOpenModalGallery}
        currentImageTag={currentImageTag}
      />
      <TourGuide
        tourGuideKey={TourGuideKeys.schoolGallery}
        steps={getGalleryTourSteps()}
        icon
        autoStart={false}
      />
      <CustomedAlertDialog
        open={showDeleteImagePopup}
        setOpen={setShowDeleteImagePopup}
        alertType={AlertTypes.CONFIRM}
        description={`${t('school:gallery.deleteImageTips')}`}
        title={t('school:gallery.deleteImage') as string}
        cancelText={t('school:gallery.cancel') as string}
        actionText={t('school:gallery.confirm') as string}
        loading={deleteImageResult.isLoading}
        onActionClick={() => {
          if (!galleryImageToDelete) {
            return
          }
          deleteImageResult.mutateAsync({
            institutionId: galleryImageToDelete.institutionId,
            siteId: galleryImageToDelete.siteId,
            galleryId: galleryImageToDelete.id,
          })
          setShowDeleteImagePopup(false)
        }}
      />
    </div>
  )
}

export default Gallery
