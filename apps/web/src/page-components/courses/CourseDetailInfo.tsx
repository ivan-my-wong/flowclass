import { useState } from 'react'

import moment from 'moment/moment'
import useTranslation from 'next-translate/useTranslation'
import { BsClockFill } from 'react-icons/bs'
import { HiHashtag } from 'react-icons/hi'
import { IoIosPricetag } from 'react-icons/io'

// import { HiMiniHashtag } from 'react-icons/all'
import HoverDataCard from '@/components/Popups/HoverCard'
import { TuitionMode } from '@/types/class'
import { ClassType, Course } from '@/types/course'
import { Site } from '@/types/site'
import { availableTimeslotsCount, getPriceRangeFromCourse } from '@/utils/calculateCourse'
import { getCourseTimeslots } from '@/utils/calculateTime'
import { getPriceWithCurrency } from '@/utils/string.utils'

const CourseDetailInfo = ({
  course,
  site,
  justify = 'start',
}: {
  course: Course
  site: Site
  justify?: 'start' | 'center'
}): JSX.Element => {
  const { t } = useTranslation()

  const courseTimeslots = getCourseTimeslots(course)
  const coursePriceInfo = getPriceRangeFromCourse(course)
  const coursePriceRange = coursePriceInfo.priceRange
  const cheapestClass = coursePriceInfo.cheapestClass
  // const courseQuota = getCourseQuota(course)
  // const courseTotalFee = getCourseTotalFee(course)
  const currency = site.currency
  const [openHoverCard, setOpenHoverCard] = useState(false)
  const tagsToRender = course.tags?.filter(tag => tag.searchable) ?? []

  const renderClassLowestPrice = () => {
    // Check if all classes in the course are workshops
    const hasOnlyWorkshops =
      course?.classes &&
      course.classes.length > 0 &&
      course.classes.every(cls => cls.type === ClassType.workshop)

    // Get tuitionMode from the cheapest class if available
    let tuitionMode = cheapestClass ? cheapestClass.priceType : undefined

    // If all classes are workshops, display as PER_CLASS (price for entire event)
    if (hasOnlyWorkshops) {
      tuitionMode = TuitionMode.PER_CLASS
    }

    // Get number of lessons for PER_CLASS and events (workshops) - price is multiplied by this
    let numberOfLessons = cheapestClass ? availableTimeslotsCount(cheapestClass) : 0
    // Handle edge cases: if numberOfLessons is Infinity, NaN, or 0, default to 1
    if (!Number.isFinite(numberOfLessons) || numberOfLessons <= 0) {
      numberOfLessons = 1
    }

    // Handle MULTIPLE_OPTIONS case
    if (tuitionMode === TuitionMode.MULTIPLE_OPTIONS) {
      if (coursePriceRange[0] === 0 && coursePriceRange[1] === 0) {
        return t('course:courseDetailCard.freeLesson')
      } else if (coursePriceRange.length === 0) {
        return null
      } else if (coursePriceRange[0] !== coursePriceRange[1]) {
        return `${getPriceWithCurrency(currency, coursePriceRange[0])} -
         ${getPriceWithCurrency(currency, coursePriceRange[1])}`
      } else {
        return `${getPriceWithCurrency(currency, coursePriceRange[0])}`
      }
    }

    // Handle PER_LESSON case
    if (tuitionMode === TuitionMode.PER_LESSON) {
      const tuitionModeText = t('course:courseDetailCard.perLesson')
      let priceText = ''

      if (coursePriceRange[0] === 0 && coursePriceRange[1] === 0) {
        priceText = t('course:courseDetailCard.freeLesson')
      } else if (coursePriceRange.length === 0) {
        return null
      } else if (coursePriceRange[0] !== coursePriceRange[1]) {
        priceText = `${getPriceWithCurrency(currency, coursePriceRange[0])} -
         ${getPriceWithCurrency(currency, coursePriceRange[1])}`
      } else if (coursePriceRange[0] === coursePriceRange[1]) {
        priceText = `${getPriceWithCurrency(currency, coursePriceRange[0])}`
      }

      return `${priceText} / ${tuitionModeText}`
    }

    // Handle PER_CLASS case (multiply by number of lessons)
    if (tuitionMode === TuitionMode.PER_CLASS) {
      const tuitionModeText = hasOnlyWorkshops
        ? t('course:courseDetailCard.forEntireEvent')
        : t('course:courseDetailCard.forEntire')
      let priceText = ''

      if (coursePriceRange[0] === 0 && coursePriceRange[1] === 0) {
        priceText = t('course:courseDetailCard.freeLesson')
      } else if (coursePriceRange.length === 0) {
        return null
      } else if (coursePriceRange[0] !== coursePriceRange[1]) {
        // Multiply both min and max prices by number of lessons
        const minPrice = coursePriceRange[0] * numberOfLessons
        const maxPrice = coursePriceRange[1] * numberOfLessons
        priceText = `${getPriceWithCurrency(currency, minPrice)} -
         ${getPriceWithCurrency(currency, maxPrice)}`
      } else if (coursePriceRange[0] === coursePriceRange[1]) {
        // Multiply price by number of lessons
        const totalPrice = coursePriceRange[0] * numberOfLessons
        priceText = `${getPriceWithCurrency(currency, totalPrice)}`
      }

      return `${priceText} / ${tuitionModeText}`
    }

    return null
  }

  const CourseTag = ({ full }: { full?: boolean }): JSX.Element => {
    return (
      <div className="flex w-full flex-col gap-2">
        {tagsToRender?.slice(0, full ? tagsToRender.length : 3).map(tag => (
          <div key={tag.key} className={`box-row-full justify-${justify}`}>
            <HiHashtag className="flex-shrink-0" />
            <div
              key={tag.key}
              className={`${full ? '' : 'overflow-hidden text-ellipsis whitespace-nowrap'}`}
            >
              {tag.key}:{' '}
              {tag.value.map((value, index) => (
                <span key={tag.key}>
                  {value}
                  {index < tag.value.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="box-col-full gap-2">
      {courseTimeslots && (
        <div className={`box-row-full justify-${justify}`}>
          <BsClockFill className="flex-shrink-0" />
          {`${t('course:courseDetailCard.earliestLesson')} ${moment(courseTimeslots[0]).format(
            'YYYY/MM/DD'
          )}`}
        </div>
      )}
      {coursePriceRange !== null && coursePriceRange.length !== 0 && (
        <div className={`box-row-full justify-${justify}`}>
          <IoIosPricetag />
          {renderClassLowestPrice()}
        </div>
      )}
      <CourseTag />
      {tagsToRender?.length > 3 && (
        <HoverDataCard
          open={openHoverCard}
          setOpen={setOpenHoverCard}
          content={<CourseTag full />}
          trigger={
            <div className={`box-row-full justify-${justify}`}>
              <HiHashtag className="flex-shrink-0" />
              <div>{t('course:courseDetailCard.more')} ...</div>
            </div>
          }
        />
      )}
    </div>
  )
}

export default CourseDetailInfo
