import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { t } from 'i18next'
import { useFieldArray, useForm, useFormState } from 'react-hook-form'
import { IoMdAdd } from 'react-icons/io'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import { ErrorCodes } from '@/api/errors/errorMessage'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import BoxWithToggleGroup from '@/components/ToggleGroup/BoxWithToggleGroup'
import { ToggleGroupLabelsProps } from '@/components/ToggleGroup/ToggleGroup'
import { ToggleGroupDropdownMenuModules } from '@/components/ToggleGroup/ToggleGroupItem'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import Form from '@/components/ui/Form'
import Text from '@/components/ui/Text'
import { RepeatUnit } from '@/constants/course'
import { INCOMPLETE_FEATURE_FLAG } from '@/constants/featureFlags'
import useClassData from '@/hooks/useClassData'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'
import useSiteData from '@/hooks/useSiteData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { Appointment, AppointmentForm } from '@/types/appointment'
import {
  Classes,
  ClassesForm,
  RegularPeriods,
  RepeatFormats,
} from '@/types/classes'
import {
  ClassTypeEnum,
  Course,
  CourseActivitiesOrder,
  PriceType,
} from '@/types/course'
import { DropDownMenuType } from '@/types/options'
import { rearrangeOrder } from '@/utils/convert'
import { convertToClassFormData } from '@/utils/convert-class.utils'
import dayjs from '@/utils/dayjs'
import { getCourseIcon } from '@/utils/options'
import { generateDefaultPriceOptionName } from '@/utils/price-option-name-generator'
import { buildDefaultRegularV2Period } from '@/utils/regular-class-schedule.utils'

import TransitioningRegularClassPopup from './Dialogs/TransitioningRegularClassPopup'
import BasicSetting from './BasicSetting'
import SubscriptionSetting from './SubscriptionSetting'

type ClassesFormArray = {
  classes: ClassesForm[]
}

const isClassNotHaveLessons = (
  currentCourseType: string,
  currentClass?: Classes
): boolean => {
  if (!currentClass) return true

  const hasPeriodsWithoutLessons = currentClass.regularPeriods?.some(
    scheduleItem => scheduleItem?.lessons?.length === 0
  )
  const isRegularOrWorkshopClass = [
    ClassTypeEnum.regular,
    ClassTypeEnum.workshop,
  ].includes(currentCourseType as ClassTypeEnum)

  if (
    (!currentClass?.regularPeriods?.length || hasPeriodsWithoutLessons) &&
    isRegularOrWorkshopClass
  ) {
    return true
  }

  if (
    !currentClass.recurringSchedules?.length &&
    currentCourseType === ClassTypeEnum.recurring
  ) {
    return true
  }

  return false
}

