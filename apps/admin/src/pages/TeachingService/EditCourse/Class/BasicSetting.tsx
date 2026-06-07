import { useEffect, useMemo, useRef, useState } from 'react'

import { CalendarOptions } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayjs from 'dayjs'
import { t } from 'i18next'
import { useForm, useFormContext, useWatch } from 'react-hook-form'
import { LuCopy, LuExternalLink } from 'react-icons/lu'
import Select from 'react-select'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import CustomDatePicker from '@/components/DatePickers/DatePicker'
import PriceOptionsManager from '@/components/PriceOption/PriceOptionsManager'
import { selectCustomStyles } from '@/components/Selector/TextSearchMultiSelector'
import Link from '@/components/Texts/Link'
import Switch from '@/components/Toggle/Switch'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import { Separator } from '@/components/ui/Separator'
import Text from '@/components/ui/Text'
import { INCOMPLETE_FEATURE_FLAG } from '@/constants/featureFlags'
import useClassData from '@/hooks/useClassData'
import useCourseData from '@/hooks/useCourseData'
import usePriceManagement from '@/hooks/usePriceManagement'
import { useLocationRoom } from '@/hooks/useRoomLocation'
import useSiteData from '@/hooks/useSiteData'
import useUsersManagement from '@/hooks/useUsersManagement'
import { courseState } from '@/stores/courseData'
import { ClassesForm, RegularPeriods } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { convertToClassFormData } from '@/utils/convert-class.utils'
import { getCurrencySymbol } from '@/utils/currency'
import { validateCourseLowestPrice } from '@/utils/validate'

import AppointmentFields from '../Appointment/AppointmentFields'
import Session from '../Events/Session'
import RecurringScheduleTable from '../Recurring/RecurringScheduleTable'
import { RegularClassSchedulesV2 } from '../RegularClassSchedules'

// import { RegularClassPeriods } from '../RegularClassPeriods'
import DropIn from './DropIn'
import MultipleApplicantSetting from './MultipleApplicantSetting'
import MultipleClassesSetting from './MultipleClassesSetting'
import RegularPeriodsSection from './RegularPeriodsSection'

type BasicSettingProps = {
  fieldIndex: number
  tabName: string
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}

export const generateRecurringEvents = (
  schedule: RegularPeriods[]
): CalendarOptions['events'] => {
  const events: CalendarOptions['events'] = []

  schedule.forEach(item => {
    if (!item) return
    const { lessons, duration } = item

    lessons?.forEach(lesson => {
      if (!lesson || !lesson.startTime || !lesson.endTime) {
        return
      }

      const event = {
        title: item.name,
        start: lesson.startTime,
        end: lesson.endTime,
        duration,
      }

      events.push(event)
    })
  })
  return events
}

