import dynamic from 'next/dynamic'
import { useState } from 'react'

import { useRecoilState } from 'recoil'

import ScrollArea from '@/components/Containters/ScrollArea'
import FilterTagSidebar from '@/components/Sidebar/FilterTagSidebar'
import LanguageToggle from '@/components/Toggle/LanguageToggle'
import useResponsive from '@/hooks/useResponsive'
import LayoutHead from '@/layouts/DefaultLayout/LayoutHead'
import Sidebar from '@/layouts/DefaultLayout/MenuPopover'
import Menu from '@/layouts/VerticalTemplateLayout/Menu'
import MenuFooter from '@/layouts/VerticalTemplateLayout/MenuFooter'
import SchoolContactInfo from '@/layouts/VerticalTemplateLayout/SchoolContactInfo'
import { courseFilterOpenState } from '@/stores/courseData'
import { useSsrComplected } from '@/stores/ssrCompleted'
import { Course, School, Site } from '@/types'

const MobileNavigationBar = dynamic(() => import('@/layouts/DefaultLayout/MobileNavBar'), {
  ssr: false,
})
const TemplateLayout = ({
  tabs,
  school,
  site,
  course,
  children,
}: {
  children: React.ReactElement
  school: School
  site: Site
  course?: Course
  tabs: string[]
}): JSX.Element => {
  // set recoil state to indicate SSR is completed
  useSsrComplected()

  const { isMobile, isTablet } = useResponsive()
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [showFilterModal] = useRecoilState(courseFilterOpenState)

  if (!school || !site) {
    return <>{children}</>
  }

  return (
    <>
      <LayoutHead school={school} site={site} />
      <div className="align-center flex h-full w-full flex-row items-start justify-center lg:h-dvh">
        {showFilterModal && <FilterTagSidebar />}
        {isMobile || isTablet ? (
          <MobileNavigationBar tabs={tabs} school={school} site={site} />
        ) : (
          <div className="bg-backgroundLayer2">
            <Sidebar tabs={tabs} school={school} site={site} />
          </div>
        )}
        {/*standard menu for desktop*/}
        {((!isMobile && !isTablet && !showMegaMenu) ||
          ((isMobile || isTablet) && !showMegaMenu)) && (
          <div
            className={` ${
              showFilterModal ? 'pointer-events-none' : ''
            }mt-16 h-full w-full lg:mt-0 lg:w-4/5 2xl:w-full`}
          >
            <ScrollArea>{children}</ScrollArea>
          </div>
        )}
        {/*mega menu for mobile*/}
        {(isMobile || isTablet) && showMegaMenu && (
          <div
            className={` ${
              showFilterModal ? 'pointer-events-none' : ''
            }mt-16 align-center z-10 h-full w-full items-center justify-center lg:mt-0 lg:h-full lg:w-3/4`}
          >
            <div className="border-textDisabled align-center my-4 w-full justify-center border-t" />
            <Menu tabs={tabs} setShowMegaMenu={setShowMegaMenu} />

            <div className="border-textDisabled align-center my-6 w-full justify-center border-t" />
            <SchoolContactInfo school={school} />

            <div className="border-textDisabled align-center my-6 w-full justify-center border-t" />
            <MenuFooter site={site} />
            <div className="border-textDisabled align-center mb-2 mt-6 w-full justify-center border-t" />

            <LanguageToggle />
          </div>
        )}
      </div>
    </>
  )
}

export default TemplateLayout
