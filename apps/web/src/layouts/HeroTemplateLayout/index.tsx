import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useRecoilState } from 'recoil'

import useResponsive from '@/hooks/useResponsive'
import LayoutHead from '@/layouts/DefaultLayout/LayoutHead'
import HeroFooter from '@/layouts/HeroTemplateLayout/HeroFooter'
import HeroNavBar from '@/layouts/HeroTemplateLayout/HeroNavBar'
import { courseFilterOpenState } from '@/stores/courseData'
import { useSsrComplected } from '@/stores/ssrCompleted'
import { useTabContext } from '@/stores/tabContext'
import { Course, School, Site } from '@/types'
import { PageType } from '@/types/embed-component'
import { heroTemplateTabs } from '@/types/websiteTemplate'

import HeroImage from './HeroImage'

const MobileNavigationBar = dynamic(() => import('@/layouts/DefaultLayout/MobileNavBar'), {
  ssr: false,
})
const HeroTemplateLayout = ({
  school,
  site,
  course,
  children,
  pageType,
}: {
  children: React.ReactNode
  school: School
  course?: Course
  site: Site
  tabs: string[]
  pageType: PageType
}): JSX.Element => {
  // set recoil state to indicate SSR is completed
  useSsrComplected()
  const router = useRouter()
  // const { schoolContext } = useSchoolContext()
  // const { school, site } = schoolContext
  const { isMobileOrTablet } = useResponsive()
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [showFilterModal, setFilterModal] = useRecoilState(courseFilterOpenState)
  const { currentTab, setCurrentTab } = useTabContext()

  // const { currentTab, setCurrentTab } = useTabContext()
  // useEffect(() => {
  //   setCurrentTab(tabs[queryTab])
  // }, [])

  const hasHeroImage = pageType === PageType.COURSE || pageType === PageType.SCHOOL

  useEffect(() => {
    const hash = router.asPath.split('#')[1]

    if (hash === 'results' || hash === 'courses') {
      setCurrentTab(heroTemplateTabs[1])
    } else if (hash === 'contact') {
      setCurrentTab(heroTemplateTabs[2])
    } else if (hash === 'home') {
      setCurrentTab(heroTemplateTabs[0])
    } else {
      setCurrentTab(heroTemplateTabs[0])
    }
    // if (hash) {
    //   setTimeout(() => {
    //     const sectionElement = document.getElementById(currentTab)
    //
    //     if (sectionElement) {
    //       sectionElement.scrollIntoView({ behavior: 'smooth' })
    //     }
    //   }, 500)
    // }

    if (hash && hash !== 'home') {
      setTimeout(() => {
        const sectionElement = document.getElementById('hero_image')

        window.scrollTo({
          top: sectionElement?.offsetHeight,
          behavior: 'smooth',
        })
      }, 300)
    }
  }, [router.asPath])

  useEffect(() => {
    if (!isMobileOrTablet) {
      setShowMegaMenu(false)
    }
  }, [showMegaMenu, isMobileOrTablet])

  if (!school || !site) {
    return <>{children}</>
  }

  return (
    <>
      <LayoutHead school={school} site={site} />
      <div className="align-center flex h-full w-full flex-row items-start justify-center ">
        {isMobileOrTablet ? (
          <MobileNavigationBar tabs={heroTemplateTabs} school={school} site={site} />
        ) : (
          <HeroNavBar school={school} tabs={heroTemplateTabs} site={site} />
        )}

        {/*standard menu for desktop*/}

        <div
          className={`${
            showFilterModal ? 'pointer-events-none' : ''
          } bg-backgroundLayer2 mt-16 h-full w-full`}
        >
          {hasHeroImage && <HeroImage school={school} course={course} pageType={pageType} />}

          <div className="line-height-[1.3rem] z-40 w-full">{children}</div>
          {/*<ScrollToTop smooth />*/}
          <HeroFooter school={school} site={site} />
        </div>
      </div>
    </>
  )
}

export default HeroTemplateLayout
