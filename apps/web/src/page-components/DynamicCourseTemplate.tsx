import dynamic from 'next/dynamic'

import { CourseStateProvider } from '@/hooks/useCourse'
import { useGlobalTimezone } from '@/hooks/useGlobalTimezone'
import { Course } from '@/types/course'
import { PageType } from '@/types/embed-component'
import { School } from '@/types/school'
import { Site } from '@/types/site'
import { WebsiteTemplate } from '@/types/websiteTemplate'

import { errorHandlerOptions } from './ErrorHandlerOptions'

const HeroCoursePage = dynamic(() => import('@/layouts/HeroTemplateLayout/HeroCoursePage'), {
  ssr: false,
  ...errorHandlerOptions,
})
const MinimalCoursePage = dynamic(
  () => import('@/layouts/MinimalTemplateLayout/MinimalCoursePage'),
  {
    ssr: false,
    ...errorHandlerOptions,
  }
)
const VerticalTemplateLayout = dynamic(() => import('@/layouts/VerticalTemplateLayout'), {
  ssr: false,
  ...errorHandlerOptions,
})
const HeroTemplateLayout = dynamic(() => import('@/layouts/HeroTemplateLayout'), {
  ssr: false,
  ...errorHandlerOptions,
})
const BareboneTemplateCoursePage = dynamic(
  () => import('@/layouts/BareboneTemplateLayout/BareboneCoursePage'),
  {
    ssr: false,
    ...errorHandlerOptions,
  }
)
const CourseTemplatePage = dynamic(
  () => import('@/layouts/VerticalTemplateLayout/VerticalCoursePage'),
  {
    ssr: false,
    ...errorHandlerOptions,
  }
)
const CourseHeadElement = dynamic(() => import('@/page-components/courses/CourseHeadElement'), {
  ssr: false,
  ...errorHandlerOptions,
})

type DynamicTemplateProps = {
  course: Course
  school: School
  site: Site
  store: {
    school: School
    course: Course
    site: Site
  }
  templateTabs: string[]
  heroTemplateTabs: string[]
}

const DynamicCourseTemplate = ({
  course,
  school,
  store,
  site,
  templateTabs,
  heroTemplateTabs,
}: DynamicTemplateProps): JSX.Element => {
  useGlobalTimezone(course?.site)

  let template = school.institutionSetting?.templates

  if (!template) {
    template = WebsiteTemplate.Hero
  }

  const templateComponents = {
    [WebsiteTemplate.Minimal]: MinimalCoursePage,
    [WebsiteTemplate.Barebone]: BareboneTemplateCoursePage,
  } as const

  const withTabs = {
    [WebsiteTemplate.Vertical]: (
      <VerticalTemplateLayout course={course} school={school} site={site} tabs={templateTabs}>
        <div className="h-full w-full ">
          <CourseTemplatePage course={course} school={school} />
        </div>
      </VerticalTemplateLayout>
    ),
    [WebsiteTemplate.Hero]: (
      <HeroTemplateLayout
        school={school}
        site={course.site}
        course={course}
        tabs={heroTemplateTabs}
        pageType={PageType.COURSE}
      >
        <div className="h-full w-full" id="courses">
          <HeroCoursePage course={course} school={school} />
        </div>
      </HeroTemplateLayout>
    ),
  } as const

  const TemplateComponent = templateComponents[template as keyof typeof templateComponents] ?? null

  const TemplateComponentWithTabs =
    withTabs[template as keyof typeof withTabs] ?? withTabs[WebsiteTemplate.Hero]

  const isUseTemplateComponentWithTabs =
    school.institutionSetting?.templates &&
    Object.hasOwn(withTabs, school.institutionSetting.templates)

  return (
    <CourseStateProvider value={store}>
      <CourseHeadElement course={course} school={school} />
      {TemplateComponent && <TemplateComponent course={course} school={school} />}
      {isUseTemplateComponentWithTabs && TemplateComponentWithTabs}
    </CourseStateProvider>
  )
}
DynamicCourseTemplate.displayName = 'DynamicCourseTemplate'
export default DynamicCourseTemplate
