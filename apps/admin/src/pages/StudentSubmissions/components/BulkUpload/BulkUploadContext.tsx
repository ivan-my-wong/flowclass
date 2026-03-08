import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'

import { getListStudentLesson } from '@/api/lessonDateTime'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'

export type SubmissionLesson = {
  value: number
  label: string
}

export type SubmissionStudent = {
  label: string
  value: number
  email: string
  phone: string
}

export type FileDetail = {
  file: File
  fileName: string
  fileSize: number
  isMatch: boolean
  lesson?: SubmissionLesson
  student?: SubmissionStudent | null
}

type BulkUploadContextType = {
  selectedFiles: FileDetail[]
  setSelectedFiles: Dispatch<SetStateAction<FileDetail[]>>
  selectedLessonId: number | undefined
  setSelectedLessonId: Dispatch<SetStateAction<number | undefined>>
  studentList: SubmissionStudent[]
}

const BulkUploadContext = createContext<BulkUploadContextType | undefined>(
  undefined
)

export const BulkUploadProvider = ({
  children,
}: {
  children: ReactNode
}): JSX.Element => {
  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const currentInstitutionId = schoolData.currentSchool?.id.toString() || ''
  const currentSiteId = siteData.currentSite?.id.toString() || ''
  const [selectedFiles, setSelectedFiles] = useState<FileDetail[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<number>()
  const [studentList, setStudentList] = useState<SubmissionStudent[]>([])

  useEffect(() => {
    if (selectedLessonId) {
      const fetchStudents = async () => {
        const result = await getListStudentLesson(
          selectedLessonId ?? 0,
          +currentInstitutionId,
          +currentSiteId,
          { allPage: true, page: 1, num: 10 }
        )

        setStudentList(
          result.content.map(item => {
            return {
              label: item.name,
              value: item.id,
              email: item.email,
              phone: item.phone,
            }
          })
        )
      }

      fetchStudents()
    }
  }, [currentInstitutionId, currentSiteId, selectedLessonId])
  return (
    <BulkUploadContext.Provider
      value={{
        selectedFiles,
        setSelectedFiles,
        selectedLessonId,
        setSelectedLessonId,
        studentList,
      }}
    >
      {children}
    </BulkUploadContext.Provider>
  )
}

export function useContextBulkUpload(): BulkUploadContextType {
  const context = useContext(BulkUploadContext)
  if (!context) {
    throw new Error('Failed to create context: useContextBulkUpload')
  }
  return context
}
