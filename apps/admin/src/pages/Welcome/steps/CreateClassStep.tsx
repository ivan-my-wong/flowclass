import React, { useEffect, useState } from 'react'

import dayjs from 'dayjs'
import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IoChevronBack } from 'react-icons/io5'

import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { EnrollmentAnswer, QuizStep, ScheduleAnswer } from '@/types/onboarding'

import AppointmentClassPreview from './components/AppointmentClassPreview'
import RecurringClassPreview from './components/RecurringClassPreview'
import RegularClassPreview from './components/RegularClassPreview'

type CreateClassStepProps = {
  formClass: UseFormReturn<Record<string, unknown>>
  formCourse?: UseFormReturn<Record<string, unknown>>
  onSubmitClass: (data: Record<string, unknown>) => Promise<boolean>
  onNext: () => void
  onStepChange?: (step: QuizStep) => void
  onBack?: () => void
  courseId?: number
  onClassDataReady?: (data: {
    classType: ClassTypeEnum
    courseName: string
    coursePath: string
    generatedTimeSlots: TimeSlot[]
  }) => void
}

type TimeSlot = {
  courseId?: number
  classId?: number
  weekDay?: number
  startTime: string
  endTime: string
  duration: number
  lessonRepeatFormat?: {
    repeat: boolean
    every: number
    unit: string
    times: number
    monthDay: number
  }
  repeatFormat?: {
    repeat: boolean
    every: number
    unit: string
    times: number
  }
  deleted?: boolean
  lessons?: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
}

