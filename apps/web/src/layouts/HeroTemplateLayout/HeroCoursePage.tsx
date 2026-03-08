import { useCallback, useEffect, useRef, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { useInView } from 'react-intersection-observer'

import { CourseMobileButtonGroup } from '@/components/Buttons/CourseMobileButtonGroup'
import ScrollArea from '@/components/Containters/ScrollArea'
import Heading from '@/components/Texts/Heading'
import { courseDescription } from '@/constants/course'
// import Heading from '@/components/Texts/Heading'
import { courseDefaultSectionTitle } from '@/constants/defaultSectionTitle'
import useResponsive from '@/hooks/useResponsive'
import CourseDetailInfo from '@/page-components/courses/CourseDetailInfo'
import { CourseDetailProps, LongDescription } from '@/types/index'

import { CoursePageDescription } from '../LayoutElements/PageDescription'

const HeroCoursePage = ({ course, school }: CourseDetailProps): JSX.Element => {
  const site = course.site

  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const scrollRefs = useRef<Record<string, HTMLDivElement>>({})
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [showHeader, setShowHeader] = useState(false)
  const tabWithAnchorScrollRef = useRef<HTMLDivElement | null>(null)
  const tabs = course.longDescriptions
    ? course.longDescriptions
        .filter((description: LongDescription) =>
          description.content.replace(/<(?!img\b)[^>]+>/g, '').trim()
        )
        .map((description: LongDescription) => description.sectionTitle)
    : []
  // const tabs = course.longDescriptions.map((description) => description.sectionTitle)
  const tabData = tabs.map(tab => ({
    value: tab,
    label: courseDefaultSectionTitle.includes(tab)
      ? t(`course:courseDefaultSectionTitle.${tab}`)
      : tab,
  }))

  const handleScroll = useCallback(() => {
    const tabWithAnchorScrollElement = tabWithAnchorScrollRef.current
    if (tabWithAnchorScrollElement) {
      const tabWithAnchorScrollOffsetTop = tabWithAnchorScrollElement.offsetTop
      const scrollPosition = window.scrollY || window.pageYOffset

      setShowHeader(scrollPosition >= tabWithAnchorScrollOffsetTop)
    }

    Object.keys(scrollRefs.current).forEach(sectionTitle => {
      const sectionRef = scrollRefs.current[sectionTitle]
      if (
        sectionRef &&
        window.scrollY >= sectionRef.offsetTop - 20 &&
        window.scrollY < sectionRef.offsetTop + sectionRef.offsetHeight
      ) {
        setCurrentTab(sectionTitle)
      }
    })
  }, [showHeader])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const [currentTab, setCurrentTab] = useState(tabs[0])

  const getCourseDescription = (courseType: string) => {
    const course = courseDescription?.find(item => item.type === courseType)
    const Icon = course?.icon
    return (
      <div className="box-col justify-start p-4">
        {Icon && (
          <div className="justify-center text-6xl">
            <Icon />
          </div>
        )}
        <div className="box-col items-start justify-start">
          {course?.paragraph &&
            course?.paragraph.map((paragraph, index) => (
              <div className="py-2" key={index}>
                {t(`course:${paragraph}`)}
              </div>
            ))}
        </div>
      </div>
    )
  }

  const handleTabChange = (value: string) => {
    scrollRefs.current[value].scrollIntoView({ behavior: 'smooth' })
    setCurrentTab(value)
  }

  const [refDetailCard] = useInView({
    threshold: 0,
    initialInView: true,
    rootMargin: !isDesktop ? '-22% 0%' : '0% 0%',
  })

  const [, inViewHeader] = useInView({
    threshold: 0,
    initialInView: true,
    rootMargin: !isDesktop ? '-22% 0%' : '0% 0%',
  })
  return (
    <ScrollArea>
      <div className="bg-backgroundLayer2 flex h-full w-full flex-col items-center justify-center justify-items-center gap-4 self-start lg:flex-row lg:items-start">
        <div className="w-[98%] max-w-7xl items-center px-2 py-4 md:px-0">
          <div className="box-col-full bg-background items-center justify-center rounded-lg p-4">
            <Heading className="text-center text-xl font-bold" as="h1">
              {course.name}
            </Heading>
            <div className="box-col-full">
              <CourseDetailInfo course={course} site={site} justify="center" />
            </div>
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

        <CourseMobileButtonGroup course={course} school={school} site={site} />
      </div>
    </ScrollArea>
  )
}

export default HeroCoursePage
