import { useEffect } from 'react'

import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

import DynamicCourseTemplate from '@/page-components/DynamicCourseTemplate'
import { useSchoolContext } from '@/stores/schoolContext'
// import Heading from '@/components/Texts/Heading'
import { CourseDetailProps } from '@/types/index'
import { heroTemplateTabs, templateTabs } from '@/types/websiteTemplate'
import { getCourseDetailProps } from '@/utils/course-page.utils'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  const courseUrl = params?.id as string
  const domain = req.headers.host as string
  if (!courseUrl) {
    return {
      notFound: true,
    }
  }

  const props = await getCourseDetailProps({ domain, courseUrl })
  if (!props) {
    return {
      notFound: true,
    }
  }

  return {
    props,
    revalidate: 10, // In seconds
  }
}

const CourseDetail = ({ course, school }: CourseDetailProps): JSX.Element => {
  const webpageSettings = school.institutionSetting
  const { setSchoolContext } = useSchoolContext()
  const site = course.site

  const store = {
    school,
    course,
    site,
  }

  useEffect(() => {
    setSchoolContext({
      school,
      webpageSettings,
      site,
    })
  }, [])

  return (
    <DynamicCourseTemplate
      course={course}
      school={school}
      store={store}
      site={site}
      templateTabs={templateTabs}
      heroTemplateTabs={heroTemplateTabs}
    />
  )
}

export default CourseDetail
