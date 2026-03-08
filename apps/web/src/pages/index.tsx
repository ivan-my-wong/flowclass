import { GetServerSideProps } from 'next'

import { SiteErrorMessage } from '@/api/error/errorMessage'
import SchoolDetail from '@/page-components/schools/SchoolDetail'
import { CustomPathProps, getPathRelatedData } from '@/utils/domain'

import NotFoundPage from './404'

export const getServerSideProps: GetServerSideProps = async context => {
  const props = await getPathRelatedData(context)

  return props
}

const CustomPath = ({ siteProps, schoolProps, courseProps }: CustomPathProps): JSX.Element => {
  if (!siteProps || !schoolProps) {
    return <NotFoundPage errorMessage={SiteErrorMessage.SITE_NOT_FOUND} />
  }

  const { site } = siteProps
  const { school } = schoolProps
  const { courses = [] } = courseProps
  return <SchoolDetail domain={site.url} school={school} courses={courses} site={site} />
}

export default CustomPath
