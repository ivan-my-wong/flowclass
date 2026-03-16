import { useMemo, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { BiArchiveIn, BiArchiveOut } from 'react-icons/bi'
import { LuCopyPlus } from 'react-icons/lu'
import { toast } from 'sonner'

import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import banner from '@/assets/fallback/imageFailed.png'
import CopyIcon from '@/assets/svgs/CopyIcon'
import DeleteIcon from '@/assets/svgs/DeleteIcon'
import EditIcon from '@/assets/svgs/EditIcon'
import Box from '@/components/Containers/Box'
import DropdownMenu, {
  DropDownMenuItemType,
} from '@/components/DropDownMenus/DropDownMenu'
import ImageAspect from '@/components/Images/ImageAspect'
import SvgIcon from '@/components/Images/SvgIcon'
import { Spinner } from '@/components/Loaders/Spinner'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import useCourseData from '@/hooks/useCourseData'
import { useResponsive } from '@/hooks/useResponsive'
import useSiteData from '@/hooks/useSiteData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Course } from '@/types/course'
import { rearrangeOrder } from '@/utils/convert'
import { getCourseIcon } from '@/utils/options'

import SelectCourseDuplicateModal from './SelectCourseDuplicateModal'

// Archive-related reducer
const SET_SHOW_ARCHIVE_MODAL = 'SET_SHOW_ARCHIVE_MODAL'
const SET_LOCAL_IS_ARCHIVED = 'SET_LOCAL_IS_ARCHIVED'

interface ArchiveState {
  showArchiveModal: boolean
  localIsArchived: boolean
}

interface ArchiveAction {
  type: string
  payload?: boolean
}

const archiveReducer = (
  state: ArchiveState,
  action: ArchiveAction
): ArchiveState => {
  switch (action.type) {
    case SET_SHOW_ARCHIVE_MODAL:
      return { ...state, showArchiveModal: action.payload ?? false }
    case SET_LOCAL_IS_ARCHIVED:
      return { ...state, localIsArchived: action.payload ?? false }
    default:
      return state
  }
}

interface SchoolCardProps {
  course: Course
  deleteSuccessfulCallback?: (data: Course) => void
  duplicateSuccessfulCallback?: (data: Course) => void
  archiveSuccessfulCallback?: (data: Course) => void
}

const CourseCard = ({
  course,
  deleteSuccessfulCallback,
  duplicateSuccessfulCallback,
  archiveSuccessfulCallback,
}: SchoolCardProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    useDeleteCourse,
    setCurrentCourse,
    courseData,
    useArchiveCourse,
    useUnArchiveCourse,
    useCourseHasInvoice,
    useDuplicateCourseData,
  } = useCourseData()

  // Keep other states as useState
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showSelectCourseDuplicateModal, setShowSelectCourseDuplicateModal] =
    useState<boolean>(false)

  // Only use reducer for archive-related state with proper initialization
  const [archiveState, dispatchArchive] = useReducer(archiveReducer, {
    showArchiveModal: false,
    localIsArchived: course.isArchived ?? false,
  })

  const { isMobile } = useResponsive()
  const navigate = useNavigate()

  const deleteCourse = useDeleteCourse()

  // Archive hooks with proper callback handling
  const archiveCourseResult = useArchiveCourse()
  const unArchiveCourseResult = useUnArchiveCourse()

  const { data: invoiceCheckData, isLoading: isCheckingInvoices } =
    useCourseHasInvoice(course.id)

  const hasInvoices = invoiceCheckData?.hasInvoices ?? false

  const handleConfirm = async () => {
    await deleteCourse.mutateAsync(course.id)

    // Call the callback manually after successful delete
    if (deleteSuccessfulCallback) {
      deleteSuccessfulCallback(course)
    }

    navigate(`/teaching-service`)
  }

  const handleEditCourse = () => {
    if (!showConfirmPopup) {
      setCurrentCourse(course.id)
      navigate(`/teaching-service/edit-course`)
    }
  }

  const duplicateCourseMutate = useDuplicateCourseData()

  const handleDuplicateCourse = async () => {
    try {
      setIsLoading(true)

      await duplicateCourseMutate.mutateAsync(course)

      // Call the callback manually after successful duplicate
      if (duplicateSuccessfulCallback) {
        duplicateSuccessfulCallback(course)
      }

      toast.success(t('teachingService:duplicateCourse.successDuplicate'))
    } catch (e) {
      toast.error('Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchiveCourse = () => {
    dispatchArchive({ type: SET_SHOW_ARCHIVE_MODAL, payload: true })
  }

  const handleArchiveConfirm = async () => {
    const wasArchived = archiveState.localIsArchived

    try {
      // Update local state immediately for UI feedback
      dispatchArchive({ type: SET_LOCAL_IS_ARCHIVED, payload: !wasArchived })
      dispatchArchive({ type: SET_SHOW_ARCHIVE_MODAL, payload: false })

      // Perform API call
      if (wasArchived) {
        await unArchiveCourseResult.mutateAsync(course.id)
      } else {
        await archiveCourseResult.mutateAsync(course.id)
        // Track GTM event for archiving
        setGtmEvent({
          courseId: course.id,
          event: GtmEvent.updateCoursePublish,
        })
      }

      // Call the callback manually after successful operation
      if (archiveSuccessfulCallback) {
        archiveSuccessfulCallback({
          ...course,
          isArchived: !wasArchived,
        })
      }

      toast.success(
        wasArchived
          ? t('teachingService:publishCourse.unarchiveSuccess')
          : t('teachingService:publishCourse.archiveSuccess')
      )
    } catch (error) {
      // Revert local state if API call fails
      dispatchArchive({ type: SET_LOCAL_IS_ARCHIVED, payload: wasArchived })
      toast.error('Unknown error')
      console.error('Archive operation failed:', error)
    }
  }

  const { currency } = useSiteData()

  const menuItems: DropDownMenuItemType[] = useMemo(() => {
    const items: DropDownMenuItemType[] = [
      {
        type: 'item',
        content: (
          <>
            <SvgIcon className="mr-4">
              <EditIcon />
            </SvgIcon>
            <Text>{t('teachingService:dropDownMenu.edit')}</Text>
          </>
        ),
        onClick: () => handleEditCourse(),
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        content: (
          <>
            <SvgIcon className="mr-4">
              <CopyIcon />
            </SvgIcon>
            <Text>{t('teachingService:dropDownMenu.copy')}</Text>
          </>
        ),
        onClick: () => handleDuplicateCourse(),
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        content: (
          <>
            <LuCopyPlus size={20} className="mr-5" />
            <Text>
              {t('teachingService:dropDownMenu.duplicateToAnotherInstitution')}
            </Text>
          </>
        ),
        onClick: () => setShowSelectCourseDuplicateModal(true),
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        content: (
          <>
            {archiveState.localIsArchived ? (
              <>
                <BiArchiveOut size={20} className="mr-5" />
                <Text>{t('teachingService:publishCourse.unArchived')}</Text>
              </>
            ) : (
              <>
                <BiArchiveIn size={20} className="mr-5" />
                <Text>{t('teachingService:publishCourse.archived')}</Text>
              </>
            )}
          </>
        ),
        onClick: handleArchiveCourse,
      },
    ]

    // Only add delete option if course doesn't have invoices
    if (!hasInvoices && !isCheckingInvoices) {
      items.push(
        {
          type: 'separator',
        },
        {
          type: 'item',
          disabled: hasInvoices,
          content: (
            <>
              <SvgIcon className="mr-4">
                <DeleteIcon fill="var(--colors-warn)" />
              </SvgIcon>
              <Text>{t('teachingService:dropDownMenu.delete')}</Text>
            </>
          ),
          onClick: () => {
            if (hasInvoices) return
            setShowConfirmPopup(true)
          },
        }
      )
    }

    return items
  }, [
    hasInvoices,
    isCheckingInvoices,
    archiveState.localIsArchived,
    t,
    handleEditCourse,
    handleDuplicateCourse,
    handleArchiveCourse,
  ])

  const allRows = useMemo(() => {
    let { classes } = course

    // Filter out archived classes - ensure classes exists and is an array
    if (classes && Array.isArray(classes)) {
      classes = classes.filter(classItem => {
        const isNotArchived = !classItem.isArchived
        return isNotArchived
      })
    }

    const activityOrder = course.courseActivitiesOrder?.activityOrder
    if (activityOrder) {
      classes = rearrangeOrder(classes, activityOrder)
    }

    return (
      classes?.map(classItem => (
        <Button
          key={classItem.id}
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={e => {
            e.stopPropagation()
            setCurrentCourse(course.id)
            navigate(`/teaching-service/edit-course?tab=class`, {
              state: {
                selectedClassId: classItem.id,
                tabName: 'class',
              },
            })
          }}
        >
          {getCourseIcon(classItem.type)}
          <Text className="ml-2">{classItem.name}</Text>
        </Button>
      )) || []
    )
  }, [course])

  return (
    <Card className="box-col p-4 bg-background-layer-2 hover:bg-background-layer-3">
      <Box
        responsive
        gap="medium"
        className="flex flex-row justify-start items-center rounded-md md:w-full md:items-start"
      >
        <ImageAspect
          s3="public"
          ratio={16 / 9}
          width={isMobile ? '85%' : '25%'}
          src={course.previewImageUrl ?? banner}
          alt="Banner image"
          borderRadius="0.5rem"
          onClick={handleEditCourse}
        />
        <Box direction="column" align="flex-start" justify="flex-start">
          <div
            className="w-full flex flex-col gap-2"
            onClick={handleEditCourse}
            data-testid="course-card"
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleEditCourse()
              }
            }}
          >
            <Box justify="flex-start" align="flex-start" responsive>
              {isLoading && <Spinner />}
            </Box>
            <Text bold size="mediumLarge">
              {course.name}
            </Text>
            <Text size="small" className="text-gray-500">
              {course.courseCode || ''}
            </Text>
            {course.prerequisites?.groups &&
              course.prerequisites.groups.length > 0 && (
                <Box direction="row" justify="flex-start" gap="small">
                  <Text bold>
                    {t('teachingService:prerequisites.prerequisites')}:
                  </Text>
                  <Text>
                    {course.prerequisites.groups
                      .flatMap(group =>
                        group.conditions.map(condition => {
                          const prerequisiteCourse = courseData.courses.find(
                            c => c.id === condition.courseId
                          )
                          return (
                            prerequisiteCourse?.name ||
                            `Course ${condition.courseId}`
                          )
                        })
                      )
                      .join(', ')}
                  </Text>
                </Box>
              )}
          </div>

          <div className="box-row-full justify-start flex-wrap">{allRows}</div>
        </Box>
      </Box>

      <div
        id={`${course.name}-dropdown`}
        role="group"
        className="absolute w-fit top-6 right-6 z-[1]"
        onClick={e => e.stopPropagation()}
      >
        <DropdownMenu
          sideOffset={0}
          menuItems={menuItems}
          contentProps={{
            minWidth: '16rem',
            zIndex: 999,
          }}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <CustomedAlertDialog
        open={showConfirmPopup}
        setOpen={setShowConfirmPopup}
        description={t('teachingService:deleteCourseModal.description')}
        title={t('teachingService:deleteCourseModal.title')}
        cancelText={t('teachingService:deleteCourseModal.cancel') as string}
        actionText={t('teachingService:deleteCourseModal.confirm') as string}
        onActionClick={handleConfirm}
      />

      {/* Archive/Unarchive Confirmation Modal */}
      <CustomedAlertDialog
        open={archiveState.showArchiveModal}
        setOpen={value =>
          dispatchArchive({ type: SET_SHOW_ARCHIVE_MODAL, payload: value })
        }
        alertType={AlertTypes.CONFIRM}
        description={
          archiveState.localIsArchived
            ? t('teachingService:publishCourse.unarchiveCourseDescription')
            : t('teachingService:publishCourse.archiveCourseDescription')
        }
        title={
          archiveState.localIsArchived
            ? t('teachingService:publishCourse.unarchiveCourseTitle')
            : t('teachingService:publishCourse.archiveCourseTitle')
        }
        cancelText={t('teachingService:createCourseModal.cancel')}
        actionText={t('teachingService:session.confirm')}
        onActionClick={handleArchiveConfirm}
      />

      <SelectCourseDuplicateModal
        open={showSelectCourseDuplicateModal}
        setOpen={setShowSelectCourseDuplicateModal}
        course={course}
      />
    </Card>
  )
}

export default CourseCard
