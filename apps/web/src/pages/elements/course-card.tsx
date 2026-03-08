import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next'
import { useMemo } from 'react'

import { getCourseByUrl } from '@/api/courseApi'
import useResponsive from '@/hooks/useResponsive'
import CourseTemplateCard from '@/page-components/schools/template/CourseTemplateCard'
import { EmbeddedCourseCardComponentParams } from '@/types/embed-component'
import { CustomPathProps, getPathRelatedData } from '@/utils/domain'
import { setResponsiveWidth } from '@/utils/style'

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const props = (await getPathRelatedData(context)) as { props: CustomPathProps }
  const { query } = context
  const { coursePath, ...otherParams } = query as EmbeddedCourseCardComponentParams
  // Change this afterwards. Now it's hard coding the schol ID.
  const course = await getCourseByUrl({
    domain: props.props.siteProps.domain,
    schoolUrl: '',
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
      ...otherParams,
      ...props.props,
    },
  }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const CourseCard: NextPage<PageProps> = ({ course, siteProps, schoolProps, height, width }) => {
  const { isMobile, isTablet } = useResponsive()

  const otherStyles = useMemo(() => {
    if (height && width) {
      return { width: `${width}px`, height: `${height}px` }
    }
    return {
      width: `100%`,
    }
  }, [width, height])

  return (
    <div style={otherStyles} className="p-3">
      <CourseTemplateCard
        course={course}
        site={siteProps.site}
        baseUrl={`/@${schoolProps.school.url ?? ''}`}
        className={setResponsiveWidth(isTablet, isMobile)}
        fullWidth={isMobile}
      />
    </div>
  )
}

export default CourseCard
