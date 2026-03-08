import { useEffect, useMemo, useState } from 'react'

import { FaEnvelope, FaPhoneAlt, FaSearch } from 'react-icons/fa'
import { FiUser } from 'react-icons/fi'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Inputs/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import useStudentData from '@/hooks/useStudentData'
import { StudentEnrolmentRecord } from '@/types/student'
import { DocumentTemplate } from '@/types/templateManagement'

type CenterCanvasProps = {
  campaignId?: string
  lessonDetails?: { courseId?: number; classId?: number }
  setLessonDetails?: (details: { courseId?: number; classId?: number }) => void
  selectedStudents: StudentEnrolmentRecord[]
  setSelectedStudents: (students: StudentEnrolmentRecord[]) => void
  selectedDocument?: DocumentTemplate
}

const CenterCanvas = (props: CenterCanvasProps) => {
  const {
    campaignId,
    selectedStudents,
    setSelectedStudents,
    selectedDocument,
    lessonDetails,
    setLessonDetails,
  } = props

  const [search, setSearch] = useState('')
  const [fixStudentsData, setFixStudentsData] = useState<
    StudentEnrolmentRecord[]
  >([])

  const { useFetchAllStudentData } = useStudentData()
  const { data: studentsData = [] } = useFetchAllStudentData()

  const isSelected = (student: Partial<StudentEnrolmentRecord>) => {
    return selectedStudents.some(s => s?.id === student?.id)
  }

  const toggleStudent = (student: Partial<StudentEnrolmentRecord>) => {
    setSelectedStudents([
      ...selectedStudents.filter(s => s.id !== student.id),
      ...(isSelected(student) ? [] : [student as StudentEnrolmentRecord]),
    ])
  }

  const { courses, classes } = useMemo(() => {
    const courses: { id: number; name: string; path: string }[] = []
    const classes: {
      id: number
      name: string
      type: string
      courseId: number
    }[] = []
    studentsData.forEach(student => {
      student.enrollCourses?.forEach(enroll => {
        if (!enroll.course) return
        if (!courses.some(c => c?.id === enroll?.course?.id)) {
          courses.push(enroll.course)
        }
        enroll.studentSchedule?.forEach(schedule => {
          if (!classes.some(c => c?.id === schedule?.class?.id)) {
            classes.push({
              ...schedule.class,
              courseId: enroll?.course?.id,
            })
          }
        })
      })
    })
    return {
      courses,
      classes: classes.filter(c => {
        if (lessonDetails?.courseId) {
          return c.courseId === lessonDetails.courseId
        }
        return false
      }),
    }
  }, [studentsData, lessonDetails])

  useEffect(() => {
    if (studentsData.length > 0 && lessonDetails?.classId) {
      const filteredStudents = studentsData.filter(
        ({ name, phone, email, enrollCourses }) => {
          if (!enrollCourses?.length) return false

          const sameCourse = enrollCourses.some(
            e => e.course?.id === lessonDetails?.courseId
          )
          const sameClass = enrollCourses.some(enroll =>
            enroll.studentSchedule?.some(
              s => s.class?.id === lessonDetails?.classId
            )
          )

          if (!sameCourse || !sameClass) return false
          if (search === '') return true

          const searching = search?.toString().toLowerCase()
          const sameName = name.toLowerCase().includes(searching)
          const sameEmail = email?.toLowerCase().includes(searching)
          const samePhone = phone?.toLowerCase().includes(searching)
          return sameName || sameEmail || samePhone
        }
      )
      setFixStudentsData(filteredStudents)
    } else {
      setFixStudentsData([])
    }
  }, [studentsData, search, lessonDetails])

  const isDisabled =
    !selectedDocument || !!campaignId || !lessonDetails?.classId

  return (
    <div className="col-span-2 bg-white border border-background-layer-3 rounded-lg p-6">
      <div className="font-semibold text-lg mb-2">Lesson Details</div>
      <div className="grid grid-cols-2 gap-4 w-full mb-4">
        <Select
          value={lessonDetails?.courseId?.toString()}
          onValueChange={value => {
            setLessonDetails?.({
              ...lessonDetails,
              courseId: value ? +value : undefined,
            })
          }}
          disabled={!selectedDocument || !!campaignId}
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course?.id} value={course?.id?.toString()}>
                {course?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={lessonDetails?.classId?.toString()}
          onValueChange={value => {
            setLessonDetails?.({
              ...lessonDetails,
              classId: value ? +value : undefined,
            })
          }}
          disabled={
            !selectedDocument || !!campaignId || !lessonDetails?.courseId
          }
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(classe => (
              <SelectItem key={classe.id} value={classe.id.toString()}>
                {classe.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-lg">
          Student Directory
          {selectedStudents.length > 0 && (
            <span className="text-primary text-sm bg-blue-100 px-2 py-1 rounded-xl ml-3">
              {selectedStudents.length} students
            </span>
          )}
        </div>
        <div className="flex gap-2 text-sm">
          <Button
            onClick={() => {
              setSelectedStudents(studentsData as StudentEnrolmentRecord[])
            }}
            disabled={isDisabled}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedStudents([])}
            disabled={isDisabled}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <Input
          className="w-full pl-10 pr-4 py-2 border rounded-md"
          placeholder="Search students..."
          prefixIcon={<FaSearch className="w-[15px] mb-[2px]" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {/* <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
          </SelectContent>
        </Select> */}
      </div>

      <div className="space-y-2">
        {fixStudentsData.map(student => {
          const checked = isSelected(student)
          return (
            <div
              key={student.email}
              className={[
                'flex items-center gap-3 border px-4 py-3 rounded',
                checked
                  ? 'border-primary-subtle bg-blue-100'
                  : 'border-background-layer-3 hover:bg-gray-50',
              ].join(' ')}
            >
              <Checkbox
                className="bg-white"
                disabled={isDisabled}
                checked={checked}
                onCheckedChange={() => toggleStudent(student)}
              />
              <div
                className={[
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm',
                  checked ? 'bg-primary' : 'bg-gray-200',
                ].join(' ')}
              >
                <FiUser className={checked ? 'text-white' : 'text-gray-500'} />
              </div>
              <div>
                <div className="font-medium text-sm">{student.name}</div>
                <div className="text-gray-500 text-xs flex items-center gap-4">
                  {!!student.phone && (
                    <div className="flex items-center gap-2">
                      <FaPhoneAlt className="text-xs" /> {student.phone}
                    </div>
                  )}
                  {!!student.email && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-xs" /> {student.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CenterCanvas
