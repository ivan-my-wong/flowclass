import Link from 'next/link'
import { useRouter } from 'next/router'

import clsx from 'clsx'

import ImageAspect from '@/components/Images/ImageAspect'
import Heading from '@/components/Texts/Heading'
import imageUrls from '@/constants/imageUrls'
import CourseDetailInfo from '@/page-components/courses/CourseDetailInfo'
import { Course, Site } from '@/types'

interface CourseCardProps {
  id?: string
  course: Course
  site: Site
  baseUrl: string
  className?: string
  fullWidth?: boolean
}

const CourseTemplateCard = ({
  id,
  course,
  baseUrl,
  site,
  className,
  fullWidth = true,
}: CourseCardProps): JSX.Element => {
  const router = useRouter()
  const isElement = (router.query.isElement as string) === 'true'

  if (!course || !site) {
    return <></>
  }

  // const handleClick = () => {
  //   setIsLoading(true)
  //   router.push(`${baseUrl}/${course.path}`).then(() => {
  //     enrolCourseScrollAction(currentTheme)
  //     setIsLoading(false)
  //   })
  // }

  return (
    <div
      data-testid={`course-card-${course.name.toLowerCase()}`}
      id={id ?? 'course-card'}
      className={clsx({
        'w-full': fullWidth,
        'flex flex-row justify-center justify-items-center align-top': true,
      })}
    >
      <Link
        className={`bg-textContrast flex w-full cursor-pointer flex-col rounded-md p-2 shadow-md`}
        tabIndex={0}
        href={`${baseUrl}/${course.path}`}
        prefetch
        {...(isElement && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        <div className="box-row">
          {course.previewImageUrl && (
            <div className="box-row-full h-full" style={{ flex: 1 }}>
              <ImageAspect
                s3="public"
                src={course.previewImageUrl}
                fallbackSrc={imageUrls.failedImage}
                alt="Course Primary Logo"
                ratio={16 / 9}
                imgClassName="object-cover"
              />
            </div>
          )}

          <div style={{ flex: 2 }}>
            <Heading fontSize="lg" as="h3" id="course-name">
              {course.name}
            </Heading>
          </div>
        </div>
        <div className="border-textDisabled align-center mb-4 mt-2 w-full justify-center border-t" />
        <div>
          <CourseDetailInfo course={course} site={site} />
        </div>
      </Link>
    </div>
  )
}

export default CourseTemplateCard
