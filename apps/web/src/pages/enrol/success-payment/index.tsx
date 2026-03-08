import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic'
import { memo } from 'react'

import { fetchSchoolAndCourse } from '@/api/courseApi'
import { getEnrollStudentLesson, getInvoice } from '@/api/enrolApi'
import { DataErrorMessage } from '@/api/error/errorMessage'
import DynamicEnrollTemplate from '@/page-components/DynamicEnrollTemplate'
import NotFoundPage from '@/pages/404'
import { Course, School, SiteSettings } from '@/types'
import { EnrolCourseResponse, StudentLesson } from '@/types/enrol'
import { InvoiceResponse } from '@/types/receipt'

const DefaultLayout = dynamic(() => import('@/layouts/DefaultLayout'), { ssr: false })
const HeroTemplateLayout = dynamic(() => import('@/layouts/HeroTemplateLayout'), { ssr: false })
const VerticalTemplateLayout = dynamic(() => import('@/layouts/VerticalTemplateLayout'), {
  ssr: false,
})
const SuccessPaymentContent = dynamic(
  () => import('@/page-components/enrol/SuccessPaymentContent'),
  { ssr: false }
)

// This function is duplicate... please deprecate it and copy the content in upload-receipt/index.tsx
export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}: GetServerSidePropsContext) => {
  const { school, course, token, errorMessage } = await fetchSchoolAndCourse(
    req,
    query as Record<string, string>
  )
  if (errorMessage) {
    return {
      props: {
        errorMessage,
      },
    }
  }

  // const enrollmentDetail: EnrolCourseResponse = await getEnrollmentDetailByToken(token)
  const invoice = await getInvoice(token as string)
  if (!invoice?.enrollCourses?.length) {
    return { props: { errorMessage: DataErrorMessage.INVOICE_NOT_FOUND } }
  }
  const studentLessons = await getEnrollStudentLesson(
    invoice?.enrollCourses?.map(enroll => enroll.id.toString()).join(',')
  )

  if (!studentLessons) {
    return { props: { errorMessage: DataErrorMessage.DATA_NOT_FOUND } }
  }

  return {
    props: {
      school,
      course,
      siteSetting: school?.siteSetting,
      studentLessons,
      enrollmentDetails: invoice.enrollCourses,
      invoice,
    },
  }
}

interface SuccessPaymentProps {
  school: School
  course: Course
  siteSetting: SiteSettings
  studentLessons: StudentLesson[]
  enrollmentDetails: EnrolCourseResponse[]
  invoice: InvoiceResponse
  errorMessage?: string
}

const SuccessPayment = memo(function SuccessPayment({
  school,
  course,
  siteSetting,
  studentLessons,
  enrollmentDetails,
  invoice,
  errorMessage,
}: SuccessPaymentProps): JSX.Element {
  return (
    <>
      {errorMessage || !school || !course || !studentLessons || !siteSetting || !invoice ? (
        <NotFoundPage errorMessage={errorMessage} />
      ) : (
        <DynamicEnrollTemplate course={course} school={school}>
          <SuccessPaymentContent
            school={school}
            course={course}
            studentLessons={studentLessons}
            enrollmentDetails={enrollmentDetails}
            siteSetting={siteSetting}
            invoice={invoice}
          />
        </DynamicEnrollTemplate>
      )}
    </>
  )
})

export default SuccessPayment
