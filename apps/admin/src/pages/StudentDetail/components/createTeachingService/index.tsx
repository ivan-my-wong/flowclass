import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import dayjs from 'dayjs'
import { t } from 'i18next'
import { useForm } from 'react-hook-form'
import { LuPlusCircle } from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'

import Drawer from '@/components/Drawer/Drawer'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import useClassData from '@/hooks/useClassData'
import useCourseData from '@/hooks/useCourseData'
import useSiteData from '@/hooks/useSiteData'
import useStudentCRMData from '@/hooks/useStudentCRMData'
import { courseState } from '@/stores/courseData'
import { requiredParamsState } from '@/stores/requiredParamsData'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { Classes } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { PriceOption } from '@/types/regularClass'
import { ClassOpts, CourseOpts, TypeOpts } from '@/types/student'
import { StudentUser } from '@/types/user'
import { getLessonCountInPeriodOrRecurring } from '@/utils/calculate-course'
import { filterClassOptionItems } from '@/utils/class-options.utils'
import { cn } from '@/utils/cn'
import dayjsTz from '@/utils/dayjs'
import {
  getRegularClassLessonsFromSchedule,
  getRegularClassSchedules,
} from '@/utils/regular-class-schedule.utils'
import { siteDomainIfCustom } from '@/utils/string'
import { formatUnixTime } from '@/utils/timeFormat'

import AddCourseDirectly from './AddCourseDirectly'
import AddLesson from './AddLesson'
import AddStudentOnly from './AddStudentOnly'
import ChangeLesson from './ChangeLesson'
import GenerateCourseLink from './GenerateCourseLink'

// Helper function to find the closest future date from available dates
const findClosestFutureDate = (dateTimeOptions: string[]): Date | null => {
  if (!dateTimeOptions || dateTimeOptions.length === 0) return null

  const today = dayjs().startOf('day')
  const futureDates = dateTimeOptions
    .map(dateTimeStr => {
      const datePart = dateTimeStr.split(' ')[0]
      return dayjs(datePart).startOf('day')
    })
    .filter(date => date.isAfter(today) || date.isSame(today))
    .sort((a, b) => a.diff(b))

  return futureDates.length > 0 ? futureDates[0].toDate() : null
}

type Props = {
  open: boolean
  handleClose: () => void
}

export type InputFields = {
  courseId: number | string
  classId: number | string
  periodId: number | string
  classLessonDate: string
  feePerLesson?: number
  parentEmail?: string
  priceOptionId?: string
  customPackagePrice?: number
}

export type CreateStudentAndAddLessonInputFields = InputFields & {
  alias: string
  email: string
  secondaryEmail?: string
  phone: string
}

