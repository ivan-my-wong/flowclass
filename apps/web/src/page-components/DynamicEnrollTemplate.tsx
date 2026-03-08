import dynamic from 'next/dynamic'
import { ReactElement, useEffect } from 'react'

import { useRecoilState } from 'recoil'

import { templateLayoutMap } from '@/config/templateConfig'
import { useGlobalTimezone } from '@/hooks/useGlobalTimezone'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { Course, School } from '@/types'
import { PageType } from '@/types/embed-component'
import { heroTemplateTabs, templateTabs, WebsiteTemplate } from '@/types/websiteTemplate'

const BareboneTemplateLayout = dynamic(() => import('@/layouts/BareboneTemplateLayout'), {
  ssr: false,
})
const DefaultLayout = dynamic(() => import('@/layouts/DefaultLayout'), { ssr: false })
const VerticalTemplateLayout = dynamic(() => import('@/layouts/VerticalTemplateLayout'), {
  ssr: false,
})
const HeroTemplateLayout = dynamic(() => import('@/layouts/HeroTemplateLayout'), { ssr: false })

type DynamicEnrollTemplateProps = {
  course: Course
  school: School
  children: ReactElement
}

const DynamicEnrollTemplate = ({
  course,
  school,
  children,
}: DynamicEnrollTemplateProps): JSX.Element => {
  useGlobalTimezone(course?.site)
  const template = school?.institutionSetting?.templates || WebsiteTemplate.Hero
  //ignore the hard code part first. Will replace all by variable later

  const TemplateComponent =
    templateLayoutMap[template as keyof typeof templateLayoutMap] || HeroTemplateLayout

  const templateTabsMap = {
    [WebsiteTemplate.Minimal]: templateTabs,
    [WebsiteTemplate.Barebone]: templateTabs,
    [WebsiteTemplate.Hero]: heroTemplateTabs,
    [WebsiteTemplate.Vertical]: templateTabs,
  }

  const [, setCurrentTheme] = useRecoilState(currentWebsiteTheme)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setCurrentTheme(template)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tabs = templateTabsMap[template as keyof typeof templateTabsMap] || heroTemplateTabs
  return (
    <TemplateComponent
      course={course}
      school={school}
      site={course.site}
      tabs={tabs}
      pageType={PageType.ENROL}
    >
      {children}
    </TemplateComponent>
  )
}

DynamicEnrollTemplate.displayName = 'DynamicEnrollTemplate'
export default DynamicEnrollTemplate
