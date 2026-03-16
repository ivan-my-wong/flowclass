import { useSsrComplected } from '@/stores/ssrCompleted'
import { Course, School, Site } from '@/types'
import { MenuTabsProps } from '@/types/websiteTemplate'

import Footer from './Footer'
import Header from './HeaderLogoName'
import LayoutHead from './LayoutHead'
import Main from './Main'

const AppLayout = ({
  showMenu,
  children,
  school,
  site,
  showHeader = true,
  showFooter = true,
  menu,
  course,
  className,
}: {
  school: School
  site: Site
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  showMenu?: boolean
  menu?: MenuTabsProps
  course?: Course
  className?: string
}): JSX.Element => {
  // set recoil state to indicate SSR is completed
  useSsrComplected()

  if (!school || !site) {
    return <>{children}</>
  }

  return (
    <>
      <LayoutHead school={school} site={site} course={course} />
      {showHeader && <Header school={school} showMenu={showMenu} menu={menu} />}
      <Main className={className}>{children}</Main>
      {showFooter && <Footer school={school} site={site} />}
    </>
  )
}

export default AppLayout