const CreateTeachingService = ({
  open,
  handleClose,
}: Props): React.ReactElement => {
  const navigate = useNavigate()
  const [studentData, setStudentData] = useRecoilState(studentState)

  const { currentStudent, currentEnrol, currentStudentLesson, tableDrawers } =
    useRecoilValue(studentState)
  const schoolData = useRecoilValue(schoolState)
  const requiredParams = useRecoilValue(requiredParamsState)
  const { currentSite } = useRecoilValue(siteState)
  const { courses, currentCourse } = useRecoilValue(courseState)

  const {
    useStudentDetail,
    useFetchTeachingServiceOptions,
    flattenDataLesson,
  } = useStudentCRMData()

  const { data: optsSource, isLoading: isLoadingCourseOptions } =
    useFetchTeachingServiceOptions()

  const { useEnrolledClassCount } = useClassData()
  const { data: enrollClassCount } = useEnrolledClassCount()
  const { setCurrentCourse } = useCourseData()
  const { timeZone } = useSiteData()

  const [isFreeLesson, setIsFreeLesson] = useState<boolean>(false)
  const [priceType, setPriceType] = useState('enterFee')
  const [sourceSelected, setSourceSelected] = useState<any>()
  const [classOpts, setClassOpts] = useState<ClassOpts[]>()
  const [selectedDate, setSelectDate] = useState<Date | null>()
  const [periodOpts, setPeriodOpts] = useState<TypeOpts[]>([])
  const [dateTimePickerOpts, setDateTimePickerOpts] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [skipLink, setSkipLink] = useState<string>('')
  const [isSendEmail, setIsSendEmail] = useState<boolean>(false)

  const refClass = useRef<any>()
  const refPeriod = useRef<any>()
  const refLessonDateTime = useRef<any>()

  const [searchParams] = useSearchParams()

  const [show5PeriodLimitNotice, setShow5PeriodLimitNotice] =
    useState<boolean>(false)

  const userId =
    Number(searchParams.get('userId')) ??
    Number(requiredParams.userId) ??
    currentStudent?.id ??
    0

  const mode = studentData.tableDrawers.assignCourseMode ?? 'add'
  const isChangeLesson = mode === AddTeachingServiceMode.changeLesson
  const isAddLesson = mode === AddTeachingServiceMode.addLesson

  const { bulkAssignCourse } = tableDrawers

  const firstStudent = bulkAssignCourse?.[0]
  const studentMemo = useMemo(
    () => currentStudent?.studentInfo,
    [currentStudent?.studentInfo]
  )
  const {
    fullName: firstName,
    email,
    phone,
  } = currentStudent || ({} as StudentUser)

  const currentSiteId = schoolData.currentSchool?.siteId || 0
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentSchoolUrl = schoolData.currentSchool?.url
  const currentSiteUrl = currentSite?.url
  const currentCoursePath = currentCourse?.path
  const currentClassId = currentEnrol?.classId
  const currentEnrolId = currentEnrol?.enrollCourseId ?? 0

  const [numberOfLessons, setNumberOfLessons] = useState<number>(0)

  const classesData: Classes[] = useMemo(() => {
    return (courses || [])
      .flatMap(course => course.classes)
      .map(classItem => {
        const enrolledClass = (enrollClassCount || [])?.find(
          enrolledClass => enrolledClass.classId === classItem.id
        )
        return {
          ...classItem,
          classQuota: enrolledClass?.classQuota,
        }
      })
  }, [courses, enrollClassCount])

  const redirectSearchParams = new URLSearchParams()
  redirectSearchParams.append(
    'school',
    encodeURIComponent(currentSchoolUrl ?? '')
  )
  redirectSearchParams.append(
    'course',
    encodeURIComponent(currentCoursePath ?? '')
  )

  const displayName = useMemo(
    () => studentMemo?.name || firstName || firstStudent?.name || '',
    [studentMemo?.name, firstName, firstStudent?.name]
  )
  const displayPhone = useMemo(
    () => phone || firstStudent?.phone || '',
    [phone, firstStudent?.phone]
  )
  const displayEmail = useMemo(
    () => email || firstStudent?.email || '',
    [email, firstStudent?.email]
  )

  const currentDetail = {
    institutionId: currentSchoolId,
    name: displayName,
    email: displayEmail,
    phone: displayPhone,
    siteId: currentSiteId,
    userAliasId: requiredParams.userAliasId,
    redirectUrl: `https://${currentSiteUrl}/enrol/success-payment?${redirectSearchParams.toString()}`,
  }

  const classesOptions = useMemo(() => {
    return filterClassOptionItems(classesData, classOpts ?? [])
  }, [classOpts, classesData])

  const form = useForm<CreateStudentAndAddLessonInputFields>({})
  const { setValue, getValues, watch, reset } = form

  const courseId = getValues('courseId')
  const classId = getValues('classId')

  useStudentDetail(
    {
      userId: requiredParams.userId,
      siteId: requiredParams.siteId ?? 0,
      institutionId: requiredParams.institutionId,
      userAliasId: requiredParams.userAliasId,
    },
    studentDetail => {
      setStudentData(prev => ({ ...prev, currentStudent: studentDetail }))
    }
  )

  const handleCloseAndClearData = () => {
    handleClose()
    setStudentData(prev => ({ ...prev, currentStudent: null }))
    setSkipLink('')
    setSelectDate(undefined)
    setIsSendEmail(false)
    setIsFreeLesson(false)
    reset()

    if (userId) {
      navigate(
        `/student-record/${requiredParams.userAliasId}?userId=${requiredParams.userId}`
      )
    }
  }

  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'back',
    action: handleCloseAndClearData,
    'data-testid': 'return-to-student-central',
  }
  const [selectedPriceOption, setSelectedPriceOption] = useState<string>('')
  const [priceOptions, setPriceOptions] = useState<Array<PriceOption>>([])

  const handleFeeCourse = (
    selectedClassId?: string | number,
    selectedPeriodId?: number,
    selectedPriceOptionId?: string | number
  ) => {
    if (isFreeLesson) {
      setValue('feePerLesson', 0)
      setPriceType('enterFee')
      return
    }

    const classData = classesData.find(c => c.id === Number(selectedClassId))
    if (!classData) return
    if (classData.priceType === PriceType.MULTIPLE_OPTIONS) {
      setPriceOptions(
        classData.priceOptions.map(option => ({
          ...option,
          id: option.id,
          amount: option.amount,
          numberOfLessons: option.numberOfLessons,
        })) || []
      )

      if (selectedPriceOptionId) {
        const selectedOption = classData.priceOptions?.find(
          option => option.id === selectedPriceOptionId
        )
        if (selectedOption) {
          setValue('feePerLesson', Number(selectedOption.amount))
          setNumberOfLessons(Number(selectedOption.numberOfLessons))
        }
      } else {
        setValue('feePerLesson', 0)
        setNumberOfLessons(0)
      }
      setPriceType(PriceType.MULTIPLE_OPTIONS)
    } else if (classData.type === ClassTypeEnum.regularV2) {
      const lessonsCount = dateTimePickerOpts.length
      setNumberOfLessons(lessonsCount)
      setValue('feePerLesson', +classData?.tuition * lessonsCount)
      setPriceType(PriceType.PER_CLASS)
    } else if (classData.priceType === PriceType.PER_CLASS) {
      setValue('feePerLesson', +classData?.tuition)
    } else {
      const lessonsCount = getLessonCountInPeriodOrRecurring(
        classData,
        selectedPeriodId ?? 0
      )
      setNumberOfLessons(lessonsCount)
      setValue('feePerLesson', +classData?.tuition * lessonsCount)
    }
    setPriceType(classData?.priceType)
  }

  const onValueChangeSelectPriceOption = (opt: string | undefined) => {
    if (opt) {
      setSelectedPriceOption(opt)
      setValue('priceOptionId', opt)

      const selectedOption = priceOptions.find(
        option => option.id?.toString() === opt
      )
      if (selectedOption) {
        setValue('customPackagePrice', Number(selectedOption.amount))
        setValue('feePerLesson', Number(selectedOption.amount))
        setNumberOfLessons(Number(selectedOption.numberOfLessons))
      }
    }
  }

  const objOpts = useMemo(() => {
    return flattenDataLesson((optsSource ?? []).filter(opt => !opt.isArchived))
  }, [optsSource, flattenDataLesson])

  useEffect(() => {
    if (getValues()) {
      setValue('courseId', '')
      setValue('classId', '')
      setValue('periodId', '')
      setValue('classLessonDate', '')
    }

    if (isAddLesson || isChangeLesson) {
      const courseId = Number(currentEnrol?.courseId)
      setValue('courseId', courseId)
    }

    if (isChangeLesson) {
      // Use local variable to avoid stale closure on the render-time `courseId`
      const enrolCourseId = Number(currentEnrol?.courseId)
      const classId = Number(currentEnrol?.classId) ?? 0
      const recurringScheduleId = String(
        currentEnrol?.invoice?.invoiceId ??
          currentEnrol?.invoices?.[0]?.invoiceId
      )

      setValue('classId', classId)
      setValue('periodId', recurringScheduleId)
      setSourceSelected(objOpts[courseId]?.classes)
      if (!objOpts?.[courseId]) return
      setClassOpts(objOpts[courseId]?.classes)

      const classData = objOpts[enrolCourseId].classes?.find(
        o => Number(o.value) === classId
      )
      if (!classData) return

      if (!classData?.periods) return
      const periodOpts: TypeOpts[] = Object.values(classData?.periods)

      setPeriodOpts(periodOpts)
      const getLessonOpts: TypeOpts[] = periodOpts.filter(
        periodItem => Number(periodItem.value) === Number(recurringScheduleId)
      )

      const dateTimeOptions = getLessonOpts[0]?.data ?? []
      setDateTimePickerOpts(dateTimeOptions)

      if (classData?.type === ClassTypeEnum.appointment) {
        const apptOptions = (periodOpts.map(o => o.data).flat() ||
          []) as string[]
        setDateTimePickerOpts(apptOptions)
      }

      if (dateTimeOptions.length > 0) pickDate(dateTimeOptions)
    }
  }, [currentEnrol, mode, open, objOpts, setValue, getValues])

  const courseOpts = useMemo(() => {
    const courseOptsArray: CourseOpts[] = []
    Object.keys(objOpts).forEach(courseId => {
      courseOptsArray.push(objOpts[courseId])
    })

    return [
      ...courseOptsArray,
      {
        value: 'createNewCourse',
        label: (
          <div className="flex items-center justify-start gap-2 text-primary">
            <LuPlusCircle size={16} />
            {t('student:teachingService.newCourse')}
          </div>
        ),
      },
    ]
  }, [objOpts])

  const onValueChangeSelectCourse = (opt: string | undefined) => {
    if (opt) {
      if (opt === 'createNewCourse') {
        localStorage.setItem('openCreateCourseModal', 'true')
        navigate('/teaching-service')
        return
      }
      if (!objOpts) return
      setSourceSelected(objOpts[opt].classes)

      const classes = objOpts[opt]?.classes.map(classItem => {
        let isDisabled = false

        const isRegularOrWorkshopClasses = [
          ClassTypeEnum.regular,
          ClassTypeEnum.recurring,
        ].includes(classItem.type as ClassTypeEnum)

        if (isRegularOrWorkshopClasses) {
          isDisabled = !classItem.periods || classItem.periods?.length === 0
        }

        return {
          ...classItem,
          isDisabled,
          // filterPeriodOptionItems(classItem.periods ?? []).length === 0,
        }
      })

      setSelectDate(undefined)
      setClassOpts([
        ...classes,
        {
          value: 'createNewClass',
          label: (
            <div className="flex items-center justify-start gap-2 text-primary">
              <LuPlusCircle size={16} />
              {t('student:teachingService.newClass')}
            </div>
          ),
        },
      ])
      setValue('classId', '')
      setValue('periodId', '')
      setValue('classLessonDate', '')

      if (refClass && refClass.current) {
        refClass?.current?.clearValue()
      }

      if (refPeriod && refPeriod.current) {
        refPeriod?.current.clearValue()
      }
      if (refLessonDateTime && refLessonDateTime.current) {
        refLessonDateTime?.current?.clearValue()
      }
    }
  }
  // In changeLesson mode, auto-select the period and date that match the
  // original lesson's start time so the admin doesn't need to scroll to find it.
  // Returns true when a match is found and values are set.
  const autoSelectOriginalDate = (periodOptions: TypeOpts[]): boolean => {
    if (!isChangeLesson || !currentEnrol?.originalLessonStart) return false
    const originalDateStr = dayjs(currentEnrol.originalLessonStart).format(
      'YYYY-MM-DD'
    )
    const matchedPeriod = periodOptions.find(p =>
      (p.data ?? []).some(dt => dt.split(' ')[0] === originalDateStr)
    )
    if (!matchedPeriod) return false
    setValue('periodId', matchedPeriod.value ?? '')
    const dtOptions = matchedPeriod.data ?? []
    setDateTimePickerOpts(dtOptions)
    const matchedDt = dtOptions.find(dt => dt.split(' ')[0] === originalDateStr)
    if (matchedDt) {
      setSelectDate(new Date(matchedDt.split(' ')[0]))
      setValue('classLessonDate', matchedDt)
    }
    return true
  }

  const onValueChangeSelectClass = (opt: string | undefined) => {
    if (opt) {
      const courseId = getValues('courseId')
      if (opt === 'createNewClass') {
        setCurrentCourse(Number(courseId))
        // create course should be change to create class in the future
        navigate('/teaching-service/create-course')
        return
      }
      // Use objOpts directly instead of sourceSelected to avoid async state issues
      // sourceSelected may not be ready yet when called synchronously after onValueChangeSelectCourse
      let getPeriodOpts: TypeOpts[] =
        objOpts?.[courseId]?.classes?.find(
          (item: ClassOpts) => item.value === opt
        )?.periods ||
        (sourceSelected || [])?.find((item: ClassOpts) => item.value === opt)
          ?.periods

      if (!getPeriodOpts) return

      const classFound = (objOpts || {})?.[courseId]?.classes?.find(
        o => o.value === opt
      )
      const classType = classFound?.type

      // RegularV2: build period options from preview util and limit to 5 periods if infinite
      const classData = classesData.find(c => c.id === Number(opt))
      if (!classData) return
      if (classType === ClassTypeEnum.regularV2) {
        const schedule = classData?.regularScheduleV2
        setShow5PeriodLimitNotice(
          !schedule?.periodRepeatCount || schedule?.periodRepeatCount <= 0
        )
        const periods = getRegularClassSchedules(schedule, 0)
        const allLessons = getRegularClassLessonsFromSchedule(schedule, [], 0)
        const lessonsByPeriod: Record<number, string[]> = {}
        allLessons.forEach(l => {
          const key = l.period // 1-based
          if (!lessonsByPeriod[key]) lessonsByPeriod[key] = []
          lessonsByPeriod[key].push(`${l.startTime} ${l.endTime}`)
        })
        const builtPeriodOpts: TypeOpts[] = periods.map((p, idx) => {
          const s = dayjsTz(p.startDate).tz(timeZone).format('YYYY-MM-DD')
          const e = dayjsTz(p.endDate)
            .tz(timeZone)
            .subtract(1, 'day')
            .format('YYYY-MM-DD')
          return {
            value: (idx + 1).toString(),
            label: `${s} - ${e}`,
            data: lessonsByPeriod[idx + 1] ?? [],
          }
        })
        setPeriodOpts(builtPeriodOpts)
        setValue('periodId', '')
        setValue('classLessonDate', '')
        setSelectedPriceOption('')
        setPriceOptions([])
        setValue('priceOptionId', '')
        setValue('customPackagePrice', undefined)
        if (refPeriod && refPeriod.current) {
          refPeriod?.current.clearValue()
        }
        if (refLessonDateTime && refLessonDateTime.current) {
          refLessonDateTime?.current?.clearValue()
        }
        return
      }

      if (
        mode === AddTeachingServiceMode.changeLesson &&
        classType === ClassTypeEnum.regular
      ) {
        getPeriodOpts = getPeriodOpts.map(period => {
          const date = period.data?.[0]?.split(' ')?.[0]
          if (date) {
            return {
              ...period,
              label: dayjs(date)
                .tz(timeZone)
                .format('D MMM YYYY, dddd hh:mm a'),
            }
          }
          return period
        })
      }

      setPeriodOpts(getPeriodOpts)

      setValue('periodId', '')
      setValue('classLessonDate', '')
      setSelectedPriceOption('')
      setPriceOptions([])
      setValue('priceOptionId', '')
      setValue('customPackagePrice', undefined)
      if (
        classData?.type === ClassTypeEnum.recurring &&
        classData.priceType === PriceType.MULTIPLE_OPTIONS
      ) {
        setPriceType(PriceType.MULTIPLE_OPTIONS)
        setPriceOptions(classData.priceOptions || [])
      } else {
        setPriceType(classData?.priceType || 'enterFee')
        setPriceOptions([])
        const firstPriceOption = classData.priceOptions?.at(0)
        setIsFreeLesson(Number(firstPriceOption?.amount ?? '0') <= 0)
      }
      if (refPeriod && refPeriod.current) {
        refPeriod?.current.clearValue()
      }

      if (refLessonDateTime && refLessonDateTime.current) {
        refLessonDateTime?.current?.clearValue()
      }

      if (
        classType === ClassTypeEnum.appointment &&
        [
          AddTeachingServiceMode.addLesson,
          AddTeachingServiceMode.changeLesson,
        ].includes(mode as AddTeachingServiceMode)
      ) {
        const dateTimeOptions = (getPeriodOpts.map(o => o.data).flat() ||
          []) as string[]
        setDateTimePickerOpts(dateTimeOptions)
      }
    }
  }
  const onValueChangeSelectPeriod = (opt: string | undefined) => {
    if (opt) {
      handleFeeCourse(
        Number(getValues('classId')),
        Number(opt),
        Number(getValues('priceOptionId'))
      )

      const classData = (objOpts || {})?.[courseId]?.classes?.find(
        o => o.value === getValues('classId')
      )

      if (
        classData?.type === ClassTypeEnum.appointment &&
        [
          AddTeachingServiceMode.addLesson,
          AddTeachingServiceMode.changeLesson,
        ].includes(mode as AddTeachingServiceMode)
      ) {
        setValue('periodId', '')
        return
      }

      const getLessonOpts: TypeOpts[] = periodOpts.filter(
        periodItem => periodItem.value === opt
      )

      if (getLessonOpts.length > 0) {
        setDateTimePickerOpts(getLessonOpts[0].data ?? [])

        if (getLessonOpts[0].data && getLessonOpts[0].data.length > 0) {
          const closestFutureDate = findClosestFutureDate(getLessonOpts[0].data)
          if (closestFutureDate) {
            setSelectDate(closestFutureDate)
            // Find the corresponding dateTime string for the closest future date
            const dateTimeStr = getLessonOpts[0].data.find(dateTimeStr => {
              const datePart = dateTimeStr.split(' ')[0]
              return dayjs(datePart).isSame(dayjs(closestFutureDate), 'day')
            })
            if (dateTimeStr) {
              setValue('classLessonDate', dateTimeStr)
            }
          }
        }

        refLessonDateTime?.current?.clearValue()

        const lessonsCount = (getLessonOpts[0].data ?? []).length
        if (lessonsCount > 0) {
          setNumberOfLessons(lessonsCount)
        }
      }

      handleFeeCourse(
        Number(getValues('classId')),
        Number(opt),
        Number(getValues('priceOptionId'))
      )
    }
  }

  const handleSelectDate = (date: Date | null) => {
    // If you see isRequired error or 此欄位為必填, please check the function here
    if (date) {
      const newOpts = dateTimePickerOpts.filter(time =>
        dayjs(time?.split(' ')[0]).isSame(dayjs(date), 'day')
      )

      if (newOpts.length > 0) {
        setValue('classLessonDate', newOpts[0])
      }
      setSelectDate(date)

      const classData = (objOpts || {})?.[courseId]?.classes?.find(
        o => o.value === getValues('classId')
      )

      if (
        classData?.type === ClassTypeEnum.appointment &&
        [
          AddTeachingServiceMode.addLesson,
          AddTeachingServiceMode.changeLesson,
        ].includes(mode as AddTeachingServiceMode)
      ) {
        const periodOpts: TypeOpts[] = Object.values(classData?.periods || {})
        if (!periodOpts) return
        const res = periodOpts.filter(p =>
          p.value?.includes(newOpts?.[0]?.split(' ')[0]?.split('T')?.[0])
        )
        setPeriodOpts(res)
      }
    }
  }

  const onSubmitGenerateTeachingServiceLink = (data: InputFields) => {
    const domain = siteDomainIfCustom(currentSite?.customDomain, currentSiteUrl)
    const schoolUrl = currentSchoolUrl ?? ''

    const thisCourse = courses.filter(
      course => course.id === Number(data?.courseId)
    )
    const searchParams = new URLSearchParams({
      name: firstName,
      email,
      phone: displayPhone,
      school: schoolUrl,
      course: thisCourse[0]?.path ?? '',
    })

    const params: {
      classId?: string
      recurLessonTimeId?: string
      firstLessonDateUnix?: string
    } = {}

    if (data?.classLessonDate) {
      searchParams.append(
        'firstLessonDateUnix',
        formatUnixTime(data?.classLessonDate)
      )
    }

    if (data?.periodId) {
      searchParams.append('recurLessonTimeId', String(data.periodId))
    }
    if (data?.priceOptionId) {
      searchParams.append('priceOptionId', String(data.priceOptionId))
    }

    params.classId = String(data.classId)

    searchParams.append('classId', String(data.classId))

    const normalDomain = import.meta.env.DEV
      ? `http://localhost:3001`
      : `https://${domain}`
    const urlWithParams = `${normalDomain}/enrol?${searchParams.toString()}`

    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 500) // Reset loading status after 0.5's for better UX
    setSkipLink(urlWithParams)
  }

  const currentClassType = useMemo(() => {
    return classOpts?.find(o => {
      return Number(o.value) === Number(watch('classId'))
    })?.type
  }, [classOpts, watch('classId')])

  const selectedCourseName = useMemo(() => {
    return (
      (courseOpts || [])?.find(course => courseId === course?.value)?.label ||
      '-'
    )
  }, [courseOpts, courseId])

  const selectedClassName = useMemo(() => {
    return (
      (classesOptions || [])?.find(course => classId === course?.value)
        ?.label || '-'
    )
  }, [classesOptions, classId])

  const defaultProps = {
    headerBackButton,
    handleCloseAndClearData,
    // onLessonChanged,
    currentDetail,
    form,
    isFreeLesson,
    priceType,
    numberOfLessons,
    setIsFreeLesson,
    onValueChangeSelectCourse,
    courseOpts,
    classesOptions,
    classOpts,
    currentClassType,
    onValueChangeSelectPeriod,
    onValueChangeSelectClass,
    periodOpts,
    dateTimePickerOpts,
    selectedDate,
    handleSelectDate,
    currentClassId,
    currentEnrolId,
    isSendEmail,
    setIsSendEmail,
    timeZone,
    skipLink,
    selectedClassName,
    selectedCourseName,
    selectedPriceOption,
    priceOptions,
    onValueChangeSelectPriceOption,
    show5PeriodLimitNotice,
    isLoadingCourseOptions,
  }

  const getDrawerMaxWidth = () => {
    if (mode === AddTeachingServiceMode.addCourseDirectly) return '40%'
    if (mode === AddTeachingServiceMode.changeLesson) return '500px'
    return undefined
  }

  if (open) {
    return (
      <Drawer
        open={open}
        onClose={handleCloseAndClearData}
        maxWidth={getDrawerMaxWidth()}
      >
        <div className="pb-4">
          {mode === AddTeachingServiceMode.addCourseDirectly && (
            <AddCourseDirectly {...defaultProps} />
          )}
          {mode === AddTeachingServiceMode.addLesson && (
            <AddLesson
              {...defaultProps}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              setSkipLink={setSkipLink}
            />
          )}
          {mode === AddTeachingServiceMode.changeLesson && (
            <ChangeLesson {...defaultProps} />
          )}
          {mode === AddTeachingServiceMode.generateCourseLink && (
            <GenerateCourseLink
              {...defaultProps}
              isGenerating={isGenerating}
              onSubmitGenerateTeachingServiceLink={
                onSubmitGenerateTeachingServiceLink
              }
            />
          )}
          {mode === AddTeachingServiceMode.addStudentOnly && (
            <AddStudentOnly {...defaultProps} />
          )}
        </div>
      </Drawer>
    )
  }
  return <></>
}

export const Loading = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('ml-2.5', className)} {...props}>
    {children}
  </div>
)

export const LabelField = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-2 mt-4 text-base', className)} {...props}>
    {children}
  </div>
)

export const Field = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('w-full relative', className)} {...props}>
    {children}
  </div>
)

export const ErrorField = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'absolute text-[#ff4d4f] -bottom-[18px] left-0 text-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export const Link = ({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a className={cn('cursor-pointer break-words', className)} {...props}>
    {children}
  </a>
)

export default CreateTeachingService
