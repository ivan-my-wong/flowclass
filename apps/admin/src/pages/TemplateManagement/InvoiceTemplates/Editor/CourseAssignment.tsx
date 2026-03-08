import CourseContainer from '../components/CourseAssigment/Course/CourseContainer'
import { InvoiceEditDialogProvider } from '../components/CourseAssigment/Invoice/EditInvoiceContext'
import InvoiceContainer from '../components/CourseAssigment/Invoice/InvoiceContainer'
import StudentCardontainer from '../components/CourseAssigment/Student/StudentCardontainer'

const CourseAssignment = (): JSX.Element => {
  return (
    <div className="flex flex-col lg:flex-row items-start gap-3 w-full p-4">
      <div className="w-full lg:w-3/12">
        <StudentCardontainer />
      </div>
      <div className="w-full lg:w-6/12">
        <CourseContainer />
      </div>
      <div className="w-full lg:w-3/12">
        <InvoiceEditDialogProvider>
          <InvoiceContainer />
        </InvoiceEditDialogProvider>
      </div>
    </div>
  )
}

export default CourseAssignment
