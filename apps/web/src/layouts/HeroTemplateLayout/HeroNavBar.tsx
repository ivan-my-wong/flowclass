import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

import useTranslation from 'next-translate/useTranslation'
import { twMerge } from 'tailwind-merge'

import EnquiryButton from '@/components/Buttons/EnquiryButton'
import { useGetStudentPortalSettings } from '@/hooks/useProfile'
import Header from '@/layouts/DefaultLayout/HeaderLogoName'
import StudentProfile from '@/page-components/profile/StudentProfile'
import { useTabContext } from '@/stores/tabContext'
import { PhoneContactMethod, School, Site } from '@/types'
import { getContactMethodLink } from '@/utils/contact'

interface HeroNavBarProps {
  school: School
  site: Site
  tabs: string[]
}

const HeroNavBar = ({ school, tabs, site }: HeroNavBarProps): JSX.Element => {
  const router = useRouter()

  const { t } = useTranslation()
  const { currentTab, setCurrentTab } = useTabContext()
  const pathname = usePathname()

  const baseUrl = school.url ? `/@${school.url}` : '/'

  const { data: studentPortalSettings } = useGetStudentPortalSettings(school?.id)

  const contactMethodLink = getContactMethodLink({
    contactId: school?.contactId,
    contactMethod: school?.phoneContactMethod ?? PhoneContactMethod.WhatsApp,
    phone: school.phone ?? '',
    schoolUrl: school?.url ?? '',
    domain: site?.url,
  })

  return (
    <nav className="fixed left-0 top-0 z-20 flex w-full flex-row justify-center ">
      <div className="bg-background mx-2 mt-2 flex h-16 w-full max-w-7xl items-center justify-between rounded-xl px-4 shadow-sm sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex-shrink-0">{school && <Header school={school} />}</div>

        {/* Navigation Links */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {tabs.map(tab => {
            return (
              <button
                key={tab}
                type="button"
                className={twMerge(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  currentTab === tab ? 'text-primary' : 'hover:text-primary'
                )}
                onClick={() => {
                  router
                    .push({
                      pathname: baseUrl,
                      query: {},
                      hash: tab,
                    })
                    .then(() => {
                      setCurrentTab(tab)
                    })
                }}
              >
                {t(`school:heading.${tab}`)}
              </button>
            )
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {school.phone && <EnquiryButton contactMethodLink={contactMethodLink} />}
          {studentPortalSettings?.studentLogin && <StudentProfile school={school} />}
        </div>
      </div>
    </nav>
  )
}

export default HeroNavBar
