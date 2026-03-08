/* eslint-disable no-plusplus */
import { useCallback, useMemo, useState } from 'react'
import {
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import { useDebounce } from '@uidotdev/usehooks'
import { format } from 'date-fns-tz'
import dayjs from 'dayjs'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { LuMapPin, LuSearch, LuX } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import Drawer from '@/components/Drawer/Drawer'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import PaginatedItems from '@/components/Pagination/Pagination'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { Switch } from '@/components/ui/Switch'
import { AttendanceStatus } from '@/constants/course'
import { csvHeadersDetailLesson } from '@/constants/exportCSVPrefix'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import { useLocationRoom } from '@/hooks/useRoomLocation'
import useSiteData from '@/hooks/useSiteData'
import useUsersManagement from '@/hooks/useUsersManagement'
import ContentLayout from '@/layouts/ContentLayout'
import CourseCalendarStudentItem from '@/pages/FullCalendar/components/CourseCalendarStudentItem'
import LessonDetailInfo from '@/pages/FullCalendar/components/LessonDetailInfo'
import EmptyData from '@/pages/WhatsappTemplate/components/EmptyData'
import ProtectedComponent from '@/routes/ProtectedComponent'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import {
  ClassLessonType,
  ParamsListStudentLessons,
} from '@/types/lessonDateTime'
import { OptionType } from '@/types/options'

import LocationModal from '../../Locations/components/LocationModal'

const NO_LOCATION = 'noLocation'
const NO_INSTRUCTOR = 'noInstructor'

const DetailLesson = (): React.ReactElement => {
  const [locationRoom, setLocationRoom] = useState<OptionType | null>(null)
  const [instructors, setInstructors] = useState<OptionType | null>(null)
  const params = useParams()
  const [searchParams] = useSearchParams()
  const back = searchParams.get('back')
  const {
    id: lessonId,
    page,
    num,
  } = params as { id: string; page: string; num: string }
  const { t } = useTranslation()
  const { getCurrentSiteTimeZoneDate } = useSiteData()
  const {
    useFetchCurrentLesson,
    useGetListStudentLesson,
    useUpdateLocationRoom,
    useUpdateInstructor,
  } = useLessonDateTimeData()

  const [pageParams, setPageParams] = useState<ParamsListStudentLessons>({
    search: '',
    withUnpaid: true,
    page: page ? +page : 1,
    num: num ? +num : 10,
  })

  const userPermissionData = useRecoilValue(userPermissionState)
  const isAboveInstructor = [
    UserRole.SchoolAdmin,
    UserRole.SiteAdmin,
    UserRole.MasterAdmin,
  ].includes(userPermissionData)

  const [showUnpaid, setShowUnpaid] = useState(true)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const debouncedSearchTerm = useDebounce(pageParams.search, 600)
  const debouncedWithPage = useDebounce(pageParams.page, 600)
  const navigate = useNavigate()
  const { useFetchLocationRooms } = useLocationRoom()
  const { data: locationRooms } = useFetchLocationRooms()

  // Create debounced params for API calls - always fetch all students
  const debouncedPageParams = useMemo(
    () => ({
      search: debouncedSearchTerm,
      withUnpaid: true, // Always fetch all students
      page: debouncedWithPage,
      num: pageParams.num,
    }),
    [debouncedSearchTerm, debouncedWithPage, pageParams.num]
  )

  const locationRoomsOptions = useMemo(() => {
    return (locationRooms || []).map(location => ({
      label: location.name,
      value: location.id?.toString() || '',
    }))
  }, [locationRooms])
  const locationRoomWithPlaceholder = useMemo(() => {
    return [
      {
        label: t('teachingService:basic.selectLocation'),
        value: NO_LOCATION,
      },
      ...locationRoomsOptions,
    ]
  }, [locationRoomsOptions, t])

  const { useGetInstructors } = useUsersManagement()
  const { data: instructorsList } = useGetInstructors()

  const instructorsOptions = useMemo(() => {
    return (instructorsList || []).map(instructor => ({
      label: `${instructor.user?.firstName} ${
        instructor.user?.lastName || ''
      } - ${instructor.user?.email}`,
      value: instructor.user?.id?.toString() || '',
    }))
  }, [instructorsList])

  const instructorWithPlaceholder = useMemo(() => {
    return [
      {
        label: t('teachingService:basic.selectInstructor'),
        value: NO_INSTRUCTOR,
      },
      ...instructorsOptions,
    ]
  }, [instructorsOptions, t])

  // Memoize lessonId to prevent unnecessary re-renders and duplicate API calls
  const memoizedLessonId = useMemo(() => Number(lessonId), [lessonId])

  // Memoize the callback to prevent it from being recreated on every render
  const handleLessonSuccess = useCallback(
    (classLesson: ClassLessonType) => {
      const locationRoom = locationRoomsOptions.find(
        option =>
          option.value ===
          (
            classLesson?.locationId || classLesson?.class?.locationId
          )?.toString()
      )
      if (locationRoom) {
        setLocationRoom(locationRoom)
      }

      if (classLesson.instructorId) {
        const selectedInstructor = instructorsOptions.find(
          option => option.value === classLesson.instructorId?.toString()
        )
        if (selectedInstructor) {
          setInstructors(selectedInstructor)
        }
      }
    },
    [locationRoomsOptions, instructorsOptions]
  )

  const {
    isLoading,
    isError,
    isSuccess,
    isIdle,
    data: currentLesson,
    refetch: refetchCurrentLesson,
  } = useFetchCurrentLesson(memoizedLessonId, handleLessonSuccess)

  const { data: allStudentData, refetch } = useGetListStudentLesson(
    memoizedLessonId,
    {
      ...debouncedPageParams,
      allPage: true,
    }
  )

  const { mutate: updateLocationRoom, isLoading: isUpdatingLocationRoom } =
    useUpdateLocationRoom(Number(lessonId), () => {
      refetchCurrentLesson()
    })

  const { mutate: updateInstructor, isLoading: isUpdateInstructor } =
    useUpdateInstructor(Number(lessonId), () => {
      refetchCurrentLesson()
    })

  const onBack = () => {
    if (back) {
      navigate(back)
    } else {
      navigate(`/full-calendar?${searchParams}`)
    }
  }

  const leftHeaderContent = (
    <div className="text-2xl">{t('lessonDateTime:lessonDetail')}</div>
  )
  const rightHeaderContent = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onBack}
      className="cursor-pointer justify-self-end md:justify-self-normal"
      aria-label="Close"
    >
      <LuX size={20} />
    </Button>
  )

  const lessonTime = useMemo(() => {
    if (!currentLesson) return ''
    const { startTime: start, endTime: end } = currentLesson
    const startDate = dayjs(start).format('YYYY/MM/DD')
    const startTime = format(
      getCurrentSiteTimeZoneDate(start as unknown as string) as Date,
      'hh:mm:a'
    )
    const endTime = format(
      getCurrentSiteTimeZoneDate(end as unknown as string) as Date,
      'hh:mm:a'
    )
    return `${startDate} at ${startTime} - ${endTime}`
  }, [currentLesson, getCurrentSiteTimeZoneDate])

  const csvData = useMemo(() => {
    if (!allStudentData?.content || !currentLesson) return []
    const { courseName, className } = currentLesson
    return allStudentData?.content?.map(student => {
      return {
        id: lessonId,
        name: student.name,
        phone: student.phone,
        email: student.email,
        attendanceStatus: student.attendance,
        courseName,
        className,
        lessonTime,
      }
    })
  }, [allStudentData?.content, currentLesson, lessonId, lessonTime])

  const csvFileName = useMemo(() => {
    if (!currentLesson) return ''
    const { courseName = '', className = '', startTime: start } = currentLesson
    return `${courseName}_${className}_${dayjs(start).format('YYYYMMDD')}.csv`
  }, [currentLesson])

  // Client-side filtering for unpaid students
  const filteredStudentData = useMemo(() => {
    if (!allStudentData?.content) return allStudentData

    if (showUnpaid) {
      // Show all students (including unpaid)
      return allStudentData
    }

    // Filter out unpaid students
    const filteredContent = allStudentData.content.filter(student => {
      // Check if student has paid
      return student.payments?.paymentState === 'PAID' || !student.payments
    })

    return {
      ...allStudentData,
      content: filteredContent,
      meta: {
        ...allStudentData.meta,
        itemCount: filteredContent.length,
        pageCount: Math.ceil(
          filteredContent.length / (debouncedPageParams.num || 10)
        ),
      },
    }
  }, [allStudentData, showUnpaid, debouncedPageParams.num])

  const isDataIsEmpty = !filteredStudentData?.content?.length

  const exportCsv = (
    <CSVLink
      headers={csvHeadersDetailLesson}
      data={csvData}
      filename={csvFileName}
      target="_blank"
      style={{
        textDecoration: 'none',
        flexShrink: 0,
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={(e: any) => {
        if (isDataIsEmpty) e.preventDefault()
      }}
    >
      <Button
        className="self-end"
        data-testid="export-csv-btn"
        disabled={isDataIsEmpty}
      >
        {t('student:exportCSV.title')}
      </Button>
    </CSVLink>
  )

  const selectedLocationRoom = useMemo(() => {
    return (locationRooms || []).find(
      option => option.id === currentLesson?.class?.locationId
    )
  }, [locationRooms, currentLesson?.class?.locationId])

  const numberOfAttendedStudents = useMemo(() => {
    return (
      allStudentData?.content?.filter(
        student => student.attendance === AttendanceStatus.ATTENDED
      ).length || 0
    )
  }, [allStudentData?.content])

  return (
    <>
      <Drawer open onClose={onBack}>
        <ContentLayout
          leftHeader={leftHeaderContent}
          rightHeader={rightHeaderContent}
        >
          {isIdle && <FullScreenAlertBox text={t(`lessonDateTime:noLesson`)} />}
          {isLoading && (
            <Box className="min-w-[25rem] min-h-[80vh]">
              <FullScreenLoading />
            </Box>
          )}
          {isError && (
            <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
          )}
          {isSuccess && currentLesson && (
            <Box
              align="start"
              justify="start"
              direction="col"
              className="mt-6 relative min-h-[80vh] md:min-w-[25rem] space-y-2.5"
            >
              <LessonDetailInfo
                data={currentLesson}
                instructorName={
                  instructors
                    ? instructors.label ?? ''
                    : instructorWithPlaceholder[0].label
                }
                locationRoom={
                  locationRoom
                    ? locationRoom.label ?? ''
                    : locationRoomWithPlaceholder[0].label
                }
                instructorOptions={instructorWithPlaceholder}
                locationOptions={locationRoomWithPlaceholder}
                onUpdateInstructor={val => {
                  if (val === NO_INSTRUCTOR) {
                    updateInstructor({ instructorId: null })
                  } else {
                    updateInstructor({ instructorId: Number(val) })
                  }
                }}
                onUpdateLocation={val => {
                  if (val === NO_LOCATION) {
                    updateLocationRoom({ locationId: null })
                  } else {
                    updateLocationRoom({ locationId: Number(val) })
                  }
                }}
                isUpdatingInstructor={isUpdateInstructor}
                isUpdatingLocation={isUpdatingLocationRoom}
                isAboveInstructor={isAboveInstructor}
              />
              <ProtectedComponent
                roleAllowed={[UserRole.SiteAdmin, UserRole.SchoolAdmin]}
              >
                <Box direction="col" align="start" gap="sm">
                  {selectedLocationRoom && selectedLocationRoom.address && (
                    <span className="text-sm font-normal flex items-center gap-x-1 p-2 border rounded-md w-full">
                      {selectedLocationRoom.coordinate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsLocationModalOpen(true)}
                        >
                          <LuMapPin />
                        </Button>
                      )}
                      {selectedLocationRoom.address}
                    </span>
                  )}
                </Box>
              </ProtectedComponent>
              <div className="flex justify-between w-full">
                <span className="text-xl font-bold">
                  {t('lessonDateTime:studentList')}
                </span>
                <div className="flex items-center gap-x-1 font-normal">
                  <Switch
                    checked={showUnpaid}
                    onCheckedChange={setShowUnpaid}
                  />{' '}
                  {t('calendar:showUnpaid')}
                </div>
              </div>

              <div className="flex gap-4">
                <p className="text-sm font-normal">
                  {`${t('lessonDateTime:lessonStats.quota')}: ${
                    currentLesson?.quotaUsed || 0
                  } / ${currentLesson.quota}`}
                </p>
                <p className="text-sm font-normal">
                  {`${t(
                    'lessonDateTime:lessonStats.attendance'
                  )}: ${numberOfAttendedStudents} / ${
                    currentLesson?.quotaUsed || 0
                  }`}
                </p>
              </div>

              <Box>
                <Input
                  prefixIcon={<LuSearch className="fill-transparent" />}
                  placeholder={t('lessonDateTime:searchPlaceholder').toString()}
                  value={pageParams.search}
                  onChange={e =>
                    // Always reset page if search change
                    setPageParams(prev => ({
                      ...prev,
                      search: e.target.value,
                      page: 1,
                    }))
                  }
                />
                {isAboveInstructor && exportCsv}
              </Box>

              {filteredStudentData?.meta &&
                (filteredStudentData?.meta?.pageCount || 0) >= 1 && (
                  <PaginatedItems
                    meta={{
                      num: pageParams?.num || 10,
                      page: pageParams?.page || 1,
                      itemCount: filteredStudentData?.meta?.itemCount,
                      pageCount: filteredStudentData?.meta?.pageCount,
                      hasPreviousPage: (pageParams?.page || 1) > 1,
                      hasNextPage:
                        (pageParams?.page || 1) <
                        (filteredStudentData?.meta?.pageCount || 1),
                    }}
                    pageButtonProps={{
                      next: 'Next',
                      back: 'Back',
                      onChangePage: page =>
                        setPageParams(prev => ({ ...prev, page })),
                      onClickBack: () => {
                        if ((pageParams?.page || 1) > 1) {
                          setPageParams(prev => ({
                            ...prev,
                            page: (pageParams.page as number) - 1,
                          }))
                        }
                      },
                      onClickNext: () => {
                        if (
                          (pageParams?.page || 1) <
                          (filteredStudentData?.meta?.pageCount || 1)
                        ) {
                          setPageParams(prev => ({
                            ...prev,
                            page: (pageParams.page as number) + 1,
                          }))
                        }
                      },
                    }}
                    itemWrapperClassName="overflow-y-auto pb-10 mt-4 space-y-3"
                  >
                    {filteredStudentData?.content
                      ?.slice(
                        ((pageParams?.page || 1) - 1) * (pageParams?.num || 10),
                        (pageParams?.page || 1) * (pageParams?.num || 10)
                      )
                      .map(student => {
                        return (
                          <CourseCalendarStudentItem
                            key={student.id}
                            data={student}
                            refetch={refetch}
                            isAboveInstructor={isAboveInstructor}
                          />
                        )
                      })}
                  </PaginatedItems>
                )}
              {(filteredStudentData?.content?.length || 0) <= 0 && (
                <EmptyData />
              )}
            </Box>
          )}
        </ContentLayout>
      </Drawer>
      <Outlet />
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        position={selectedLocationRoom?.coordinate}
        address={selectedLocationRoom?.address}
      />
    </>
  )
}

export default DetailLesson
