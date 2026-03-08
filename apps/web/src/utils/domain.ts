import { GetServerSideProps, GetServerSidePropsContext } from 'next'

import { getCourseByUrl, getCourses } from '@/api/courseApi'
import { getSchoolByUrl } from '@/api/schoolApi'
import { getSiteByDomain } from '@/api/siteApi'
import { setServerTextVersion } from '@/stores/textVersionStore'
import { Course, CourseComment, School, SchoolWebpageSettings, Site, SiteSettings } from '@/types'

import { getDomainFromReq } from './sanitize'
import { validateDomain } from './validate'

export type SiteProps = {
  site: Site
  siteSettings: SiteSettings
  school: School
  webpageSettings: SchoolWebpageSettings
  domain: string
}

export type PathType = 'school' | 'course' | 'default' | 'elements-list-course'

export type SchoolProps = {
  domain: string
  school: School
  courses: Course[]
  schoolComments?: CourseComment[]
  webpageSettings?: SchoolWebpageSettings
  site: Site
  siteSettings?: SiteSettings
}

export type CourseProps = {
  school: School
  course: Course
  courses?: Course[]
}

export type CustomPathProps = {
  siteProps: SiteProps
  schoolProps: SchoolProps
  courseProps: CourseProps
  errorMessage?: string
  pathType: PathType
}

export const getPathRelatedData: GetServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  try {
    const siteProps = {} as unknown as SiteProps
    const schoolProps = {} as unknown as SchoolProps
    const courseProps = {} as unknown as CourseProps
    const props: CustomPathProps = {
      siteProps,
      schoolProps,
      courseProps,
      pathType: 'default',
    }
    const customPath = params?.customPath as string[]
    const domain = await getDomainFromReq(req)

    if (!domain || !validateDomain(domain)) {
      return {
        notFound: true,
      }
    }

    if (customPath?.length > 2) {
      throw new Error('UNKNOWN_CUSTOM_PATH')
    }

    const site = await getSiteByDomain(domain)

    // Check if a site exists with the domain sent by the user
    if (!site) {
      return {
        notFound: true,
      }
    }
    props.siteProps.site = site
    let schoolPath = ''
    let coursePath = ''
    if (customPath?.length === 2) {
      props.pathType = 'course'
      if (customPath[0] && customPath[0] !== 'SPECIAL_SCHOOL_PLACEHOLDER') {
        schoolPath = customPath[0]
      } else {
        schoolPath = ''
      }

      coursePath = customPath[1]
    } else if (customPath?.length === 1) {
      props.pathType = 'school'
      schoolPath = customPath[0]
    } else {
      props.pathType = 'default'
    }

    const school: School = await getSchoolByUrl(domain, schoolPath)

    if (!school) {
      return {
        notFound: true,
      }
    }

    props.schoolProps.school = school
    props.siteProps.domain = domain

    if (school?.institutionSetting?.textVersion) {
      setServerTextVersion(school.institutionSetting.textVersion)
    }

    if (props.pathType === 'course') {
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

      props.courseProps.course = course
    } else {
      const courses = await getCourses(school.id)
      props.courseProps.courses = courses.content ?? []
    }

    return {
      props,
    }
  } catch (e: any) {
    return {
      props: {
        errorMessage: e.message,
      },
    }
  }
}

export const exportRedirectUrl = (domain: string, schoolUrl: string, coursePath: string) => {
  return `https://${domain}/enrol/success-payment?school=${schoolUrl ?? ''}&course=${coursePath}`
}

export const exportDomain = (customDomain: string, siteUrl: string) => {
  return validateDomain(customDomain) ? customDomain : siteUrl
}
