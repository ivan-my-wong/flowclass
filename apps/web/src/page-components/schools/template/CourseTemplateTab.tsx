import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import TagButtonWithClose from '@/components/Buttons/TagButtonWithClose'
import { GroupedOption, TagOption } from '@/components/Selector/MultiGroupedSelect'
import Text from '@/components/Texts/Text'
import useResponsive from '@/hooks/useResponsive'
import ProvideCourseNotFound from '@/page-components/courses/ProvideCourseNotFound'
import { courseFilterOpenState } from '@/stores/courseData'
import { useSchoolContext } from '@/stores/schoolContext'
import { Course, School, Site } from '@/types'
import { allCoursesHaveNoTagsOrNoSearchableTags, customOrderCourse } from '@/utils/courseDisplay'
import { setResponsiveWidth } from '@/utils/style'

import CourseTemplateCard from './CourseTemplateCard'

interface GroupedOptionObject {
  [key: string]: any // This allows any string key with any value type
}

const CourseTemplateTab = (): JSX.Element => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useResponsive()
  const router = useRouter()
  const { schoolContext } = useSchoolContext()
  const { courses, site, school } = schoolContext as {
    site: Site
    courses: Course[]
    school: School
  }

  const [filterCourses, setFilterCourses] = useState<Course[]>(courses)

  const [groupedOptions, setGroupedOptions] = useState<GroupedOption[]>([])

  const [tagOptions, setTagOptions] = useState<TagOption[]>([])
  const [isClickSearch, setIsClickSearch] = useState<boolean>(false)
  const [showFilterModal, setFilterModal] = useRecoilState(courseFilterOpenState)
  const [selectedTagValueCount, setSelectedTagValueCount] = useState<number>(
    groupedOptions.reduce((count, group) => {
      return count + group.options.filter(option => option.isSelected).length
    }, 0)
  )

  useEffect(() => {
    setFilterCourses(customOrderCourse(school, filterCourses))
  }, [courses])

  const createTagOptionsFromCourseTags = () => {
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
                isSelected:
                  (router.query[tag.key] && router.query[tag.key]?.includes(value)) || false,
              })
            }
          })
        }
      })
    })

    setTagOptions(tagOptions)
    return createGroupTagOptions(tagOptions)
  }

  const createGroupTagOptions = (tagOptions: TagOption[]) => {
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

    setSelectedTagValueCount(
      groupedOptionsArray.reduce((count, group) => {
        return count + group.options.filter((option: any) => option.isSelected).length
      }, 0)
    )
    searchCourseByTags(groupedOptionsArray)
    setGroupedOptions(groupedOptionsArray)

    return groupedOptionsArray
  }

  const searchCourseByTags = (groupedOptions: GroupedOption[]) => {
    const filteredResult = courses?.filter(course => {
      return groupedOptions.some(selectedItem => {
        return (
          selectedItem.isEnabled && // Check if the selectedItem is enabled
          selectedItem.options.some(option => {
            return (
              option.isSelected && // Check if the option is selected
              course.tags?.some(tag => tag.value.includes(option.value))
            )
          })
        )
      })
    })

    setFilterCourses(filteredResult)
    setIsClickSearch(true)
    const noSelectedItems = !groupedOptions.some(item =>
      item.options.some(option => option.isSelected)
    )

    if (noSelectedItems) {
      setFilterCourses(courses)
    }
  }

  useEffect(() => {
    const group = createTagOptionsFromCourseTags()
  }, [router.query])

  const handleRemoveQueryParamByValue = (paramName: string, paramValue: string) => {
    const newQuery = { ...router.query }

    // Filter out the query parameters with the specified name and value
    for (const key in newQuery) {
      if (newQuery[key] === paramValue) {
        delete newQuery[key]
      }
    }

    router.push({ query: newQuery })
  }

  if (courses && courses?.length !== 0) {
    return (
      <div className="bg-background2 flex h-full w-full flex-col items-start justify-start gap-2 p-4 lg:h-dvh">
        <div className="box-row-full items-center justify-between gap-6">
          <Text className="text-text text-xl font-bold">{t('common:entity.class')}</Text>

          {!allCoursesHaveNoTagsOrNoSearchableTags(courses) && (
            <Button
              variant="outlined"
              onClick={() => {
                setFilterModal(!showFilterModal)
              }}
            >
              {t('course:search')}
            </Button>
          )}
        </div>
        <div className="border-textDisabled align-center my-4 w-full justify-center border-t" />

        {groupedOptions.some(item => item.options.some(option => option.isSelected)) && (
          <div className="mb-2 flex flex-row justify-between gap-2">
            <div className="flex flex-row gap-2">
              {groupedOptions.map(group => (
                <div key={group.label}>
                  {group.options
                    .filter(option => option.isSelected)
                    .map(option => (
                      <TagButtonWithClose
                        key={option.value}
                        isEnable={option.isSelected ?? false}
                        tagName={option.label}
                        onClick={() => {
                          setGroupedOptions((prevGroupedOptions: any) => {
                            const updatedOptions = prevGroupedOptions.map((groupedOption: any) => {
                              if (groupedOption.label === group.label) {
                                const updatedGroupedOptions = groupedOption.options.map(
                                  (opt: any) => {
                                    if (opt.value === option.value) {
                                      handleRemoveQueryParamByValue(option.category, option.value)
                                      return {
                                        ...opt,
                                        isSelected: !option.isSelected,
                                      }
                                    }
                                    return opt
                                  }
                                )
                                return {
                                  ...groupedOption,
                                  options: updatedGroupedOptions,
                                }
                              }
                              return groupedOption
                            })

                            return updatedOptions
                          })
                        }}
                      />
                    ))}
                </div>
              ))}
            </div>
            {selectedTagValueCount != 0 && (
              <div>{`${t('course:showing')} ${filterCourses.length} ${t('course:results')}`}</div>
            )}
          </div>
        )}

        <div className="grid w-full grid-cols-1 gap-4 pb-1 align-baseline md:grid-cols-2">
          {filterCourses?.map(course => {
            return (
              <CourseTemplateCard
                key={course.name}
                course={course}
                site={site}
                baseUrl={`/@${school.url ?? ''}`}
                className={setResponsiveWidth(isTablet, isMobile)}
                fullWidth={false}
              />
            )
          })}
        </div>
      </div>
    )
  } else {
    return <ProvideCourseNotFound />
  }
}

export default CourseTemplateTab
