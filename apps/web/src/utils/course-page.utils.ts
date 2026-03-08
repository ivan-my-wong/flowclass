import { getCourseByUrl } from '@/api/courseApi'
import { getSchoolByUrl } from '@/api/schoolApi'
import { CourseDetailProps } from '@/types'

export const getCourseDetailProps = async ({
  domain,
  schoolUrl = '',
  courseUrl,
}: {
  domain: string
  schoolUrl?: string
  courseUrl: string
}): Promise<CourseDetailProps | null> => {
  const props = {} as CourseDetailProps
  // Change this afterwards. Now it's hard coding the schol ID.
  const course = await getCourseByUrl({ domain, schoolUrl, courseUrl })
  props.course = course

  if (!props.course || !props.course.institutionId) {
    return null
  }

  props.school = await getSchoolByUrl(domain, schoolUrl)

  if (!props.school) {
    return null
  }

  return props
}
