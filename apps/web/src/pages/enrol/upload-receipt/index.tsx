import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import dynamic from 'next/dynamic'
import { memo } from 'react'

import { fetchSchoolAndCourse } from '@/api/courseApi'
import { getInvoices } from '@/api/enrolApi'
import { DataErrorMessage } from '@/api/error/errorMessage'
import NotFoundPage from '@/pages/404'
import { Course, School } from '@/types'

const DynamicEnrollTemplate = dynamic(() => import('@/page-components/DynamicEnrollTemplate'))
const UploadReceiptContent = dynamic(
  () => import('@/page-components/enrol/PaymentSteps/UploadReceiptContent')
)

interface ServerSideProps {
  school?: School
  course?: Course
  token?: string
  errorMessage?: string | null
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<ServerSideProps>> => {
  const { token: invoiceToken } = query as Record<string, string>
  const { school, course, errorMessage } = await fetchSchoolAndCourse(
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
  if (!invoiceToken) {
    return {
      props: {
        errorMessage: DataErrorMessage.DATA_NOT_FOUND,
      },
    }
  }
  try {
    const invoices = await getInvoices(invoiceToken as string)
    if (!invoices.every(i => i.enrollCourses.length > 0)) {
      return {
        props: {
          errorMessage: DataErrorMessage.DATA_NOT_FOUND,
        },
      }
    }
  } catch {
    return {
      props: {
        errorMessage: DataErrorMessage.DATA_NOT_FOUND,
      },
    }
  }

  return {
    props: {
      school,
      course,
      token: invoiceToken,
    },
  }
}

export interface UploadReceiptProps {
  school?: School
  course?: Course
  token?: string
  errorMessage?: string
}

const areEqual = (prevProps: UploadReceiptProps, nextProps: UploadReceiptProps) =>
  prevProps.token === nextProps.token &&
  prevProps.course?.id === nextProps.course?.id &&
  prevProps.school?.id === nextProps.school?.id

const UploadReceipt = memo(
  ({ school, course, token, errorMessage }: UploadReceiptProps): JSX.Element => {
    return (
      <>
        {errorMessage || !school || !course || !token ? (
          <NotFoundPage errorMessage={errorMessage} />
        ) : (
          <DynamicEnrollTemplate course={course} school={school}>
            <UploadReceiptContent school={school} course={course} token={token} />
          </DynamicEnrollTemplate>
        )}
      </>
    )
  },
  areEqual
)

UploadReceipt.displayName = 'UploadReceipt'

export default UploadReceipt
