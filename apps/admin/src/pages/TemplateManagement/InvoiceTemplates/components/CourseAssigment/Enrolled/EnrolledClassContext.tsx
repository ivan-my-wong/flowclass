import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

import dayjs from 'dayjs'

import { LessonPreview } from '@/types/regularClass'
import { InvoiceClassType, InvoiceStudent } from '@/types/studentInvoice.type'

type EnrolledClassContextType = {
  isEnrollAllStudents: boolean
  setEnrollAllStudents: Dispatch<SetStateAction<boolean>>
  allStudentsToEnroll: InvoiceStudent[]
  setAllStudentsToEnroll: Dispatch<SetStateAction<InvoiceStudent[]>>
  studentToEnroll: InvoiceStudent | undefined
  setStudentToEnroll: Dispatch<SetStateAction<InvoiceStudent | undefined>>
  date: Date
  setDate: Dispatch<SetStateAction<Date>>
  availableClassesAndSessions: AllEnrolledData[]
  setAvailableClassesAndSessions: Dispatch<SetStateAction<AllEnrolledData[]>>
  selectedClasses: AllEnrolledData[]
  setSelectedClasses: Dispatch<SetStateAction<AllEnrolledData[]>>
}

export type AllEnrolledData = {
  classData: InvoiceClassType & { parentName: string }
  sessionData: LessonPreview[]
}

const EnrolledClassContext = createContext<
  EnrolledClassContextType | undefined
>(undefined)

export const EnrolledClassProvider = ({
  children,
}: {
  children: ReactNode
}): JSX.Element => {
  const [isEnrollAllStudents, setEnrollAllStudents] = useState(false)
  const [allStudentsToEnroll, setAllStudentsToEnroll] = useState<
    InvoiceStudent[]
  >([])
  const [studentToEnroll, setStudentToEnroll] = useState<InvoiceStudent>()
  const [date, setDate] = useState<Date>(
    dayjs().subtract(1, 'month').startOf('month').toDate()
  )

  const [availableClassesAndSessions, setAvailableClassesAndSessions] =
    useState<AllEnrolledData[]>([])
  const [selectedClasses, setSelectedClasses] = useState<AllEnrolledData[]>([])

  return (
    <EnrolledClassContext.Provider
      value={{
        isEnrollAllStudents,
        setEnrollAllStudents,
        allStudentsToEnroll,
        setAllStudentsToEnroll,
        studentToEnroll,
        setStudentToEnroll,
        date,
        setDate,
        availableClassesAndSessions,
        setAvailableClassesAndSessions,
        selectedClasses,
        setSelectedClasses,
      }}
    >
      {children}
    </EnrolledClassContext.Provider>
  )
}

export function useContextEnrolledClass(): EnrolledClassContextType {
  const context = useContext(EnrolledClassContext)
  if (!context) {
    throw new Error(
      'useContextEnrolledClass must be used within EnrolledClassProvider'
    )
  }
  return context
}
