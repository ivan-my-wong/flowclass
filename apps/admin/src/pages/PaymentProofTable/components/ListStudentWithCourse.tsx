import { useMemo } from 'react'

import { Badge } from '@/components/ui/Badge'
import { StudentWithEnrollInfo } from '@/types/enrollCourse'

const ListStudentWithCourse = ({
  students,
}: {
  students: StudentWithEnrollInfo[]
}): JSX.Element => {
  const groupedStudents = useMemo(() => {
    const uniqueStudents = new Map()
    students.forEach(student => {
      if (!uniqueStudents.has(student.id)) {
        uniqueStudents.set(student.id, student.name)
      }
    })
    return Array.from(uniqueStudents.values())
  }, [students])

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {groupedStudents.map(student => (
        <Badge key={student} variant="default">
          <span>{student}</span>
        </Badge>
      ))}
    </div>
  )
}

export default ListStudentWithCourse
