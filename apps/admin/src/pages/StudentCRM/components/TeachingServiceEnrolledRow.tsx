import { useMemo, useState } from 'react'

import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import CollapsibleWrapper from '@/components/Accordions/Collapsible'
import Box from '@/components/Containers/Box'
import Text from '@/components/Texts/Text'
import { Badge } from '@/components/ui/Badge'
import { PaymentState } from '@/constants/payment'
import {
  SingleStudentCrmRecordEnrolledClassesInvoice,
  SingleStudentCrmRecordEnrolledClassesStudentSchedule,
  StudentEnrolmentRecord,
} from '@/types/student'
import { getCourseIcon } from '@/utils/options'

import WhatsappButton from './WhatsappButton'

export const handleStatusPayment = (status: string, t: TFunction) => {
  switch (status) {
    case PaymentState.PAID:
      return <Badge variant="success">{t('student:statusPaid')}</Badge>
    case PaymentState.PARTIALLY_PAID:
      return (
        <Badge variant="secondary">{t('student:statusPartiallyPaid')}</Badge>
      )
    case PaymentState.PENDING:
      return <Badge variant="light">{t('student:statusUnPaid')}</Badge>
    case PaymentState.SUBMITTED:
      return (
        <Badge variant="secondary">
          {t('teachingService:paymentStatus.submitted')}
        </Badge>
      )
    // case PaymentState.CRITICAL:
    //   return (
    //     <Badge variant="warning">
    //       {t('teachingService:paymentStatus.critical')}
    //     </Badge>
    //   )

    default:
      return (
        <Badge variant="light">
          {t('teachingService:paymentStatus.pending')}
        </Badge>
      )
  }
}

type GroupedClassLesson = {
  course: {
    id: number
    name: string
    path: string
  }
  studentSchedule?: SingleStudentCrmRecordEnrolledClassesStudentSchedule
  enrolId: string | undefined
  className: string
  classType: string
  invoices: SingleStudentCrmRecordEnrolledClassesInvoice[]
  // students: StudentLesson[]
}

const TeachingServiceEnrolledColumn = ({
  enrolledStudent,
}: {
  enrolledStudent: StudentEnrolmentRecord
}): JSX.Element => {
  const { t } = useTranslation()
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)

  const allRows = useMemo(() => {
    const studentLessons =
      enrolledStudent?.enrollCourses
        ?.filter(ec => !ec.isPaused)
        ?.map(enrollCourse => {
          // Support both invoice (new) and invoices (old) for backward compatibility
          const invoices = enrollCourse.invoice
            ? [enrollCourse.invoice]
            : enrollCourse.invoices || []
          return {
            ...enrollCourse,
            studentSchedule: enrollCourse.studentSchedule,
            invoices,
          }
        }) || []

    // studentLessons grouped by enrollCourseId
    const groupedData = studentLessons.reduce(
      (acc: Record<string, GroupedClassLesson>, item) => {
        if (!item.studentSchedule || !item.studentSchedule[0]) return acc
        const class_ = item.studentSchedule[0].class

        if (!class_) return acc
        const enrollCourseId = item.id?.toString()
        const className = class_?.name
        const classType = class_?.type

        if (!enrollCourseId) return acc

        // Each enrollCourse gets its own entry
        acc[enrollCourseId] = {
          course: item.course,
          studentSchedule: item.studentSchedule[0],
          enrolId: item.id?.toString(),
          className,
          classType,
          invoices: item.invoices,
        }

        return acc
      },
      {}
    )

    return (Object.entries(groupedData) || [])?.map(
      ([
        enrollCourseId,
        { course, classType, enrolId, className, invoices },
      ]) => {
        const lastInvoice = invoices?.[invoices.length - 1]
        return (
          <Box css={{ padding: '2px' }} key={enrollCourseId}>
            <Box align="center" justify="flex-start">
              <WhatsappButton
                phone={enrolledStudent.phone}
                params={{
                  course: (course?.path || '').split(' ').join('-'),
                  enrolId: `${enrolId}`,
                  token: lastInvoice?.proofToken,
                }}
                type="payment"
              />
              {handleStatusPayment(lastInvoice?.paymentState || '', t)}
              {getCourseIcon(classType)}
              <Text bold>{course?.name}</Text>
              <Text>{className}</Text>
            </Box>
          </Box>
        )
      }
    )
  }, [enrolledStudent, t])

  if (allRows && allRows.length > 3) {
    return (
      <CollapsibleWrapper
        title={`${t('student:teachingService.clickToViewAll')} ${
          allRows.length
        } ${t('student:column.teachingServiceEnrolled')}`}
        visibleChildren={allRows.slice(0, 3)}
        hiddenChildren={allRows.slice(3)}
        setCollapsibleOpen={setIsCollapsibleOpen}
        collapsibleOpen={isCollapsibleOpen}
      />
    )
  }

  return (
    <Box direction="column" gap="none">
      {allRows}
    </Box>
  )
}
export default TeachingServiceEnrolledColumn
