import { useMemo } from 'react'

import { CaretRightIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { ReactDatePickerProps } from 'react-datepicker'
import { FieldValues, UseFormReturn } from 'react-hook-form'

import Button from '@/components/Buttons/Button'
import { useGetTeachingServiceOpts } from '@/hooks/useProfile'
import DateField from '@/page-components/enrol/ApplicationFormSteps/DateField'
import { UpcomingLesson } from '@/types/profile'

const questionClassNames = 'raw-input-label mb-0 text-wrap'

type IProps = {
  data?: UpcomingLesson
  schoolName?: string
  formInstance: UseFormReturn<FieldValues, any, undefined>
  setIsCustomTime: (value: boolean) => void
}

const RequestCustomTimeSlot = ({ data, schoolName, formInstance, setIsCustomTime }: IProps) => {
  const { t } = useTranslation()

  const { watch, reset } = formInstance

  const { data: listCourses = [] } = useGetTeachingServiceOpts({
    institutionId: data?.institutionId,
    siteId: data?.siteId,
  })

  const classes = useMemo(() => {
    return listCourses.find(c => c.id === watch('courseId'))?.classes || []
  }, [watch('courseId')])

  const periods = useMemo(() => {
    const _periods = classes.find(c => c.id === watch('classId'))?.periods || []
    return Object.entries(_periods).map(lessonItem => {
      const [recurringScheduleId, lessonDateArray] = lessonItem
      const startDate = lessonDateArray[0]?.split(' ')?.[0]
      const newDate = dayjs(startDate).format('YYYY/MM/DD hh:mm a (dddd)')
      return {
        value: recurringScheduleId,
        label: `${t('profile:requestTimeChange.startsAt')} ${newDate}`,
        data: lessonDateArray,
      }
    })
  }, [classes, watch('classId')])

  return (
    <>
      <div className="flex items-center justify-between rounded-md border py-1 pl-3 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <InfoCircledIcon /> {t('profile:requestTimeChange.infoExisting')}
        </div>
        <Button
          variant="textPrimary"
          iconAfter={<CaretRightIcon />}
          onClick={() => {
            setIsCustomTime(false)
            reset()
          }}
          className="w-[250px]"
        >
          {t('profile:requestTimeChange.requestExistingLesson')}
        </Button>
      </div>
      <div
        className="text-sm"
        dangerouslySetInnerHTML={{
          __html: t('profile:requestTimeChange.desc')
            .replace('\n', '<br/>')
            .replace('{schoolName}', schoolName || ''),
        }}
      />
      <div>
        <div className="space-y-3">
          <DateField
            form={formInstance}
            name={'lessonStartTime'}
            labelClass={questionClassNames}
            label={t('profile:requestTimeChange.lessonStartTime')}
            showTimeSelect
            timeIntervals={15}
            required={true}
          />
          <DateField
            form={formInstance}
            name={'lessonEndTime'}
            labelClass={questionClassNames}
            label={t('profile:requestTimeChange.lessonEndTime')}
            required={true}
            showTimeSelect
            timeIntervals={15}
            inputProps={
              {
                minDate: watch('lessonStartTime'),
              } as ReactDatePickerProps
            }
          />
        </div>
      </div>
    </>
  )
}

export default RequestCustomTimeSlot
