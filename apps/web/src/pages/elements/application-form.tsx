import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next'
import { useMemo } from 'react'

import { getCourseByUrl } from '@/api/courseApi'
import { getSchoolByUrl } from '@/api/schoolApi'
import EnrollementSteps from '@/page-components/enrol/FullApplicationSteps'
import { EnrolStateProvider } from '@/stores/enrolContext'
import { School } from '@/types'
import { EmbeddedApplicationFormComponentParams } from '@/types/embed-component'
import { CustomPathProps, exportDomain, getPathRelatedData } from '@/utils/domain'

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const props = (await getPathRelatedData(context)) as { props: CustomPathProps }
  const { query } = context
  const { coursePath, schoolPath, ...otherParams } = query as EmbeddedApplicationFormComponentParams

  const domain = props.props.siteProps.domain
  const school: School = await getSchoolByUrl(domain, schoolPath ?? '')

  if (!school) {
    throw new Error('Invalid school')
  }

  const course = await getCourseByUrl({
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
      course,
      siteSettings: school.siteSetting,
      ...otherParams,
      ...props.props,
    },
  }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const ApplicationForm: NextPage<PageProps> = ({
  course,
  schoolProps,
  siteSettings,
  height,
  width,
}) => {
  const otherStyles = useMemo(() => {
    if (height && width) {
      return { width: `${width}px`, height: `${height}px` }
    }
    return {
      width: `100%`,
    }
  }, [width, height])

  const domain = exportDomain(course.site.customDomain, course.site?.url)
  const originalUrl = `https://${domain}/@${schoolProps.school.url ?? ''}/${course.path}`

  const store = {
    school: schoolProps.school,
    course,
    siteSetting: siteSettings,
    originalUrl,
  }

  return (
    <div style={otherStyles} className="p-3">
      <EnrolStateProvider value={store}>
        <EnrollementSteps school={schoolProps.school} course={course} />
      </EnrolStateProvider>
    </div>
  )
}

export default ApplicationForm
