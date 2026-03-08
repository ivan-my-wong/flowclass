import { FC, useEffect, useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuLink, LuTrash, LuUpload } from 'react-icons/lu'
import { toast } from 'sonner'

import { Spinner } from '@/components/Loaders/Spinner'
import CourseAndClassSingleSelector from '@/components/Selector/CourseAndClassSingleSelector'
import LabelSelector from '@/components/Selector/LabelSelector'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useClassMaterialsData } from '@/hooks/useClassMaterialsData'
import useCourseData from '@/hooks/useCourseData'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import { CreateClassMaterialsData, TypeSupported } from '@/types/class-material'
import { OptionProps as CourseOptionType } from '@/types/courseSelector.type'
import dayjs from '@/utils/dayjs'
import { formatFileSize } from '@/utils/number.utils'

import FileItem from './components/form/FileItem'
import LinkItem from './components/form/LinkItem'
import StorageExceededAlert from './components/StorageExceededAlert'
import {
  MaterialFormData,
  materialFormSchema,
  MaterialItemData,
} from './schemas/materialForm.schema'

type CourseAndClassList = {
  value: number
  label: string
  course: string
  courseId: number
  previewImageUrl: null
}

type LessonList = {
  value: number
  label: string
}

interface Props {
  isOpen: boolean
  setOpen: (open: boolean) => void
  driveQuotaData?: {
    limit: number
    usage: number
    remainingSpace: number
    percentageUsed: number
  }
  onUploadSuccess?: () => void
  initialCourseId?: number
  initialLessonId?: number
}

const DRIVE_QUOTA_WARNING_THRESHOLD = 95

