import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { studentCrmCsvHeaders } from '@/constants/exportCSVPrefix'
import { PaymentState } from '@/constants/payment'
import useEnrollmentFormData from '@/hooks/useEnrollmentFormData'
import { InformationFieldTypes } from '@/types/applicationForm'
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

  // 1. Derive fieldsHeaders from enrollment form field definitions
  //    (same source as the table's customFieldColumns)
  const { useFetchListEnrollmentFormFields } = useEnrollmentFormData()
  const { data: fieldsCustom } = useFetchListEnrollmentFormFields()

  const fieldsHeaders = (fieldsCustom || [])
    .filter((field: InformationFieldTypes) => !field.isDefault && field.id)
    .map((field: InformationFieldTypes) => ({
      key: `custom_${field.id}`,
      label: field.question,
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
            const dateA = new Date(a.changeEndTime || a.endTime)
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
            lastAttendanceDate =
              lastAttendanceDateObject.changeEndTime ||
              lastAttendanceDateObject.endTime
          }

          return {
            courseName: ec.course?.name,
            className: firstSortedStudentSchedule.class?.name,
            createdAt: firstInvoiceOfEnrollCourse?.createdAt,
            currency: firstInvoiceOfEnrollCourse?.currency,
            paymentAmount: firstInvoiceOfEnrollCourse?.payAmount,
            paymentState: firstInvoiceOfEnrollCourse?.paymentState,
            lastAttendanceDate,
            paymentDate: firstInvoiceOfEnrollCourse?.paymentDate,
          }
        })
        .filter(Boolean) as EnrollCourseItemForExport[]
    }

    const enrollCourseBase = firstEnrollment
      ? {
          ...(firstEnrollment as any),
          name: student.name,
          phone: formatPhoneNumber(student.phone),
          email: student.email,
        }
      : null

    return {
      // Fields that formatCsvData expects at the root of its input objects ('obj')
      id: student.id,
      updatedAt: student.updatedAt,
      paymentState: firstInvoice?.paymentState,
      payAmount: firstInvoice?.payAmount,
      currency: firstInvoice?.currency ?? '',
      paymentDate: firstInvoice?.paymentDate,

      name: student.name,
      email: student.email,
      phone: formatPhoneNumber(student.phone),

      studentSchedule: firstEnrollment?.studentSchedule ?? [],

      enrollCourse: enrollCourseBase,

      enrollCourses: enrollCourseBase ? [enrollCourseBase] : [],

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
              paymentDate: mappedEnrollCourses[0]?.paymentDate,
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

  // 3. Call formatCsvData (pass empty customFieldsHeader — studentForms are
  //    a different data source than registrationForm, so we populate them below)
  const csvFormattedData = formatCsvData(
    inputToFormatCsv,
    paymentEvidenceList,
    [], // skip registrationForm-based custom fields
    timeZoneId
  )

  // 4. Populate studentForms custom field values directly into CSV rows
  //    Mirrors the table's cell renderer: extractFieldId(f.formFieldId) === fieldId
  let csvRowIndex = 0
  data.forEach(student => {
    if (csvRowIndex >= csvFormattedData.length) return
    const csvRow = csvFormattedData[csvRowIndex]
    csvRowIndex += 1

    fieldsHeaders.forEach(header => {
      // header.key is 'custom_123', extract the numeric fieldId
      const fieldId = header.key.replace('custom_', '')
      const form = student.studentForms?.find(
        (sf: StudentFormListResponse) =>
          extractFieldId(sf.formFieldId) === fieldId
      )
      csvRow[header.key] = form?.formFieldValue?.toString() ?? ''
    })

    // Skip extra rows added for remainingEnrollCourse
    const remainingCount = student.enrollCourses
      ? student.enrollCourses.length - 1
      : 0
    if (remainingCount > 0) {
      csvRowIndex += remainingCount
    }
  })

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
