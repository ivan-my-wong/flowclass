import { Translate } from 'next-translate'

import { GroupedOption, TagOption } from '@/components/Selector/MultiGroupedSelect'
import { SelectedClassDataState } from '@/stores/enrol'
import { ClassType, Course, RepeatType, School } from '@/types'
import { Tuition } from '@/types/enrol'
import { WebsiteTemplate } from '@/types/websiteTemplate'

export interface GroupedOptionObject {
  [key: string]: any // This allows any string key with any value type
}

export const enrolCourseScrollAction = (currentTheme: string): void => {
  const heroSectionElement = document.getElementById('hero_image')

  if (currentTheme === WebsiteTemplate.Minimal) {
    window.scroll({ top: 0, left: 0, behavior: 'smooth' })
  } else if (currentTheme === WebsiteTemplate.Hero) {
    window.scrollTo({
      top: heroSectionElement?.offsetHeight,
      behavior: 'smooth',
    })
  } else {
    if (heroSectionElement) {
      window.scrollTo({
        top: heroSectionElement?.offsetHeight,
        behavior: 'smooth',
      })
    } else {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' })
    }
  }
}

export const createTagOptionsFromCourseTags = (courses: Course[]): TagOption[] => {
  const tagOptions: TagOption[] = []

  courses?.forEach(course => {
    course.tags?.forEach(tag => {
      if (tag.searchable !== false) {
        tag.value.forEach(value => {
          // Check if the value is not already in tagOptions
          const isValueUnique = !tagOptions.some(
            option => option.category === tag.key && option.value === value
          )

          if (isValueUnique) {
            tagOptions.push({
              value,
              label: value,
              category: tag.key,
            })
          }
        })
      }
    })
  })

  return tagOptions
  // setTagOptions(tagOptions)
  // return createGroupTagOptions(tagOptions)
}

export const createGroupTagOptions = (tagOptions: TagOption[]): GroupedOption[] => {
  const groupedOptions: GroupedOptionObject = {}

  // Iterate through the tagOptions and group them by category
  tagOptions.forEach(tagOption => {
    if (!groupedOptions[tagOption.category]) {
      // If the category doesn't exist in the groupedOptions, create it
      groupedOptions[tagOption.category] = {
        label: tagOption.category,
        options: [],
        isEnabled: true,
      }
    }
    // Push the tagOption into the corresponding category
    groupedOptions[tagOption.category].options.push(tagOption)
  })

  // Convert the groupedOptions object into an array of GroupedOption objects
  const groupedOptionsArray = Object.values(groupedOptions)

  // setGroupedOptions(groupedOptionsArray)

  return groupedOptionsArray
}

export const createTagOptionsFromParams = (
  value: GroupedOption,
  params: string | string[] | undefined,
  newSelectedTagOptions: TagOption[]
): TagOption[] => {
  let tagOptions: TagOption[] = []
  let updatedSelectedTagOptions = newSelectedTagOptions
  if (Array.isArray(params) && params.length > 0) {
    tagOptions = params.map(val => ({
      value: val,
      label: value.label + ': ' + val,
      category: value.label,
    }))
    updatedSelectedTagOptions = [...newSelectedTagOptions, ...tagOptions]
  } else if (typeof params === 'string') {
    tagOptions = [
      {
        value: params,
        label: value.label + ': ' + params,
        category: value.label,
      },
    ]
    updatedSelectedTagOptions = [...newSelectedTagOptions, ...tagOptions]
  }
  return updatedSelectedTagOptions
}

export const allCoursesHaveNoTagsOrNoSearchableTags = (courses: Course[]): boolean => {
  const res = courses.every(course => {
    // Check if the course has no tags or all tags are not searchable
    return (
      course?.tags === null ||
      course?.tags?.length === 0 ||
      course?.tags?.every(tag => !tag.searchable)
    )
  })

  return res
}

export const getTagQueryString = (
  currentTheme: string,
  selectedTagOptions: TagOption[]
): Record<string, string> => {
  const query = selectedTagOptions.reduce(
    (acc: Record<string, any>, tag) => {
      if (acc[tag.category] && Array.isArray(acc[tag.category])) {
        return {
          ...acc,
          [tag.category]: [...acc[tag.category], tag.value],
        }
      } else if (acc[tag.category] && typeof acc[tag.category] === 'string') {
        return {
          ...acc,
          [tag.category]: [acc[tag.category], tag.value],
        }
      }
      return {
        ...acc,
        [tag.category]: tag.value,
      }
    },
    currentTheme === WebsiteTemplate.Hero ? {} : { tab: 'courses' }
  )

  return query
}

export const customOrderCourse = (school: School, filterCourses: Course[]): Course[] => {
  if (!filterCourses) {
    return []
  }

  if (school && school.courseOrder && school.courseOrder.length !== 0) {
    filterCourses.sort((a, b) => {
      return (school.courseOrder?.indexOf(a.id) ?? -1) - (school.courseOrder?.indexOf(b.id) ?? -1)
    })
  }
  return filterCourses
}

export const updateCurrentSelectedClass = (
  array: SelectedClassDataState[],
  currentIndex: number,
  newItem: SelectedClassDataState
): SelectedClassDataState[] => {
  if (currentIndex === array.length) return [...array, newItem]
  return array.map((item, idx) => (idx === currentIndex ? { ...item, ...newItem } : item))
}

export const updateSelectedClassTuition = (
  array: Tuition[],
  currentIndex: number,
  newItem: Tuition
): Tuition[] => {
  if (currentIndex === array.length) return [...array, newItem]

  return array.map((item, idx) => (idx === currentIndex ? { ...item, ...newItem } : item))
}

export const courseContainTimeNotNeededClass = (course: Course): boolean => {
  return course.classes.some(
    cls =>
      cls.type === ClassType.recurring ||
      cls.type === ClassType.subscription ||
      cls.type === ClassType.regularV2
  )
}

export const getSubscriptionClassDescription = (repeatFormat: RepeatType, t: Translate): string => {
  if (!repeatFormat?.repeat) {
    return `${t('course:subscription.oneTimePayment')}`
  }

  return `${t('course:forEvery')} ${repeatFormat?.every} ${repeatFormat?.unit}. ${t(
    'course:subscription.billingCycleRepeat'
  )} ${repeatFormat?.times} ${t('enrol:repeatType.times')}`
}
