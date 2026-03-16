import { useRef, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'

import { CourseMobileButtonGroup } from '@/components/Buttons/CourseMobileButtonGroup'
import ImageAspect from '@/components/Images/ImageAspect'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { courseDefaultSectionTitle } from '@/constants/defaultSectionTitle'
import useResponsive, { NotDesktop } from '@/hooks/useResponsive'
import CourseDetailCard from '@/page-components/courses/CourseDetailCard'
import CourseDetailInfo from '@/page-components/courses/CourseDetailInfo'
import { Course, LongDescription, School } from '@/types/index'
import { cn } from '@/utils/cn'

import { CoursePageDescription } from '../LayoutElements/PageDescription'

import BareboneTemplateLayout from '.'

export type CourseDetailProps = {
  school: School
  course: Course
}

const BareboneTemplateCoursePage = ({ course, school }: CourseDetailProps): JSX.Element => {
  const site = course.site

  const { isDesktop } = useResponsive()
  const { t } = useTranslation()

  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const courseTabs = course.longDescriptions
    ? course.longDescriptions
        .filter((description: LongDescription) =>
          description.content.replace(/<(?!img\b)[^>]+>/g, '').trim()
        )
        .map((description: LongDescription) => description.sectionTitle)
    : []
  // const tabs = course.longDescriptions.map((description) => description.sectionTitle)
  const tabData = courseTabs.map(tab => ({
    value: tab,
    label: courseDefaultSectionTitle.includes(tab)
      ? t(`course:courseDefaultSectionTitle.${tab}`)
      : tab,
  }))

  // const getCourseDescription = (courseType: string) => {
  //   const course = courseDescription?.find(item => item.type === courseType)
  //   return (
  //     <div className="box-col justify-start p-4">
  //       <div className="justify-center text-6xl">{course?.icon}</div>
  //       <div className="box-col items-start justify-start">
  //         {course?.paragraph &&
  //           course?.paragraph.map(paragraph => (
  //             <div className="py-2" key={paragraph}>
  //               {t(`course:${paragraph}`)}
  //             </div>
  //           ))}
  //       </div>
  //     </div>
  //   )
  // }

  const scrollRefs = useRef<Record<string, HTMLDivElement>>({})

  const [currentTab, setCurrentTab] = useState(tabData[0]?.value ?? '')
  const [showHeader, setShowHeader] = useState(false)
  //   const router = useRouter()
  //   const menuTabData = tabs.map((tab) => ({ value: tab, label: t(`school:heading.${tab}`) }))
  //   const handleChangeTab = (tab: string) => {
  //     if (tab === tabs[0]) {
  //       router.push(router.pathname)
  //     } else {
  //       router.push(`${router.pathname}?tab=${tab}`)
  //     }
  //   }

  //   <Header
  //   school={school}
  //   menu={{
  //     currentSelectedTab: tabs[0],
  //     items: menuTabData,
  //     onChange: handleChangeTab,
  //   }}
  // />

  const handleTabChange = (value: string) => {
    scrollRefs.current[value]?.scrollIntoView({ behavior: 'smooth' })
    setCurrentTab(value)
  }

  return (
    <BareboneTemplateLayout school={school} site={site}>
      {tabData.length > 0 && (
        <header
          className={`bg-background fixed top-0 z-10 flex min-h-16 w-full shrink-0 flex-col justify-between px-4 py-2 lg:flex-row ${
            showHeader ? 'block' : 'hidden'
          }`}
        >
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="flex w-full overflow-x-auto">
              {tabData.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </header>
      )}

      <div className="box-row sticky top-5 w-full justify-start">
        <div
          className={cn('box-col h-full w-full', {
            'w-[70%]': isDesktop,
          })}
        >
          <div className="w-full justify-start" ref={imageRef}>
            <ImageAspect
              s3="public"
              ratio={16 / 9}
              src={course.previewImageUrl}
              alt="Course preview cover"
              className="h-full w-full"
            />
          </div>

          <div className="w-full justify-start">
            <NotDesktop className="box-col p-0">
              <div className="box-col items-start justify-start text-xl font-bold">
                {course.name}
              </div>
              <div className="box-col gap-2">
                <CourseDetailInfo course={course} site={site} />
              </div>
              <CourseMobileButtonGroup course={course} school={school} site={site} />
            </NotDesktop>
          </div>
          <CoursePageDescription
            course={course}
            setShowHeader={setShowHeader}
            showHeader={showHeader}
            scrollRefs={scrollRefs}
            tabData={tabData}
            currentTab={currentTab}
            handleTabChange={handleTabChange}
            setCurrentTab={setCurrentTab}
          />
        </div>

        {isDesktop && <CourseDetailCard course={course} school={school} site={site} />}
      </div>
    </BareboneTemplateLayout>
  )
}

export default BareboneTemplateCoursePage
