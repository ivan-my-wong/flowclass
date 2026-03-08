import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { toast } from 'sonner'

import { getCourses } from '@/api/courseApi'
import { InstitutionErrorMessage } from '@/api/error/errorMessage'
import { getSchoolByUrl } from '@/api/schoolApi'
import { getSiteByDomain } from '@/api/siteApi'
import { useGlobalTimezone } from '@/hooks/useGlobalTimezone'
import { useGetStudentPortalSettings } from '@/hooks/useProfile'
import useResponsive from '@/hooks/useResponsive'
import Footer from '@/layouts/DefaultLayout/Footer'
import LayoutHead from '@/layouts/DefaultLayout/LayoutHead'
import CreditBalance from '@/page-components/profile/CreditBalance'
import FormAccount from '@/page-components/profile/FormAccount'
import Lessons from '@/page-components/profile/lessons/Lessons'
import PaymentRecord from '@/page-components/profile/PaymentRecord'
import { useAuth } from '@/stores/auth'
import { Course, School, Site } from '@/types'
import { heroTemplateTabs } from '@/types/websiteTemplate'
import { getDomainFromReq } from '@/utils/sanitize'

const MobileNavigationBar = dynamic(() => import('@/layouts/DefaultLayout/MobileNavBar'), {
  ssr: false,
})

const HeroNavBar = dynamic(() => import('@/layouts/HeroTemplateLayout/HeroNavBar'), {
  ssr: false,
})

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}: GetServerSidePropsContext) => {
  const domain = await getDomainFromReq(req)

  if (!domain) {
    return {
      redirect: {
        destination: '/profile?school=',
        permanent: false,
      },
      props: {
        errorMessage: InstitutionErrorMessage.INSTITUTION_NOT_FOUND,
      },
    }
  }

  const site = await getSiteByDomain(domain)

  if (!query) {
    return {
      props: {
        site,
        school: null,
        courses: [],
      },
    }
  }

  const { school: schoolUrl } = query

  const school = await getSchoolByUrl(domain, schoolUrl as string)

  const courses = await getCourses(school.id)

  return {
    props: {
      school,
      site,
      courses: courses.content,
    },
  }
}

export enum ProfileMenu {
  LESSONS = 'lessons',
  // UPCOMING = 'upcoming',
  // PAST = 'past',
  PENDING_PAYMENTS = 'pendingPayments',
  PAYMENT_HISTORY = 'paymentHistory',
  CREDIT_BALANCE = 'creditBalance',
  PROFILE = 'profile',
}

const studentTabs = [
  ProfileMenu.LESSONS,
  // ProfileMenu.UPCOMING,
  // ProfileMenu.PAST,
  ProfileMenu.PROFILE,
]
const parentTabs = Object.values(ProfileMenu)

const ProfilePage = ({
  site,
  school,
  courses,
}: {
  site: Site
  school: School
  courses: Course[]
}): JSX.Element => {
  useGlobalTimezone(site)

  const { t } = useTranslation()
  const router = useRouter()
  const { isMobile, isTablet } = useResponsive()
  const { auth } = useAuth()

  const [activeMenu, setActiveMenu] = useState<ProfileMenu>(ProfileMenu.LESSONS)

  const { data: studentPortalSettings, isLoading } = useGetStudentPortalSettings(school.id)

  useEffect(() => {
    const hash = router.asPath.split('#')[1]
    setActiveMenu((hash as ProfileMenu) || ProfileMenu.LESSONS)
  }, [router.asPath])

  const getClassName = (menu: string) => {
    const className = 'cursor-pointer text-center py-2 '
    if (menu !== activeMenu) return className + 'border-b'
    return className + 'border-b-primary border-b-2'
  }

  const handleChangeMenu = (menu: ProfileMenu) => {
    router
      .push({ pathname: `/profile`, query: { school: school.url ?? '' }, hash: menu })
      .then(() => {
        setActiveMenu(menu)
      })
  }

  useEffect(() => {
    if (!isLoading) {
      if (!school) {
        toast.error(t('school:profile.schoolNotFound') as string)
        router.push('/')
      } else if (!studentPortalSettings?.studentLogin || !auth.firstName) {
        toast.error(t('school:profile.profileNotEnabled') as string)
        router.push(`/@${school.url ?? ''}`)
      }
    }
  }, [isLoading])

  const isStudent = !auth?.isStudentParent || !!auth.currentlyActiveChild

  const tabs = !isStudent ? parentTabs : studentTabs

  return (
    <>
      <LayoutHead school={school} site={site} />
      <div className="align-center flex h-full w-full flex-row items-start justify-center px-4">
        {isMobile || isTablet ? (
          <MobileNavigationBar tabs={heroTemplateTabs} school={school} site={site} />
        ) : (
          <HeroNavBar site={site} school={school} tabs={heroTemplateTabs} />
        )}

        <div className={'mt-24 w-full md:mt-[100px] md:w-[1200px] md:p-0'}>
          <div className="line-height-[1.3rem] z-40 mb-8 w-full">
            <div className="mb-4 overflow-x-auto">
              <div className="flex min-w-max gap-2">
                {tabs.map(menu => {
                  return (
                    <div
                      key={`menu-${menu}`}
                      data-testid={`menu-${menu}`}
                      className={getClassName(menu) + ' whitespace-nowrap px-2'}
                      onClick={() => handleChangeMenu(menu)}
                    >
                      {t(`school:profile.menu.${menu}`)}
                    </div>
                  )
                })}
              </div>
            </div>
            {activeMenu === ProfileMenu.LESSONS && <Lessons school={school} courses={courses} />}
            {/* {activeMenu === ProfileMenu.UPCOMING && (
              <UpcomingLessons school={school} courses={courses} />
            )}
            {activeMenu === ProfileMenu.PAST && (
              <UpcomingLessons school={school} courses={courses} isPastLesson />
            )} */}
            {activeMenu === ProfileMenu.PENDING_PAYMENTS && (
              <PaymentRecord school={school} courses={courses} showPaymentState />
            )}
            {activeMenu === ProfileMenu.PAYMENT_HISTORY && (
              <PaymentRecord school={school} courses={courses} showPaidOnly />
            )}
            {activeMenu === ProfileMenu.CREDIT_BALANCE && <CreditBalance school={school} />}
            {activeMenu === ProfileMenu.PROFILE && (
              <div>
                <div className="mb-4 flex w-full flex-col gap-4 rounded-lg border p-3 md:flex-row">
                  <FormAccount />
                </div>

                {/* <NotificationReferences school={school} /> */}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer school={school} site={site} />
    </>
  )
}

export default ProfilePage
