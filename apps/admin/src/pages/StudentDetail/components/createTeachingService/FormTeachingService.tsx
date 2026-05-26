import { useEffect, useMemo, useState } from 'react'

import { t } from 'i18next'
import { Controller } from 'react-hook-form'
import { FaCopy } from 'react-icons/fa'
import { LuBadgeInfo } from 'react-icons/lu'
import { toast } from 'sonner'

import AlertBox from '@/components/Boxes/AlertBox'
import WaitingButton from '@/components/Buttons/WaitingButton'
import Box from '@/components/Containers/Box'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import { TextInput } from '@/components/Inputs/TextInput'
import CourseAndClassSingleSelector from '@/components/Selector/CourseAndClassSingleSelector'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/HoverCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { FEATURE_FLAG } from '@/constants/featureFlags'
import useSiteData from '@/hooks/useSiteData'
import WhatsappButton from '@/pages/StudentCRM/components/WhatsappButton'
import { AddTeachingServiceMode } from '@/stores/studentData'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { OptionProps } from '@/types/courseSelector.type'
import { ClassOpts, CourseOpts } from '@/types/student'
import { FormTeachingServiceProps } from '@/types/studentAddTeachingService'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'

import { ErrorField, Field, LabelField, Link } from '.'

export const classUnavailableReasons = [
  'teachingService:classUnavailableReasons.noTimeslotAtFuture',
  'teachingService:classUnavailableReasons.noTimeslotAtClass',
  'teachingService:classUnavailableReasons.allClassIsFull',
]

