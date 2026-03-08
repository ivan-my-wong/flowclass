import { ClassPriceOption } from '@/models/class-price-options.entity'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { RegularPeriods } from '@/models/course-regular-periods.entity'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { ClassTypeEnum, PriceType } from '@/models/enums'
import { RepeatFormats } from '@/models/repeat-formats.entity'

export const calculateNumberOfLessonInClass = (
  classType: ClassTypeEnum,
  regularPeriod: RegularPeriods | undefined,
  recurringFormat: RepeatFormats | undefined
) => {
  if (
    classType === ClassTypeEnum.SUBSCRIPTION ||
    classType === ClassTypeEnum.RECURRING ||
    classType === ClassTypeEnum.APPOINTMENT
  ) {
    return recurringFormat?.times || 1
  } else {
    return regularPeriod?.lessons.length || 1
  }
}

export const calculateSingleLessonPrice = ({
  priceType,
  classType,
  regularPeriod,
  recurringFormat,
  priceOptions,
}: {
  priceType: PriceType
  classType: ClassTypeEnum
  regularPeriod: RegularPeriods | undefined
  recurringFormat: RepeatFormats | undefined
  priceOptions?: ClassPriceOption[]
}): number => {
  const tuition = priceOptions?.[0]?.amount || 0
  if (priceType === PriceType.PER_LESSON) {
    return tuition
  } else if (priceType === PriceType.PER_CLASS) {
    if (classType === ClassTypeEnum.SUBSCRIPTION) {
      return tuition
    } else if (classType === ClassTypeEnum.RECURRING || classType === ClassTypeEnum.APPOINTMENT) {
      return tuition / (recurringFormat?.times || 1)
    } else {
      const numOfLessons = regularPeriod?.lessons.length || 1
      return tuition / numOfLessons
    }
  }
}

export const calculateClassPrice = (
  selectedClass: ClassEntity | undefined,
  numOfSelectedLessons: number,
  totalLesson: number,
  selectedPriceOption: ClassPriceOption | null
) => {
  if (selectedClass && selectedPriceOption) {
    const amount = Number(selectedPriceOption.amount)
    if (!Number.isFinite(amount)) return 0
    if (selectedClass.priceType === PriceType.PER_LESSON) {
      return amount * numOfSelectedLessons
    } else {
      const numberOfLessons = selectedPriceOption.numberOfLessons
      if (!numberOfLessons || !Number.isFinite(numberOfLessons) || numberOfLessons <= 0) return 0
      return Number(((amount * numOfSelectedLessons) / numberOfLessons).toFixed(2))
    }
  }

  return 0
}

export const getEnrollCourseLocations = async (
  enrollCourse: EnrollCourse,
  classRepository: ClassRepository
): Promise<string> => {
  if (!enrollCourse.multipleClassMapping?.length) {
    return ''
  }

  const locationNames = await Promise.all(
    enrollCourse.multipleClassMapping.map(async (mapping) => {
      const classEntity = await classRepository.findOne({
        where: { id: mapping.classId },
        relations: { locationRoom: true },
      })
      return classEntity?.locationRoom?.name
    })
  )
  return locationNames.filter(Boolean).join(', ')
}
