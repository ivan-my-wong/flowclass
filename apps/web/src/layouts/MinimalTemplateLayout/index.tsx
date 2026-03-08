import useResponsive from '@/hooks/useResponsive'
import { useSchoolContext } from '@/stores/schoolContext'
import { useSsrComplected } from '@/stores/ssrCompleted'

import Footer from '../DefaultLayout/Footer'
import LayoutHead from '../DefaultLayout/LayoutHead'
import Main from '../DefaultLayout/Main'
import MobileNavigationBar from '../DefaultLayout/MobileNavBar'
import HeroNavBar from '../HeroTemplateLayout/HeroNavBar'

interface MinimalTemplateLayoutProps {
  /** Content to be rendered within the layout */
  children: React.ReactNode
  /** Navigation tabs to display */
  tabs: string[]
  /** Whether to show the header component. @default true */
  showHeader?: boolean
  /** Whether to show the footer component. @default true */
  showFooter?: boolean
}

const MinimalTemplateLayout = ({
  tabs,
  children,
  showHeader = true,
  showFooter = true,
}: MinimalTemplateLayoutProps): JSX.Element => {
  // set recoil state to indicate SSR is completed
  useSsrComplected()

  const { schoolContext } = useSchoolContext()
  const { school, site } = schoolContext

  const { isMobile, isTablet } = useResponsive()

  if (!school || !site) {
    return <>{children}</>
  }

  return (
    <>
      {showHeader && <LayoutHead school={school} site={site} />}

      <div>
        {isMobile || isTablet ? (
          <MobileNavigationBar tabs={tabs} school={school} site={site} />
        ) : (
          <HeroNavBar school={school} tabs={tabs} site={site} />
        )}

        <div className="mt-16">
          <Main>{children}</Main>
        </div>
        {showFooter && <Footer school={school} site={site} />}
      </div>
    </>
  )
}

export default MinimalTemplateLayout