const MaterialForm: FC<Props> = ({
  isOpen,
  setOpen,
  driveQuotaData,
  onUploadSuccess,
  initialCourseId,
  initialLessonId,
}): JSX.Element => {
  const { t } = useTranslation('material')
  const totalSizeLimit = 524288000
  const fileUploadRef = useRef<HTMLInputElement>(null)
  const [uploadProgressPercentage, setUploadProgressPercentage] = useState(0)
  const { useCreateClassMaterialsWithProgress, currentUploadProgress } =
    useClassMaterialsData()
  const { courseData } = useCourseData()
  const { useFetchAllLessonData } = useLessonDateTimeData()
  const {
    mutate: createClassMaterials,
    error: uploadError,
    isLoading: isUploadingMutation,
  } = useCreateClassMaterialsWithProgress(progressEvent => {
    const percentage = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    )
    setUploadProgressPercentage(percentage)
  })

  const isDriveQuotaExceeded = useMemo(() => {
    if (!driveQuotaData) return false
    return driveQuotaData.percentageUsed >= DRIVE_QUOTA_WARNING_THRESHOLD
  }, [driveQuotaData])

  useEffect(() => {
    if (currentUploadProgress?.status === 'uploading') {
      setUploadProgressPercentage(currentUploadProgress.percentage)
    }
  }, [currentUploadProgress?.status, currentUploadProgress?.percentage])
  const isUploading = useMemo(() => {
    return (
      ['pending', 'uploading'].includes(currentUploadProgress?.status ?? '') ||
      isUploadingMutation
    )
  }, [currentUploadProgress, isUploadingMutation])
  const uploadMessage = useMemo(() => {
    if (isUploadingMutation) {
      return t('uploadMaterials.message.uploadingMaterials')
    }
    if (currentUploadProgress?.status === 'completed') {
      return t('uploadMaterials.message.uploadingCompleted')
    }
    if (currentUploadProgress?.status === 'failed') {
      return t('uploadMaterials.message.uploadingFailed')
    }
    if (currentUploadProgress?.status === 'pending') {
      return t('uploadMaterials.message.preparingUploadMaterial')
    }
    return t('uploadMaterials.message.uploadingToGoogleDrive')
  }, [isUploadingMutation, currentUploadProgress?.status, t])
  const uploadErrorMessage = useMemo(() => {
    return (uploadError as Error)?.message || currentUploadProgress?.message
  }, [currentUploadProgress, uploadError])
  const isCompleted = useMemo(() => {
    return currentUploadProgress?.status === 'completed'
  }, [currentUploadProgress?.status])
  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      selectedCourse: undefined,
      selectedLesson: undefined,
      materials: [],
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  })

  const selectedCourse = watch('selectedCourse')
  const materials = watch('materials')

  const lessonFilter = useMemo(() => {
    if (!selectedCourse) return { classIdSelected: [] }
    return { classIdSelected: [selectedCourse.value] }
  }, [selectedCourse])
  const { data: classLessons } = useFetchAllLessonData(lessonFilter)

  const lessonList: LessonList[] = useMemo(() => {
    if (!classLessons) return []
    return classLessons
      .slice()
      .sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf())
      .map(item => {
        const date = dayjs(item.start).format('DD-MM-YYYY')
        const start = dayjs(item.start).format('HH:mm A')
        const end = dayjs(item.end).format('HH:mm A')
        return {
          label: `${date} ${start} - ${end}`,
          value: item.id,
        }
      })
  }, [classLessons])

  const courseAndClassList: { label: string; options: CourseAndClassList[] }[] =
    useMemo(() => {
      if (!courseData) return []
      return (
        courseData.courses.map(courseItem => {
          const classes = courseItem.classes.map(cls => ({
            value: cls.id,
            label: cls.name || 'Unknown Class',
            course: courseItem.name || 'Unknown Course',
            courseId: courseItem.id,
            previewImageUrl: null,
          }))
          return {
            label: courseItem.name || 'Unknown Course',
            options: classes,
          }
        }) || []
      )
    }, [courseData])

  // Set initial course and lesson when form opens with pre-selected values
  useEffect(() => {
    if (isOpen && initialCourseId && courseAndClassList.length > 0) {
      // Find the course/class that matches initialCourseId
      const matchingClass = courseAndClassList
        .flatMap(cg => cg.options)
        .find(cls => cls.value === initialCourseId)
      if (matchingClass) {
        setValue(
          'selectedCourse',
          matchingClass as unknown as CourseAndClassList
        )
      }
    } else if (!isOpen) {
      // Reset form when closing
      reset({
        selectedCourse: undefined,
        selectedLesson: undefined,
        materials: [],
      })
    }
  }, [isOpen, initialCourseId, courseAndClassList, setValue, reset])

  // Set initial lesson after course is selected and lessons are loaded
  useEffect(() => {
    if (isOpen && initialLessonId && selectedCourse && lessonList.length > 0) {
      const matchingLesson = lessonList.find(
        lesson => lesson.value === initialLessonId
      )
      if (matchingLesson) {
        setValue('selectedLesson', matchingLesson)
      }
    }
  }, [isOpen, initialLessonId, selectedCourse, lessonList, setValue])

  const materialSummary = useMemo(() => {
    const fileItems = materials.filter(
      item => item.type === TypeSupported.DOCUMENT
    )
    const linkItems = materials.filter(item => item.type === TypeSupported.LINK)

    return {
      fileCount: fileItems.length,
      fileSize: fileItems.reduce((acc, cur) => acc + (cur?.fileSize ?? 0), 0),
      linkCount: linkItems.length,
    }
  }, [materials])

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    const currentMaterials = watch('materials')

    const newFiles = Array.from(files ?? [])
      .map(item => {
        const isExist = currentMaterials.some(
          material =>
            [TypeSupported.DOCUMENT].includes(material.type) &&
            material.fileName === item.name
        )
        if (isExist) return null
        return {
          type: TypeSupported.DOCUMENT,
          fileType: item.type,
          file: item,
          fileName: item.name,
          fileSize: item.size,
        }
      })
      .filter(item => item !== null)

    append(newFiles as MaterialItemData[])
  }

  const onAddLink = () => {
    append({
      type: TypeSupported.LINK,
      fileName: '',
      description: '',
      link: '',
    })
  }

  const removeFile = (fileIndex: number) => {
    remove(fileIndex)
  }

  const classes = useMemo(() => {
    if (!courseData) return []
    return (courseData.courses ?? []).flatMap(item => item.classes)
  }, [courseData])
  const uploadMaterials: SubmitHandler<MaterialFormData> = data => {
    const selectedLesson = data.selectedLesson?.value
    const selectedClass = classes.find(
      item => item.id === data.selectedCourse?.value
    )
    if (!selectedClass || !selectedLesson) return

    const { courseId, id: classId } = selectedClass
    if (!classId || !courseId) return

    // Transform materials to API format
    const files: File[] = []
    const mediaMaterials = data.materials.map(material => {
      if (material.type === TypeSupported.DOCUMENT) {
        const documentMaterial = material as Extract<
          MaterialItemData,
          { type: TypeSupported.DOCUMENT }
        >
        if (documentMaterial.file) {
          files.push(documentMaterial.file)
          return {
            name: documentMaterial.fileName || documentMaterial.file.name,
            description: documentMaterial.description,
            expiryDate: documentMaterial.expiryDate,
            type: TypeSupported.DOCUMENT,
            fileType: documentMaterial.file.type,
          }
        }
      }

      // Type assertion for link material
      const linkMaterial = material as Extract<
        MaterialItemData,
        { type: TypeSupported.LINK }
      >
      return {
        name: linkMaterial.fileName || '',
        description: linkMaterial.description,
        link: linkMaterial.link,
        expiryDate: linkMaterial.expiryDate,
        fileType: null,
        type: TypeSupported.LINK,
      }
    })

    const uploadData: CreateClassMaterialsData = {
      classLessonId: selectedLesson,
      classId,
      courseId,
      mediaMaterials,
      files,
    }

    createClassMaterials(uploadData, {
      onSuccess: () => {
        // Close dialog and reset form on success
        setUploadProgressPercentage(0)
        toast.success(t('uploadMaterials.message.uploadMaterialsSuccess'))
        setOpen(false)
        reset()
        onUploadSuccess?.()
      },
    })
  }

  const closeDialog = () => {
    if (!isUploading) {
      setOpen(false)
      // Reset form when closing
      reset({
        selectedCourse: undefined,
        selectedLesson: undefined,
        materials: [],
      })
    }
  }
  useEffect(() => {
    if (isCompleted) {
      setOpen(false)
      reset({
        selectedCourse: undefined,
        selectedLesson: undefined,
        materials: [],
      })
      toast.success(t('uploadMaterials.message.uploadMaterialsSuccess'))
    }
  }, [isCompleted, setOpen, reset, t])

  useEffect(() => {
    if (currentUploadProgress?.status === 'failed') {
      toast.error(
        currentUploadProgress?.message ||
          t('uploadMaterials.message.uploadFailed')
      )
      setOpen(false)
      reset()
    }
  }, [
    currentUploadProgress?.status,
    currentUploadProgress?.message,
    t,
    setOpen,
    reset,
  ])

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="w-full lg:w-[750px]">
        <DialogHeader className="flex flex-col items-start justify-center sticky top-0 z-10">
          <DialogTitle>{t('uploadMaterials.dialogTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-3 pb-4 min-h-[400px]">
          {isUploading ? (
            <div className="h-full flex flex-col justify-center items-center">
              <Spinner />
              <div className="text-gray-600 mb-4">{uploadMessage}</div>
              <div className="w-full max-w-md">
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgressPercentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-2 text-center">
                  {t('uploadMaterials.uploadedPercentage', {
                    percentage: uploadProgressPercentage,
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {uploadErrorMessage && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-400 mb-4">
                  <div className="text-red-600 text-sm font-medium">
                    {t('uploadMaterials.message.uploadError')}
                  </div>
                  <div className="text-red-500 text-xs">
                    {uploadErrorMessage}
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row gap-2">
                <div className="w-6/12">
                  <div className="mb-1 text-sm font-medium">
                    {t('uploadMaterials.form.classLabel')}*
                  </div>
                  <Controller
                    name="selectedCourse"
                    control={control}
                    render={({ field }) => (
                      <CourseAndClassSingleSelector
                        value={field.value as unknown as CourseOptionType[]}
                        isMulti={false}
                        options={courseAndClassList}
                        onChange={selected => {
                          setValue(
                            'selectedLesson',
                            undefined as unknown as {
                              value: number
                              label: string
                            }
                          )
                          field.onChange(
                            selected as unknown as CourseAndClassList
                          )
                        }}
                        width="auto"
                      />
                    )}
                  />
                  {errors.selectedCourse && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.selectedCourse.message}
                    </p>
                  )}
                </div>
                <div className="w-6/12">
                  <div className="mb-1 text-sm font-medium">
                    {t('uploadMaterials.form.lessonLabel')}*
                  </div>
                  <Controller
                    name="selectedLesson"
                    control={control}
                    render={({ field }) => (
                      <LabelSelector
                        selectOption={field.value ? [field.value] : []}
                        options={lessonList}
                        onChange={value => {
                          const singleValue = Array.isArray(value)
                            ? value[0]
                            : value
                          field.onChange(singleValue)
                        }}
                        isDisabled={!selectedCourse}
                        placeHolder={t(
                          'uploadMaterials.form.lessonPlaceholder'
                        )}
                      />
                    )}
                  />
                  {errors.selectedLesson && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.selectedLesson.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  iconBefore={<LuUpload />}
                  onClick={() => fileUploadRef.current?.click()}
                >
                  {t('uploadMaterials.chooseFiles')}
                </Button>
                <input
                  type="file"
                  multiple
                  onChange={onFileSelected}
                  ref={fileUploadRef}
                  hidden
                />
                <Button
                  variant="outline"
                  iconBefore={<LuLink />}
                  onClick={onAddLink}
                >
                  {t('uploadMaterials.addLinks')}
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex pr-2">
                  <div className="text-sm font-medium">
                    {t('uploadMaterials.materialsToUpload')}
                  </div>
                  <div className="flex gap-2 ml-auto">
                    {materialSummary.fileCount > 0 && (
                      <div className="text-sm font-medium flex gap-1">
                        <div>{materialSummary.fileCount} files</div>
                        <div>({formatFileSize(materialSummary.fileSize)})</div>
                      </div>
                    )}
                    {materialSummary.linkCount > 0 && (
                      <div className="text-sm font-medium">
                        {t('uploadMaterials.uploadedLinks', {
                          count: materialSummary.linkCount,
                        })}
                      </div>
                    )}
                  </div>
                </div>
                {!fields.length && (
                  <div className="text-sm text-gray-700 text-center">
                    {t('uploadMaterials.noMaterials')}
                  </div>
                )}
                {(materialSummary.fileCount > 10 ||
                  materialSummary.fileSize > totalSizeLimit) && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-400">
                    <div className="text-red-600 text-sm font-medium">
                      {t('uploadMaterials.materialLimitExceeded')}
                    </div>
                    <div className="text-red-500 text-xs font-medium">
                      {t('uploadMaterials.materialLimitLabel')}
                    </div>
                  </div>
                )}
                {fields.map((field, fileIndex) => (
                  <div
                    key={field.id}
                    className="relative p-4 rounded-lg border border-gray-300 bg-gray-50"
                  >
                    <LuTrash
                      onClick={() => removeFile(fileIndex)}
                      size={18}
                      className="text-red-500 cursor-pointer absolute z-10 right-4 top-3"
                    />
                    {[
                      TypeSupported.DOCUMENT,
                      TypeSupported.ONLINE_RECORDING,
                    ].includes(field.type) && (
                      <Controller
                        name={`materials.${fileIndex}`}
                        control={control}
                        render={({ field: materialField }) => (
                          <FileItem
                            fileItem={materialField.value}
                            updateExpiryDate={date => {
                              materialField.onChange({
                                ...materialField.value,
                                expiryDate: date,
                              })
                            }}
                          />
                        )}
                      />
                    )}
                    {field.type === TypeSupported.LINK && (
                      <Controller
                        name={`materials.${fileIndex}`}
                        control={control}
                        render={({ field: materialField }) => (
                          <LinkItem
                            materialItem={materialField.value}
                            onUpdateMaterialDetail={(fieldName, value) => {
                              materialField.onChange({
                                ...materialField.value,
                                [fieldName]: value,
                              })
                            }}
                          />
                        )}
                      />
                    )}
                  </div>
                ))}
                {errors.materials && (
                  <p className="text-red-500 text-sm">
                    {errors.materials.message}
                  </p>
                )}
              </div>

              {isDriveQuotaExceeded && <StorageExceededAlert />}
            </>
          )}
        </DialogBody>
        {!isUploading && (
          <div className="flex items-center border-t border-gray-300 justify-end px-6 gap-2 py-3 sticky bottom-0 z-10 bg-white">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common:action.cancel')}
            </Button>
            <Button
              disabled={!isValid}
              loading={isUploading}
              onClick={handleSubmit(uploadMaterials)}
            >
              {t('material:uploadMaterials.uploadMaterials')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MaterialForm
