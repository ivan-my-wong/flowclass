import { useEffect, useState } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { GiHamburgerMenu } from 'react-icons/gi'
import { RxCross2 } from 'react-icons/rx'

import Button from '@/components/Buttons/Button'
import { useCurrentTab } from '@/hooks/useCurrentTab'
import { useGetStudentPortalSettings } from '@/hooks/useProfile'
import useResponsive from '@/hooks/useResponsive'
import Header from '@/layouts/DefaultLayout/HeaderLogoName'
import Sidebar from '@/layouts/DefaultLayout/MenuPopover'
import StudentProfile from '@/page-components/profile/StudentProfile'
import { courseFilterOpenState } from '@/stores/courseData'
import { useTabContext } from '@/stores/tabContext'
import { School, Site } from '@/types'

interface NavigationBarProps {
  school: School
  tabs: string[]
  site: Site
  height?: number
}

const NavigationBar = ({ tabs, school, site }: NavigationBarProps): JSX.Element => {
  const [showFilterModal] = useRecoilState(courseFilterOpenState)
  const { setCurrentTab } = useTabContext()
  const { t } = useTranslation()
  const { isMobileOrTablet } = useResponsive()
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const queryTab = useCurrentTab(tabs)

  const { data: studentPortalSettings } = useGetStudentPortalSettings(school?.id)

  useEffect(() => {
    setCurrentTab(tabs[queryTab])
  }, [])

  if (!school) {
    return <></>
  }

  return (
    <>
      <nav className="fixed left-0 top-0 z-20 flex w-full flex-row justify-center">
        <div className="bg-background m-2 flex h-auto w-full max-w-7xl flex-wrap items-center justify-between rounded-xl p-2 shadow-sm lg:px-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Header school={school} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:items-center md:space-x-8 lg:flex">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                className={`
                  rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${queryTab === index ? 'text-primary' : 'hover:text-primary'}
                `}
              >
                {t(`school:heading.${tab}`)}
              </button>
            ))}
          </div>

          {/* Enquiry Button */}
          <div className="fit-content ml-auto flex flex-row items-center space-x-4">
            {studentPortalSettings?.studentLogin && (
              <div className="hidden lg:block">
                <StudentProfile school={school} />
              </div>
            )}
            {/* {school.phone && <EnquiryButton contactMethodLink={contactMethodLink} />} */}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                onClick={() => setShowMegaMenu(!showMegaMenu)}
                type="button"
                variant="textPrimary"
                className="text-2xl hover:bg-transparent"
              >
                <GiHamburgerMenu />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileOrTablet && showMegaMenu && (
        <div className="bg-background fixed inset-0 z-30 flex w-full items-center justify-center">
          <Button
            onClick={() => setShowMegaMenu(false)}
            className="text-textSubtle absolute right-2 top-3 z-[31] text-2xl"
            variant="textPrimary"
          >
            <RxCross2 />
          </Button>
          <Sidebar school={school} site={site} tabs={tabs} setShowMegaMenu={setShowMegaMenu} />
        </div>
      )}
    </>
  )
}

export default NavigationBar
