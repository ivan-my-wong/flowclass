import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useRecoilState } from 'recoil'

import { Cross2Icon } from '@radix-ui/react-icons'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import Overlay from '@/components/Containters/Overlay'
import { GroupedOption, TagOption } from '@/components/Selector/MultiGroupedSelect'
import useResponsive from '@/hooks/useResponsive'
import { courseFilterOpenState } from '@/stores/courseData'
import { useSchoolContext } from '@/stores/schoolContext'
import { Course, School, Site } from '@/types'
import { GroupedOptionObject } from '@/utils/courseDisplay'

import CourseTagCheckboxOption from '../Tags/CourseTagCheckboxOption'
import Text from '../Texts/Text'

const FilterTagSidebar = (): JSX.Element => {
  const router = useRouter()
  const { t } = useTranslation()
  const { schoolContext } = useSchoolContext()
  const { courses } = schoolContext as {
    site: Site
    courses: Course[]
    school: School
  }
  const { isMobile, isTablet } = useResponsive()
  const [groupedOptions, setGroupedOptions] = useState<GroupedOption[]>([])
  const [showFilterModal, setFilterModal] = useRecoilState(courseFilterOpenState)
  const [tagOptions, setTagOptions] = useState<TagOption[]>([])
  const pathname = usePathname()

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

    setGroupedOptions(groupedOptionsArray)

    return groupedOptionsArray
  }

  useEffect(() => {
    setGroupedOptions(groupedOptions)
  }, [groupedOptions])

  useEffect(() => {
    const group = createTagOptionsFromCourseTags()
  }, [router.query])

  const getQueryString = (): Record<string, string> => {
    const query = groupedOptions.reduce(
      (acc: Record<string, any>, grpOpt) => {
        return grpOpt.options.reduce((innerAcc: Record<string, any>, tag) => {
          if (tag.isSelected) {
            if (innerAcc[tag.category] && Array.isArray(innerAcc[tag.category])) {
              return {
                ...innerAcc,
                [tag.category]: [...innerAcc[tag.category], tag.value],
              }
            } else if (innerAcc[tag.category] && typeof innerAcc[tag.category] === 'string') {
              return {
                ...innerAcc,
                [tag.category]: [innerAcc[tag.category], tag.value],
              }
            } else {
              return {
                ...innerAcc,
                [tag.category]: tag.value,
              }
            }
          } else {
            return {
              ...innerAcc,
            }
          }
        }, acc)
      },
      { tab: 'courses' }
    )

    return query
  }

  return (
    <>
      <Overlay />
      <div
        className={`${showFilterModal ? 'w-96' : 'w-0'} ${
          (isMobile || isTablet) && 'w-full'
        } transition-right bg-background fixed bottom-0 right-0 top-0 z-30 block h-dvh overflow-y-scroll p-6 transition-opacity duration-300 ease-out`}
        role="document"
      >
        <div className="flex w-full flex-col p-1">
          <div className="flex w-full flex-row items-center justify-between gap-4 ">
            <button
              onClick={() => {
                setFilterModal(!showFilterModal)
              }}
              className="text-textSubtle  text-2xl"
            >
              <Cross2Icon className="w-30 h-30" />
            </button>
            <div className="text-text w-full text-xl font-bold">
              <Text>{t('component:filterTagSidebar.filter')}</Text>
            </div>
            <div className="flex flex-row justify-end gap-2">
              <Button
                variant="outlined"
                className="whitespace-nowrap"
                onClick={() => {
                  const updatedOptions = groupedOptions.map(group => ({
                    ...group,
                    options: group.options.map(option => ({
                      ...option,
                      isSelected: false,
                    })),
                  }))

                  setGroupedOptions(updatedOptions)
                }}
              >
                {t('component:filterTagSidebar.reset')}
              </Button>
              <Button
                className="whitespace-nowrap"
                onClick={() => {
                  router
                    .push({ query: getQueryString(), pathname }, undefined, {
                      shallow: false,
                    })
                    .then(() => {
                      setFilterModal(false)
                    })
                  // searchCourseByTags(selectedTagOptions)
                }}
              >
                {t('component:filterTagSidebar.apply')}
              </Button>
            </div>
          </div>

          {groupedOptions.map(groupedOption => {
            return (
              <>
                <div className="border-textDisabled align-center my-4 w-full justify-center border-t" />
                <CourseTagCheckboxOption
                  label={groupedOption.label}
                  options={groupedOption.options}
                  setGroupedOptions={setGroupedOptions}
                />
              </>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default FilterTagSidebar
