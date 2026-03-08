import Head from 'next/head'

import moment from 'moment'
import { NextSeo } from 'next-seo'

import imageUrls from '@/constants/imageUrls'
import { Course, School } from '@/types/index'
import { getPriceRangeFromCourse, getShortestDurationFromCourse } from '@/utils/calculateCourse'
import { getCourseTimeslots, getRegularScheduleAfterTodayOnly } from '@/utils/calculateTime'
import { getMediaFileUrl } from '@/utils/convert'
import { longDescriptionToString, nonFalsyJoin } from '@/utils/flatten'
import { clearSeparator, stripHTML } from '@/utils/sanitize'
import { getBaseSiteUrl } from '@/utils/string.utils'

import CommonSeoHeadElement from '../CommonSeoHeadElement'

type CourseHeadElementProps = {
  course: Course
  school: School
}

const defaultCourseInstance = [
  {
    // Online self-paced course that takes 2 days to complete.
    '@type': 'CourseInstance',
    courseMode: 'Online',
    courseWorkload: 'PT1H',
  },
]

export const compileCourseInstance = (course: Course, school: School) => {
  const duration = getShortestDurationFromCourse(course)
  const timeslotsArray = getCourseTimeslots(course)
  const toBeReturned: Record<string, any> = []

  const durationNumber = Number(getShortestDurationFromCourse(course))
  if (!duration || !isNaN(durationNumber) || !timeslotsArray) {
    return defaultCourseInstance
  }

  course.classes?.forEach(classItem => {
    let courseSchedule = undefined
    const currentSchedule = getRegularScheduleAfterTodayOnly(classItem)
    const thisSchedule = currentSchedule[0]

    const thisLesson = thisSchedule?.lessons

    if (thisLesson && thisLesson.length && currentSchedule && currentSchedule.length > 0) {
      const startTime = thisLesson[0].startTime
      const endTime = thisLesson[thisLesson.length - 1].endTime

      courseSchedule = {
        '@type': 'Schedule',
        duration: `PT${duration}M`,
        repeatFrequency: 'Weekly',
        repeatCount: thisLesson?.length ?? 1,
        startDate: moment(startTime).format('YYYY-MM-DD'),
        endDate: moment(endTime).format('YYYY-MM-DD'),
      }
      toBeReturned.push({
        '@type': 'CourseInstance',
        courseMode: 'Onsite',
        location: school.name,
        courseSchedule,
        courseWorkload:
          !isNaN(durationNumber) && thisLesson?.length > 0
            ? `PT${durationNumber * thisLesson?.length}M`
            : 'PT1H',
      })
    }
  })

  return toBeReturned.length > 0 ? toBeReturned : defaultCourseInstance
}

export const CourseHeadElement = ({ school, course }: CourseHeadElementProps): JSX.Element => {
  const site = course.site

  const schoolUrl = getBaseSiteUrl({ site, school })
  const seoUrl = getBaseSiteUrl({ site, school, course })

  const seoTitle = course.seoContent
    ? course.seoContent.metaTitle
    : `${course?.name} / ${school.name}`
  const fallbackLogoUrl = `https://flowclass.io${imageUrls.courseSchemaLogo}`
  const seoDesc = course.seoContent
    ? course.seoContent.metaDescription
    : nonFalsyJoin(
        [
          course.name,
          school.name,
          Array.from(
            stripHTML(clearSeparator(longDescriptionToString(course.longDescriptions))) ?? ''
          )
            ?.slice(0, 120)
            .join(''),
        ],
        ' / '
      )

  const seoTags = course.tags?.map(tag => tag.key) ?? undefined
  const seoTagsValue = course.tags?.map(tag => nonFalsyJoin(tag.value)) ?? undefined

  const priceInfo = getPriceRangeFromCourse(course)
  const price = priceInfo.priceRange[0]

  // Merge School, Site, and more into seo object
  // Online: All class lectures, assignments, and tests can be completed virtually.
  // Onsite: The course is taught in person at a physical location.
  // Blended: The course has both online and in-person components.

  const seo = {
    '@context': 'https://schema.org/',
    '@id': seoUrl,
    '@type': 'Course',
    name: course.name,
    description: seoDesc,
    publisher: {
      '@type': 'Organization',
      name: school.name,
      urL: schoolUrl,
    },
    provider: {
      '@type': 'Organization',
      name: school.name,
      urL: schoolUrl,
    },
    offers: [
      {
        '@type': 'Offer',
        category: 'Paid',
        priceCurrency: site.currency,
        price,
      },
    ],
    image: [course.previewImageUrl ?? fallbackLogoUrl],
    datePublished: course.updatedAt,
    inLanguage: site.language,
    about: seoTags,
    teaches: seoTagsValue,
    availableLanguage: [site.language],
    hasCourseInstance: compileCourseInstance(course, school),
  }

  return (
    <>
      <CommonSeoHeadElement site={course.site} school={school} course={course} />

      <NextSeo
        title={seoTitle}
        description={seoDesc}
        openGraph={{
          url: seoUrl,
          title: seoTitle,
          description: seoDesc,
          images: [
            {
              url: course.previewImageUrl
                ? getMediaFileUrl(course.previewImageUrl)
                : fallbackLogoUrl,
              width: 400,
              height: 400,
              alt: seoTitle,
            },
          ],
          type: 'website',
        }}
      />

      {/* <VideoJsonLd
        name={course.name}
        description={course.shortDescription}
        contentUrl={course.previewVideoUrl}
        embedUrl={course.previewVideoUrl}
        uploadDate={course.createdAt}
        thumbnailUrls={[course.previewImageUrl ?? fallbackLogoUrl]}
      /> */}

      <Head>
        <script type="application/ld+json">{JSON.stringify(seo)}</script>
      </Head>
    </>
  )
}

export default CourseHeadElement
