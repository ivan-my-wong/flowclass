import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { studentCrmCsvHeaders } from '@/constants/exportCSVPrefix'
import { PaymentState } from '@/constants/payment'
import { PaymentEvidence, StudentFormListResponse } from '@/types/enrollCourse'
import { StudentEnrolmentRecord } from '@/types/student'
import { formatPhoneNumber } from '@/utils/misc'
import { extractFieldId } from '@/utils/string'

import {
  EnrollCourseItemForExport,
  formatCsvData,
} from '../../PaymentProofTable/tableFormatter'

// Props for the new component
type ExportCsvButtonProps = {
  data: StudentEnrolmentRecord[]

  timeZoneId: string
  paymentEvidenceList?: PaymentEvidence[]
}

const ExportCsvButton = ({
  data,
  timeZoneId,
  paymentEvidenceList = [],
}: ExportCsvButtonProps): React.ReactElement => {
  const { t } = useTranslation()

  // 1. Derive fieldsHeaders (for custom fields)
  const allCustomFields = new Map<string, string>()

  data.forEach(student => {
    if (student.studentForms && student.studentForms.length > 0) {
      student.studentForms.forEach((sf: StudentFormListResponse) => {
        const fieldIdStr = extractFieldId(sf.formFieldId)
        const fieldQuestionStr = String(sf.formFieldQuestion)
        if (
          sf.formFieldId &&
          sf.formFieldQuestion &&
          !allCustomFields.has(fieldIdStr)
        ) {
          allCustomFields.set(fieldIdStr, fieldQuestionStr)
        }
      })
    }
  })

  const fieldsHeaders = Array.from(allCustomFields, ([key, label]) => ({
    key,
    label,
  }))

  // 2. Transform data for formatCsvData
  const inputToFormatCsv = data.map(student => {
    const firstEnrollment = student.enrollCourses?.[0]
    // Support both invoice (new) and invoices (old) for backward compatibility
    const firstInvoice =
      firstEnrollment?.invoice ?? firstEnrollment?.invoices?.[0]

    // Calculate new columns
    let totalApplicationNum = 0
    let totalRevenueNum = 0
    let totalPaidRevenueNum = 0

    student.enrollCourses?.forEach(ec => {
      // Support both invoice (new) and invoices (old) for backward compatibility
      const invoices = ec.invoice ? [ec.invoice] : ec.invoices || []
      invoices.forEach(invoice => {
        totalApplicationNum += 1
        const tuitionAmount = invoice.payAmount
          ? parseFloat(invoice.payAmount.toString())
          : 0 // Assuming payAmount is the tuition
        totalRevenueNum += tuitionAmount
        if (invoice.paymentState === PaymentState.PAID) {
          totalPaidRevenueNum += tuitionAmount
        }
      })
    })

    // 3. Make sure the course name and class name are correct
    let mappedEnrollCourses: EnrollCourseItemForExport[] = []

    if (student && student.enrollCourses) {
      mappedEnrollCourses = student.enrollCourses
        ?.map(ec => {
          // Support both invoice (new) and invoices (old) for backward compatibility
          const firstInvoiceOfEnrollCourse = ec.invoice ?? ec.invoices?.[0]

          if (
            !ec.course ||
            !ec.studentSchedule ||
            !firstInvoiceOfEnrollCourse
          ) {
            return null
          }

          const sortedStudentSchedules = ec.studentSchedule
            ? [...ec.studentSchedule].sort((a, b) => {
                const dateA = new Date(a.id)
                const dateB = new Date(b.id)

                if (
                  Number.isNaN(dateA.getTime()) ||
                  Number.isNaN(dateB.getTime())
                ) {
                  return 0
                }

                return dateB.getTime() - dateA.getTime()
              })
            : []

          const firstSortedStudentSchedule = sortedStudentSchedules[0]

          if (!firstSortedStudentSchedule) {
            return null
          }

          const lastAttendanceDateObject = [
            ...(firstSortedStudentSchedule?.studentLessons ?? []),
          ].sort((a, b) => {
            const dateA = new Date(a.endTime)
            const dateB = new Date(b.changeEndTime || b.endTime)

            if (
              Number.isNaN(dateA.getTime()) ||
              Number.isNaN(dateB.getTime())
            ) {
              return 0
            }

            return dateB.getTime() - dateA.getTime()
          })[0]

          let lastAttendanceDate = ''

          if (lastAttendanceDateObject) {
            lastAttendanceDate = lastAttendanceDateObject.endTime
          }

          return {
            courseName: ec.course?.name,
            className: firstSortedStudentSchedule.class?.name,
            createdAt: firstInvoiceOfEnrollCourse?.createdAt,
            currency: firstInvoiceOfEnrollCourse?.currency,
            paymentAmount: firstInvoiceOfEnrollCourse?.payAmount,
            paymentState: firstInvoiceOfEnrollCourse?.paymentState,
            lastAttendanceDate,
          }
        })
        .filter(Boolean) as EnrollCourseItemForExport[]
    }

    // Prepare extra info for remainingEnrollCourse

    return {
      // Fields that formatCsvData expects at the root of its input objects ('obj')
      id: student.id, // Convert student ID to string
      updatedAt: student.updatedAt,
      paymentState: firstInvoice?.paymentState,
      payAmount: firstInvoice?.payAmount,
      // paymentMethod: firstEnrollment?.paymentMethod, // Source if available, e.g. from student or firstEnrollment
      currency: firstInvoice?.currency ?? '', // Source if available
      // promotionUsed: firstEnrollment?.promotionUsed, // Source if available

      name: student.name,
      email: student.email,
      phone: formatPhoneNumber(student.phone),

      // studentSchedule for formatCsvData to derive enrollDate (it checks obj.studentSchedule)
      studentSchedule: firstEnrollment?.studentSchedule ?? [],

      // enrollCourse object structured as formatCsvData expects
      enrollCourse: firstEnrollment
        ? {
            ...(firstEnrollment as any),
            name: student.name,
            phone: formatPhoneNumber(student.phone),
            email: student.email,
          }
        : null,

      enrollCourseMetadata:
        mappedEnrollCourses.length > 0
          ? {
              courseName: mappedEnrollCourses[0]?.courseName,
              className: mappedEnrollCourses[0]?.className,
              paymentAmount: mappedEnrollCourses[0]?.paymentAmount,
              createdAt: mappedEnrollCourses[0]?.createdAt,
              currency: mappedEnrollCourses[0]?.currency,
              paymentState: mappedEnrollCourses[0]?.paymentState,
              lastAttendanceDate: mappedEnrollCourses[0]?.lastAttendanceDate,
            }
          : undefined,

      remainingEnrollCourse:
        mappedEnrollCourses.length > 1 ? mappedEnrollCourses.slice(1) : [], // now with courseName and className

      // statistics
      statistics: {
        totalApplicationNum,
        totalRevenueNum,
        totalPaidRevenueNum,
      },
    }
  })

  // 3. Call formatCsvData
  const csvFormattedData = formatCsvData(
    inputToFormatCsv,
    paymentEvidenceList, // Pass the prop
    fieldsHeaders, // Pass the derived custom field headers
    timeZoneId
  )

  const todayISO = new Date().toISOString().split('T')[0] // More filename-friendly date

  const csvHeaders = studentCrmCsvHeaders.map(d => ({
    ...d,
    label: d.key === 'id' ? d.label : t(d.label),
  }))

  return (
    <CSVLink
      headers={[...csvHeaders, ...fieldsHeaders]} // Combined headers
      data={csvFormattedData} // Data processed by formatCsvData
      filename={`${
        t('teachingService:allCourses') as string
      }_students_export_${todayISO}.csv`}
      target="_blank"
      style={{
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      <Button variant="primary-outline">{t('student:exportCSV.title')}</Button>
    </CSVLink>
  )
}

export default ExportCsvButton
