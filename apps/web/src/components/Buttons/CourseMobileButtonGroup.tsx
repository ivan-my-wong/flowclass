import { useEffect, useState } from 'react'

import { LucideChevronDown, LucideChevronUp } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { MdInfoOutline } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import CourseEnquiryCard from '@/components/PresetCards/CourseEnquiryCard'
import CourseEnrollButton from '@/page-components/courses/CourseEnrollButton'
import { Course, RecruitPeriodStatus, School, Site } from '@/types'
import { checkRecruitPeriodStatus, isAnyClassesAvailable } from '@/utils/calculateTime'

export const CourseMobileButtonGroup = ({
  course,
  school,
  site,
}: {
  course: Course
  school: School
  site: Site
}): JSX.Element => {
  const { t } = useTranslation()
  // const router = useRouter()
  // const tuition = getPriceRangeFromCourse(course)[0]
  const [showEnquiryCard, setShowEnquiryCard] = useState(false)
  const [recruitmentStatus, setRecruitmentStatus] = useState<RecruitPeriodStatus>(
    checkRecruitPeriodStatus(course)
  )
  const [displayApplicationClosedButton, setDisplayApplicationClosedButton] =
    useState<boolean>(false)
  const [displayContactButton, setDisplayContactButton] = useState<boolean>(false)

  useEffect(() => {
    const { available, error } = isAnyClassesAvailable(course)

    if (!available) {
      if (error) {
        setRecruitmentStatus(error)
      }
      setDisplayContactButton(true)
      setShowEnquiryCard(true)
    } else {
      setRecruitmentStatus(RecruitPeriodStatus.inProgress)
      setDisplayContactButton(false)
      setShowEnquiryCard(true)
    }
  }, [course])

  return (
    <div className="box-col bg-background border-borderColor fixed bottom-2 z-10 w-[98%] max-w-7xl rounded-md border">
      {(displayApplicationClosedButton || displayContactButton) && (
        <div className="z-1 items-center gap-2">
          {recruitmentStatus !== RecruitPeriodStatus.inProgress && (
            <div className="box-row-full">
              <MdInfoOutline />
              <div className="box-col-full gap-1">
                <p className="font-bold">{t(`course:courseEnrollButton.contact`)}</p>
                <p className="text-center text-sm">
                  {t(`course:courseEnrollButton.${recruitmentStatus}`)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      {showEnquiryCard && <CourseEnquiryCard course={course} site={site} school={school} />}
      <div className="box-row-full gap-0 p-0">
        <div className="w-full p-1">
          <Button
            className="relative h-12 w-full"
            variant="outlinedPlain"
            onClick={() => {
              if (showEnquiryCard) setShowEnquiryCard(false)
              else setShowEnquiryCard(true)
            }}
          >
            <div className="box-row">
              {showEnquiryCard ? <LucideChevronDown /> : <LucideChevronUp />}
              {t(`course:enquire`)}
            </div>
          </Button>
        </div>
        {!displayApplicationClosedButton && !displayContactButton && (
          <div className="w-full p-1">
            <CourseEnrollButton
              course={course}
              showEnquiryCard={showEnquiryCard}
              setShowEnquiryCard={setShowEnquiryCard}
            />
          </div>
        )}
      </div>
    </div>
  )
}
