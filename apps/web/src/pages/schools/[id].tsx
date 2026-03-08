import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

import { getCourses } from '@/api/courseApi'
import { getSchoolByUrl } from '@/api/schoolApi'
import { getSiteByDomain } from '@/api/siteApi'
import SchoolDetail, { type SchoolDetailProps } from '@/page-components/schools/SchoolDetail'
import { getDomainFromReq } from '@/utils/sanitize'

const getSchoolDetailProps = async (
  domain: string,
  schoolUrl: string
): Promise<SchoolDetailProps | null> => {
  const props = {} as SchoolDetailProps

  const school = await getSchoolByUrl(domain, schoolUrl)

  if (!school) {
    return null
  }

  props.school = school

  const schoolId = props.school.id

  const courseList = await getCourses(schoolId)
  // const commentList = await getCourseComments(schoolId)

  props.courses = courseList?.content || []
  // props.schoolComments = commentList?.content || []

  return props
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  let schoolUrl = params?.id as string
  const domain = await getDomainFromReq(req)

  if (!domain) {
    return {
      notFound: true,
    }
  }

  if (!schoolUrl) {
    schoolUrl = ''
  }

  let props = {} as SchoolDetailProps
  const site = await getSiteByDomain(domain)
  if (!site) {
    return {
      notFound: true,
    }
  }

  props.site = site

  const newProps = await getSchoolDetailProps(domain, schoolUrl)
  if (!props || !newProps) {
    return {
      notFound: true,
    }
  }

  props = { ...props, ...newProps }
  return {
    props,
  }
}

// const tabs = ['basicInfo', 'courses', 'gallery']
// const templateTabs = ['basicInfo', 'courses']

const SchoolDetailPage = (props: SchoolDetailProps): JSX.Element => {
  return <SchoolDetail {...props} />
}

export default SchoolDetailPage
