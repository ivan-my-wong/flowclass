/* eslint-disable react-hooks/exhaustive-deps */
import React, { ChangeEvent, useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaChevronRight } from 'react-icons/fa'
import { MdPublish } from 'react-icons/md'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import banner from '@/assets/fallback/imageFailed.png'
import AlertBox from '@/components/Boxes/AlertBox'
import ImageAspect from '@/components/Images/ImageAspect'
import ImageUploader from '@/components/Inputs/ImageUploader'
import { TextInput } from '@/components/Inputs/TextInput'
import Link from '@/components/Texts/Link'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'
import { courseState } from '@/stores/courseData'
import { Course } from '@/types/course'
import { cn } from '@/utils/cn'
import { validateDomain } from '@/utils/validate'

interface BasicProps {
  tabName: string
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}

const Basic = ({
  tabName,
  handleChange,
  // setShowPublishModal,
  allSaveMethods,
}: BasicProps): JSX.Element => {
  const { setIsUnSavedChanges, currentCourse, setCurrentCourse } =
    useCourseEditSave()

  const form = useForm<Course>({
    defaultValues: currentCourse ?? {},
  })
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = form

  const { t } = useTranslation()

  const {
    useUpdateCourseBasic,
    useUpdateCourseRecruitment,
    useFetchAllCourseData,
  } = useCourseData()
  const { mutateAsync: courseBasicMutate } = useUpdateCourseBasic()

  const { mutateAsync: courseRecruitmentMutate } = useUpdateCourseRecruitment()

  const [courseRecoilState, setCourseRecoilState] = useRecoilState(courseState)
  const { courseBaseUrl, courseEnrolUrl } = useCourseData()
  const fetchCourseDataResult = useFetchAllCourseData()
  const [originalPath, setOriginalPath] = useState<string>('') // Initialize with an empty string

  useEffect(() => {
    // Calculate originalPath when the component mounts
    setOriginalPath(currentCourse?.path ?? '')

    setIsUnSavedChanges(checkIfBasicInfoUpdate())
  }, [currentCourse])

  const checkIfRecruitmentUpdate = (): boolean => {
    return (
      courseRecoilState.currentCourse?.recruitStart !==
        currentCourse?.recruitStart ||
      courseRecoilState.currentCourse?.recruitEnd !== currentCourse?.recruitEnd
    )
  }

  const checkIfBasicInfoUpdate = (): boolean => {
    if (!currentCourse || !courseRecoilState.currentCourse) return false

    const isQrAttendanceChanged =
      getValues('useQrAttendance') !== currentCourse?.useQrAttendance &&
      getValues('useQrAttendance') !== undefined

    const originalCourseCode = courseRecoilState.currentCourse?.courseCode || ''
    const currentCourseCode = currentCourse?.courseCode || ''

    if (
      courseRecoilState.currentCourse?.name !== currentCourse?.name ||
      courseRecoilState.currentCourse?.path !== currentCourse?.path ||
      originalCourseCode !== currentCourseCode ||
      isQrAttendanceChanged ||
      courseRecoilState.currentCourse?.previewImageUrl !==
        currentCourse?.previewImageUrl ||
      checkIfRecruitmentUpdate()
    )
      return true

    return false
  }

  const validateUniquePath = (): boolean => {
    if (!currentCourse) return true
    const pathsArray = fetchCourseDataResult?.data
      ?.map(obj => obj.path)
      .filter(path => path !== originalPath)
    return !pathsArray?.includes(currentCourse?.path)
  }

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newNameValue = event.target.value
    // const newPathValue = generatePathFromName(newNameValue)

    setValue('name', newNameValue)
    // setValue('path', newPathValue)
    setCurrentCourse({
      ...(currentCourse as Course),
      name: newNameValue,
    })
  }

  const handleCourseCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newCodeValue = event.target.value

    setValue('courseCode', newCodeValue)
    setCurrentCourse({
      ...(currentCourse as Course),
      courseCode: newCodeValue === '' ? undefined : newCodeValue,
    })
  }

  const handleUpdate = async (): Promise<void> => {
    if (!currentCourse) return

    if (currentCourse.path && !validateDomain(currentCourse.path)) {
      toast.error(t('onboarding:errors.invalidDomain'))
      return
    }

    if (!validateUniquePath()) {
      toast.error(t('teachingService:createCourseModal.duplicatePath'))
      return
    }

    try {
      let updatedCourse = await courseBasicMutate({
        courseId: currentCourse?.id,
        institutionId: currentCourse?.institutionId,
        name: currentCourse?.name,
        courseCode: currentCourse?.courseCode,
        shortDescription: currentCourse?.shortDescription,
        previewImageUrl: currentCourse?.previewImageUrl,
        path: currentCourse?.path,
        useQrAttendance: getValues('useQrAttendance'),
      })

      if (checkIfRecruitmentUpdate()) {
        updatedCourse = await courseRecruitmentMutate({
          courseId: currentCourse?.id,
          institutionId: currentCourse?.institutionId,
          startDate: currentCourse?.recruitStart,
          endDate: currentCourse?.recruitEnd,
        } as any)
      }

      setIsUnSavedChanges(false)
      setCourseRecoilState(prevCourseState => ({
        ...prevCourseState,
        currentCourse: updatedCourse,
      }))

      toast.success(t('teachingService:privacySettings.updateSuccess'))
    } catch (error: any) {
      if (
        error?.response?.data?.message?.includes('Course ID already exists')
      ) {
        toast.error(t('teachingService:createCourseModal.duplicateId'))
      } else {
        toast.error(t('common:errors.UNKNOWN_ERROR'))
        console.error(error)
      }
    }
  }

  useEffect(() => {
    allSaveMethods(tabName, handleUpdate)
  }, [allSaveMethods, tabName, handleUpdate])

  const previewImageUrl =
    currentCourse?.previewImageUrl ??
    courseRecoilState?.currentCourse?.previewImageUrl

  return (
    <div id={tabName} className="flex flex-col !important">
      {!currentCourse?.published && (
        <AlertBox
          icon={<MdPublish />}
          content={t('teachingService:alert')}
          actionLink={
            <Box>
              <Text className="text-text-disabled">
                {t(`teachingService:publishCourse.unArchived`)}
              </Text>
              {/* no need duplicate switch button here */}
              {/* <Switch
                checked={false}
                onCheckedChange={() => setShowPublishModal(true)}
              /> */}
            </Box>
          }
        />
      )}
      <div
        id="course-previewImageUrl-container"
        className="box-responsive justify-start items-start"
      >
        <div className="shadow-box lg:w-[30%] w-full lg:h-[25rem] justify-between">
          <p className="font-bold text-sm">
            {t('teachingService:basic.previewImage')}
          </p>
          <p className="text-center text-sm">
            {t('teachingService:basic.previewImageTips')}
          </p>
          <div className="flex gap-2 items-center">
            <ImageUploader
              directory={MediaFileDirectory.COURSE}
              onSuccess={data => {
                if (!currentCourse) return
                setCurrentCourse({
                  ...currentCourse,
                  previewImageUrl: data.url,
                })
                setIsUnSavedChanges(true)
              }}
              aspect={16 / 9}
            />
            {previewImageUrl && (
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => {
                  if (!currentCourse) return
                  setCurrentCourse({
                    ...currentCourse,
                    previewImageUrl: ' ',
                  })
                }}
              >
                {t('common:action.remove')}
              </Button>
            )}
          </div>
          <div className="box-col-full">
            <ImageAspect
              s3="public"
              ratio={16 / 9}
              width="100%"
              src={previewImageUrl ?? banner}
              alt="Banner image"
            />
          </div>
        </div>
        <div className="box-col-full lg:w-[70%] lg:h-[25rem] w-full justify-start shadow-box gap-4">
          <div className="box-col-full" id="course-name-container">
            <TextInput
              value={currentCourse?.name ?? ''}
              id="name"
              label={t('teachingService:basic.name')}
              isError={!!errors.name}
              helperText={errors.name?.message as string}
              {...register('name', {
                required: t('login:errors.required') as string,
                onChange: e => {
                  handleNameChange(e)
                  setIsUnSavedChanges(true)
                },
              })}
            />
          </div>
          <div className="box-col-full" id="course-path-container">
            <TextInput
              value={currentCourse?.path ?? ''}
              id="path"
              label={t('teachingService:basic.path')}
              isError={!!errors.path}
              helperText={errors.path?.message as string}
              {...register('path', {
                required: t('login:errors.required') as string,
                validate: (value: string | null) => {
                  if (!value) return undefined
                  if (!validateDomain(value)) {
                    return t('onboarding:errors.invalidDomain') as string
                  }

                  if (!validateUniquePath()) {
                    return t(
                      'teachingService:createCourseModal.duplicatePath'
                    ) as string
                  }

                  return undefined
                  // return (
                  //   validateDomain(value) ||
                  //   (t('onboarding:errors.invalidDomain') as string)
                  // )
                },
                onChange: e => {
                  handleChange(e)
                  setIsUnSavedChanges(true)
                },
              })}
            />
          </div>
          <div className="box-col-full" id="course-code-container">
            <TextInput
              value={currentCourse?.courseCode || ''}
              id="courseCode"
              label={t('teachingService:basic.id')}
              isError={!!errors.courseCode}
              helperText={errors.courseCode?.message as string}
              placeholder={
                t('teachingService:basic.optionalCustomIdPlaceholder') ||
                'Leave empty for auto-generated ID'
              }
              {...register('courseCode', {
                onChange: e => {
                  handleCourseCodeChange(e)
                  setIsUnSavedChanges(true)
                },
              })}
            />
          </div>
          <div className="box-row-full lg:flex-row break-all leading-tight justify-start lg:mt-auto">
            <div className="box-col-full items-start">
              <Text className={cn('shrink-0 lg:shrink')}>{`${t(
                `teachingService:view.courseLink`
              )}:`}</Text>
              <Link href={courseBaseUrl} target="_blank" rel="noreferrer">
                {courseBaseUrl}
              </Link>
            </div>
            <Button
              onClick={() => {
                window.open(courseBaseUrl, '_blank')
              }}
              variant="primary-outline"
              iconAfter={<FaChevronRight />}
              disabled={!currentCourse?.published}
            >
              {t('teachingService:view.viewSite')}
            </Button>
          </div>
          <div className="box-row-full lg:flex-row break-all leading-tight justify-start">
            <div className="box-col-full items-start">
              <Text className={cn('shrink-0 lg:shrink')}>{`${t(
                `teachingService:view.applicationLink`
              )}:`}</Text>
              <Link href={courseEnrolUrl} target="_blank" rel="noreferrer">
                {courseEnrolUrl}
              </Link>
            </div>
            <Button
              onClick={() => {
                window.open(courseEnrolUrl, '_blank')
              }}
              variant="primary-outline"
              iconAfter={<FaChevronRight />}
              disabled={!currentCourse?.published}
            >
              {t('teachingService:view.viewApplicationLink')}
            </Button>
          </div>
        </div>
      </div>

      {/* <Recruitment
        // tabName='recruitment'
        currentCourse={currentCourse}
        setCurrentCourse={setCurrentCourse}
        setIsUnSavedChanges={setIsUnSavedChanges}
      /> */}
      {/* 
    <TourGuide
      css={{ alignSelf: 'flex-start' }}
      tourGuideKey={TourGuideKeys.courseBasic}
      steps={getBasicTourSteps()}
      icon
      autoStart={false}
    /> */}
    </div>
  )
}

export default Basic
