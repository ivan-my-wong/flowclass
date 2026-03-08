import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'

import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import TextEditor from '@/components/Inputs/TextEditor'
import PromptDialog from '@/components/Popups/PromptDialog'
import Text from '@/components/Texts/Text'
import BoxWithToggleGroup from '@/components/ToggleGroup/BoxWithToggleGroup'
import { ToggleGroupLabelsProps } from '@/components/ToggleGroup/ToggleGroup'
import { ToggleGroupDropdownMenuModules } from '@/components/ToggleGroup/ToggleGroupItem'
import Popover from '@/components/Tooltips/Popover'
import Tooltip from '@/components/Tooltips/Tooltip'
import TourGuide from '@/components/Tour/TourGuide'
import Form, { FormField } from '@/components/ui/Form'
import { TourGuideKeys } from '@/constants/guides'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'
import useConfirm from '@/hooks/useGlobalConfirm'
import { useResponsive } from '@/hooks/useResponsive'
import { AlertTypes, ConfirmOptionsType } from '@/reducers/confirm.reducers'
import { FormCourseDescription, SectionDescription } from '@/types/course'
import { DropDownMenuType } from '@/types/options'
import { SectionTag } from '@/types/school'

import { getDescriptionTourSteps } from './CourseTourPopup'

type DescriptionPropsTypes = {
  tabName: string
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}

const initialCourseEditorLabels: SectionTag[] = [
  'COURSE_FEATURES',
  'COURSE_SYLLABUS',
  'COURSE_TARGET',
  'COURSE_INSTRUCTOR',
  'COURSE_STUDENT_PERF',
  'COURSE_APPLICATION',
  'COURSE_ENQUIRY',
  'COURSE_TIMETABLE',
]
const defaultSectionValue = '<p><br></p>'
export const initializeCourseSectionValues = (): SectionDescription[] => {
  return initialCourseEditorLabels.map(key => ({
    content: defaultSectionValue,
    sectionTitle: key as SectionTag,
  }))
}

