import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuX } from 'react-icons/lu'

import NoDataCard from '@/components/NoDataCard'
import { Button } from '@/components/ui/Button'
import useStudentSubmissionData from '@/hooks/useStudentSubmissionData'
import { ListParams } from '@/types/class-material'
import { StudentSubmissionType } from '@/types/student-submission'

import SubmissionFilter from '../SubmissionFilter'

import SubmissionByFileItem from './SubmissionByFileItem'

export type FileItem = {
  id: number
  fileName: string
  uploadedAt?: Date
}

type Lesson = {
  id: number
  name: string
  start_date: Date
  end_date: Date
}

const SubmissionByFile = (): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const [selectedSubmissions, setSelectedSubmission] = useState<
    StudentSubmissionType[]
  >([])
  const [params, setParams] = useState<ListParams>({})
  const { useGetListStudentSubmission } = useStudentSubmissionData()
  const { data, refetch } = useGetListStudentSubmission(params)

  const handleCheckChange = (
    event: boolean,
    submissionItem: StudentSubmissionType
  ) => {
    setSelectedSubmission(prev => {
      if (event) {
        return [...prev, submissionItem]
      }
      return prev.filter(item => item.id !== submissionItem.id)
    })
  }
  useEffect(() => {
    refetch()
  }, [params, refetch])
  return (
    <div className="space-y-4 pb-6">
      <SubmissionFilter setParams={setParams} />
      {/* {selectedSubmissions.length > 0 && (
        <div className="px-4 py-2 border bg-blue-50 border-blue-300 rounded-lg flex items-center gap-2">
          <LuX
            size={18}
            className="cursor-pointer text-gray-700 hover:text-gray-900"
            onClick={() => setSelectedSubmission([])}
          />
          <div className="text-sm font-medium">
            {t('submissionSelected', { count: selectedSubmissions.length })}
          </div>
          <Button className="ml-auto px-4 bg-red-500" size="xs">
            {t('common:action.remove')}
          </Button>
          <Button className="px-4" size="xs">
            {t('downloadAll')}
          </Button>
        </div>
      )} */}
      {(data?.data ?? []).map(item => (
        <SubmissionByFileItem
          key={item.id}
          submissionItem={item}
          isSelected={selectedSubmissions.some(x => x.id === item.id)}
          onCheckChange={e => handleCheckChange(e, item)}
        />
      ))}
      {(data?.data ?? []).length === 0 && (
        <NoDataCard
          variant="materials"
          message={t('noSubmissions') as string}
        />
      )}
    </div>
  )
}

export default SubmissionByFile
