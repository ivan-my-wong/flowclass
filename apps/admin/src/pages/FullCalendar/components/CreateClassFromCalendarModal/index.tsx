import { useState } from 'react'

import dayjs from 'dayjs'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import RegularCourseIcon from '@/assets/svgs/courses/RegularCourseIcon'
import WorkshopIcon from '@/assets/svgs/courses/WorkshopIcon'
import { Card } from '@/components/ui/Card'
import ModalDialog from '@/components/ui/ModalDialog'
import Text from '@/components/ui/Text'
import { RegularClassSchedulePeriods } from '@/pages/TeachingService/EditCourse/RegularClassSchedules/RegularClassSchedulePeriods'
import { ClassTypeEnum } from '@/types/course'
import { cn } from '@/utils/cn'

type CreateClassModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTimeSlot?: {
    start: string
    end: string
  }
}

const roundToNearest15Minutes = (date: dayjs.Dayjs) => {
  const minutes = date.minute()
  const remainder = minutes % 15
  const roundedMinutes =
    remainder < 8 ? minutes - remainder : minutes + (15 - remainder)
  return date.minute(roundedMinutes).second(0).millisecond(0)
}

export const CreateClassModal = ({
  open,
  onOpenChange,
  selectedTimeSlot,
}: CreateClassModalProps): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  const [selectedType, setSelectedType] = useState<ClassTypeEnum | null>(null)

  // Round times to nearest 15 minutes
  const startTime = selectedTimeSlot
    ? roundToNearest15Minutes(dayjs(selectedTimeSlot.start))
    : null

  const endTime = selectedTimeSlot
    ? roundToNearest15Minutes(dayjs(selectedTimeSlot.end))
    : null

  const startTimeFormatted = startTime?.format('M/D/YYYY h:mm A')
  const endTimeFormatted = endTime?.format('M/D/YYYY h:mm A')

  // Calculate duration in minutes
  const durationMinutes =
    startTime && endTime ? endTime.diff(startTime, 'minute') : 0

  // Get the day of week (0-6, 0 = Sunday)
  const defaultDay = startTime?.day()

  const form = useForm({
    defaultValues: {
      regularV2: {
        startDate: startTime?.format('YYYY-MM-DD'),
        endDate: null,
        startTime: startTime?.format('HH:mm'),
        endTime: endTime?.format('HH:mm'),
      },
    },
  })

  const supportedTypes = [
    {
      type: ClassTypeEnum.regular,
      icon: <RegularCourseIcon />,
      title: t('teachingService:courseType.regular'),
      description: t('teachingService:courseDescription.regular'),
    },
    {
      type: ClassTypeEnum.regularV2,
      icon: <RegularCourseIcon />,
      title: t('teachingService:courseType.regularV2'),
      description: t('teachingService:courseDescription.regularV2'),
    },
    {
      type: ClassTypeEnum.workshop,
      icon: <WorkshopIcon />,
      title: t('teachingService:courseType.workshop'),
      description: t('teachingService:courseDescription.workshop'),
    },
  ]

  const handleTypeSelect = (type: ClassTypeEnum) => {
    setSelectedType(type)
  }

  return (
    <ModalDialog
      title={t('teachingService:createClassModal.title') as string}
      open={open}
      onOpenChange={onOpenChange}
    >
      <FormProvider {...form}>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {t('teachingService:createClassModal.title')}
            </h2>

            {selectedTimeSlot && startTime?.isValid() && endTime?.isValid() && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <Text className="font-semibold">
                  {t('teachingService:createClassModal.selectedTimeSlot')}:
                </Text>
                <Text>
                  {startTimeFormatted} - {endTimeFormatted} ({durationMinutes}{' '}
                  {t('teachingService:createClassModal.minutes')})
                </Text>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {supportedTypes.map(classType => (
              <Card
                key={classType.type}
                className={cn(
                  'p-6 cursor-pointer border-2 transition-all duration-200',
                  selectedType === classType.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => handleTypeSelect(classType.type)}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {classType.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {classType.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {classType.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedType === ClassTypeEnum.regularV2 && (
            <RegularClassSchedulePeriods />
          )}

          <div className="bg-yellow-50 p-4 rounded-lg mt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Text className="text-white text-xs font-bold">!</Text>
              </div>
              <div>
                <Text className="font-semibold text-yellow-800">
                  {t(
                    'teachingService:createClassModal.needAppointmentsOrMembership'
                  )}
                </Text>
                <Text className="text-yellow-700 text-sm">
                  {t(
                    'teachingService:createClassModal.appointmentsMembershipDescription'
                  )}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </FormProvider>
    </ModalDialog>
  )
}
