import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'

import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import { useGlobalTimezone } from '@/hooks/useGlobalTimezone'
import { useSchoolContext } from '@/stores/schoolContext'
import { useTabContext } from '@/stores/tabContext'
import { Course, CourseComment, School, Site, SiteSettings } from '@/types'
import { PageType } from '@/types/embed-component'
import { heroTemplateTabs, tabs, templateTabs, WebsiteTemplate } from '@/types/websiteTemplate'

const SchoolHead = dynamic(() => import('@/page-components/schools/SchoolHeadElement'))
const VerticalBasicInfoTemplateTab = dynamic(
  () => import('@/page-components/schools/template/VerticalBasicInfoTemplateTab')
)
const BareboneTemplateLayout = dynamic(() => import('@/layouts/BareboneTemplateLayout'), {
  ssr: false,
})
const CourseTemplateTab = dynamic(
  () => import('@/page-components/schools/template/CourseTemplateTab')
)

const HeroTemplateLayout = dynamic(() => import('@/layouts/HeroTemplateLayout'), { ssr: false })
const MinimalTemplateLayout = dynamic(() => import('@/layouts/MinimalTemplateLayout'), {
  ssr: false,
})
const VerticalTemplateLayout = dynamic(() => import('@/layouts/VerticalTemplateLayout'), {
  ssr: false,
})
const MinimalBasicInfoTemplateTab = dynamic(
  () => import('@/page-components/schools/minimalTemplate/MinimalBasicInfoTemplateTab')
)
const MinimalCourseTemplateTab = dynamic(
  () => import('@/page-components/schools/minimalTemplate/MinimalCourseTemplateTab')
)
const HeroCalendarTab = dynamic(
  () => import('@/page-components/schools/heroTemplate/HeroCalendarTab')
)
const HeroContactTab = dynamic(
  () => import('@/page-components/schools/heroTemplate/HeroContactTab')
)
const HeroCourseTab = dynamic(() => import('@/page-components/schools/heroTemplate/HeroCourseTab'))
const HomeTab = dynamic(() => import('@/page-components/schools/heroTemplate/HomeTab'))
const MediaTab = dynamic(() => import('@/page-components/schools/MediaTab'), { ssr: false })

export type SchoolDetailProps = {
  domain: string
  school: School
  courses: Course[]
  schoolComments?: CourseComment[]
  site: Site
  siteSettings?: SiteSettings
}
const SchoolDetail = ({ school, courses, siteSettings, site }: SchoolDetailProps): JSX.Element => {
  useGlobalTimezone(site)

  const contentRef = useRef<HTMLDivElement>(null)
  const schoolBaseUrl = `https://${site?.url}/@${school.url ?? ''}`

  const { currentTab, setCurrentTab } = useTabContext()
  const { setSchoolContext } = useSchoolContext()

  useEffect(() => {
    setSchoolContext({
      school,
      courses,
      webpageSettings: school.institutionSetting,
      site,
      siteSettings,
      baseUrl: schoolBaseUrl,
    })
  }, [])

  // Set default tab for Vertical and Minimal templates
  useEffect(() => {
    if (
      (school.institutionSetting?.templates === WebsiteTemplate.Vertical ||
        school.institutionSetting?.templates === WebsiteTemplate.Minimal) &&
      (!currentTab || currentTab === '')
    ) {
      setCurrentTab(tabs[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!school.institutionSetting?.templates) {
    return (
      <HeroTemplateLayout
        school={school}
        site={site}
        tabs={heroTemplateTabs}
        pageType={PageType.SCHOOL}
      >
        <SchoolHead school={school} courses={courses} site={site} galleries={school.galleries} />
        <div ref={contentRef} className="flex h-full w-full flex-col items-center justify-center ">
          {currentTab === heroTemplateTabs[0] && <HomeTab />}
          {currentTab === heroTemplateTabs[1] && <HeroCourseTab />}
          {currentTab === heroTemplateTabs[2] && <HeroCalendarTab />}
          {currentTab === heroTemplateTabs[3] && <HeroContactTab />}
        </div>
      </HeroTemplateLayout>
    )
  }

  if (school.institutionSetting.templates === WebsiteTemplate.Vertical) {
    return (
      <VerticalTemplateLayout school={school} site={site} tabs={templateTabs}>
        <div ref={contentRef} className="h-full w-full">
          <SchoolHead school={school} courses={courses} site={site} galleries={school.galleries} />
          {currentTab === tabs[0] && <VerticalBasicInfoTemplateTab baseUrl={schoolBaseUrl} />}
          {currentTab === tabs[1] && <CourseTemplateTab />}
          {currentTab === tabs[2] && <MediaTab />}
          {currentTab === tabs[3] && <HeroContactTab />}
        </div>
      </VerticalTemplateLayout>
    )
  }

  if (school.institutionSetting.templates === WebsiteTemplate.Hero) {
    return (
      <HeroTemplateLayout
        school={school}
        site={site}
        tabs={heroTemplateTabs}
        pageType={PageType.SCHOOL}
      >
        <SchoolHead school={school} courses={courses} site={site} galleries={school.galleries} />
        <div ref={contentRef} className="flex h-full w-full flex-col items-center justify-center ">
          {currentTab === heroTemplateTabs[0] && <HomeTab />}
          {currentTab === heroTemplateTabs[1] && <HeroCourseTab />}
          {currentTab === heroTemplateTabs[2] && <HeroCalendarTab />}
          {currentTab === heroTemplateTabs[3] && <HeroContactTab />}
        </div>
      </HeroTemplateLayout>
    )
  }

  if (school.institutionSetting.templates === WebsiteTemplate.Barebone) {
    return (
      <BareboneTemplateLayout school={school} site={site}>
        <SchoolHead school={school} courses={courses} site={site} galleries={school.galleries} />
        <div ref={contentRef} className="flex h-full w-full flex-col items-center justify-center ">
          <MinimalCourseTemplateTab />
        </div>
      </BareboneTemplateLayout>
    )
  }

  if (school.institutionSetting.templates === WebsiteTemplate.Minimal) {
    return (
      <MinimalTemplateLayout tabs={tabs}>
        <SchoolHead school={school} courses={courses} site={site} galleries={school.galleries} />
        <div ref={contentRef} className="flex h-full w-full flex-col items-center justify-center">
          {currentTab === tabs[0] && <MinimalBasicInfoTemplateTab />}
          {currentTab === tabs[1] && <MinimalCourseTemplateTab />}
          {currentTab === tabs[2] && <MediaTab />}
          {currentTab === tabs[3] && <HeroContactTab />}
        </div>
      </MinimalTemplateLayout>
    )
  }

  return <SkeletonLoader height="10rem" />
}

export default SchoolDetail
