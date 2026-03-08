import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'

import Box from '@/components/Containters/Box'
import { GroupedOption, TagOption } from '@/components/Selector/MultiGroupedSelect'
import Text from '@/components/Texts/Text'
import useResponsive from '@/hooks/useResponsive'
import ProvideCourseNotFound from '@/page-components/courses/ProvideCourseNotFound'
import SearchCourseWithTagButton, {
  searchCourseByTags,
} from '@/page-components/courses/SearchCourseWithTagButton'
import { useSchoolContext } from '@/stores/schoolContext'
import { Course, School, Site } from '@/types'
import {
  createGroupTagOptions,
  createTagOptionsFromCourseTags,
  createTagOptionsFromParams,
  customOrderCourse,
} from '@/utils/courseDisplay'
import { setResponsiveWidth } from '@/utils/style'

import CourseTemplateCard from '../template/CourseTemplateCard'

const CourseTab = (): JSX.Element => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useResponsive()

  const router = useRouter()
  const { schoolContext } = useSchoolContext()
  const { courses, site, school, baseUrl } = schoolContext as {
    site: Site
    courses: Course[]
    school: School
    baseUrl: string
  }

  const [filterCourses, setFilterCourses] = useState<Course[]>(courses)

  const [groupedOptions, setGroupedOptions] = useState<GroupedOption[]>([])

  const [tagOptions, setTagOptions] = useState<TagOption[]>([])
  const [isClickSearch, setIsClickSearch] = useState<boolean>(false)

  useEffect(() => {
    setFilterCourses(customOrderCourse(school, courses))
  }, [courses])

  const [selectedTagOptions, setSelectedTagOptions] = useState<TagOption[]>([])

  useEffect(() => {
    const courseTagOptions = createTagOptionsFromCourseTags(courses)

    setTagOptions(courseTagOptions)
    const group = createGroupTagOptions(courseTagOptions)
    setGroupedOptions(group)

    let newSelectedTagOptions: TagOption[] = []
    group.forEach(value => {
      const params = router.query[value.label]

      const updatedSelectedOptions = createTagOptionsFromParams(
        value,
        params,
        newSelectedTagOptions
      )
      newSelectedTagOptions = updatedSelectedOptions

      const { result, clickSearchVal } = searchCourseByTags(newSelectedTagOptions, courses)
      setFilterCourses(result)
      setIsClickSearch(clickSearchVal)
    })
  }, [router.query])

  if (courses && courses?.length !== 0) {
    return (
      <Box direction="col" style={{ gap: '2rem' }}>
        <SearchCourseWithTagButton
          courses={courses}
          groupedOptions={groupedOptions}
          selectedTagOptions={selectedTagOptions}
          setFilterCourses={setFilterCourses}
          setGroupedOptions={setGroupedOptions}
          setIsClickSearch={setIsClickSearch}
          setSelectedTagOptions={setSelectedTagOptions}
        />

        {isClickSearch && (
          <Text align="center">
            {t('course:showSearchResult')}: {filterCourses.length}
          </Text>
        )}

        <Box direction="row" justify="center" className="flex-wrap items-baseline gap-4">
          {filterCourses.map(course => {
            return (
              <CourseTemplateCard
                key={course.name}
                course={course}
                site={site}
                baseUrl={`/@${school.url ?? ''}`}
                className={setResponsiveWidth(isTablet, isMobile)}
              />
            )
          })}
        </Box>
      </Box>
    )
  } else {
    return <ProvideCourseNotFound />
  }
}

export default CourseTab
