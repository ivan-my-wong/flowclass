import { useCallback, useEffect, useRef, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'

import { CourseMobileButtonGroup } from '@/components/Buttons/CourseMobileButtonGroup'
import ScrollArea from '@/components/Containters/ScrollArea'
import ImageAspect from '@/components/Images/ImageAspect'
import Heading from '@/components/Texts/Heading'
import { courseDescription } from '@/constants/course'
// import Heading from '@/components/Texts/Heading'
import { courseDefaultSectionTitle } from '@/constants/defaultSectionTitle'
import useResponsive, { NotDesktop } from '@/hooks/useResponsive'
import CourseDetailCard from '@/page-components/courses/CourseDetailCard'
import CourseDetailInfo from '@/page-components/courses/CourseDetailInfo'
import { CourseDetailProps, LongDescription } from '@/types/index'

import { CoursePageDescription } from '../LayoutElements/PageDescription'

const CourseTemplatePage = ({ course, school }: CourseDetailProps): JSX.Element => {
  const site = course.site

  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const scrollRefs = useRef<Record<string, HTMLDivElement>>({})
  const [showInfoDialog, setShowInfoDialog] = useState(false)
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

  return (
    <ScrollArea>
      <div className="bg-background2 flex h-full w-full flex-col items-center justify-center justify-items-center self-start p-2 lg:flex-row lg:items-start lg:justify-normal">
        <div className="w-full items-center p-2">
          <div className="mb-2 w-full" ref={imageRef}>
            <ImageAspect
              s3="public"
              src={course.previewImageUrl}
              alt="Course preview cover"
              className="object-contain"
            />
          </div>

          <div className="w-full justify-start">
            <NotDesktop className="box-col p-0">
              <Heading className="box-col items-start justify-start text-xl font-bold" as="h1">
                {course.name}
              </Heading>
              <div className="box-col gap-2">
                <CourseDetailInfo course={course} site={site} />
              </div>
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
        <NotDesktop>
          <CourseMobileButtonGroup course={course} school={school} site={site} />
        </NotDesktop>
      </div>
    </ScrollArea>
  )
}

export default CourseTemplatePage
