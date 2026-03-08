import { useRecoilState } from 'recoil'

import EnquiryButton from '@/components/Buttons/EnquiryButton'
import SocialMediaIconRow from '@/components/SocialLogin/SocialMediaIconRow'
import LanguageToggle from '@/components/Toggle/LanguageToggle'
import { useGetStudentPortalSettings } from '@/hooks/useProfile'
import Header from '@/layouts/DefaultLayout/HeaderLogoName'
import Menu from '@/layouts/VerticalTemplateLayout/Menu'
import MenuFooter from '@/layouts/VerticalTemplateLayout/MenuFooter'
import StudentProfile from '@/page-components/profile/StudentProfile'
import { courseFilterOpenState } from '@/stores/courseData'
import { PhoneContactMethod, School, Site } from '@/types'
import { cn } from '@/utils/cn'
import { getContactMethodLink } from '@/utils/contact'

import { ContactInfos, ContactInfoType } from '../HeroTemplateLayout/HeroFooter'

interface SidebarProps {
  school: School
  site: Site
  tabs: string[]
  setShowMegaMenu?: (val: boolean) => void
}

const Sidebar = ({ school, site, tabs, setShowMegaMenu }: SidebarProps): JSX.Element => {
  const [showFilterModal] = useRecoilState(courseFilterOpenState)
  const baseUrl = school?.url ? `/@${school?.url}` : '/'

  const socialMedia = school?.institutionSetting?.socialMedia

  const { data: studentPortalSettings } = useGetStudentPortalSettings(school?.id)

  if (!school || !site) {
    return <></>
  }

  const contactMethodLink = getContactMethodLink({
    contactId: school?.contactId,
    contactMethod: school?.phoneContactMethod ?? PhoneContactMethod.WhatsApp,
    phone: school.phone ?? '',
    schoolUrl: school?.url ?? '',
    domain: site.url,
  })

  return (
    <div
      className={cn(
        showFilterModal && 'pointer-events-none',
        'align-center',
        'h-full',
        'justify-center',
        'lg:align-start',
        'lg:justify-start',
        'lg:h-dvh',
        'z-10',
        'flex',
        'flex-col',
        'items-center',
        'self-center',
        'px-2',
        'py-2'
      )}
    >
      <Header school={school} />
      <div className="mt-2" />
      <div className="box-row-full">
        {school.phone && <EnquiryButton contactMethodLink={contactMethodLink} />}
        {studentPortalSettings?.studentLogin && <StudentProfile school={school} />}
      </div>
      <div className="border-textDisabled align-center mb-6 mt-4 w-full justify-center border-t" />
      <Menu tabs={tabs} setShowMegaMenu={setShowMegaMenu} baseUrl={baseUrl} />

      <div className="border-textDisabled align-center my-6 w-full justify-center border-t" />
      <div className="flex flex-col items-center gap-2">
        {school.phone && (
          <ContactInfos
            site={site}
            school={school}
            type={ContactInfoType.PHONE}
            textStyles="w-full"
            boxClassName="w-fit"
          />
        )}
        {school.email && (
          <ContactInfos
            site={site}
            school={school}
            type={ContactInfoType.EMAIL}
            textStyles="w-full"
            boxClassName="w-fit"
          />
        )}
      </div>

      {socialMedia && socialMedia.length > 0 && (
        <div className="box-col-full mt-4">
          <SocialMediaIconRow socialMedia={socialMedia} />
        </div>
      )}
      <div className="border-textDisabled align-center my-6 w-full justify-center border-t" />
      <MenuFooter site={site} />
      <div className="border-textDisabled align-center my-4 w-full justify-center border-t" />
      <div className="flex items-center justify-center">
        <LanguageToggle />
      </div>
    </div>
  )
}

export default Sidebar
