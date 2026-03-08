import { GetServerSidePropsContext } from 'next'

import { ListData } from '@/types/api'
import { Course, CourseWithQuotaValueClasses } from '@/types/course'
import { RegularSchedulePreview } from '@/types/regularSchedule'
import { School } from '@/types/school'
import { getDomainFromReq } from '@/utils/sanitize'
import { validateDomain } from '@/utils/validate'

import { DataErrorMessage, InstitutionErrorMessage } from './error/errorMessage'
import customFetch, { ApiResponse } from './baseClient'
import { getSchoolByUrl } from './schoolApi'

export const getCourses = async (schoolId: number) => {
  const { data: listData } = await customFetch<ListData<Course>>('/student/courses', {
    query: { institutionId: schoolId?.toString() },
  })
  return listData
}

export const getCoursesWithFilter = async (schoolId: number) => {
  const queryParams: { [key: string]: string } = {}
  const searchParams = new URLSearchParams(window.location.search)
  for (const [key, value] of searchParams.entries()) {
    queryParams[key] = value
  }

  const { data: listData } = await customFetch<ListData<Course>>('/student/courses/search', {
    query: { institutionId: schoolId?.toString() },
  })

  return listData
}

export const getCourseByUrl = async ({
  domain,
  schoolUrl = '',
  courseUrl,
}: {
  domain: string
  schoolUrl?: string
  courseUrl: string
}): Promise<CourseWithQuotaValueClasses> => {
  const { data: course } = await customFetch<CourseWithQuotaValueClasses>(
    '/student/courses/detail',
    {
      query: { domain, institutionUrl: schoolUrl, courseUrl },
    }
  )
  return course
}

export const getCourseById = async (courseId: number) => {
  const { data: course } = await customFetch<Course>('/student/courses', {
    query: { id: courseId.toString() },
  })
  return course
}

export const getAppointmentSchedule = async (courseId: number) => {
  const { data: course } = await customFetch<Course>(
    '/student/enroll-courses/appointment-schedule',
    {
      query: { courseId: courseId.toString() },
    }
  )
  return course
}

export const getRecurringCourseStartLesson = async (
  lessonDateId: number,
  siteId: number,
  institutionId: number,
  numberOfLessons: number
) => {
  const { data: lesson } = await customFetch<any>('/student/recurring-lessons/starting-lessons', {
    query: {
      ids: lessonDateId.toString(),
      siteId: siteId.toString(),
      institutionId: institutionId.toString(),
      numberOfLessons: numberOfLessons.toString(),
    },
  })

  return lesson
}

export const previewRecurringCourseLessons = async (
  startDate: string,
  lessonDateId: number,
  classId: number,
  institutionId: number,
  priceOptionId?: number
): Promise<string[]> => {
  const queryParams: any = {
    date: startDate,
    lessonDateId: lessonDateId.toString(),
    classId: classId.toString(),
    institutionId: institutionId.toString(),
  }

  if (priceOptionId) {
    queryParams.priceOptionId = priceOptionId.toString()
  }

  const { data } = await customFetch<string[]>(
    '/student/recurring-lessons/single-class-recurring-lessons',
    {
      query: queryParams,
    }
  )

  return data
}

export const fetchSchoolOnly = async (
  req: GetServerSidePropsContext['req'],
  query?: Record<string, string>
): Promise<School | null> => {
  const { school: schoolPath } = query as Record<string, string>
  const domain = await getDomainFromReq(req)
  if (!domain || !validateDomain(domain)) {
    return null
  }

  try {
    return await getSchoolByUrl(domain, schoolPath)
  } catch (error) {
    return null
  }
}

export const fetchSchoolAndCourse = async (
  req: GetServerSidePropsContext['req'],
  query?: Record<string, string>
): Promise<{ school?: School; course?: Course; token?: string; errorMessage?: string | null }> => {
  if (!query) {
    return { errorMessage: InstitutionErrorMessage.INVALID_DOMAIN }
  }
  const { school: schoolPath, course: coursePath, token } = query

  const domain = await getDomainFromReq(req)
  if (!domain || !validateDomain(domain) || !coursePath || coursePath === '') {
    return { errorMessage: InstitutionErrorMessage.INVALID_DOMAIN }
  }

  let school: School
  try {
    school = await getSchoolByUrl(domain, schoolPath)
  } catch (error) {
    return { errorMessage: InstitutionErrorMessage.INSTITUTION_NOT_FOUND }
  }

  const course: Course = await getCourseByUrl({
    domain,
    schoolUrl: schoolPath,
    courseUrl: coursePath,
  })

  if (!course) {
    return { errorMessage: DataErrorMessage.COURSE_NOT_FOUND }
  }

  return { school, course, token, errorMessage: null }
}

// export const getSchoolStripeConnection = async (institutionId: string) => {
//   const { data: result } = await customFetch<StripeConnectionResponse>(
//     '/student/enroll-courses/stripe-connection',
//     {
//       method: 'GET',
//       query: { institutionId },
//     }
//   )

//   return result
// }

export const sendEmailVerification = async ({
  courseId,
  email,
}: {
  courseId: number
  email: string
}): Promise<{
  message?: string
}> => {
  const { data: result } = await customFetch<
    ApiResponse<{
      message?: string
    }>
  >('/student/courses/email-verification', {
    method: 'POST',
    body: { courseId, email },
  })

  return result
}

export async function getRegularSchedulePreview({
  institutionId,
  scheduleId,
  startingScheduleIndex = 0,
  previewPeriodCount = 5,
}: {
  institutionId: number
  scheduleId: number
  startingScheduleIndex: number
  previewPeriodCount: number
}): Promise<RegularSchedulePreview> {
  const res = await customFetch<RegularSchedulePreview>(`/student/regular-schedules/preview`, {
    method: 'GET',
    query: {
      scheduleId: String(scheduleId),
      startingScheduleIndex: String(startingScheduleIndex),
      previewPeriodCount: String(previewPeriodCount),
      institutionId: String(institutionId),
    },
  })

  return res.data
}
