import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { useEffect } from 'react'

import { useSetRecoilState } from 'recoil'

import { DataErrorMessage } from '@/api/error/errorMessage'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { Course, Site } from '@/types'
import { School } from '@/types/school'
import { WebsiteTemplate } from '@/types/websiteTemplate'
import { CustomPathProps, getPathRelatedData } from '@/utils/domain'

import NotFoundPage from '../404'
import CourseDetail from '../courses/[id]'
import SchoolDetail from '../schools/[id]'

interface PathData {
  props: {
    siteProps?: {
      site?: Site
    }
    schoolProps?: {
      school?: School
    }
    courseProps?: {
      course?: Course
    }
  }
}
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { props } = (await getPathRelatedData(context)) as PathData
  const { schoolProps, siteProps, courseProps } = props ?? {}

  if (!schoolProps || !siteProps || !courseProps) {
    return {
      props: {
        errorMessage: DataErrorMessage.DATA_NOT_FOUND,
      },
    }
  }
  return {
    props,
  }
}

const CustomPath = ({
  siteProps,
  schoolProps,
  courseProps,
  errorMessage,
  pathType,
}: CustomPathProps): JSX.Element => {
  const setCurrentTheme = useSetRecoilState(currentWebsiteTheme)
  useEffect(() => {
    setCurrentTheme(schoolProps?.school?.institutionSetting?.templates ?? WebsiteTemplate.Hero)
  }, [schoolProps, setCurrentTheme])
  if (errorMessage) {
    return <NotFoundPage errorMessage={errorMessage} />
  }

  const { site } = siteProps
  const { school } = schoolProps
  const { courses = [] } = courseProps
  const { course } = courseProps

  return (
    <>
      {pathType === 'school' && (
        <SchoolDetail domain={site.url} school={school} courses={courses} site={site} />
      )}
      {pathType === 'course' && <CourseDetail school={school} course={course} />}
    </>
  )
}

export default CustomPath
