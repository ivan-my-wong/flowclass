import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next'
import { useMemo } from 'react'

import useResponsive from '@/hooks/useResponsive'
import CourseTemplateCard from '@/page-components/schools/template/CourseTemplateCard'
import { Course } from '@/types'
import { EmbeddedComponentParams } from '@/types/embed-component'
import { CustomPathProps, getPathRelatedData } from '@/utils/domain'
import { setResponsiveWidth } from '@/utils/style'

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const props = (await getPathRelatedData(context)) as { props: CustomPathProps }
  const { query } = context
  const otherParams = query as EmbeddedComponentParams

  return {
    props: {
      courses: props.props.courseProps.courses as Course[],
      ...otherParams,
      ...props.props,
    },
  }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const CourseList: NextPage<PageProps> = ({ courses, siteProps, schoolProps, height, width }) => {
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
    <div className={'flex w-full !p-3 md:flex-row'} style={otherStyles}>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(courses || [])?.map((course, index) => {
          return (
            <CourseTemplateCard
              id={`course-card-${index}`}
              key={course.name}
              course={course}
              site={siteProps.site}
              baseUrl={`/@${schoolProps.school.url ?? ''}`}
              className={setResponsiveWidth(isTablet, isMobile)}
              fullWidth={isMobile}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CourseList
