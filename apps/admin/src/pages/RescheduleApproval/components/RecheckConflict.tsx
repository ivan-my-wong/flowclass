import { useState } from 'react'

import { Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { CiWarning } from 'react-icons/ci'

import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import { useGetDetailRescheduleApproval } from '@/hooks/useRescheduleApproval'
import ValidationItem from '@/pages/TeachingService/EditCourse/ValidateSessionModal/ValidationItem'
import {
  AvailabilityStatus,
  RequestTimeChange,
} from '@/types/rescheduleApproval'

type RecheckConflictProps = {
  data: RequestTimeChange
}

const RecheckConflict = ({ data }: RecheckConflictProps) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState<boolean>(false)

  const { mutateAsync: handleValidate, isLoading: loadValidate } =
    useGetDetailRescheduleApproval()

  const handleOpenChange = () => {
    setOpen(!open)
  }

  const [classConflicts, setClassConflicts] =
    useState<RequestTimeChange['conflict']>()

  const handleValidateTimeslot = () => {
    handleValidate(data.id).then(res => {
      setClassConflicts(res.conflict)
    })
  }

  const renderButton = () => {
    let textColor = 'text-orange-500'
    let bgColor = 'bg-orange-100'
    let title = t('student:rescheduleApproval.fullyBooked')
    if (data.availabilityStatus === AvailabilityStatus.AVAILABLE) {
      textColor = 'text-white'
      bgColor = 'bg-primary'
      title = t('student:rescheduleApproval.checkAvailability')
    }
    if (data.availabilityStatus === AvailabilityStatus.CONFLICT) {
      textColor = 'text-red-500'
      bgColor = 'bg-red-100'
      title = t('student:rescheduleApproval.conflict')
    }
    return (
      <button
        type="button"
        onClick={handleValidateTimeslot}
        className={`${textColor} ${bgColor} px-2 rounded-md font-bold text-center cursor-pointer text-sm py-2 mt-1`}
      >
        {title}
      </button>
    )
  }

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Trigger asChild>{renderButton()}</Trigger>
      <Portal>
        <StyledOverlay />

        <StyledContent>
          <Title>{t(`teachingService:validate.conflictsDetection`)}</Title>
          <div className="text-sm text-gray-500">
            {t(`teachingService:validate.conflictsDetectionDesc`)}
          </div>
          <Separator />

          {loadValidate && (
            <div className="flex justify-center items-center h-[200px]">
              <div className="animate-spin h-6 w-6 border-4 border-t-transparent rounded-full border-primary" />
            </div>
          )}

          {!!classConflicts?.classroom?.length && (
            <div>
              <div className="flex gap-2 items-center text-tertiary mb-4">
                <CiWarning size={24} />
                {t(`teachingService:validate.classConflict`)}
              </div>
              <div className="space-y-4 pl-2">
                {classConflicts?.classroom.map((classes, key) => {
                  return (
                    <ValidationItem
                      key={classes.id}
                      classes={classes}
                      index={key}
                      isClassroom
                    />
                  )
                })}
              </div>
            </div>
          )}

          {!!classConflicts?.teacher?.length && (
            <div className="mt-4">
              <div className="flex gap-2 items-center text-tertiary mb-4">
                <CiWarning size={24} />
                {t(`teachingService:validate.teacherConflict`)}
              </div>
              <div className="space-y-4 pl-2">
                {classConflicts?.teacher?.map((classes, key) => {
                  return (
                    <ValidationItem
                      key={classes.id}
                      classes={classes}
                      index={key}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {!classConflicts?.classroom?.length &&
            !classConflicts?.teacher?.length && (
              <div className="flex justify-center items-center h-[200px]">
                <div className="text-success">
                  {t(`teachingService:validate.noConflict`)}
                </div>
              </div>
            )}

          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
}

export default RecheckConflict