const CoursePageContent = ({
  tabName,
  allSaveMethods,
}: DescriptionPropsTypes): JSX.Element => {
  const { currentCourse } = useCourseData()
  const { setIsOpenConfirmUnsavedChanges } = useCourseEditSave()
  const { isMobile, isTablet } = useResponsive()
  const form = useForm<FormCourseDescription>({
    resetOptions: {
      keepDirty: false,
      keepDirtyValues: false,
    },
    defaultValues: {
      longDescriptions:
        currentCourse?.longDescriptions || initializeCourseSectionValues(),
    },
  })
  const { useUpdateCourseDescription } = useCourseData()
  const { mutateAsync, isLoading: isLoadingDeletion } =
    useUpdateCourseDescription(() => {
      closeConfirm()
    })
  const [searchParams] = useSearchParams()
  const seoSettingsRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const [currentSection, setCurrentSection] = useState<string | null>()
  // initialCourseEditorLabels[0]

  const currentDeleteSection = useRef<string>('')

  const initialLongDescriptions = useMemo(() => {
    return currentCourse?.longDescriptions || []
  }, [currentCourse?.longDescriptions])
  useEffect(() => {
    const subscription = form.watch(value => {
      const oldDescriptions = currentCourse?.longDescriptions
      const newDescriptions = value.longDescriptions

      const oldDescriptionsString = JSON.stringify(oldDescriptions)
      const newDescriptionsString = JSON.stringify(newDescriptions)
      setIsOpenConfirmUnsavedChanges(
        oldDescriptionsString !== newDescriptionsString
      )
    })
    return () => subscription.unsubscribe()
  }, [currentCourse?.longDescriptions, form.watch])
  const handleDescriptionChange = (
    longDescriptions: SectionDescription[] | string,
    field: ControllerRenderProps<FormCourseDescription, 'longDescriptions'>
  ): void => {
    if (!currentCourse) return
    if (!Array.isArray(longDescriptions)) return
    field.onChange(longDescriptions)
  }

  useLayoutEffect(() => {
    if (searchParams.get('scroll') === 'bottom' && seoSettingsRef.current) {
      seoSettingsRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [searchParams])

  useEffect(() => {
    form.reset(
      {
        longDescriptions: initialLongDescriptions,
      },
      {
        keepDirty: false,
        keepDirtyValues: false,
      }
    )
    if (!currentSection) {
      setCurrentSection(
        initialLongDescriptions?.at(0)?.sectionTitle ||
          initialCourseEditorLabels[0]
      )
    }
  }, [initialLongDescriptions, form])
  const isValidateSectionTitle = useCallback(
    (label: string): boolean => {
      if (label === '') {
        toast.warning(t('school:emptySectionWarn'))
        return false
      }
      const isDuplicate =
        initialLongDescriptions &&
        initialLongDescriptions.some(
          e => e.sectionTitle.toString() === label.toString()
        )
      if (isDuplicate) {
        toast.warning(t('school:duplicateSectionWarn'))
        return false
      }
      return true
    },
    [initialLongDescriptions, t]
  )

  const handleEditSection = useCallback(
    async (label: string, newLabel: string): Promise<boolean> => {
      // const formatedInput = formatSectionTitle(newLabel)
      if (!currentCourse) return false
      if (label === newLabel) return true
      if (!isValidateSectionTitle(newLabel)) return false
      if (!initialLongDescriptions) return false

      const editingElement = initialLongDescriptions.find(
        item => item.sectionTitle === label
      )
      const newElement = {
        sectionTitle: newLabel as SectionTag | string,
        content: editingElement?.content as string,
      }

      await mutateAsync({
        courseId: currentCourse?.id,
        institutionId: currentCourse?.institutionId,
        longDescriptions: initialLongDescriptions?.map(item =>
          item.sectionTitle === label ? newElement : item
        ),
      })
      return true
    },
    [
      currentCourse,
      initialLongDescriptions,
      isValidateSectionTitle,
      mutateAsync,
    ]
  )

  const confirmParams = useMemo<ConfirmOptionsType>(() => {
    const handleDeleteSection = async () => {
      const newSectionTitleList = initialLongDescriptions
        ? initialLongDescriptions.filter(
            item => item.sectionTitle !== currentDeleteSection.current
          )
        : []
      form.setValue('longDescriptions', newSectionTitleList)
      setCurrentSection(newSectionTitleList[0].sectionTitle as SectionTag)
      await mutateAsync({
        courseId: currentCourse?.id,
        institutionId: currentCourse?.institutionId,
        longDescriptions: newSectionTitleList,
      })
    }
    const title = initialCourseEditorLabels.includes(
      currentSection as SectionTag
    )
      ? t(`component:SectionTag.${currentSection}`).replace('SectionTag.', '')
      : currentSection
    return {
      title: ` ${t(`common:action.delete`)} ${title}` as string,
      description: t(`school:discardSectionWarn`) as string,
      cancelText: t('common:action.cancel') as string,
      confirmText: t('common:action.confirm') as string,
      alertType: AlertTypes.WARN,
      onConfirm: handleDeleteSection,
    }
  }, [
    currentCourse?.id,
    currentCourse?.institutionId,
    initialLongDescriptions,
    currentSection,
    form,
    mutateAsync,
    t,
  ])
  const { setConfirm, closeConfirm } = useConfirm(isLoadingDeletion)
  const courseEditorLabels = useMemo(() => {
    return initialLongDescriptions.map(item => item.sectionTitle)
  }, [initialLongDescriptions])
  const toggleGroupLabels = useMemo(() => {
    const openDeleteSectionPopupPopup = (label: string) => {
      if (initialLongDescriptions && initialLongDescriptions.length <= 1) {
        toast.warning(t('school:noSectionWarn'))
      } else {
        currentDeleteSection.current = label
        setConfirm(confirmParams).open()
      }
    }
    if (initialLongDescriptions) {
      return initialLongDescriptions.map(longDesc => {
        return {
          value: longDesc.sectionTitle,
          label: t(`component:SectionTag.${longDesc.sectionTitle}`).replace(
            'SectionTag.',
            ''
          ),
          onEdit: handleEditSection,
          onDelete: openDeleteSectionPopupPopup,
          actionButton: <></>,
        }
      })
    }
    return courseEditorLabels?.map(label => {
      return {
        value: label,
        label: initialCourseEditorLabels.includes(label as SectionTag)
          ? t(`component:SectionTag.${label}`)
          : label,
      }
    })
  }, [
    initialLongDescriptions,
    courseEditorLabels,
    t,
    setConfirm,
    confirmParams,
    handleEditSection,
  ])

  const handleUpdate: SubmitHandler<{
    longDescriptions: SectionDescription[]
  }> = useCallback(
    async data => {
      await mutateAsync({
        courseId: currentCourse?.id,
        institutionId: currentCourse?.institutionId,
        longDescriptions: data.longDescriptions,
      })
    },
    [currentCourse?.id, currentCourse?.institutionId, mutateAsync]
  )
  useEffect(() => {
    allSaveMethods(tabName, form.handleSubmit(handleUpdate))
  }, [allSaveMethods, tabName, handleUpdate, form])

  const handleDragEnd = (newData: ToggleGroupLabelsProps[]) => {
    const newLongDescriptions = newData.map(item => {
      const result = initialLongDescriptions?.find(
        longDesc => longDesc.sectionTitle === item.value
      )
      return {
        ...(result as SectionDescription),
      }
    })
    form.setValue('longDescriptions', newLongDescriptions)
  }

  const handleCreateSection = (input: string) => {
    // Format Section Title
    // const formatedInput = formatSectionTitle(input)
    // Validate Section Title
    const isValidate = isValidateSectionTitle(input)
    if (!isValidate) return
    // Perform Section List Update
    const newSectionTitleList = initialLongDescriptions ?? []
    form.setValue('longDescriptions', [
      ...newSectionTitleList,
      { content: '<p><br></p>', sectionTitle: input },
    ])
    setCurrentSection(input)
    mutateAsync({
      courseId: currentCourse?.id,
      institutionId: currentCourse?.institutionId,
      longDescriptions: [
        ...newSectionTitleList,
        { content: '<p><br></p>', sectionTitle: input },
      ],
    })
  }

  const hintLabel = t(`school:hints.course.${currentSection}`)

  return (
    <Form {...form}>
      <Box
        id={tabName}
        direction="column"
        className="flex w-full flex-col sm:w-full sm:justify-center"
      >
        <BoxWithToggleGroup
          toggleGroupLabels={toggleGroupLabels}
          title={t('school:selectSection')}
          actionButton={
            <PromptDialog
              title={t('school:createSection')}
              desc={t('school:writeNewSection') as string}
              onCreate={handleCreateSection}
            />
          }
          dropdownMenuModules={[
            ToggleGroupDropdownMenuModules.EDIT,
            ToggleGroupDropdownMenuModules.DUPLICATE,
            ToggleGroupDropdownMenuModules.DELETE,
          ]}
          currentSection={currentSection || initialCourseEditorLabels[0]}
          setCurrentSection={setCurrentSection}
          draggable
          handleDragEnd={handleDragEnd}
          type={DropDownMenuType.Section}
        >
          <Box direction="column" gap="large">
            <Box
              justify="space-between"
              hidden={hintLabel.includes('hints.course')}
            >
              {isMobile || isTablet ? (
                <Popover
                  trigger={
                    // trigger component must be wrapped by div idk why
                    <div>
                      <Box>
                        <AiOutlineQuestionCircle />
                        <Text className="block border-b border-dotted">
                          {t(`school:hints.needSomeGuidance`)}
                        </Text>
                      </Box>
                    </div>
                  }
                >
                  <Text>{hintLabel}</Text>
                </Popover>
              ) : (
                <Tooltip
                  trigger={
                    // trigger component must be wrapped by div idk why
                    <div>
                      <Box className="cursor-help">
                        <AiOutlineQuestionCircle />
                        <Text className="block underline decoration-dotted">
                          {t(`school:hints.needSomeGuidance`)}
                        </Text>
                      </Box>
                    </div>
                  }
                >
                  <Text className="block">{hintLabel}</Text>
                </Tooltip>
              )}
            </Box>

            <FormField
              name="longDescriptions"
              control={form.control}
              render={({ field }) => (
                <TextEditor
                  style={{
                    width: '100%',
                    height: 'calc(100vh - 260px)',
                  }}
                  theme="snow"
                  content={field.value ?? null}
                  currentSection={
                    currentSection || initialCourseEditorLabels[0]
                  }
                  labels={initialCourseEditorLabels}
                  imageDirectory={MediaFileDirectory.COURSE}
                  onValueChange={value => {
                    handleDescriptionChange(value, field)
                  }}
                />
              )}
            />
          </Box>
        </BoxWithToggleGroup>
        <TourGuide
          tourGuideKey={TourGuideKeys.courseDescription}
          steps={getDescriptionTourSteps()}
          icon
          autoStart={false}
        />
      </Box>
    </Form>
  )
}

export default CoursePageContent