const CreateClassStep: React.FC<CreateClassStepProps> = ({
  formClass,
  formCourse,
  onSubmitClass: _onSubmitClass,
  onNext: _onNext,
  onStepChange,
  onBack: _onBack,
  courseId = 0,
  onClassDataReady,
}) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState<QuizStep>(QuizStep.SCHEDULE)
  const [scheduleAnswer, setScheduleAnswer] = useState<ScheduleAnswer | null>(
    null
  )
  const [enrollmentAnswer, setEnrollmentAnswer] =
    useState<EnrollmentAnswer | null>(null)
  const [selectedClassType, setSelectedClassType] =
    useState<ClassTypeEnum | null>(null)
  const [courseName, setCourseName] = useState('')
  const [coursePath, setCoursePath] = useState('')
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<TimeSlot[]>([])
  const [isGeneratingTimeSlots, setIsGeneratingTimeSlots] = useState(false)

  // Notify parent when step changes
  useEffect(() => {
    onStepChange?.(currentStep)
  }, [currentStep])

  const generateCoursePath = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
  }

  const handleCourseNameChange = (value: string) => {
    setCourseName(value)
    if (value.trim()) {
      setCoursePath(generateCoursePath(value))
    } else {
      setCoursePath('')
    }
  }

  const handleScheduleAnswer = (answer: ScheduleAnswer) => {
    setScheduleAnswer(answer)
    if (answer === ScheduleAnswer.FIXED) {
      setCurrentStep(QuizStep.ENROLLMENT)
    } else {
      setCurrentStep(QuizStep.RESULTS)
    }
  }

  const handleEnrollmentAnswer = (answer: EnrollmentAnswer) => {
    setEnrollmentAnswer(answer)
    setCurrentStep(QuizStep.RESULTS)
  }

  const getRecommendedClassTypes = (): ClassTypeEnum[] => {
    if (
      scheduleAnswer === ScheduleAnswer.FIXED &&
      enrollmentAnswer === EnrollmentAnswer.SAME_END
    ) {
      return [ClassTypeEnum.regularV2]
    }
    if (
      scheduleAnswer === ScheduleAnswer.FIXED &&
      enrollmentAnswer === EnrollmentAnswer.DIFFERENT_END
    ) {
      return [ClassTypeEnum.recurring]
    }
    if (scheduleAnswer === ScheduleAnswer.FLEXIBLE) {
      return [ClassTypeEnum.appointment]
    }
    if (scheduleAnswer === ScheduleAnswer.OTHER) {
      return [ClassTypeEnum.workshop]
    }
    return []
  }

  const handleClassTypeSelect = (classType: ClassTypeEnum) => {
    setSelectedClassType(classType)
    setCurrentStep(QuizStep.COURSE_DETAILS)
  }

  const handleBack = () => {
    if (currentStep === QuizStep.ENROLLMENT) {
      setCurrentStep(QuizStep.SCHEDULE)
    } else if (currentStep === QuizStep.RESULTS) {
      if (scheduleAnswer === ScheduleAnswer.FIXED) {
        setCurrentStep(QuizStep.ENROLLMENT)
      } else {
        setCurrentStep(QuizStep.SCHEDULE)
      }
    } else if (currentStep === QuizStep.COURSE_DETAILS) {
      setCurrentStep(QuizStep.RESULTS)
    } else if (currentStep === QuizStep.TIME_SLOTS) {
      setCurrentStep(QuizStep.COURSE_DETAILS)
    } else if (currentStep === QuizStep.PREVIEW) {
      setCurrentStep(QuizStep.TIME_SLOTS)
    }
    // Note: No back action for 'schedule' step - it's the first step
  }

  const handleCourseDetailsNext = async () => {
    if (courseName && coursePath) {
      setIsGeneratingTimeSlots(true)
      setCurrentStep(QuizStep.TIME_SLOTS)

      // Simulate time slot generation (replace with actual API call)
      setTimeout(() => {
        const tomorrow = dayjs()
          .add(1, 'day')
          .hour(14)
          .minute(0)
          .second(0)
          .millisecond(0)

        const timeSlots: TimeSlot[] = []
        if (selectedClassType === ClassTypeEnum.regularV2) {
          // For regularV2, create time slots with proper V2 structure
          const startTime = tomorrow.toISOString()
          const endTime = tomorrow.add(2, 'hours').toISOString()

          timeSlots.push({
            courseId,
            startTime,
            endTime,
            duration: 120,
            lessonRepeatFormat: {
              repeat: true,
              every: 1,
              unit: 'weeks',
              times: 8,
              monthDay: 1,
            },
          })
        } else if (selectedClassType === ClassTypeEnum.recurring) {
          timeSlots.push({
            classId: 0,
            weekDay: tomorrow.day(),
            startTime: tomorrow.format('HH:mm'),
            endTime: tomorrow.add(2, 'hours').format('HH:mm'),
            duration: 120,
          })
        } else if (selectedClassType === ClassTypeEnum.appointment) {
          // For appointment classes, create availability time slots
          timeSlots.push({
            courseId,
            startTime: tomorrow.format('HH:mm'),
            endTime: tomorrow.add(1, 'hour').format('HH:mm'), // 1 hour duration
            duration: 60,
            repeatFormat: {
              repeat: true,
              every: 1,
              unit: 'days',
              times: 1,
            },
          })
        } else if (selectedClassType === ClassTypeEnum.workshop) {
          // For workshop/event classes, create single event time slot (like Session.tsx)
          const eventStartTime = tomorrow.toISOString()
          const eventEndTime = tomorrow.add(3, 'hours').toISOString() // 3 hour duration

          timeSlots.push({
            courseId,
            startTime: eventStartTime,
            endTime: eventEndTime,
            duration: 180, // 3 hours in minutes
            lessonRepeatFormat: {
              repeat: false, // One-time event
              every: 1,
              unit: 'weeks',
              times: 1,
              monthDay: 1,
            },
            lessons: [
              {
                dayOfWeek: tomorrow.day(),
                startTime: eventStartTime,
                endTime: eventEndTime,
              },
            ],
          })
        }

        setGeneratedTimeSlots(timeSlots)
        setIsGeneratingTimeSlots(false)
        setCurrentStep(QuizStep.PREVIEW)
      }, 1000) // Simulate 2-second delay
    }
  }

  // Auto-advance to next step when course details are filled
  // Removed - user will click "Generate Time Slots" button instead

  // Auto-advance to preview when time slots are generated
  useEffect(() => {
    if (
      currentStep === QuizStep.TIME_SLOTS &&
      generatedTimeSlots.length > 0 &&
      !isGeneratingTimeSlots
    ) {
      setCurrentStep(QuizStep.PREVIEW)
    }
  }, [generatedTimeSlots, isGeneratingTimeSlots, currentStep])

  // Notify parent component about the current state for form data preparation
  useEffect(() => {
    if (currentStep === QuizStep.PREVIEW && selectedClassType) {
      // Set basic form values that don't require courseId/classId
      formClass.setValue('classType', selectedClassType)
      formClass.setValue('className', courseName)
      formClass.setValue('classTuition', '100')
      formClass.setValue('classPriceType', PriceType.PER_LESSON)
      formClass.setValue('classQuota', '20')
      formClass.setValue('courseName', courseName)
      formClass.setValue('coursePath', coursePath)

      // Notify parent component with class data for form preparation
      onClassDataReady?.({
        classType: selectedClassType,
        courseName,
        coursePath,
        generatedTimeSlots,
      })
    }
  }, [
    currentStep,
    selectedClassType,
    courseName,
    coursePath,
    generatedTimeSlots,
    formClass,
    onClassDataReady,
  ])

  // Also update the course form when course details change
  useEffect(() => {
    if (courseName && coursePath && formCourse) {
      formCourse.setValue('courseName', courseName)
      formCourse.setValue('courseLink', coursePath)
    }
  }, [courseName, coursePath, formCourse])

  const renderScheduleStep = () => (
    <div className="space-y-6 px-4">
      <div className="mb-4">
        <Heading size="medium" className="text-left leading-relaxed">
          {t('onboarding:newUserSetup.classSetup.scheduleStep.title')}
        </Heading>
      </div>

      <div className="space-y-4">
        {[
          {
            key: ScheduleAnswer.FIXED,
            label: (
              <>
                {t(
                  'onboarding:newUserSetup.classSetup.scheduleStep.options.fixed.label'
                )}
                <br />
                {t(
                  'onboarding:newUserSetup.classSetup.scheduleStep.options.fixed.example'
                )}
              </>
            ),
            letter: 'A',
          },
          {
            key: ScheduleAnswer.FLEXIBLE,
            label: t(
              'onboarding:newUserSetup.classSetup.scheduleStep.options.flexible.label'
            ),
            letter: 'B',
          },
          {
            key: ScheduleAnswer.OTHER,
            label: t(
              'onboarding:newUserSetup.classSetup.scheduleStep.options.other.label'
            ),
            letter: 'C',
          },
        ].map(option => (
          <button
            key={option.key}
            type="button"
            onClick={() => handleScheduleAnswer(option.key)}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
              scheduleAnswer === option.key
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-1 ${
                  scheduleAnswer === option.key
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {scheduleAnswer === option.key && (
                  <div className="w-2 h-2 bg-white rounded-full transition-opacity duration-200" />
                )}
              </div>
              <div className="flex-1 leading-relaxed">
                <span className="font-medium">{option.letter}.</span>{' '}
                <span className="leading-relaxed">{option.label}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderEnrollmentStep = () => (
    <div className="space-y-6 px-4">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-1 h-auto"
        >
          <IoChevronBack className="w-5 h-5" />
        </Button>
        <Heading size="medium" className="text-left leading-relaxed">
          {t('onboarding:newUserSetup.classSetup.enrollmentStep.title')}
          <br />
          {t('onboarding:newUserSetup.classSetup.enrollmentStep.subtitle')}
        </Heading>
      </div>

      <div className="space-y-4">
        {[
          {
            key: EnrollmentAnswer.SAME_END,
            label: (
              <>
                {t(
                  'onboarding:newUserSetup.classSetup.enrollmentStep.options.sameEnd.label'
                )}
                <br />
                {t(
                  'onboarding:newUserSetup.classSetup.enrollmentStep.options.sameEnd.example'
                )}
              </>
            ),
            letter: 'A',
          },
          {
            key: EnrollmentAnswer.DIFFERENT_END,
            label: (
              <>
                {t(
                  'onboarding:newUserSetup.classSetup.enrollmentStep.options.differentEnd.label'
                )}
                <br />
                {t(
                  'onboarding:newUserSetup.classSetup.enrollmentStep.options.differentEnd.example'
                )}
              </>
            ),
            letter: 'B',
          },
          {
            key: EnrollmentAnswer.OTHER,
            label: t(
              'onboarding:newUserSetup.classSetup.enrollmentStep.options.other.label'
            ),
            letter: 'C',
          },
        ].map(option => (
          <button
            key={option.key}
            type="button"
            onClick={() => handleEnrollmentAnswer(option.key)}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
              enrollmentAnswer === option.key
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-1 ${
                  enrollmentAnswer === option.key
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {enrollmentAnswer === option.key && (
                  <div className="w-2 h-2 bg-white rounded-full transition-opacity duration-200" />
                )}
              </div>
              <div className="flex-1 leading-relaxed">
                <span className="font-medium">{option.letter}.</span>{' '}
                <span className="leading-relaxed">{option.label}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderResultsStep = () => {
    const recommendedTypes = getRecommendedClassTypes()
    const allClassTypes = [
      {
        type: ClassTypeEnum.regularV2,
        name: t(
          'onboarding:newUserSetup.classSetup.resultsStep.classTypes.regular.name'
        ),
        description: t(
          'onboarding:newUserSetup.classSetup.resultsStep.classTypes.regular.description'
        ),
      },
      {
        type: ClassTypeEnum.recurring,
        name: t(
          'onboarding:newUserSetup.classSetup.resultsStep.classTypes.recurring.name'
        ),
        description: t(
          'onboarding:newUserSetup.classSetup.resultsStep.classTypes.recurring.description'
        ),
      },
      {
        type: ClassTypeEnum.appointment,
        name: t(
          'onboarding:newUserSetup.classSetup.resultsStep.classTypes.appointment.name'
        ),
        description: t(
          'onboarding:newUserSetup.classSetup.resultsStep.classTypes.appointment.description'
        ),
      },
      {
        type: ClassTypeEnum.workshop,
        name: t(
          'onboarding:newUserSetup.classSetup.resultsStep.classTypes.workshop.name'
        ),
        description: t(
          'onboarding:newUserSetup.classSetup.resultsStep.classTypes.workshop.description'
        ),
      },
    ]

    return (
      <div className="space-y-6 px-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-1 h-auto"
          >
            <IoChevronBack className="w-5 h-5" />
          </Button>
          <Heading size="medium" className="text-left leading-relaxed">
            {t('onboarding:newUserSetup.classSetup.resultsStep.title')}
          </Heading>
        </div>

        <div className="space-y-4">
          {allClassTypes.map((classType, index) => {
            const isRecommended = recommendedTypes.includes(classType.type)
            const isSelected = selectedClassType === classType.type
            // Determine button styling
            let buttonClasses =
              'w-full p-4 text-left border-2 rounded-lg transition-all duration-200 hover:shadow-md '
            if (isSelected) {
              buttonClasses += 'border-blue-500 bg-blue-50 shadow-sm'
            } else if (isRecommended) {
              buttonClasses += 'border-green-500 bg-green-50 shadow-sm'
            } else {
              buttonClasses +=
                'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }

            // Determine circle styling
            let circleClasses =
              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 '
            if (isSelected) {
              circleClasses += 'border-blue-500 bg-blue-500'
            } else if (isRecommended) {
              circleClasses += 'border-green-500'
            } else {
              circleClasses += 'border-gray-300 bg-white'
            }

            return (
              <button
                key={classType.type}
                type="button"
                onClick={() => handleClassTypeSelect(classType.type)}
                className={buttonClasses}
              >
                <div className="flex items-center space-x-3">
                  <div className={circleClasses}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full transition-opacity duration-200" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="font-medium">{classType.name}</span>
                      {isRecommended && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {t(
                            'onboarding:newUserSetup.classSetup.resultsStep.recommended'
                          )}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <Text className="text-gray-600 text-sm">
                        {classType.description}
                      </Text>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <Text className="text-yellow-800 text-sm">
            {t('onboarding:newUserSetup.classSetup.resultsStep.note')}
          </Text>
        </div>
      </div>
    )
  }

  const renderCourseDetailsStep = () => (
    <div className="space-y-6 px-4">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-1 h-auto"
        >
          <IoChevronBack className="w-5 h-5" />
        </Button>
        <div className="text-left">
          <Heading size="large">
            {t('onboarding:newUserSetup.classSetup.courseDetailsStep.title')}
          </Heading>
          <Text className="text-gray-600 mb-8">
            {t(
              'onboarding:newUserSetup.classSetup.courseDetailsStep.subtitle',
              { classType: selectedClassType?.toLowerCase() }
            )}
          </Text>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div
            id="courseName-label"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t(
              'onboarding:newUserSetup.classSetup.courseDetailsStep.courseName.label'
            )}
          </div>
          <Input
            id="courseName"
            value={courseName}
            onChange={e => handleCourseNameChange(e.target.value)}
            placeholder={
              t(
                'onboarding:newUserSetup.classSetup.courseDetailsStep.courseName.placeholder'
              ) as string
            }
            className="w-full"
            aria-labelledby="courseName-label"
            aria-describedby="courseName-help"
          />
          <Text id="courseName-help" className="text-xs text-gray-500 mt-1">
            {t(
              'onboarding:newUserSetup.classSetup.courseDetailsStep.courseName.help'
            )}
          </Text>
        </div>
        <div>
          <div
            id="coursePath-label"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t(
              'onboarding:newUserSetup.classSetup.courseDetailsStep.coursePath.label'
            )}
          </div>
          <Input
            id="coursePath"
            value={coursePath}
            onChange={e => setCoursePath(e.target.value)}
            placeholder={
              t(
                'onboarding:newUserSetup.classSetup.courseDetailsStep.coursePath.placeholder'
              ) as string
            }
            className="w-full bg-gray-50"
            readOnly
            aria-labelledby="coursePath-label"
            aria-describedby="coursePath-help"
          />
          <Text id="coursePath-help" className="text-xs text-gray-500 mt-1">
            {t(
              'onboarding:newUserSetup.classSetup.courseDetailsStep.coursePath.help'
            )}
          </Text>
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleCourseDetailsNext}
          disabled={!courseName.trim() || !coursePath.trim()}
          className="w-full"
        >
          {t(
            'onboarding:newUserSetup.classSetup.courseDetailsStep.generateTimeSlots'
          )}
        </Button>
      </div>
    </div>
  )

  const renderTimeSlotsStep = () => (
    <div className="space-y-6 px-4">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-1 h-auto"
        >
          <IoChevronBack className="w-5 h-5" />
        </Button>
        <div className="text-left">
          <Heading size="large">
            {t('onboarding:newUserSetup.classSetup.timeSlotsStep.title')}
          </Heading>
          <Text className="text-gray-600 mb-8">
            {t('onboarding:newUserSetup.classSetup.timeSlotsStep.subtitle', {
              classType: selectedClassType?.toLowerCase(),
            })}
          </Text>
        </div>
      </div>

      {isGeneratingTimeSlots ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <Text className="text-gray-600">
            {t('onboarding:newUserSetup.classSetup.timeSlotsStep.generating')}
          </Text>
        </div>
      ) : (
        <div className="space-y-4">
          {generatedTimeSlots.map((slot, index) => {
            const slotKey = slot.lessons
              ? `regular-${slot.lessons[0]?.startTime}-${slot.lessons[0]?.endTime}-${index}`
              : `recurring-${slot.startTime}-${slot.endTime}-${index}`

            return (
              <div
                key={slotKey}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium">
                      {(() => {
                        if (slot.lessons)
                          return t(
                            'onboarding:newUserSetup.classSetup.timeSlotsStep.slotTypes.regularPeriod'
                          )
                        if (slot.lessonRepeatFormat?.repeat === false)
                          return t(
                            'onboarding:newUserSetup.classSetup.timeSlotsStep.slotTypes.event'
                          )
                        return t(
                          'onboarding:newUserSetup.classSetup.timeSlotsStep.slotTypes.recurringSchedule'
                        )
                      })()}
                    </Text>
                    {slot.lessons ? (
                      <Text className="text-sm text-gray-600">
                        {slot.lessons[0].startTime} - {slot.lessons[0].endTime}(
                        {t(
                          'onboarding:newUserSetup.classSetup.timeSlotsStep.duration',
                          { duration: slot.duration }
                        )}
                        )
                      </Text>
                    ) : (
                      <Text className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}(
                        {t(
                          'onboarding:newUserSetup.classSetup.timeSlotsStep.duration',
                          { duration: slot.duration }
                        )}
                        )
                      </Text>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {(() => {
                      if (slot.lessonRepeatFormat) {
                        if (slot.lessonRepeatFormat.repeat === false) {
                          return t(
                            'onboarding:newUserSetup.classSetup.timeSlotsStep.oneTimeEvent'
                          )
                        }
                        return t(
                          'onboarding:newUserSetup.classSetup.timeSlotsStep.recurringPattern',
                          {
                            every: slot.lessonRepeatFormat.every,
                            unit: slot.lessonRepeatFormat.unit,
                            plural:
                              slot.lessonRepeatFormat.every > 1 ? 's' : '',
                          }
                        )
                      }
                      if (typeof slot.repeatFormat === 'object') {
                        return t(
                          'onboarding:newUserSetup.classSetup.timeSlotsStep.recurringPattern',
                          {
                            every: slot.repeatFormat.every,
                            unit: slot.repeatFormat.unit,
                            plural: slot.repeatFormat.every > 1 ? 's' : '',
                          }
                        )
                      }
                      return slot.repeatFormat
                    })()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderPreviewStep = () => {
    if (!selectedClassType) return null

    if (selectedClassType === ClassTypeEnum.regularV2) {
      const regularTimeSlots = generatedTimeSlots.map(slot => ({
        courseId: slot.courseId || 0,
        lessons: slot.lessons || [],
        duration: slot.duration,
        repeatFormat: (() => {
          if (slot.lessonRepeatFormat) {
            return `${slot.lessonRepeatFormat.every} ${
              slot.lessonRepeatFormat.unit
            }${slot.lessonRepeatFormat.every > 1 ? 's' : ''}`
          }
          if (typeof slot.repeatFormat === 'object') {
            return `${slot.repeatFormat.every} ${slot.repeatFormat.unit}${
              slot.repeatFormat.every > 1 ? 's' : ''
            }`
          }
          return slot.repeatFormat || 'Weekly'
        })(),
      }))

      return (
        <RegularClassPreview
          courseName={courseName}
          coursePath={coursePath}
          timeSlots={regularTimeSlots}
          isWorkshop={false}
        />
      )
    }

    if (selectedClassType === ClassTypeEnum.recurring) {
      const recurringTimeSlots = generatedTimeSlots.map(slot => ({
        dayOfWeek: slot.weekDay || 0,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        repeatFormat:
          typeof slot.repeatFormat === 'object'
            ? `${slot.repeatFormat.every} ${slot.repeatFormat.unit}${
                slot.repeatFormat.every > 1 ? 's' : ''
              }`
            : slot.repeatFormat || 'Weekly',
        deleted: slot.deleted || false,
      }))

      return (
        <RecurringClassPreview
          courseName={courseName}
          coursePath={coursePath}
          timeSlots={recurringTimeSlots}
          numberOfLessons={8}
        />
      )
    }

    if (selectedClassType === ClassTypeEnum.appointment) {
      const appointmentTimeSlots = generatedTimeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        repeatFormat:
          typeof slot.repeatFormat === 'object'
            ? `${slot.repeatFormat.every} ${slot.repeatFormat.unit}${
                slot.repeatFormat.every > 1 ? 's' : ''
              }`
            : slot.repeatFormat || 'Daily',
      }))

      return (
        <AppointmentClassPreview
          courseName={courseName}
          coursePath={coursePath}
          timeSlots={appointmentTimeSlots}
        />
      )
    }

    if (selectedClassType === ClassTypeEnum.workshop) {
      const workshopTimeSlots = generatedTimeSlots.map(slot => ({
        courseId: slot.courseId || 0,
        lessons: slot.lessons || [],
        duration: slot.duration,
        repeatFormat: (() => {
          if (slot.lessonRepeatFormat) {
            if (slot.lessonRepeatFormat.repeat === false) {
              return 'One-time event'
            }
            return `${slot.lessonRepeatFormat.every} ${
              slot.lessonRepeatFormat.unit
            }${slot.lessonRepeatFormat.every > 1 ? 's' : ''}`
          }
          if (typeof slot.repeatFormat === 'object') {
            return `${slot.repeatFormat.every} ${slot.repeatFormat.unit}${
              slot.repeatFormat.every > 1 ? 's' : ''
            }`
          }
          return slot.repeatFormat || 'One-time event'
        })(),
      }))

      return (
        <RegularClassPreview
          courseName={courseName}
          coursePath={coursePath}
          timeSlots={workshopTimeSlots}
          isWorkshop
        />
      )
    }

    return null
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="relative overflow-hidden">
        <div
          className={`transition-all duration-300 ease-in-out ${
            currentStep === QuizStep.SCHEDULE
              ? 'opacity-100 translate-x-0 relative'
              : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
          }`}
        >
          {renderScheduleStep()}
        </div>
        <div
          className={`transition-all duration-300 ease-in-out ${
            currentStep === QuizStep.ENROLLMENT
              ? 'opacity-100 translate-x-0 relative'
              : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
          }`}
        >
          {renderEnrollmentStep()}
        </div>
        <div
          className={`transition-all duration-300 ease-in-out ${
            currentStep === QuizStep.RESULTS
              ? 'opacity-100 translate-x-0 relative'
              : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
          }`}
        >
          {renderResultsStep()}
        </div>
        <div
          className={`transition-all duration-300 ease-in-out ${
            currentStep === QuizStep.COURSE_DETAILS
              ? 'opacity-100 translate-x-0 relative'
              : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
          }`}
        >
          {renderCourseDetailsStep()}
        </div>
        <div
          className={`transition-all duration-300 ease-in-out ${
            currentStep === QuizStep.TIME_SLOTS
              ? 'opacity-100 translate-x-0 relative'
              : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
          }`}
        >
          {renderTimeSlotsStep()}
        </div>
        <div
          className={`transition-all duration-300 ease-in-out ${
            currentStep === QuizStep.PREVIEW
              ? 'opacity-100 translate-x-0 relative'
              : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
          }`}
        >
          {renderPreviewStep()}
        </div>
      </div>
    </div>
  )
}

export default CreateClassStep
