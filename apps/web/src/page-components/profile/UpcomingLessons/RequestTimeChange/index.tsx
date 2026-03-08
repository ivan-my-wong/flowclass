import { useCallback, useEffect, useMemo, useState } from 'react'

import { Content, Root, TooltipProvider, Trigger } from '@radix-ui/react-tooltip'
import dayjs from 'dayjs'
import { LucideLoader } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import Form from '@/components/Form'
import InfoDialog from '@/components/Popups/InfoDialog'
import { useGetStudentPortalSettings, useRequestTimeChange } from '@/hooks/useProfile'
import TextAnswerField from '@/page-components/enrol/ApplicationFormSteps/TextAnswerField'
import { ClassType } from '@/types'
import {
  RequestTimeChangeForm,
  SubmitRequestTimeChangeProps,
  UpcomingLesson,
} from '@/types/profile'

import RequestCustomTimeSlot from './RequestCustomTimeSlot'
import RequestExistingLesson from './RequestExistingLesson'

type RequestTimeChangeProps = { data?: UpcomingLesson; schoolName?: string }

const RequestTimeChange = ({ data, schoolName }: RequestTimeChangeProps): React.ReactElement => {
  const { t } = useTranslation()

  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [isCustomTime, setIsCustomTime] = useState(false)

  const formInstance = useForm<RequestTimeChangeForm>()
  const {
    watch,
    reset,
    formState: { isValid },
  } = formInstance

  useEffect(() => {
    reset({
      courseId: data?.course?.id,
      classId: data?.class?.id,
      periodId: data?.periodId,
    })
  }, [data])

  const handleOpen = useCallback(() => {
    setShowInfoDialog(!showInfoDialog)
    reset()
    setIsCustomTime(false)
  }, [showInfoDialog])

  const { mutateAsync: handleSubmit, isLoading } = useRequestTimeChange()

  const handleOnSubmit = async (params: RequestTimeChangeForm) => {
    const { classLessonDate, lessonStartTime, lessonEndTime, reason, classId, classType } = params
    const payload: SubmitRequestTimeChangeProps = {
      institutionId: data?.institutionId,
      requestStartTime: classLessonDate?.toISOString() ?? '',
      requestEndTime: classLessonDate?.toISOString() ?? '',
      lessonId: data?.id,
      reason,
      classId,
    }

    if (isCustomTime || classType === ClassType.appointment) {
      payload.requestStartTime = lessonStartTime?.toISOString() ?? ''
      payload.requestEndTime = lessonEndTime?.toISOString() ?? ''
    }

    await handleSubmit(payload).then(() => {
      handleOpen()
      toast.success(t('profile:requestTimeChange.success') as string)
    })
  }

  const isDisable =
    isLoading ||
    (isCustomTime
      ? !watch('lessonStartTime') || !watch('lessonEndTime')
      : !isValid || !watch('classLessonDate'))

  const { data: studentPortalSettings } = useGetStudentPortalSettings(data?.institutionId ?? 0)
  const settings = studentPortalSettings?.rescheduleSettings
  const minimumHoursBeforeRequest = settings?.minimumHoursBeforeRequest ?? 0

  const isDisabled = useMemo(() => {
    const diffHours = dayjs(data?.startTime).diff(dayjs(), 'hour')
    if (minimumHoursBeforeRequest > 0) {
      return diffHours < minimumHoursBeforeRequest
    }
    return diffHours < 0
  }, [minimumHoursBeforeRequest, data?.startTime])

  const Tooltip = () => {
    return (
      <TooltipProvider delayDuration={0}>
        <Root>
          <Trigger asChild>
            <div>
              <Button className="w-full lg:w-fit" variant="outlined" disabled={true}>
                {t('profile:requestTimeChange.title')}
              </Button>
            </div>
          </Trigger>
          <Content
            sideOffset={5}
            className="bg-white-900 rounded-md border border-gray-200 p-4 shadow-lg"
          >
            {t('profile:requestTimeChange.alertRequestReschedule', {
              count: minimumHoursBeforeRequest,
            })}
          </Content>
        </Root>
      </TooltipProvider>
    )
  }

  return (
    <InfoDialog
      key={'request-time-change'}
      title={t('profile:requestTimeChange.title')}
      description=""
      trigger={
        isDisabled ? (
          <Tooltip />
        ) : (
          <Button className="w-full lg:w-fit" variant="outlined" onClick={handleOpen}>
            {t('profile:requestTimeChange.title')}
          </Button>
        )
      }
      open={showInfoDialog}
      setOpen={handleOpen}
    >
      <Form {...formInstance}>
        <form onSubmit={formInstance.handleSubmit(handleOnSubmit)} className="space-y-4">
          {isCustomTime ? (
            <RequestCustomTimeSlot
              formInstance={formInstance}
              data={data}
              schoolName={schoolName}
              setIsCustomTime={setIsCustomTime}
            />
          ) : (
            <RequestExistingLesson
              formInstance={formInstance}
              data={data}
              schoolName={schoolName}
              setIsCustomTime={setIsCustomTime}
              settings={settings}
            />
          )}
          <TextAnswerField
            name={'reason'}
            labelClass={'raw-input-label mb-0 text-wrap'}
            label={t('profile:requestTimeChange.reason')}
            required={true}
            form={formInstance}
            type="text"
          />
          <Button className="flex w-full gap-x-2" type="submit" disabled={isDisable}>
            {isLoading && <LucideLoader className="animate-spin" />}
            {t('common:action.confirm')}
          </Button>
        </form>
      </Form>
    </InfoDialog>
  )
}

export default RequestTimeChange
