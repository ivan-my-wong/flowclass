import { useCallback, useEffect, useRef } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { useInView } from 'react-intersection-observer'

import TabWithAnchorScroll from '@/components/TabScrollGroups/TabWithAnchorScroll'
import HtmlArea from '@/components/TextAreas/HtmlArea'
import Heading from '@/components/Texts/Heading'
import { courseDefaultSectionTitle } from '@/constants/defaultSectionTitle'
import useResponsive from '@/hooks/useResponsive'
import { Course } from '@/types'

type CoursePageDescriptionProps = {
  showHeader: boolean
  scrollRefs: React.MutableRefObject<Record<string, HTMLDivElement>>
  setCurrentTab: (tab: string) => void
  tabData: { value: string; label: string }[]
  currentTab: string
  handleTabChange: (tab: string) => void
  course: Course
  setShowHeader: (show: boolean) => void
}

export const CoursePageDescription = ({
  showHeader,
  scrollRefs,
  setShowHeader,
  setCurrentTab,
  tabData,
  currentTab,
  handleTabChange,
  course,
}: CoursePageDescriptionProps): JSX.Element => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()

  const [refDetailCard] = useInView({
    threshold: 0,
    initialInView: true,
    rootMargin: !isDesktop ? '-22% 0%' : '0% 0%',
  })
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

  const tabWithAnchorScrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      className="mt-2 w-full overflow-x-hidden overflow-y-hidden"
      ref={el => {
        tabWithAnchorScrollRef.current = el
      }}
    >
      {tabData.length > 1 && (
        <TabWithAnchorScroll
          anchorData={tabData}
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          scrollRefs={scrollRefs}
        />
      )}

      <div className="w-full justify-center">
        {course.longDescriptions?.map(description => {
          if (
            !description.content ||
            !description.content.replace(/<(?!img\b)[^>]+>/g, '').trim()
          ) {
            return null
          }

          return (
            <div
              className="w-full justify-center py-4"
              key={description.sectionTitle}
              id={description.sectionTitle}
              ref={el => {
                scrollRefs.current[description.sectionTitle] = el ?? HTMLDivElement.prototype
                refDetailCard(el)
              }}
            >
              <Heading className="text-primary mt-2 text-left !text-2xl font-bold" as="h2">
                {courseDefaultSectionTitle.includes(description.sectionTitle)
                  ? t(`course:courseDefaultSectionTitle.${description.sectionTitle}`)
                  : description.sectionTitle}
              </Heading>
              <HtmlArea key={description.sectionTitle} text={description.content} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
