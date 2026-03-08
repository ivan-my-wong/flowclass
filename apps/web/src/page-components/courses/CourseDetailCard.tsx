import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'

import CourseEnquiryCard from '@/components/PresetCards/CourseEnquiryCard'
import { NotMobile } from '@/hooks/useResponsive'
import { Course } from '@/types/course'
import { School } from '@/types/school'
import { Site } from '@/types/site'
import { checkCourseScheduleAfterToday } from '@/utils/calculateTime'

import CourseDetailInfo from './CourseDetailInfo'

const CourseEnrollButton = dynamic(() => import('./CourseEnrollButton'), { ssr: false })

const CourseDetailCard = ({
  course,
  school,
  site,
}: {
  course: Course
  school: School
  site: Site
}): JSX.Element => {
  const { t } = useTranslation()

  const [showEnquiryCard, setShowEnquiryCard] = useState(false)
  useEffect(() => {
    if (checkCourseScheduleAfterToday(course)) {
      setShowEnquiryCard(true)
    }
  }, [course])

  return (
    <NotMobile className="box-col h-full w-full shrink-0 p-0 lg:w-[30%]">
      <div className="box-col sticky top-4 h-full w-full  justify-start p-0">
        <div className="box-col items-start justify-start text-xl font-bold">{course.name}</div>

        <div className="box-col gap-2">
          <CourseDetailInfo course={course} site={site} />
        </div>
        <div className="box-col">
          <CourseEnrollButton
            course={course}
            showEnquiryCard={showEnquiryCard}
            setShowEnquiryCard={setShowEnquiryCard}
          />
          <div className="w-full">
            {showEnquiryCard && <CourseEnquiryCard course={course} site={site} school={school} />}
          </div>
        </div>
      </div>
    </NotMobile>
  )
}

export default CourseDetailCard