const FormTeachingService = (
  props: FormTeachingServiceProps
): React.ReactElement => {
  const {
    form,
    priceType,
    onValueChangeSelectCourse,
    courseOpts,
    classesOptions,
    classOpts,
    onValueChangeSelectClass,
    currentClassType,
    onValueChangeSelectPeriod,
    periodOpts,
    dateTimePickerOpts,
    selectedDate,
    handleSelectDate,
    isFreeLesson,
    setIsFreeLesson,
    mode = AddTeachingServiceMode.addCourseDirectly,
    bulkAssignCourse,
    currentDetail,
    skipLink,
    handleSubmit,
    handleSendEmailClick,
    selectedCourseName,
    selectedClassName,
    numberOfLessons,
    selectedPriceOption,
    priceOptions,
    onValueChangeSelectPriceOption,
    show5PeriodLimitNotice,
    isLoadingCourseOptions = false,
  } = props

  const {
    control,
    formState: { errors },
    trigger,
    register,
    getValues,
    watch,
    setValue,
  } = form
  const isSubscriptionClass = currentClassType === ClassTypeEnum.subscription

  const isAppointmentClass = currentClassType === ClassTypeEnum.appointment

  const isRegularOrWorkshopClass =
    currentClassType === ClassTypeEnum.regular ||
    currentClassType === ClassTypeEnum.workshop

  const isPeriodRequiredClass =
    isRegularOrWorkshopClass || currentClassType === ClassTypeEnum.regularV2

  const [isCoppied, setIsCoppied] = useState(false)
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false)

  const { currentSite } = useSiteData()
  const currency = currentSite?.currency

  const courseId = getValues('courseId')
  const watchedClassId = watch('classId')

  const isSingleLessonMode = useMemo(() => {
    return (
      mode === AddTeachingServiceMode.addLesson ||
      mode === AddTeachingServiceMode.changeLesson
    )
  }, [mode])

  // Determine if the selected course contains any appointment classes
  const showAppointmentClassNotice = useMemo(() => {
    const courseOptsTyped = courseOpts as CourseOpts[]
    const selectedCourse = courseOptsTyped?.find(
      c => c.value?.toString() === courseId?.toString()
    )
    if (!selectedCourse || !selectedCourse.classes) return false
    return selectedCourse.classes.some(
      (cl: ClassOpts) => cl.type === ClassTypeEnum.appointment
    )
  }, [courseOpts, courseId])

  // Transform courseOpts into grouped format for CourseAndClassSingleSelector
  const courseAndClassOptions = useMemo(() => {
    if (!courseOpts) return []

    const courseOptsTyped = courseOpts as CourseOpts[]
    return courseOptsTyped
      .filter(o => o.value !== 'createNewCourse')
      .map((course: CourseOpts) => {
        const classes = (course.classes || [])
          .filter(option => {
            if (FEATURE_FLAG.ALLOW_ASSIGN_APPOINTMENT_CLASS) {
              return true
            }
            if (!isSingleLessonMode) {
              return option.type !== ClassTypeEnum.appointment
            }
            return true
          })
          .map((classItem: ClassOpts) => {
            const isRegularOrWorkshopClasses = [
              ClassTypeEnum.regular,
              ClassTypeEnum.recurring,
            ].includes(classItem.type as ClassTypeEnum)

            const isDisabled =
              classItem.isDisabled ||
              (isRegularOrWorkshopClasses &&
                (!classItem.periods || classItem.periods?.length === 0))

            return {
              value: Number(classItem.value),
              label: String(classItem.label),
              course: String(course.label),
              courseId: Number(course.value),
              previewImageUrl: null,
              type: classItem.type,
              isDisabled,
            } as OptionProps
          })

        return {
          label: String(course.label),
          options: classes,
        }
      })
  }, [courseOpts, isSingleLessonMode])

  // Track loading state for period options
  useEffect(() => {
    if (watchedClassId && isPeriodRequiredClass && periodOpts.length === 0) {
      // Class is selected but period options haven't loaded yet
      setIsLoadingPeriods(true)
    } else if (periodOpts.length > 0) {
      // Period options have loaded
      setIsLoadingPeriods(false)
    }
  }, [watchedClassId, isPeriodRequiredClass, periodOpts.length])

  // Get current selected value for CourseAndClassSingleSelector
  const currentValue = useMemo(() => {
    if (!watchedClassId) return undefined

    // Find the selected class option
    const matchingClass = courseAndClassOptions
      .flatMap(courseGroup => courseGroup.options)
      .find(cls => cls.value === Number(watchedClassId))

    return matchingClass
  }, [courseAndClassOptions, watchedClassId])

  // const classLessonDateStr = watch('classLessonDate')

  // const insufficientFromSelectedFirstDate = useMemo(
  //   () =>
  //     isInsufficientFromSelectedFirstDate({
  //       currentClassType,
  //       priceType,
  //       selectedPriceOption,
  //       numberOfLessons,
  //       dateTimePickerOpts,
  //       classLessonDate: classLessonDateStr,
  //       selectedDate,
  //     }),
  //   [
  //     currentClassType,
  //     priceType,
  //     selectedPriceOption,
  //     numberOfLessons,
  //     dateTimePickerOpts,
  //     classLessonDateStr,
  //     selectedDate,
  //   ]
  // )

  return (
    <>
      {skipLink && mode !== AddTeachingServiceMode.addLesson && (
        <Box
          css={{ backgroundColor: '$backgroundLayer3' }}
          padding="medium"
          wrap
        >
          <Link href={skipLink} target="_blank" rel="noreferrer noopener">
            {skipLink}
          </Link>
          <Button
            onClick={e => {
              try {
                e.preventDefault()
                navigator.clipboard.writeText(skipLink)
                setIsCoppied(true)
                setTimeout(() => setIsCoppied(false), 5000) // Reset isCoppied status after 5 seconds
                toast.success(t('embed:code.linkCopied'))
              } catch (err) {
                toast.error('Failed to copy link')
              }
            }}
            className="sm:mr-auto sm:mt-2"
          >
            {isCoppied ? (
              t('embed:code.copied')
            ) : (
              <Box>
                <FaCopy />
                {t('embed:code.copy')}
              </Box>
            )}
          </Button>
          {handleSubmit && handleSendEmailClick && (
            <WaitingButton
              variants="outlined"
              btnText={t('teachingService:sendEmail')}
              onClick={handleSubmit(handleSendEmailClick)}
            />
          )}
          {currentDetail?.phone && (
            <WhatsappButton
              type="apply"
              params={{
                link: skipLink,
                course: selectedCourseName as string,
                class: selectedClassName as string,
                studentName: currentDetail.name,
              }}
              phone={currentDetail.phone ?? ''}
            />
          )}
        </Box>
      )}
      {!bulkAssignCourse?.length && (
        <Box
          direction="column"
          rounded
          padding="medium"
          css={{ border: '1px solid $borderColor' }}
        >
          <Box direction="column">
            <Box
              css={{ '@xs': { flexDirection: 'column' } }}
              justify="flex-start"
            >
              <Text
                css={{ '@xs': { textAlign: 'center' } }}
                bold
                noWrap
                width="30%"
              >
                {t('student:teachingService.studentName')}
              </Text>
              <Text type="subtle">{currentDetail.name}</Text>
            </Box>
            <Box
              css={{ '@xs': { flexDirection: 'column' } }}
              justify="flex-start"
            >
              <Text
                css={{ '@xs': { textAlign: 'center' } }}
                bold
                noWrap
                width="30%"
              >
                {t('student:teachingService.email')}
              </Text>
              <Text type="subtle">{currentDetail.email}</Text>
            </Box>
            <Box
              css={{ '@xs': { flexDirection: 'column' } }}
              justify="flex-start"
            >
              <Text
                css={{ '@xs': { textAlign: 'center' } }}
                bold
                noWrap
                width="30%"
              >
                {t('student:teachingService.phone')}
              </Text>
              <Text type="subtle">{currentDetail.phone}</Text>
            </Box>
          </Box>
        </Box>
      )}
      {mode === AddTeachingServiceMode.changeLesson ? (
        <Field data-testid="courseAndClass">
          {/* Course: pre-selected dropdown, freely changeable */}
          <div className="flex gap-1 items-center">
            <LabelField className="flex gap-x-2">
              {t('student:teachingService.chooseCourse')}
            </LabelField>
            <span className="text-destructive">*</span>
          </div>
          <Controller
            name="courseId"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Select
                value={value?.toString() ?? ''}
                onValueChange={val => {
                  onChange(val)
                  onValueChangeSelectCourse(val)
                  setValue('classId', '')
                }}
              >
                <SelectTrigger
                  className={cn('w-full mb-2', error && 'border-destructive')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(courseOpts as CourseOpts[])
                    .filter(o => o.value !== 'createNewCourse')
                    .map(option => (
                      <SelectItem
                        key={String(option.value)}
                        value={String(option.value)}
                      >
                        {String(option.label)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Class: scoped to the selected course's classes */}
          <div className="flex gap-1 items-center">
            <LabelField className="flex gap-x-2 mb-0">
              {t('student:teachingService.chooseClass')}
            </LabelField>
            <span className="text-destructive">*</span>
          </div>
          <Controller
            name="classId"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <Select
                  value={value?.toString() ?? ''}
                  onValueChange={val => {
                    onChange(val)
                    onValueChangeSelectClass(val)
                  }}
                >
                  <SelectTrigger
                    className={cn('w-full', error && 'border-destructive')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(classOpts ?? [])
                      .filter(o => o.value !== 'createNewClass')
                      .map(option => (
                        <SelectItem
                          key={option.value}
                          value={option.value?.toString() ?? ''}
                        >
                          {String(option.label)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {(errors.courseId?.type === 'required' ||
                  errors.classId?.type === 'required') && (
                  <ErrorField>
                    {t('student:teachingService.requiredField')}
                  </ErrorField>
                )}
              </>
            )}
          />
        </Field>
      ) : (
        <Field data-testid="courseAndClass">
          <div className="flex gap-1 items-center">
            <LabelField className="flex gap-x-2">
              {t('student:teachingService.chooseCourse')} /{' '}
              {t('student:teachingService.chooseClass')}
              {classesOptions.length <= 0 && (
                <HoverCard>
                  <HoverCardTrigger>
                    <LuBadgeInfo />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <span>
                      {t('teachingService:classUnavailableReasons.title')}
                    </span>
                    <ol className="pl-5 list-disc">
                      {classUnavailableReasons.map(reason => (
                        <li key={reason}>{t(reason)}</li>
                      ))}
                    </ol>
                  </HoverCardContent>
                </HoverCard>
              )}
            </LabelField>
            <span className="text-destructive">*</span>
          </div>
          <Controller
            name="courseId"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange: onChangeCourseId } }) => (
              <>
                <CourseAndClassSingleSelector
                  key={`${getValues('courseId')}-${watchedClassId}`}
                  options={courseAndClassOptions}
                  value={currentValue ? [currentValue] : undefined}
                  isLoading={isLoadingCourseOptions}
                  onChange={(
                    selected: readonly OptionProps[] | OptionProps | null
                  ) => {
                    const selectedOption = Array.isArray(selected)
                      ? selected?.[0] || null
                      : selected

                    if (!selectedOption) {
                      onChangeCourseId('')
                      setValue('classId', '')
                      return
                    }

                    const selectedCourseId = selectedOption.courseId?.toString()
                    const selectedClassId = selectedOption.value?.toString()

                    const needsCourseSet =
                      !getValues('courseId') && selectedCourseId

                    if (selectedCourseId) {
                      const currentCourseIdInForm =
                        getValues('courseId')?.toString()
                      if (currentCourseIdInForm !== selectedCourseId) {
                        onChangeCourseId(selectedCourseId)
                        onValueChangeSelectCourse(selectedCourseId)
                      } else if (needsCourseSet || !currentCourseIdInForm) {
                        onValueChangeSelectCourse(selectedCourseId)
                      }
                    }

                    if (selectedClassId) {
                      setValue('classId', selectedClassId)
                      const selectedClass = courseAndClassOptions
                        .flatMap(courseGroup => courseGroup.options)
                        .find(cls => cls.value === Number(selectedClassId))
                      const isNeedsPeriods =
                        selectedClass?.type === ClassTypeEnum.regular ||
                        selectedClass?.type === ClassTypeEnum.workshop
                      if (isNeedsPeriods) {
                        setIsLoadingPeriods(true)
                      }
                      onValueChangeSelectClass(selectedClassId)
                    }
                  }}
                  isMulti={false}
                  width="100%"
                />
                {(errors.courseId?.type === 'required' ||
                  errors.classId?.type === 'required') && (
                  <ErrorField>
                    {t('student:teachingService.requiredField')}
                  </ErrorField>
                )}
              </>
            )}
          />
          <Controller
            name="classId"
            control={control}
            rules={{
              required: true,
            }}
            render={() => <></>}
          />
        </Field>
      )}
      {!isSingleLessonMode && (
        <AlertBox
          content={t('student:teachingService.chooseClassDescription')}
        />
      )}
      <Field
        data-testid="periodId"
        hidden={
          isSubscriptionClass || (isAppointmentClass && isSingleLessonMode)
        }
      >
        <div className="flex gap-1 items-center">
          <LabelField>{t('student:teachingService.choosePeriod')}</LabelField>
          {isPeriodRequiredClass && <span className="text-destructive">*</span>}
        </div>

        <Controller
          name="periodId"
          control={control}
          rules={{
            required: isPeriodRequiredClass,
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <Select
                value={value?.toString() ?? ''}
                onValueChange={val => {
                  onValueChangeSelectPeriod(val)
                  return onChange(val)
                }}
                disabled={isLoadingPeriods}
              >
                <SelectTrigger
                  className={cn('w-full', error && 'border-destructive')}
                >
                  <SelectValue
                    placeholder={
                      isLoadingPeriods
                        ? t('student:teachingService.loadingPeriods')
                        : undefined
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPeriods ? (
                    <div className="py-2 px-3 text-sm text-text-disabled text-center">
                      {t('student:teachingService.loadingPeriods')}
                    </div>
                  ) : (
                    periodOpts.map(option => (
                      <SelectItem key={option.value} value={option.value ?? ''}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {show5PeriodLimitNotice && (
                <AlertBox
                  className="mt-2"
                  content={t('student:teachingService.5PeriodLimitNotice')}
                />
              )}
            </>
          )}
        />
        {errors.periodId?.type === 'required' && (
          <ErrorField>{t('student:teachingService.requiredField')}</ErrorField>
        )}
      </Field>
      <Field
        hidden={
          isSubscriptionClass || (isAppointmentClass && isSingleLessonMode)
        }
      >
        <div className="flex gap-1 items-center">
          <LabelField>
            {t('student:teachingService.firstLessonDateTime')}
          </LabelField>
          <span className="text-destructive">*</span>
        </div>

        <Controller
          name="classLessonDate"
          control={control}
          rules={{
            required: !isSubscriptionClass,
          }}
          render={() => (
            <div className="w-full">
              <CustomDatePicker
                includeDates={dateTimePickerOpts.map(
                  date => new Date(date.split(' ')[0])
                )}
                includeTimes={
                  isAppointmentClass
                    ? dateTimePickerOpts.map(
                        date => new Date(date.split(' ')[1])
                      )
                    : []
                }
                selected={selectedDate}
                showTimeSelect={isAppointmentClass}
                dateFormat={
                  isAppointmentClass ? 'yyyy-MM-dd hh:mm a' : 'yyyy-MM-dd'
                }
                onChange={value => handleSelectDate(value)}
                selectedDate={selectedDate?.toString() ?? ''}
                timeIntervals={5}
                dataTestId="classLessonDate"
              />
            </div>
          )}
        />

        {errors.classLessonDate?.type === 'required' && (
          <ErrorField>{t('student:teachingService.requiredField')}</ErrorField>
        )}
        {/* {insufficientFromSelectedFirstDate && (
          <AlertBox
            className="mt-2"
            type="error"
            content={t('student:teachingService.notEnoughLessonsWithinPeriod')}
          />
        )} */}
      </Field>

      <Field hidden={!(isAppointmentClass && isSingleLessonMode)}>
        <div className="flex gap-1 items-center">
          <LabelField>{t('student:teachingService.lessonDate')}</LabelField>
          <span className="text-destructive">*</span>
        </div>

        <Controller
          name="classLessonDate"
          control={control}
          rules={{ required: true }}
          render={() => (
            <div className="w-full">
              <CustomDatePicker
                includeDates={dateTimePickerOpts.map(
                  date => new Date(date.split(' ')[0])
                )}
                selected={selectedDate}
                showTimeSelect={false}
                dateFormat="yyyy-MM-dd"
                onChange={value => handleSelectDate(value)}
                selectedDate={selectedDate?.toString() ?? ''}
                dataTestId="classLessonDate"
              />
            </div>
          )}
        />

        {errors.classLessonDate?.type === 'required' && (
          <ErrorField>{t('student:teachingService.requiredField')}</ErrorField>
        )}
      </Field>
      <Field
        data-testid="periodId"
        hidden={!(isAppointmentClass && isSingleLessonMode)}
      >
        <div className="flex gap-1 items-center">
          <LabelField>{t('student:teachingService.lessonTime')}</LabelField>
          <span className="text-destructive">*</span>
        </div>

        <Controller
          name="periodId"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <Select
                value={value?.toString() ?? ''}
                onValueChange={val => {
                  onValueChangeSelectPeriod(val)
                  return onChange(val)
                }}
              >
                <SelectTrigger
                  className={cn('w-full', error && 'border-destructive')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOpts.map(option => (
                    <SelectItem key={option.value} value={option.value ?? ''}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {show5PeriodLimitNotice && (
                <AlertBox
                  className="mt-2"
                  content={t('student:teachingService.5PeriodLimitNotice')}
                />
              )}
            </>
          )}
        />
        {errors.periodId?.type === 'required' && (
          <ErrorField>{t('student:teachingService.requiredField')}</ErrorField>
        )}
      </Field>

      {mode === AddTeachingServiceMode.addCourseDirectly &&
        priceType !== PriceType.MULTIPLE_OPTIONS && (
          <>
            {!isFreeLesson && (
              <Field>
                <div className="flex gap-1 items-center">
                  <LabelField>
                    {priceType === PriceType.PER_CLASS
                      ? t(`student:teachingService.priceType.PER_CLASS`)
                      : t(`student:teachingService.priceType.totalPrice`)}
                  </LabelField>
                  <span className="text-destructive">*</span>
                </div>
                <TextInput
                  vertical
                  type="number"
                  dataTestId="feePerLesson"
                  min={0}
                  {...register('feePerLesson', {
                    required: !isFreeLesson,
                    validate: (value: any) =>
                      value === null ||
                      Number(value) >= 0 ||
                      (t('embed:configuration.negative') as string),
                  })}
                />

                {priceType === PriceType.PER_LESSON &&
                  (numberOfLessons || 0) > 1 && (
                    <p className="text-sm text-text-disabled">
                      {t(`student:teachingService.priceType.eachLessonPrice`)}
                      {formatCurrency(
                        Number(watch('feePerLesson')) / (numberOfLessons ?? 1),
                        currency ?? ''
                      )}
                      {` / `}
                      {t(
                        `student:teachingService.priceType.forTotalOfLessons`,
                        {
                          count: numberOfLessons,
                        }
                      )}
                    </p>
                  )}

                {errors.feePerLesson?.type === 'required' && (
                  <ErrorField>
                    {t('student:teachingService.requiredField')}
                  </ErrorField>
                )}
              </Field>
            )}

            <Field className="flex justify-between items-center mt-5">
              <LabelField className="my-0">
                {t(`teachingService:feeNTime.freeLesson`)}
              </LabelField>

              <div>
                {/* TASK: https://flowclass.atlassian.net/browse/FLOW-2907 */}
                <Switch
                  disabled={mode !== AddTeachingServiceMode.addCourseDirectly}
                  // dataTestId="free-lesson-switch"
                  className="flex justify-start"
                  onCheckedChange={() => {
                    setIsFreeLesson(!isFreeLesson)
                    trigger('feePerLesson')
                  }}
                />
              </div>
            </Field>
          </>
        )}
      {!isSingleLessonMode && showAppointmentClassNotice && (
        <AlertBox
          className="p-2"
          content={t('student:teachingService.appointmentClassNotice')}
        />
      )}

      {priceType === PriceType.MULTIPLE_OPTIONS && !isSingleLessonMode && (
        <Field
          data-testid="priceOptionId"
          hidden={
            currentClassType !== ClassTypeEnum.subscription &&
            priceType !== PriceType.MULTIPLE_OPTIONS
          }
        >
          <div className="flex gap-1 items-center">
            <LabelField>
              {t('student:teachingService.choosePriceOption')}
            </LabelField>
            <span className="text-destructive">*</span>
          </div>
          <Controller
            name="priceOptionId"
            control={control}
            rules={{
              required: priceType === PriceType.MULTIPLE_OPTIONS,
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Select
                value={value?.toString() ?? ''}
                onValueChange={val => {
                  onValueChangeSelectPriceOption?.(val)
                  return onChange(val)
                }}
              >
                <SelectTrigger
                  className={cn('w-full', error && 'border-destructive')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceOptions?.map(option => (
                    <SelectItem
                      key={option.id}
                      value={option.id?.toString() ?? ''}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {`${formatCurrency(
                            Number(option.amount),
                            currency ?? ''
                          )} - ${option.numberOfLessons} ${t(
                            'teachingService:class.priceOption.lessonUnit'
                          )}`}
                        </span>
                        <span className="text-sm text-text-disabled">
                          {option.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.priceOptionId?.type === 'required' && (
            <ErrorField>
              {t('student:teachingService.requiredField')}
            </ErrorField>
          )}
        </Field>
      )}

      {priceType === PriceType.MULTIPLE_OPTIONS &&
        selectedPriceOption &&
        !isSingleLessonMode && (
          <Field data-testid="customPackagePrice">
            <div className="flex gap-1 items-center">
              <LabelField>
                {t('student:teachingService.customPackagePrice')}
              </LabelField>
            </div>
            <TextInput
              vertical
              type="number"
              data-testid="customPackagePrice"
              min={0}
              placeholder={
                t('student:teachingService.enterCustomPackagePrice') as string
              }
              {...register('customPackagePrice', {
                min: 0,
                validate: (value: any) =>
                  value === null ||
                  value === undefined ||
                  Number(value) >= 0 ||
                  (t('embed:configuration.negative') as string),
              })}
              onChange={e => {
                register('customPackagePrice').onChange(e)

                const packagePrice = Number(e.target.value) || 0
                setValue('feePerLesson', packagePrice)
              }}
            />

            {watch('customPackagePrice') && (
              <p className="text-sm text-text-disabled">
                {t('student:teachingService.pricePerLesson')}:
                {formatCurrency(
                  (Number(watch('customPackagePrice')) || 0) /
                    (priceOptions?.find(
                      option =>
                        option.id?.toString() ===
                        selectedPriceOption?.toString()
                    )?.numberOfLessons || 1),
                  currency ?? ''
                )}
                {` / ${t('teachingService:class.priceOption.lessonUnit')}`}
              </p>
            )}

            {errors.customPackagePrice && (
              <ErrorField>{errors.customPackagePrice.message}</ErrorField>
            )}
          </Field>
        )}
    </>
  )
}

export default FormTeachingService
