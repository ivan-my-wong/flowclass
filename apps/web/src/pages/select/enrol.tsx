import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'

import { getCourseByUrl } from '@/api/courseApi'
import { getSchoolByUrl } from '@/api/schoolApi'
import { useGlobalTimezone } from '@/hooks/useGlobalTimezone'
import BareboneTemplateLayout from '@/layouts/BareboneTemplateLayout'
import DefaultLayout from '@/layouts/DefaultLayout'
import HeroTemplateLayout from '@/layouts/HeroTemplateLayout'
import TemplateLayout from '@/layouts/VerticalTemplateLayout'
import ApplicationFormCourseCard from '@/page-components/enrol/CourseInformationComponents/ApplicationFormCourseCard'
import ApplyFromWishlistFlow from '@/page-components/schools/wishlist/ApplyFromWishlistFlow'
import { EnrolStateProvider } from '@/stores/enrolContext'
import { wishlistState } from '@/stores/wishlist'
import { CourseWithQuotaValueClasses, School, SiteSettings } from '@/types'
import { heroTemplateTabs, templateTabs, WebsiteTemplate } from '@/types/websiteTemplate'
import { getDomainFromReq } from '@/utils/sanitize'
import { validateDomain } from '@/utils/validate'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}: GetServerSidePropsContext) => {
  const { school: schoolPath, course: coursePath } = query as Record<string, string>
  const domain = await getDomainFromReq(req)
  if (!domain || !validateDomain(domain) || !coursePath || coursePath === '') {
    throw new Error('Invalid queries')
  }

  const school: School = await getSchoolByUrl(domain, schoolPath)

  if (!school) {
    throw new Error('Invalid school')
  }

  const course = await getCourseByUrl({
    domain,
    schoolUrl: schoolPath,
    courseUrl: coursePath,
  })

  if (!course) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      school,
      course,
      siteSetting: school.siteSetting,
    },
  }
}

interface EnrolCrousePageProps {
  school: School
  course: CourseWithQuotaValueClasses
  siteSetting: SiteSettings
}

const EnrollPage = ({ school, course, siteSetting }: EnrolCrousePageProps): JSX.Element => {
  useGlobalTimezone(course?.site)
  const { t } = useTranslation()

  const [wishlist, setWishlist] = useRecoilState(wishlistState)

  const siteTitle = `Enroll multiple courses`.replace(/\s+-\s+/g, '')
  const seoTitle = `${siteTitle}: ${t('enrol:siteTitle')}`

  useEffect(() => {
    setWishlist(prev => ({
      ...prev,
      currentEnrolForm: undefined,
      currentCourse: undefined,
      currentStep: 0,
    }))
  }, [])

  const Layouts = {
    [WebsiteTemplate.Minimal]: DefaultLayout,
    [WebsiteTemplate.Hero]: HeroTemplateLayout,
    [WebsiteTemplate.Vertical]: TemplateLayout,
    [WebsiteTemplate.Barebone]: BareboneTemplateLayout,
  }

  const renderLayout = (Layout: any, additionalProps = {}) => (
    <Layout
      school={school}
      site={wishlist.currentCourse?.site || course.site}
      course={wishlist.currentCourse || course}
      {...additionalProps}
    >
      <Head>
        <title>{seoTitle}</title> {/* Set page title */}
      </Head>
      <div
        className={`box-col ${
          Layout === DefaultLayout
            ? 'mt-[-1rem] w-full justify-start p-0 md:mt-0'
            : 'bg-background w-full justify-start md:p-4 lg:p-6'
        }`}
      >
        <EnrolStateProvider
          value={{
            school,
            course: wishlist.currentCourse || course,
            siteSetting,
          }}
        >
          <ApplyFromWishlistFlow
            sidebar={
              <ApplicationFormCourseCard
                currentEnrolForm={wishlist.currentEnrolForm}
                course={wishlist.currentCourse}
              />
            }
          />
        </EnrolStateProvider>
      </div>
    </Layout>
  )

  if (school.institutionSetting?.templates) {
    if (school.institutionSetting?.templates == WebsiteTemplate.Minimal) {
      return renderLayout(Layouts[WebsiteTemplate.Minimal])
    } else if (school.institutionSetting?.templates == WebsiteTemplate.Hero) {
      return renderLayout(Layouts[WebsiteTemplate.Hero], {
        courses: [course],
        tabs: heroTemplateTabs,
        currentCourse: course,
      })
    } else if (school.institutionSetting?.templates == WebsiteTemplate.Vertical) {
      return renderLayout(Layouts[WebsiteTemplate.Vertical], {
        tabs: templateTabs,
        currentCourse: wishlist.currentCourse || course,
      })
    } else if (school.institutionSetting?.templates == WebsiteTemplate.Barebone) {
      return (
        <BareboneTemplateLayout school={school} site={wishlist.currentCourse?.site || course.site}>
          <Head>
            <title>{seoTitle}</title> {/* Set page title */}
          </Head>

          <EnrolStateProvider
            value={{
              school,
              course: wishlist.currentCourse || course,
              siteSetting,
            }}
          >
            <div className="box-col">
              <ApplyFromWishlistFlow
                sidebar={<ApplicationFormCourseCard course={wishlist.currentCourse || course} />}
              />
            </div>
          </EnrolStateProvider>
        </BareboneTemplateLayout>
      )
    }
  }

  return renderLayout(Layouts[WebsiteTemplate.Hero], {
    courses: [course],
    tabs: heroTemplateTabs,
  })
}

export default EnrollPage
