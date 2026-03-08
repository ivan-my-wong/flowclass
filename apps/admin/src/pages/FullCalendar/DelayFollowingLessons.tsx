import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'

import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import { QUERY_KEY } from '@/constants/queryKey'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import useSchoolData from '@/hooks/useSchoolData'
import { ParamsListStudentLessons } from '@/types/lessonDateTime'
import { formatTs, getFormatDate } from '@/utils/timeFormat'

const DelayFollowingLessons = (): JSX.Element => {
  const { t } = useTranslation()
  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''
  const params = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    id: lessonId,
    page,
    num,
  } = params as { id: string; page: string; num: string }
  const [pageParams, setPageParams] = useState<ParamsListStudentLessons>({
    search: '',
    withUnpaid: false,
    page: page ? +page : 1,
    num: num ? +num : 10,
  })
  const queryClient = useQueryClient()

  const {
    useFetchCurrentLesson,
    useDelayFollowingLessons,
    useFetchAvailableNextRecurring,
    useGetListStudentLesson,
  } = useLessonDateTimeData()
  const { mutateAsync, isLoading } = useDelayFollowingLessons(
    +lessonId,
    async () => {
      await onBack()
    }
  )
  const { data: detailLesson } = useFetchCurrentLesson(+lessonId)
  const {
    mutateAsync: checkAvailableNextRecurringLesson,
    data: nextRecurringLesson,
  } = useFetchAvailableNextRecurring()

  const { data: studentData, refetch } = useGetListStudentLesson(+lessonId, {
    ...pageParams,
  })
  const onBack = async () => {
    await queryClient.invalidateQueries({
      queryKey: [
        QUERY_KEY.course.listLessonDateTimeKey,
        currentInstitutionId,
        getFormatDate(searchParams.get('startDate')),
        getFormatDate(searchParams.get('endDate')),
      ],
    })
    navigate(`/full-calendar?${searchParams}`)
  }
  const currentDateTime = useMemo(() => {
    if (!detailLesson) return ''
    const { startTime, endTime, changeEndTime, changeStartTime } = detailLesson
    const formattedStart = formatTs(
      changeStartTime || startTime,
      'YYYY/MM/DD hh:mm a'
    )
    const formattedEnd = formatTs(
      changeEndTime || endTime,
      'YYYY/MM/DD hh:mm a'
    )
    return `${formattedStart} - ${formattedEnd}`
  }, [detailLesson])

  const nextRecurringDateTime = useMemo(() => {
    if (!nextRecurringLesson) return ''
    const { newStartTime, newEndTime } = nextRecurringLesson
    const formattedStart = formatTs(newStartTime, 'YYYY/MM/DD hh:mm a')
    const formattedEnd = formatTs(newEndTime, 'YYYY/MM/DD hh:mm a')
    return `${formattedStart} - ${formattedEnd}`
  }, [nextRecurringLesson])
  const onConfirm = async () => {
    if (detailLesson) await mutateAsync()
  }
  useEffect(() => {
    const getAvailableNextRecurring = async () => {
      if (detailLesson) {
        const {
          startTime,
          endTime,
          changeStartTime,
          changeEndTime,
          classId,
          courseId,
        } = detailLesson
        await checkAvailableNextRecurringLesson({
          courseId,
          classId: +classId,
          startTime: changeStartTime || startTime,
          endTime: changeEndTime || endTime,
        })
      }
    }
    getAvailableNextRecurring()
  }, [detailLesson])
  return (
    <ModalDialog
      title={t('lessonDateTime:delayFollowingLessons.title') as string}
      open
      onOpenChange={() => navigate(-1)}
      footer={
        <Button
          type="button"
          loading={isLoading}
          disabled={isLoading}
          className="w-full"
          onClick={onConfirm}
        >
          {t('common:action:confirm')}
        </Button>
      }
    >
      <div className="flex flex-col gap-y-4">
        <span className="font-normal">
          {t('lessonDateTime:delayFollowingLessons.description')}
        </span>
        <span>
          {t('lessonDateTime:delayFollowingLessons.featureForRecurring')}
        </span>
      </div>
      <Box justify="start" className="!text-xs bg-text-disabled/50">
        {currentDateTime}
      </Box>
      <Box className="gap-x-2 w-full" direction="col">
        {(studentData?.content || [])?.map(student => (
          <Box justify="between" key={`source-${student.id}`}>
            <span>{student.name}</span>
            <span>
              {student.completedLessons} / {student.lessons}
            </span>
          </Box>
        ))}
      </Box>
      <Box justify="start" className="!text-xs bg-text-disabled/50">
        {nextRecurringDateTime}
      </Box>
      <Box className="gap-x-2 w-full" direction="col">
        {(studentData?.content || [])?.map(student => (
          <Box justify="between" key={`moveto-${student.id}`}>
            <span>{student.name}</span>
            <span>
              {student.completedLessons} / {student.lessons}
            </span>
          </Box>
        ))}
      </Box>
    </ModalDialog>
  )
}
export default DelayFollowingLessons
