import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'

import { useGlobalTimezone } from '@/hooks/useGlobalTimezone'
import BareboneTemplateLayout from '@/layouts/BareboneTemplateLayout'
import HeroTemplateLayout from '@/layouts/HeroTemplateLayout'
import MinimalTemplateLayout from '@/layouts/MinimalTemplateLayout'
import VerticalTemplateLayout from '@/layouts/VerticalTemplateLayout'
import { SchoolHead } from '@/page-components/schools/SchoolHeadElement'
import { useSchoolContext } from '@/stores/schoolContext'
import { PageType } from '@/types/embed-component'
import { heroTemplateTabs, tabs, templateTabs, WebsiteTemplate } from '@/types/websiteTemplate'
import { CourseProps, getPathRelatedData, PathType, SchoolProps, SiteProps } from '@/utils/domain'

const HeroCourseSelectTab = dynamic(
  () => import('@/page-components/schools/heroTemplate/HeroCourseSelectTab'),
  {
    ssr: false,
  }
)

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const props = await getPathRelatedData(context)
  return props
}

interface CourseSelelectPageProps {
  siteProps: SiteProps
  schoolProps: SchoolProps
  courseProps: CourseProps
  errorMessage?: string
  pathType: PathType
}

const CourseSelelectPage = ({
  schoolProps,
  courseProps,
  siteProps,
}: CourseSelelectPageProps): JSX.Element => {
  const { school } = schoolProps
  const { courses } = courseProps
  const { site } = siteProps
  const { siteSettings } = siteProps

  useGlobalTimezone(site)

  const contentRef = useRef<HTMLDivElement>(null)
  const schoolBaseUrl = `https://${site?.url}/@${school.url ?? ''}`

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

  if (!school.institutionSetting?.templates) {
    return (
      <HeroTemplateLayout
        school={school}
        site={site}
        tabs={heroTemplateTabs}
        pageType={PageType.COURSE}
      >
        <SchoolHead
          school={school}
          courses={courses ?? []}
          site={site}
          galleries={school.galleries}
        />
        <div ref={contentRef} className="flex h-full w-full flex-col items-center justify-center ">
          <HeroCourseSelectTab />
        </div>
      </HeroTemplateLayout>
    )
  }

  if (school.institutionSetting.templates === WebsiteTemplate.Vertical) {
    return (
      <VerticalTemplateLayout school={school} site={site} tabs={templateTabs}>
        <div ref={contentRef} className="h-full w-full">
          <SchoolHead
            school={school}
            courses={courses ?? []}
            site={site}
            galleries={school.galleries}
          />
          <HeroCourseSelectTab />
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
        pageType={PageType.COURSE}
      >
        <SchoolHead
          school={school}
          courses={courses ?? []}
          site={site}
          galleries={school.galleries}
        />
        <div ref={contentRef} className="flex h-full w-full flex-col items-center justify-center ">
          <HeroCourseSelectTab />
        </div>
      </HeroTemplateLayout>
    )
  }

  if (school.institutionSetting.templates === WebsiteTemplate.Minimal) {
    return (
      <MinimalTemplateLayout tabs={tabs}>
        <SchoolHead
          school={school}
          courses={courses ?? []}
          site={site}
          galleries={school.galleries}
        />
        <div ref={contentRef} className="flex h-full w-full flex-col items-center justify-center ">
          <HeroCourseSelectTab />
        </div>
      </MinimalTemplateLayout>
    )
  }

  if (school.institutionSetting.templates === WebsiteTemplate.Barebone) {
    return (
      <BareboneTemplateLayout school={school} site={site}>
        <SchoolHead
          school={school}
          courses={courses ?? []}
          site={site}
          galleries={school.galleries}
        />
        <div ref={contentRef} className="flex h-full w-full flex-col items-center justify-center ">
          <HeroCourseSelectTab />
        </div>
      </BareboneTemplateLayout>
    )
  }

  return <></>
}

export default CourseSelelectPage