const BasicSetting = ({ fieldIndex }: BasicSettingProps): JSX.Element => {
  const form = useFormContext<{ classes: ClassesForm[] }>()

  const localForm = useForm<ClassesForm>({
    defaultValues: form.getValues(`classes.${fieldIndex}`),
    resetOptions: {
      keepDirtyValues: false,
      keepDirty: false,
    },
  })

  useClassData()
  const { courseEnrolUrl } = useCourseData()
  const classId = useWatch({
    control: localForm.control,
    name: 'dataId',
    defaultValue: form.getValues(`classes.${fieldIndex}.dataId`),
  })
  const priceType = useWatch({ control: localForm.control, name: 'priceType' })
  const tuition = useWatch({ control: localForm.control, name: 'tuition' })
  const isFree = useWatch({ control: localForm.control, name: 'isFree' })
  const type = useWatch({ control: localForm.control, name: 'type' })
  const calendarRef = useRef<FullCalendar>(null)
  const { currentSite } = useSiteData()
  const { currency } = currentSite!
  const [freeStates, setFreeStates] = useState<{ [key: number]: boolean }>({})
  const [courseRecoilState] = useRecoilState(courseState)
  const { useFetchLocationRooms } = useLocationRoom()
  const { data: locationRooms } = useFetchLocationRooms()
  const { useGetInstructors } = useUsersManagement()
  const { data: instructors } = useGetInstructors()

  const instructorsOptions = useMemo(() => {
    return (instructors || []).map(instructor => ({
      label: `${instructor.user?.firstName} ${
        instructor.user?.lastName ?? ''
      } - ${instructor.user?.email}`,
      value: instructor.user?.id?.toString() || '',
    }))
  }, [instructors])

  const instructorWithPlaceholder = useMemo(() => {
    return [
      {
        label: t('teachingService:basic.selectInstructor'),
        value: '',
      },
      ...instructorsOptions,
    ]
  }, [instructorsOptions])

  const locationRoomsOptions = useMemo(() => {
    return (locationRooms || []).map(location => ({
      label: location.name,
      value: location.id?.toString() || '',
    }))
  }, [locationRooms])
  const locationRoomWithPlaceholder = useMemo(() => {
    return [
      {
        label: t('teachingService:basic.selectLocation'),
        value: '',
      },
      ...locationRoomsOptions,
    ]
  }, [locationRoomsOptions])

  const tuitionLabel = useMemo(() => {
    return priceType === PriceType.PER_CLASS
      ? t('teachingService:feeNTime.tuitionPerClass')
      : t('teachingService:feeNTime.tuitionPerLesson')
  }, [priceType])

  const classEnrolUrl = useMemo(() => {
    return `${courseEnrolUrl}&classId=${classId}`
  }, [courseEnrolUrl, classId])

  useEffect(() => {
    if (classId) {
      setFreeStates(prev => ({
        ...prev,
        [classId]: Number(tuition) === 0,
      }))
    }
  }, [classId, tuition])

  const isPriceValid = useMemo(
    () => validateCourseLowestPrice(tuition ?? 0, currency),
    [tuition, currency]
  )

  const tuitionLabelWithCurrency = useMemo(() => {
    return `${tuitionLabel} ${getCurrencySymbol(currency)}`
  }, [tuitionLabel, currency])

  useEffect(() => {
    const subscription = localForm.watch((values, info) => {
      // `info.type` is `undefined` for programmatic `setValue` calls and
      // `'change'` for user-driven input. We only propagate dirtiness to
      // the parent form on real user input — otherwise mount-time
      // programmatic writes (e.g. price-options syncing) would falsely
      // flag the form as having unsaved changes.
      const isUserChange = info?.type === 'change'
      form.setValue(
        `classes.${fieldIndex}`,
        convertToClassFormData({ classData: values as ClassesForm }),
        {
          shouldDirty: isUserChange,
        }
      )
    })
    return () => subscription.unsubscribe()
  }, [form, fieldIndex, localForm])

  useEffect(() => {
    if (priceType !== PriceType.MULTIPLE_OPTIONS) {
      const currentAmount = isFree ? 0 : tuition
      const priceOptions = localForm.getValues('priceOptions')

      if (
        priceOptions &&
        priceOptions.length > 0 &&
        Number(priceOptions[0].amount) !== Number(currentAmount)
      ) {
        const updatedOptions = [...priceOptions]
        updatedOptions[0] = {
          ...updatedOptions[0],
          amount: currentAmount.toString(),
        }
        localForm.setValue('priceOptions', updatedOptions, {
          shouldDirty: false,
        })
      }
    }
  }, [tuition, isFree, priceType, localForm])

  const priceTypeOptions = useMemo(() => {
    const baseOptions = [
      {
        label: t('teachingService:feeNTime.tuitionPerLesson'),
        value: PriceType.PER_LESSON,
      },
    ]

    return [
      ...baseOptions,
      // ...(type !== ClassTypeEnum.regularV2
      //   ? [
      //       {
      //         label: t('teachingService:feeNTime.tuitionPerClass'),
      //         value: PriceType.PER_CLASS,
      //       },
      //     ]
      //   : []),
      ...(type === ClassTypeEnum.recurring || type === ClassTypeEnum.appointment
        ? [
            {
              label: t('teachingService:feeNTime.multiplePriceOption'),
              value: PriceType.MULTIPLE_OPTIONS,
            },
          ]
        : []),
    ]
  }, [type])

  useEffect(() => {
    const availableValues = priceTypeOptions.map(option => option.value)

    if (!availableValues.includes(priceType)) {
      localForm.setValue('priceType', PriceType.PER_CLASS, {
        shouldDirty: false,
        shouldTouch: false,
      })
    }
  }, [type, priceTypeOptions, priceType, localForm])
  const { showTuitionField, showPriceOptions } = usePriceManagement(
    type,
    priceType,
    localForm
  )

  return (
    <Form {...localForm}>
      <Box direction="col" align="start" gap="lg">
        <div className="w-full flex md:flex-row flex-col gap-2 justify-end">
          <Button
            variant="primary-outline"
            iconAfter={<LuCopy />}
            onClick={() => {
              navigator.clipboard.writeText(classEnrolUrl)
              toast.success(t('teachingService:view.copySuccess'))
            }}
          >
            {t('teachingService:view.copyApplicationLink')}
          </Button>

          <Button
            onClick={() => {
              window.open(classEnrolUrl, '_blank')
            }}
            variant="primary-outline"
            iconAfter={<LuExternalLink />}
            disabled={!courseRecoilState?.currentCourse?.published}
          >
            {t('teachingService:view.viewApplicationLink')}
          </Button>
        </div>
        <FormField
          name="name"
          control={localForm.control}
          render={({ field }) => (
            <FormItem
              id="className"
              className="flex gap-x-4 w-full items-center leading-5"
            >
              <FormLabel className="w-[45%] font-bold">
                {t('teachingService:class.name')}
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="classesCode"
          control={localForm.control}
          render={({ field }) => (
            <FormItem
              id="classId"
              className="flex gap-x-4 w-full items-center leading-5"
            >
              <FormLabel className="w-[45%] font-bold">
                {t('teachingService:class.id')}
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showTuitionField && (
          <div
            className="box-row-full justify-between md:justify-start"
            id="free-course-tuition-button"
          >
            <Text className="w-[30%] mr-2 text-sm flex-shrink-0" noWrap bold>
              {t(`teachingService:feeNTime.freeLesson`)}
            </Text>
            <FormField
              name="isFree"
              control={localForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      data-testid="free-lesson-switch"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="!justify-end md:!justify-start"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        <Box justify="start">
          <Text className="w-[30%] mr-2 text-sm md:flex-shrink-0" bold>
            {t(`teachingService:class.priceForClass`)}
          </Text>

          <FormField
            name="priceType"
            control={localForm.control}
            render={({ field }) => (
              <Select
                value={priceTypeOptions.find(
                  option => option.value === field.value
                )}
                options={priceTypeOptions}
                styles={selectCustomStyles('100%')}
                onChange={(selectedOption: any) => {
                  field.onChange(selectedOption.value)
                }}
                placeholder={t('teachingService:class.selectPriceType')}
              />
            )}
          />
        </Box>

        {showTuitionField && !isFree && (
          <>
            <Box id="classTuition" align="start">
              <FormField
                name="tuition"
                control={localForm.control}
                rules={{
                  required: t('login:errors.required') as string,
                  validate: async (val: number) => {
                    if (freeStates[classId ?? 0]) return true
                    if (val < 0) {
                      return t('embed:configuration.negative') as string
                    }
                    if (!isPriceValid) {
                      return t('teachingService:feeNTime.tooLow') as string
                    }
                    return undefined
                  },
                }}
                render={({ field }) => (
                  <FormItem
                    id="tuition"
                    className="flex gap-x-4 w-full items-center leading-5"
                  >
                    <FormLabel className="w-[45%] font-bold">
                      {tuitionLabelWithCurrency}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
            <Text className="-mt-3 text-sm">
              {t('teachingService:class.showCurrency')}{' '}
              <span style={{ fontWeight: 700 }}>{currency}. </span>
              <Link href="/contact?tab=regionLanguage" className="text-sm">
                {t('teachingService:class.changeCurrency')}
              </Link>
            </Text>
          </>
        )}
        {showPriceOptions && (
          <>
            <FormField
              name="priceOptions"
              control={localForm.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t('teachingService:class.priceOptions')}
                  </FormLabel>
                  <FormControl>
                    <PriceOptionsManager
                      currency={currency}
                      form={localForm}
                      fieldName="priceOptions"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          name="quota"
          control={localForm.control}
          rules={{
            validate: (val: number) =>
              val > 0 || (t('embed:configuration.negative') as string),
          }}
          render={({ field }) => (
            <FormItem
              id="classQuota"
              className="flex gap-x-4 w-full items-center leading-5"
            >
              <FormLabel className="w-[45%] font-bold">
                {t('teachingService:class.quota')}
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="locationRoom"
          control={localForm.control}
          render={({ field }) => (
            <FormItem
              id="location"
              className="flex gap-x-4 w-full items-center leading-5"
            >
              <FormLabel className="w-[45%] font-bold">
                {t('teachingService:basic.location')}
              </FormLabel>
              <FormControl id="location-selector-value">
                <Select
                  value={field.value ?? locationRoomWithPlaceholder[0]}
                  options={locationRoomWithPlaceholder}
                  styles={selectCustomStyles('100%')}
                  onChange={(opt: any) => {
                    field.onChange(opt)
                  }}
                  name="location-selector"
                  inputId="location-selector"
                  data-testid="location-selector-value"
                  placeholder={t('teachingService:basic.location')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="instructor"
          control={localForm.control}
          render={({ field }) => {
            return (
              <FormItem
                id="instructor"
                className="flex gap-x-4 w-full items-center leading-5"
              >
                <FormLabel className="w-[45%] font-bold">
                  {t('teachingService:basic.instructor')}
                </FormLabel>
                <FormControl id="instructor-selector-value">
                  <Select
                    value={field.value ?? instructorWithPlaceholder[0]}
                    options={instructorWithPlaceholder}
                    styles={selectCustomStyles('100%')}
                    onChange={(opt: any) => {
                      field.onChange(opt)
                    }}
                    name="instructor-selector"
                    inputId="instructor-selector"
                    placeholder={t('teachingService:basic.selectInstructor')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        {INCOMPLETE_FEATURE_FLAG.SHOW_APPLICATION_PERIOD &&
          (
            [
              ClassTypeEnum.recurring,
              ClassTypeEnum.appointment,
            ] as ClassTypeEnum[]
          ).includes(type as ClassTypeEnum) && (
            <div className="flex w-full gap-4 items-start">
              <p className="font-semibold w-[45%]">
                {t('teachingService:class.applicationPeriod')}
              </p>

              <div className="w-full ml-auto gap-2 flex flex-col sm:flex-row">
                {/* Start date */}
                <FormField
                  name="applicationPeriod.startDatetime"
                  control={localForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="w-[45%] font-bold">
                        {t('teachingService:class.startDatetime')}
                      </FormLabel>
                      <FormControl>
                        <CustomDatePicker
                          showTimeSelect
                          isClearable
                          selectedDate={
                            field.value
                              ? dayjs(field.value).toISOString()
                              : null
                          }
                          // dateFormat="YYYY-MM-dd HH:mm"
                          onChange={date => {
                            field.onChange(date)
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* End date */}
                <FormField
                  name="applicationPeriod.endDatetime"
                  control={localForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="w-[45%] font-bold">
                        {t('teachingService:class.endDatetime')}
                      </FormLabel>
                      <FormControl>
                        <CustomDatePicker
                          showTimeSelect
                          isClearable
                          selectedDate={
                            field.value
                              ? dayjs(field.value).toISOString()
                              : null
                          }
                          // dateFormat="YYYY-MM-dd HH:mm"
                          onChange={date => {
                            field.onChange(date)
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        <MultipleClassesSetting />

        {INCOMPLETE_FEATURE_FLAG.ONE_APPLICATION_FOR_MULTIPLE_STUDENTS && (
          <MultipleApplicantSetting />
        )}

        <Separator />

        {type === ClassTypeEnum.regular && (
          <>
            <RegularPeriodsSection calendarRef={calendarRef} />
            <DropIn />
          </>
        )}
        {type === ClassTypeEnum.workshop && <Session />}
        {type === ClassTypeEnum.recurring && <RecurringScheduleTable />}
        {type === ClassTypeEnum.appointment && (
          <AppointmentFields priceType={priceType} />
        )}

        {type === ClassTypeEnum.regularV2 && <RegularClassSchedulesV2 />}
      </Box>
    </Form>
  )
}

export default BasicSetting