const Class = (props: {
  tabName: string
  allSaveMethods: (
    tabName: string,
    saveMethod: (saveMethodsRef?: any) => Promise<void>
  ) => void
}): JSX.Element => {
  const { tabName, allSaveMethods } = props
  const {
    replaceAllClasses,
    useFetchCurrentCourseAllClasses,
    useDuplicateClass,
    updateSingleClass,
    updateCurrentCourse,
    useBulkUpdateClasses,
    useArchiveClass,
    useUnarchiveClass,
    useDeleteClass,
  } = useClassData()
  const [timeoutState, setTimeoutState] = useState<NodeJS.Timeout | null>(null)
  const [isSwitchingClass, setIsSwitchingClass] = useState(false)

  const location = useLocation()
  // get classId from navigation state
  const selectedClassId = location.state?.selectedClassId
  const { useUpdateCourseActivitiesOrder } = useCourseData()

  const {
    setCurrentCourse,
    currentClass,
    setCurrentClass,
    currentCourse,
    setIsSaving,
    setIsUnSavedChanges,
  } = useCourseEditSave()

  const [showArchiveClassPopup, setShowArchiveClassPopup] = useState(false)
  const [showDeleteClassPopup, setShowDeleteClassPopup] = useState(false)
  const [classToBeDeleted, setClassToBeDeleted] = useState<Classes | null>(null)
  const [classToBeArchived, setClassToBeArchived] = useState<Classes | null>()
  const [
    showTransitioningRegularClassPopup,
    setShowTransitioningRegularClassPopup,
  ] = useState(false)

  const params = useSearchParams()
  const navigate = useNavigate()
  const { currentSite } = useSiteData()
  const currency = currentSite?.currency
  const classesFormData = useForm<ClassesFormArray>({
    defaultValues: {
      classes: [],
    },
    resetOptions: {
      keepDirtyValues: false,
      keepDirty: false,
    },
    mode: 'onBlur',
  })
  const { errors, isSubmitted, isDirty, dirtyFields } =
    useFormState(classesFormData)

  const { fields } = useFieldArray({
    control: classesFormData.control,
    keyName: 'id',
    name: 'classes',
  })

  useEffect(() => {
    const [searchParams] = params
    const classId = searchParams.get('classId')
    if (classId) {
      const classEntity = selectClassById(Number(classId))
      if (classEntity) {
        setCurrentClass(classEntity)
      }
    }
  }, [params])

  const currentEditingClassData = useMemo(() => {
    return fields.find(field => field.dataId === currentClass?.id)
  }, [fields, currentClass])

  const currentClassFieldIndex = useMemo(() => {
    return fields.findIndex(field => field.dataId === currentClass?.id)
  }, [fields, currentClass])

  useEffect(() => {
    if (Object.keys(errors).length !== 0 && isSubmitted)
      toast.error(t(`teachingService:recurringClass.overlapWarning`))
  }, [isSubmitted, errors])

  const selectClassById = useCallback(
    (classId: number) => {
      const formattedClassId = Number(classId)
      return currentCourse?.classes?.find(c => c.id === formattedClassId)
    },
    [currentCourse?.classes]
  )
  const handleClassChange = useCallback(
    (classId: number) => {
      const classEntity = selectClassById(classId)
      if (!classEntity) return
      setIsSwitchingClass(true)
      const timeout = setTimeout(() => {
        setCurrentClass(classEntity)
        setIsSwitchingClass(false)
      }, 300)
      setTimeoutState(timeout)
    },
    [selectClassById, setCurrentClass]
  )

  const rearrangeClassesOrder = useCallback(
    (classes: Classes[]): Classes[] => {
      if (!currentCourse?.courseActivitiesOrder) {
        return classes
      }
      const { activityOrder } = currentCourse.courseActivitiesOrder
      return rearrangeOrder(classes, activityOrder)
    },
    [currentCourse]
  )

  const setFormData = useCallback(
    (orderedClasses: Classes[]) => {
      classesFormData.reset({
        classes: orderedClasses.map(d => {
          const formData = {
            ...convertToClassFormData({
              classData: d,
              transformIdentifier: true,
            }),
            isFree: Number(d.tuition) === 0,
            locationRoom:
              d.locationRoom && d.locationRoom.id
                ? {
                    label: d.locationRoom.name,
                    value: d.locationRoom.id.toString(),
                  }
                : undefined,
            instructor:
              d.instructor && d.instructor.id
                ? {
                    label: `${d.instructor.firstName} ${
                      d.instructor.lastName || ''
                    } - ${d.instructor.email}`,
                    value: d.instructor.id.toString(),
                  }
                : undefined,
          }
          if (formData.priceOptions && formData.priceOptions.length > 1) {
            formData.priceOptions = [...formData.priceOptions].sort(
              (a, b) => (a.numberOfLessons || 0) - (b.numberOfLessons || 0)
            )
          }

          // For regularV2 classes, pre-seed an initial period when the API
          // returned none. The child `RegularClassSchedulePeriods` would
          // otherwise auto-seed via `useFieldArray.replace` on mount, which
          // marks the form dirty before any user input — causing the
          // "*Unsaved changes" banner to appear immediately on page load.
          if (
            formData.type === ClassTypeEnum.regularV2 &&
            (!formData.regularScheduleV2?.periodsV2 ||
              formData.regularScheduleV2.periodsV2.length === 0)
          ) {
            formData.regularScheduleV2 = {
              ...(formData.regularScheduleV2 ?? {}),
              periodsV2: [buildDefaultRegularV2Period()],
            } as typeof formData.regularScheduleV2
          }
          const firstPriceOption = formData.priceOptions?.[0]
          if (firstPriceOption) {
            formData.tuition = Number(firstPriceOption.amount)
            formData.isFree = Number(firstPriceOption.amount) === 0
          } else {
            const defaultAmount = formData.tuition || 0
            const defaultNumberOfLessons = formData.recurringFormat?.times ?? 1

            formData.tuition = defaultAmount
            formData.isFree = defaultAmount === 0
            formData.priceOptions = [
              {
                id: uuidv4(),
                name: generateDefaultPriceOptionName(
                  t,
                  defaultNumberOfLessons,
                  defaultAmount,
                  currency
                ),
                amount: defaultAmount.toString(),
                numberOfLessons: defaultNumberOfLessons,
                priceType: formData.priceType,
                classId: d.id,
              },
            ]
          }

          return formData
        }),
      })
    },
    [classesFormData, currency]
  )

  const { isLoading, isError, isSuccess } = useFetchCurrentCourseAllClasses(
    (data: Classes[]): void => {
      const orderedClasses = rearrangeClassesOrder(data)
      replaceAllClasses(orderedClasses)

      if (!currentCourse) return

      let classToSelect: Classes | undefined

      if (selectedClassId) {
        classToSelect = orderedClasses.find(
          c => c.id === +selectedClassId && !c.isArchived
        )
      }

      if (!classToSelect && currentClass?.courseId === currentCourse.id) {
        const existingClass = orderedClasses.find(c => c.id === currentClass.id)
        if (existingClass && !existingClass.isArchived) {
          classToSelect = existingClass
        }
      }

      if (!classToSelect) {
        classToSelect = orderedClasses.find(c => !c.isArchived)
      }

      setCurrentCourse({
        ...currentCourse,
        classes: orderedClasses,
      } as Course)

      if (classToSelect) {
        setCurrentClass(classToSelect)
      }
      setFormData(orderedClasses)
    }
  )
  const isSubmittable = useMemo(() => {
    return Object.keys(errors).length === 0 && !isLoading && isDirty
  }, [errors, isLoading, isDirty])

  useEffect(() => {
    setIsUnSavedChanges(isSubmittable)
  }, [isSubmittable])

  useEffect(() => {
    if (!currentCourse?.classes) return
    replaceAllClasses(rearrangeClassesOrder(currentCourse.classes))
  }, [currentCourse?.courseActivitiesOrder])

  const updateCourseActivitiesOrderResult = useUpdateCourseActivitiesOrder()

  const handleDragEnd = useCallback(
    (newData: ToggleGroupLabelsProps[]) => {
      const newOrder = newData.map(data =>
        Number.parseInt(data.value as string, 10)
      )

      if (!currentCourse) return

      const newCurrentCourseClasses = rearrangeOrder(
        currentCourse?.classes,
        newOrder
      )

      setCurrentCourse({
        ...currentCourse,
        classes: newCurrentCourseClasses,
      } as Course)

      const newCurrentCourse = {
        ...currentCourse,
        courseActivitiesOrder: {
          ...currentCourse.courseActivitiesOrder,
          activityOrder: newOrder,
        } as CourseActivitiesOrder,
        classes: newCurrentCourseClasses,
      } as Course

      setCurrentCourse(newCurrentCourse)
      updateCurrentCourse(newCurrentCourse)

      updateCourseActivitiesOrderResult.mutateAsync({
        institutionId: currentCourse.institutionId,
        courseId: currentCourse.id,
        order: newOrder,
      })
    },
    [
      currentCourse,
      setCurrentCourse,
      updateCurrentCourse,
      updateCourseActivitiesOrderResult,
    ]
  )

  const cleanClassData = (newClass: Classes) => {
    const removeNullLessons = (periods: RegularPeriods[]) => {
      return periods.map(period => {
        return {
          ...period,
          lessons:
            period?.lessons?.filter(
              lesson => lesson.startTime && lesson.endTime
            ) ?? [],
        }
      })
    }

    const updatedClass = {
      ...newClass,
      regularPeriods: removeNullLessons(newClass.regularPeriods ?? []),
    }

    updateSingleClass(updatedClass)

    const updatedClasses = (currentCourse?.classes || []).map(classItem =>
      classItem.id === newClass.id ? newClass : classItem
    )
    replaceAllClasses(rearrangeClassesOrder(updatedClasses))

    const classEntity = selectClassById(currentEditingClassData?.id ?? 0)

    if (!classEntity) return
    setCurrentClass(classEntity)

    const indexClass = currentCourse?.classes?.findIndex(o => {
      return o.id === newClass.id
    })
    const newCurrentCourse: Course = JSON.parse(JSON.stringify(currentCourse))
    if (indexClass !== undefined && indexClass !== -1) {
      newCurrentCourse.classes[indexClass] = newClass
      setCurrentCourse(newCurrentCourse)
    }
  }

  const bulkUpdateClassesResult = useBulkUpdateClasses(
    async (newClasses: Classes[]) => {
      newClasses.forEach(newClass => {
        cleanClassData(newClass)
      })

      const updatedClasses = [...(currentCourse?.classes || [])]

      newClasses.forEach(updatedClass => {
        const index = updatedClasses.findIndex(c => c.id === updatedClass.id)
        if (index !== -1) {
          updatedClasses[index] = updatedClass
        } else {
          updatedClasses.push(updatedClass)
        }
      })

      setCurrentCourse({
        ...currentCourse,
        classes: updatedClasses,
      } as Course)

      setFormData(updatedClasses)
      setIsUnSavedChanges(false)
    }
  )

  const archiveClassResult = useArchiveClass((archivedClass: Classes): void => {
    if (!currentCourse?.classes) return

    const newCurrentCourseClasses = currentCourse.classes.map(c =>
      c.id === archivedClass.id ? { ...c, isArchived: true } : c
    )

    const updatedCourse = {
      ...currentCourse,
      classes: newCurrentCourseClasses,
    } as Course

    setCurrentCourse(updatedCourse)
    replaceAllClasses(rearrangeClassesOrder(newCurrentCourseClasses))

    // If the archived class was currently selected, switch to first non-archived class
    if (currentClass?.id === archivedClass.id) {
      const firstActiveClass = newCurrentCourseClasses.find(c => !c.isArchived)
      if (firstActiveClass) {
        setCurrentClass(firstActiveClass)
      }
    }

    // Update form data after state changes to ensure proper re-render
    setTimeout(() => {
      setFormData(newCurrentCourseClasses)
    }, 0)
  })

  const unarchiveClassResult = useUnarchiveClass(
    (unarchivedClass: Classes): void => {
      if (!currentCourse?.classes) return

      const newCurrentCourseClasses = currentCourse.classes.map(c =>
        c.id === unarchivedClass.id ? { ...c, isArchived: false } : c
      )

      const updatedCourse = {
        ...currentCourse,
        classes: newCurrentCourseClasses,
      } as Course

      setCurrentCourse(updatedCourse)
      replaceAllClasses(rearrangeClassesOrder(newCurrentCourseClasses))

      // Switch to the unarchived class
      setCurrentClass(unarchivedClass)

      // Update form data after state changes to ensure proper re-render
      setTimeout(() => {
        setFormData(newCurrentCourseClasses)
      }, 0)
    }
  )

  const duplicateClassResult = useDuplicateClass((classes: Classes): void => {
    // if (!currentCourseClasses) return
    const newClasses = [...(currentCourse?.classes || [])].filter(
      o => o.id !== classes.id
    )
    const updatedClasses = rearrangeClassesOrder([...newClasses, classes])
    setCurrentCourse({
      ...currentCourse,
      classes: updatedClasses,
    } as Course)
    setFormData(updatedClasses)
    // Wait until currentCourse is updated

    setCurrentClass(classes)
    setIsUnSavedChanges(true)
  })

  const deleteClassResult = useDeleteClass((deletedClass: Classes): void => {
    if (!currentCourse?.classes) return

    const newCurrentCourseClasses = currentCourse.classes.filter(
      c => c.id !== deletedClass.id
    )

    const updatedCourse = {
      ...currentCourse,
      classes: newCurrentCourseClasses,
    } as Course

    setCurrentCourse(updatedCourse)
    replaceAllClasses(rearrangeClassesOrder(newCurrentCourseClasses))

    if (currentClass?.id === deletedClass.id) {
      const firstActiveClass = newCurrentCourseClasses.find(c => !c.isArchived)
      if (firstActiveClass) {
        setCurrentClass(firstActiveClass)
      } else if (newCurrentCourseClasses.length > 0) {
        setCurrentClass(newCurrentCourseClasses[0])
      }
    }

    setTimeout(() => {
      setFormData(newCurrentCourseClasses)
    }, 0)
  })

  const orderedClasses = useMemo(() => {
    return rearrangeClassesOrder(currentCourse?.classes || [])
  }, [currentCourse?.classes])

  const toggleGroupLabels = useMemo(() => {
    return (
      orderedClasses.map((classObj, index) => {
        const isDirty = Boolean((dirtyFields?.classes || [])[index]) || false
        const isArchived = classObj.isArchived || false

        const classDropdownModules = [
          ToggleGroupDropdownMenuModules.DUPLICATE,
          ToggleGroupDropdownMenuModules.ARCHIVE,
        ]

        const canDelete =
          !classObj.studentSchedules || classObj.studentSchedules.length === 0
        if (canDelete) {
          classDropdownModules.push(ToggleGroupDropdownMenuModules.DELETE)
        }

        return {
          value: classObj.id.toString(),
          label: classObj.name,
          status: isClassNotHaveLessons(classObj.type, classObj)
            ? 'error'
            : 'normal',
          isDirty,
          actionButton: <></>,
          onDelete: () => {
            setShowDeleteClassPopup(true)
            setClassToBeDeleted(classObj)
          },
          onArchive: () => {
            setShowArchiveClassPopup(true)
            setClassToBeArchived(classObj)
          },
          onUnarchive: async () => {
            await unarchiveClassResult.mutateAsync(classObj.id)
          },
          onDuplicate: async () => {
            if (
              INCOMPLETE_FEATURE_FLAG.TRANSITIONING_REGULAR_CLASS &&
              classObj.type === ClassTypeEnum.regular
            ) {
              setShowTransitioningRegularClassPopup(true)
              return
            }
            await duplicateClassResult.mutateAsync(classObj)
          },
          indicators: {
            dropIn: classObj.dropIn,
            multipleClass: classObj.setMultipleClass,
            isArchived,
          },
          icon: (
            <div className="box-row-full justify-start relative">
              {getCourseIcon(classObj.type)}
              <p className="text-xs">
                {t(`teachingService:courseType.${classObj.type}`)}
              </p>
            </div>
          ),
          dropdownMenuModules: classDropdownModules,
        }
      }) ?? []
    )
  }, [
    orderedClasses,
    dirtyFields?.classes,
    currentCourse?.classes,
    archiveClassResult.isLoading,
    unarchiveClassResult.isLoading,
    duplicateClassResult.isLoading,
    setShowArchiveClassPopup,
    setClassToBeArchived,
    setShowTransitioningRegularClassPopup,
    isClassNotHaveLessons,
    unarchiveClassResult.mutateAsync,
    duplicateClassResult.mutateAsync,
  ])

  const buildDefaultRecurringFormat = (
    classData: ClassesForm
  ): RepeatFormats => {
    return {
      every: classData?.recurringFormat?.every ?? 1,
      times: classData?.recurringFormat?.times ?? 1,
      repeat: classData?.recurringFormat?.repeat ?? false,
      unit: classData?.recurringFormat?.unit ?? RepeatUnit.weeks,
    } as RepeatFormats
  }

  const buildDefaultAppointment = (classData: ClassesForm): AppointmentForm => {
    return {
      durationMinutes: classData.appointment?.durationMinutes ?? 60,
      minimumNoticeMinutes: classData.appointment?.minimumNoticeMinutes ?? 0,
      bufferBeforeMinutes: classData.appointment?.bufferBeforeMinutes ?? 0,
      bufferAfterMinutes: classData.appointment?.bufferAfterMinutes ?? 0,
      gapBetweenAppointmentsMinutes:
        classData.appointment?.gapBetweenAppointmentsMinutes ?? 15,
      availabilityId: classData.appointment?.availabilityId ?? null,
    } as Appointment
  }

  const validatePayload = useCallback(
    (data: ClassesFormArray): ClassesForm[] => {
      const payload = data.classes
        .filter((_value, index) => dirtyFields?.classes?.[index] ?? false)
        .map(classData => {
          const convertedData = convertToClassFormData({
            classData,
            revertIdentifier: true,
          })

          return {
            ...convertedData,
            classesCode:
              convertedData.classesCode === ''
                ? null
                : convertedData.classesCode,
            locationId: classData.locationRoom?.value
              ? Number(classData.locationRoom?.value)
              : null,
            instructorId: classData.instructor?.value
              ? Number(classData.instructor?.value)
              : null,
            appointment: classData.appointment,
          }
        })
        .map(classData => {
          if (!classData.id || !Number.isInteger(Number(classData.id))) {
            throw new Error(
              `Invalid class ID: ${classData.id}. Must be a valid integer.`
            )
          }
          let finalPriceOptions: any[]

          if (
            classData.priceType === PriceType.MULTIPLE_OPTIONS &&
            classData.priceOptions?.length > 0
          ) {
            const invalidOptions = classData.priceOptions.filter(
              option =>
                !option.isFreeOfCharge &&
                (option.amount === null || option.amount === undefined)
            )

            if (invalidOptions.length > 0) {
              throw new Error('teachingService:errors.priceRequired')
            }
            finalPriceOptions = classData.priceOptions.map(option => {
              const processedId =
                option.id && Number(option.id) > 0
                  ? Number(option.id)
                  : undefined

              const result: any = {
                amount: Number(option.amount),
                numberOfLessons: Number(option.numberOfLessons),
                priceType: classData.priceType,
                name: option.name,
              }

              if (processedId) {
                result.id = processedId
              }

              return result
            })
          } else {
            finalPriceOptions = [
              {
                amount: classData.isFree ? 0 : Number(classData.tuition),
                numberOfLessons: classData.recurringFormat?.times ?? 1,
                priceType: classData.priceType,
                name: generateDefaultPriceOptionName(
                  t,
                  classData.recurringFormat?.times ?? 1,
                  classData.isFree ? 0 : Number(classData.tuition),
                  currency ?? 'HKD'
                ),
              },
            ]
          }

          if (
            [
              ClassTypeEnum.subscription,
              ClassTypeEnum.recurring,
              ClassTypeEnum.appointment,
            ].includes(classData.type)
          ) {
            return {
              ...classData,
              priceOptions: finalPriceOptions,
              recurringFormat: buildDefaultRecurringFormat(
                classData as ClassesForm
              ),
              recurringSchedules: (classData?.recurringSchedules || [])?.map(
                schedule => ({
                  ...schedule,
                  classId: classData.id,
                })
              ),
              regularPeriods: (classData?.regularPeriods || [])?.map(
                period => ({
                  ...period,
                  classId: classData.id,
                })
              ),
              appointment: buildDefaultAppointment(classData as ClassesForm),
            } as ClassesForm
          }

          if (classData?.type === ClassTypeEnum.regularV2) {
            return {
              ...classData,
              regularScheduleV2: {
                ...classData.regularScheduleV2,
                periodsV2: classData.regularScheduleV2?.periodsV2?.map(
                  period => {
                    // This happen when the fieldArray add the id as a string
                    if (!Number.isNaN(period.id)) {
                      return {
                        ...period,
                        id: undefined,
                      }
                    }

                    return period
                  }
                ),
              },
            } as ClassesForm
          }

          // This is basically the else statement for the if statement above
          return {
            ...classData,
            priceOptions: finalPriceOptions,
            recurringFormat: undefined,
            appointment: undefined,
            recurringSchedules: (classData?.recurringSchedules || [])?.map(
              schedule => ({
                ...schedule,
                classId: classData.id,
              })
            ),
            regularPeriods: (classData?.regularPeriods || [])?.map(period => ({
              ...period,
              classId: classData.id,
            })),
          } as ClassesForm
        })

      /** Validate if the class at least has one period */
      payload.forEach(classData => {
        if (
          classData?.type === ClassTypeEnum.subscription ||
          classData?.type === ClassTypeEnum.appointment
        ) {
          return
        }

        if (classData?.type === ClassTypeEnum.regularV2) {
          if (
            classData?.regularScheduleV2?.periodsV2 &&
            classData?.regularScheduleV2?.periodsV2?.length <= 0
          ) {
            throw new Error('teachingService:class.phases.noLessons')
          }

          if (
            classData?.regularScheduleV2?.periodsV2.some(period =>
              dayjs(period.endTime).isBefore(period.startTime)
            )
          ) {
            throw new Error(
              'teachingService:regularV2.errors.periodEndTimeEarlierThanStartTime'
            )
          }

          return
        }

        // map lessons
        const lessons = [
          ClassTypeEnum.regular,
          ClassTypeEnum.workshop,
        ].includes(classData?.type)
          ? classData?.regularPeriods?.flatMap(reg => reg.lessons)
          : classData?.recurringSchedules

        if (lessons.length <= 0) {
          throw new Error('teachingService:class.phases.noLessons')
        }
      })

      return payload as ClassesForm[]
    },
    [classesFormData, dirtyFields]
  )

  const onSubmit = async (data: ClassesFormArray) => {
    try {
      const payload = validatePayload(data)
      setIsSaving(true)
      await bulkUpdateClassesResult.mutateAsync(payload)
      toast.success(t('teachingService:class.updateClassSuccess'))
    } catch (error) {
      if (error instanceof Error) {
        toast.error(t(error.message))
      } else {
        toast.error(t('common:errors.UNKNOWN_ERROR'))
      }
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    allSaveMethods(tabName, (ref: any) =>
      classesFormData.handleSubmit(onSubmit)(ref)
    )
  }, [allSaveMethods, tabName, onSubmit])

  const networkError = useMemo(() => {
    return bulkUpdateClassesResult.error || archiveClassResult.error
  }, [bulkUpdateClassesResult.error, archiveClassResult.error])

  useEffect(() => {
    return () => {
      if (timeoutState) {
        clearTimeout(timeoutState)
      }
    }
  }, [])

  return (
    <Form {...classesFormData}>
      <Box direction="col" id={tabName} className="p-1">
        <BoxWithToggleGroup
          className="[&_#leftColumn]:xl:!w-80"
          toggleGroupLabels={toggleGroupLabels}
          title={t('teachingService:class.selectClass')}
          actionButton={<IoMdAdd />}
          handleActionButtonClick={() => {
            navigate('/teaching-service/create-course')
          }}
          currentSection={currentClass?.id?.toString() ?? ''}
          setCurrentSection={handleClassChange}
          dropdownMenuModules={[
            ToggleGroupDropdownMenuModules.DUPLICATE,
            ToggleGroupDropdownMenuModules.ARCHIVE,
            ToggleGroupDropdownMenuModules.DELETE,
          ]}
          type={DropDownMenuType.Class}
          draggable
          handleDragEnd={handleDragEnd}
          orderedClasses={orderedClasses}
          unarchiveClassResult={unarchiveClassResult}
        >
          <Box direction="col">
            {isLoading && <FullScreenLoading />}
            {(currentCourse?.classes || []).length === 0 && (
              <Box id="noClassContainer">
                <FullScreenAlertBox
                  text={t(`teachingService:class.noClassYet`)}
                  content={
                    <Button
                      variant="primary-outline"
                      onClick={() => {
                        navigate('/teaching-service/create-course')
                      }}
                    >
                      {t('teachingService:class.createClass')}
                    </Button>
                  }
                />
              </Box>
            )}

            {isError && (
              <FullScreenAlertBox
                text={t(
                  `teachingService:class.errors.${
                    networkError?.statusCode ?? ErrorCodes.UNKNOWN_ERROR
                  }`
                )}
              />
            )}
            {isSuccess && currentClassFieldIndex > -1 && (
              <Box direction="col" gap="lg">
                {isSwitchingClass ? (
                  <FullScreenLoading />
                ) : (
                  <>
                    {currentClass?.type === ClassTypeEnum.subscription ? (
                      <SubscriptionSetting
                        key={fields[currentClassFieldIndex].id}
                        fieldIndex={currentClassFieldIndex}
                      />
                    ) : (
                      <BasicSetting
                        key={fields[currentClassFieldIndex].id}
                        fieldIndex={currentClassFieldIndex}
                        {...props}
                      />
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>
        </BoxWithToggleGroup>

        <CustomedAlertDialog
          open={showArchiveClassPopup}
          setOpen={setShowArchiveClassPopup}
          alertType={AlertTypes.WARN}
          description={`${t('teachingService:class.archiveClassDescription')}`}
          title={t('teachingService:class.archiveClassTitle') as string}
          cancelText={t('teachingService:createCourseModal.cancel') as string}
          actionText={t('teachingService:class.confirm') as string}
          onCloseClick={() => {
            setClassToBeArchived(null)
            setShowArchiveClassPopup(false)
          }}
          onActionClick={async () => {
            if (!classToBeArchived?.id) return
            await archiveClassResult.mutateAsync(classToBeArchived.id)
            setClassToBeArchived(null)
            setShowArchiveClassPopup(false)
          }}
          loading={archiveClassResult.isLoading}
        />

        <TransitioningRegularClassPopup
          showTransitioningRegularClassPopup={
            showTransitioningRegularClassPopup
          }
          setShowTransitioningRegularClassPopup={
            setShowTransitioningRegularClassPopup
          }
          onActionClick={() => {
            navigate('/teaching-service/create-course?classType=regularV2')
          }}
          onCloseClick={async () => {
            try {
              await duplicateClassResult.mutateAsync(currentClass as Classes)
            } finally {
              setShowTransitioningRegularClassPopup(false)
            }
          }}
          isLoading={duplicateClassResult.isLoading}
        />

        <CustomedAlertDialog
          open={showDeleteClassPopup}
          setOpen={setShowDeleteClassPopup}
          alertType={AlertTypes.WARN}
          description={`${t('teachingService:class.deleteClassDescription')}`}
          title={t('teachingService:class.deleteClassTitle') as string}
          cancelText={t('teachingService:createCourseModal.cancel') as string}
          actionText={t('teachingService:class.confirm') as string}
          onCloseClick={() => {
            setClassToBeDeleted(null)
            setShowDeleteClassPopup(false)
          }}
          onActionClick={async () => {
            if (!classToBeDeleted) {
              toast.error(
                t('teachingService:class.errors.classIdNotFound') as string
              )
              return
            }
            try {
              await deleteClassResult.mutateAsync(classToBeDeleted.id)
              setClassToBeDeleted(null)
              setShowDeleteClassPopup(false)
            } catch (err) {
              toast.error(
                t('teachingService:class.errors.deleteClassFailed') as string
              )
            }
          }}
          loading={deleteClassResult.isLoading}
        />
      </Box>
    </Form>
  )
}

export default Class
