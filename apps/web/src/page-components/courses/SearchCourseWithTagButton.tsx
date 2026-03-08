import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import TagButton from '@/components/Buttons/TagButton'
import MultiGroupedSelect, {
  GroupedOption,
  TagOption,
} from '@/components/Selector/MultiGroupedSelect'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import useResponsive from '@/hooks/useResponsive'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { useTabContext } from '@/stores/tabContext'
import { Course } from '@/types'
import { templateSectionBgColor } from '@/types/websiteTemplate'
import { allCoursesHaveNoTagsOrNoSearchableTags, getTagQueryString } from '@/utils/courseDisplay'

type SearchCourseWithTagButtonProps = {
  courses: Course[]
  groupedOptions: GroupedOption[]
  setGroupedOptions: (val: any) => void
  selectedTagOptions: TagOption[]
  setSelectedTagOptions: (val: any) => void
  setFilterCourses: (val: any) => void
  setIsClickSearch: (val: boolean) => void
}

export const searchCourseByTags = (selectedOptions: TagOption[], courses: Course[]) => {
  const filteredResult = courses?.filter(course => {
    return selectedOptions.some(selectedItem => {
      return (
        // course.tags?.some((tag) => tag.key === selectedItem.category) ||
        course.tags?.some(tag => tag.value.includes(selectedItem.value))
      )
    })
  })

  let clickSearchVal = true
  let result = filteredResult
  if (selectedOptions.length === 0) {
    clickSearchVal = false
    result = courses
    // setIsClickSearch(false)
    // setFilterCourses(courses)
  }

  // setFilterCourses(filteredResult)
  // setIsClickSearch(true)
  return { result, clickSearchVal }
}
const SearchCourseWithTagButton = ({
  courses,
  groupedOptions,
  setGroupedOptions,
  selectedTagOptions,
  setSelectedTagOptions,
  setFilterCourses,
  setIsClickSearch,
}: SearchCourseWithTagButtonProps): JSX.Element => {
  const { t } = useTranslation()
  const [currentTheme] = useRecoilState(currentWebsiteTheme)
  const { isMobile, isTablet } = useResponsive()
  const router = useRouter()
  const { currentTab, setCurrentTab } = useTabContext()
  const pathname = usePathname()

  const handleOptionChange = (selectedOptions: TagOption[]) => {
    const updatedSelectedOptions = selectedOptions.map(option => {
      if (option.label.includes(':')) {
        option.label = option.label.split(':')[1].trim()
      }
      option.label = option.category + ': ' + option.label

      return option
    })

    const selectedOptionsIds = selectedOptions.map(option => option.value)
    const deletedSelectedTagOptions = selectedTagOptions
      .filter(option => !selectedOptionsIds.includes(option.value))
      .map(option => {
        if (option.label.includes(':')) {
          option.label = option.label.split(':')[1].trim()
        }

        return option
      })

    setSelectedTagOptions(updatedSelectedOptions)
  }

  if (!allCoursesHaveNoTagsOrNoSearchableTags(courses)) {
    // Do something when there are courses with tags or searchable tags
    return (
      <>
        <div
          className={`border-textDisabled ${templateSectionBgColor(
            currentTheme
          )} flex w-full flex-col gap-3 rounded-xl border p-7`}
        >
          <Heading>{t('course:searchCourse')}</Heading>
          <div className={`flex w-full flex-row gap-2  ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <Text>{t('course:searchByCategory')}: </Text>
            <div className="flex-row gap-2">
              {groupedOptions?.map(group => (
                <TagButton
                  key={group.label} // Make sure to provide a unique key
                  isEnable={group.isEnabled}
                  tagName={group.label}
                  onClick={() => {
                    const updatedOptions = groupedOptions.map(optionGroup => {
                      if (optionGroup.label === group.label) {
                        return {
                          ...optionGroup,
                          isEnabled: !group.isEnabled,
                        }
                      }
                      return optionGroup
                    })
                    setGroupedOptions(updatedOptions)
                  }}
                />
              ))}
            </div>
          </div>

          <div className={`flex w-full gap-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <div className="w-full justify-items-center">
              <MultiGroupedSelect
                groupedOptions={groupedOptions.filter(option => option.isEnabled)}
                onChange={e => {
                  handleOptionChange(e)
                }}
                selectedTagOptions={selectedTagOptions}
              />
            </div>
            <Button
              data-testid="search-courses-btn"
              className="whitespace-nowrap"
              onClick={() => {
                setCurrentTab(currentTab)
                router.push(
                  {
                    hash: 'courses',
                    query: getTagQueryString(currentTheme, selectedTagOptions),
                    pathname,
                  },
                  undefined,
                  {
                    shallow: false,
                  }
                )
                const { result, clickSearchVal } = searchCourseByTags(selectedTagOptions, courses)
                setFilterCourses(result)
                setIsClickSearch(clickSearchVal)
              }}
            >
              {t('course:search')}
            </Button>
          </div>
        </div>
      </>
    )
  } else {
    return <></> // Returning an empty fragment when there are no courses with tags or searchable tags
  }
}

export default SearchCourseWithTagButton
