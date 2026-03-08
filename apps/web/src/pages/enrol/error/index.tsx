import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic'

import { LucideAlertTriangle } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import { getCourseByUrl } from '@/api/courseApi'
import { getSchoolByUrl } from '@/api/schoolApi'
import { Course, School, SiteSettings } from '@/types'
import { validateDomain } from '@/utils/validate'

const Button = dynamic(() => import('@/components/Buttons/Button'), { ssr: false })
const SchoolLayout = dynamic(() => import('@/layouts/MinimalTemplateLayout'), { ssr: false })
export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}: GetServerSidePropsContext) => {
  const { school: schoolPath, course: coursePath } = query as Record<string, string>
  const domain = req.headers.host || (req.headers[':authority'] as string)

  if (!domain || !validateDomain(domain) || !coursePath || coursePath === '') {
    return {
      notFound: true,
    }
  }

  const school: School = await getSchoolByUrl(domain, schoolPath)

  if (!school) {
    return {
      notFound: true,
    }
  }

  const course: Course = await getCourseByUrl({
    domain,
    schoolUrl: schoolPath,
    courseUrl: coursePath,
  })

  if (!course) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      school,
      course,
      siteSetting: school.siteSetting,
    },
  }
}

interface PaymentErrorProps {
  school: School
  course: Course
  siteSetting: SiteSettings
}

const PaymentError = ({ school, course, siteSetting }: PaymentErrorProps): JSX.Element => {
  const { t } = useTranslation()

  return (
    <SchoolLayout tabs={[]}>
      <div className="box-col items-center justify-center">
        <div className="box-col mt-4 items-center justify-center p-0 lg:pb-8">
          <div className="box-col">
            <div className="box-row p-4 text-xl font-bold">
              <LucideAlertTriangle className="text-warn" />
              <h4>{t('errors:PAYMENT.paymentFailed')}</h4>
            </div>

            <div className="p-4 ">{t('errors:PAYMENT.message')}</div>
            <div className=" justify-center p-4">
              <Button style={{ width: 'fit-content' }}>{t('errors:PAYMENT.back')}</Button>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  )
}

export default PaymentError
