import { useEffect, useMemo, useState } from 'react'

import NoDataCard from '@/components/NoDataCard'
import useStudentSubmissionData from '@/hooks/useStudentSubmissionData'
import { ListParams } from '@/types/class-material'

import SubmissionFilter from '../SubmissionFilter'

import SubmissionByLessonItem from './SubmissionByLessonItem'

const SubmissionByLesson = (): JSX.Element => {
  const [params, setParams] = useState<ListParams>({})
  const { useGetListStudentSubmissionByLesson } = useStudentSubmissionData()
  const { data, refetch } = useGetListStudentSubmissionByLesson(params)
  const dataLessons = useMemo(() => data?.data ?? [], [data])
  useEffect(() => {
    refetch()
  }, [params, refetch])
  return (
    <div className="space-y-4 pb-6">
      <SubmissionFilter setParams={setParams} />
      {dataLessons.map(item => (
        <SubmissionByLessonItem key={item.id} item={item} onRefetch={refetch} />
      ))}
      {(data?.data ?? []).length === 0 && <NoDataCard variant="materials" />}
    </div>
  )
}

export default SubmissionByLesson
