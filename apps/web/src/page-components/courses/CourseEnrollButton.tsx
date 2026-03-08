import { useEffect, useMemo, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { MdOutlineContactSupport } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import { Desktop } from '@/hooks/useResponsive'
import { Course, RecruitPeriodStatus } from '@/types'
import { checkRecruitPeriodStatus, isAnyClassesAvailable } from '@/utils/calculateTime'

import ModalEnrollDialog from './ModalEnrollDialog'

type CourseEnrollButtonProps = {
  showEnquiryCard: boolean
  setShowEnquiryCard: (value: boolean) => void
  course: Course
}

const CourseEnrollButton = ({
  showEnquiryCard,
  setShowEnquiryCard,
  course,
}: CourseEnrollButtonProps): JSX.Element => {
  const { t } = useTranslation()

  const [recruitmentStatus, setRecruitmentStatus] = useState<RecruitPeriodStatus>(
    checkRecruitPeriodStatus(course)
  )
  const [displayApplicationClosed, setDisplayApplicationClosed] = useState<boolean>(false)
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

  const havePrerequisites = useMemo(() => {
    if (!course.prerequisites?.groups) return false
    return course.prerequisites?.groups.some(group => group?.conditions?.length > 0)
  }, [course])

  const { requireEmailVerification } = course

  return (
    <>
      {/* disabled for now, may need in the future */}
      {/* {displayApplicationClosedButton && (
        <Button style={{ width: '100%' }} variant="outlinedPlain" disabled>
          <div className="box-row">
            <MdOutlineRemoveCircleOutline />
            {t(`course:courseEnrollButton.applicationClosed`)}
          </div>
        </Button>
      )} */}

      {(displayApplicationClosed || displayContactButton) && (
        <Desktop className="w-full flex-col items-center">
          <Button className="w-full" variant="outlinedPlain">
            <div className="box-row-full">
              <MdOutlineContactSupport />
              <div className="box-col-full">
                <p>{t(`course:courseEnrollButton.contact`)}</p>
                {recruitmentStatus !== RecruitPeriodStatus.inProgress && (
                  <p className="text-sm font-normal">
                    {t(`course:courseEnrollButton.${recruitmentStatus}`)}
                  </p>
                )}
              </div>
            </div>
          </Button>
          {/* <Button
            className="flex gap-x-2"
            style={{ width: '100%' }}
            variant="outlinedPlain"
            id="enquiry-button"
            onClick={() => {
              if (showEnquiryCard) {
                setShowEnquiryCard(false)
              } else {
                setShowEnquiryCard(true)
              }
            }}
          >
            {showEnquiryCard ? <BiChevronUp /> : <BiChevronDown />}
            {t(`course:enquire`)}
          </Button> */}
        </Desktop>
      )}
      {!displayApplicationClosed && !displayContactButton && (
        <div className="box-col p-0">
          <ModalEnrollDialog
            havePrerequisites={havePrerequisites}
            requireEmailVerification={requireEmailVerification}
          />
        </div>
      )}
    </>
  )
}

export default CourseEnrollButton
