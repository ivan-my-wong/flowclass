import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDebounce } from '@uidotdev/usehooks'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { v4 as uuidv4 } from 'uuid'

import {
  DraggableCard,
  DraggableContainer,
} from '@/components/Containers/Draggable'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import Heading from '@/components/Texts/Heading'
import { ToggleGroupLabelsProps } from '@/components/ToggleGroup/ToggleGroup'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { QUERY_KEY } from '@/constants/queryKey'
import useCourseData from '@/hooks/useCourseData'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import ProtectedComponent from '@/routes/ProtectedComponent'
import { UserRole } from '@/stores/userPermissionData'
import { Course } from '@/types/course'
import { School } from '@/types/school'

import ArchivedCoursesSection from './ArchiveCourse'
import CourseCard from './CourseCard'
import CreateCourseModal, { CreateCourseModalHandle } from './CreateCourseModal'

const TeachingServicePage = (): JSX.Element => {
  const { useFetchAllCourseData } = useCourseData()
  const queryClient = useQueryClient()
  const fetchCourseDataResult = useFetchAllCourseData()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isLoading, isError, isSuccess, isIdle, data } = fetchCourseDataResult
  const createCourseModalHandle = useRef<CreateCourseModalHandle>(null)
  const [deleteCourse, setDeleteCourse] = useState<Course>()
  const [courseData, setCourseData] = useState<Course[]>()
  const {
    schoolData,
    updateCurrentSchool,
    useUpdateSchool,
    useFetchCurrentSchool,
  } = useSchoolData()
  const [reorderModeOn, setReorderModeOn] = useState<boolean>(false)
  const { refetch } = useFetchCurrentSchool()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (isSuccess && data && data.length > 0) {
      setCourseData(data)
      refetch()
    }
  }, [data])

  // One-time refetch on component mount
  useEffect(() => {
    refetch()
  }, [])

  useEffect(() => {
    const shouldOpenModal = localStorage.getItem('openCreateCourseModal')
    if (shouldOpenModal === 'true') {
      openCreateCourseModal()
      localStorage.removeItem('openCreateCourseModal')
    }
  }, [])

  const openCreateCourseModal = () => {
    createCourseModalHandle.current?.handleOpenChange?.()
  }

  const handleSuccessfulDelete = (course: Course) => {
    setDeleteCourse(course)
    if (course) {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.course.getCourseSchoolKey],
      })
    }
    navigate('/teaching-service')
  }

  const handleSuccessfulArchiveToggle = (updatedCourse: Course) => {
    if (updatedCourse) {
      setCourseData(prev =>
        prev?.map(c => (c.id === updatedCourse.id ? updatedCourse : c))
      )

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.course.getCourseSchoolKey],
      })
    }
  }

  const handleSuccessfulDuplicate = (course: Course) => {
    if (course) {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.course.getCourseSchoolKey],
      })
    }
  }

  const rightHeaderContent = (
    <Box>
      <ProtectedComponent
        roleAllowed={[UserRole.SiteAdmin, UserRole.SchoolAdmin]}
      >
        <>
          {reorderModeOn ? (
            <Button
              variant="primary-outline"
              onClick={() => {
                setReorderModeOn(!reorderModeOn)
              }}
            >
              {t(`common:action.confirmSort`)}
            </Button>
          ) : (
            <Button
              variant="primary-outline"
              onClick={() => {
                setReorderModeOn(!reorderModeOn)
              }}
            >
              {t(`setting:studentInformation.reorder`)}
            </Button>
          )}

          <Button onClick={openCreateCourseModal}>
            {t(`teachingService:createCourse`)}
          </Button>
        </>
      </ProtectedComponent>
    </Box>
  )

  const handleCurrentSchoolChange = (school: School): void => {
    updateCurrentSchool(school)
  }

  const updateSchoolResult = useUpdateSchool(
    schoolData.currentSchool?.id ?? 0,
    false,
    handleCurrentSchoolChange
  )

  const rearrangeCourseOrder = useCallback((): Course[] => {
    if (!courseData) {
      return []
    }
    if (!schoolData.currentSchool?.courseOrder) {
      return courseData
    }

    const { courseOrder } = schoolData.currentSchool
    const courseOrderSet = new Set(courseOrder)

    // Get courses in the order specified by courseOrder
    const orderedCourses = courseOrder
      .map(id => courseData.find(item => item.id === id))
      .filter(item => item !== undefined) as Course[]

    // Get courses not in courseOrder (new courses or courses that were removed from order)
    const unorderedCourses = courseData.filter(
      course => !courseOrderSet.has(course.id)
    )

    // Combine: ordered courses first, then unordered courses
    return [...orderedCourses, ...unorderedCourses]
  }, [courseData, schoolData])

  const courseDragItems = useMemo(() => {
    return (
      rearrangeCourseOrder()?.map(courseObj => {
        return {
          id: courseObj.id,
          value: courseObj.id,
          label: courseObj.name,
          obj: courseObj,
          status: 'active',
        }
      }) ?? []
    )
  }, [courseData, rearrangeCourseOrder])

  const filteredCourseDragItems = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return courseDragItems
    const lowerQuery = debouncedSearchQuery.toLowerCase()

    return courseDragItems.filter(course => {
      // Check course name (via label, which is courseObj.name)
      if (course.label && course.label.toLowerCase().includes(lowerQuery)) {
        return true
      }

      // NEW: Check course ID (convert to string for partial/substring matching)
      if (
        course.id != null &&
        String(course.id).toLowerCase().includes(lowerQuery)
      ) {
        return true
      }

      // Check class names
      if (
        Array.isArray(course.obj?.classes) &&
        course.obj.classes.some(
          cls => cls.name && cls.name.toLowerCase().includes(lowerQuery)
        )
      ) {
        return true
      }

      return false
    })
  }, [debouncedSearchQuery, courseDragItems])

  const activeCourses = useMemo(() => {
    return filteredCourseDragItems.filter(c => !c.obj.isArchived)
  }, [filteredCourseDragItems])

  const archivedCourses = useMemo(() => {
    return filteredCourseDragItems.filter(c => c.obj.isArchived)
  }, [filteredCourseDragItems])

  const archivedCount = archivedCourses?.length ?? 0

  const handleDragEnd = (newData: ToggleGroupLabelsProps[]) => {
    const newOrder = newData.map(data =>
      Number.parseInt(data.value.toString(), 10)
    )
    const reorderedObj = newOrder.map(id =>
      courseData?.find(item => item.id === id)
    ) as Course[]

    setCourseData(reorderedObj)
    updateCurrentSchool({
      ...schoolData.currentSchool,
      courseOrder: newOrder,
    } as School)

    const updatedFields = {
      courseOrder: newOrder,
    }
    updateSchoolResult.mutateAsync(updatedFields)
  }

  const leftHeaderContent = (
    <Heading>{t('component:menubar.teachingService')}</Heading>
  )

  const renderCourseCard = () => {
    if (deleteCourse) {
      return activeCourses
        .filter(course => course.obj.id !== deleteCourse?.id)
        .map(course => (
          <CourseCard
            key={course.obj.id}
            course={course.obj}
            deleteSuccessfulCallback={handleSuccessfulDelete}
            duplicateSuccessfulCallback={handleSuccessfulDuplicate}
            archiveSuccessfulCallback={handleSuccessfulArchiveToggle}
          />
        ))
    }
    if (reorderModeOn) {
      const draggableItems = activeCourses.map(item => ({
        ...item,
        id: String(item.value),
      }))

      return (
        <DraggableContainer
          items={draggableItems}
          handleDragEnd={handleDragEnd}
        >
          {draggableItems.map(course => (
            <DraggableCard id={String(course.id)} key={String(course.id)}>
              <CourseCard
                key={course.value}
                course={course.obj}
                deleteSuccessfulCallback={handleSuccessfulDelete}
                duplicateSuccessfulCallback={handleSuccessfulDuplicate}
                archiveSuccessfulCallback={handleSuccessfulArchiveToggle}
              />
            </DraggableCard>
          ))}
        </DraggableContainer>
      )
    }
    return activeCourses.map(course => (
      <CourseCard
        key={course.obj.id}
        course={course.obj}
        deleteSuccessfulCallback={handleSuccessfulDelete}
        duplicateSuccessfulCallback={handleSuccessfulDuplicate}
        archiveSuccessfulCallback={handleSuccessfulArchiveToggle}
      />
    ))
  }

  return (
    <ContentLayout
      leftHeader={leftHeaderContent}
      rightHeader={rightHeaderContent}
    >
      {isIdle && <FullScreenAlertBox text={t(`teachingService:noSchool`)} />}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && data && data.length === 0 && (
        <FullScreenAlertBox text={t(`teachingService:noCourse`)} />
      )}
      {isSuccess && data && data.length > 0 && (
        <div className="box-col-full gap-4 p-4">
          <Input
            placeholder={
              t('teachingService:searchPlaceholder') ||
              'Search courses or classes...'
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {renderCourseCard()}

          <ArchivedCoursesSection
            archivedCourses={archivedCourses}
            archivedCount={archivedCount}
            handleSuccessfulDelete={handleSuccessfulDelete}
            handleSuccessfulDuplicate={handleSuccessfulDuplicate}
            handleSuccessfulArchiveToggle={handleSuccessfulArchiveToggle}
          />
        </div>
      )}
      <CreateCourseModal
        ref={createCourseModalHandle}
        handleCreateCourseSuccess={() => {
          navigate('/teaching-service/edit-course')
        }}
        hidden
      />
    </ContentLayout>
  )
}

export default TeachingServicePage
