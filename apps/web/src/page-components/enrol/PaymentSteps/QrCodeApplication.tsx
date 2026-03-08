import ApplicationQrCode from '@/page-components/enrol/CourseInformationComponents/ApplicationQrCode'
import { CustomDataFieldColumnMapping, StudentLesson } from '@/types/enrol'
import { InvoiceResponse, PartialUser } from '@/types/receipt'

type PropType = {
  invoice: InvoiceResponse
  studentLessons: StudentLesson[]
}
const QrCodeApplication = ({ invoice, studentLessons }: PropType): React.ReactElement => {
  const enrollCourse = invoice.enrollCourses.at(0)

  if (!enrollCourse) return <></>

  if (invoice.applicants && invoice.applicants.length > 0) {
    return (
      <div className="box-responsive">
        {invoice.applicants.map((applicant: PartialUser, index) => {
          const registrationForm = enrollCourse?.registrationForm
          const names = registrationForm
            ?.filter(
              field => field.isDefault && field.columnMapping === CustomDataFieldColumnMapping.NAME
            )
            ?.map(field => field.value)

          return (
            <ApplicationQrCode
              key={applicant.id}
              invoice={invoice}
              studentLessons={studentLessons}
              enrollmentDetail={enrollCourse}
              applicantId={applicant.id}
              applicantName={names?.[index]}
            />
          )
        })}
      </div>
    )
  }

  return (
    <ApplicationQrCode
      invoice={invoice}
      studentLessons={studentLessons}
      enrollmentDetail={enrollCourse}
      applicantId={invoice.userId}
    />
  )
}
export default QrCodeApplication
