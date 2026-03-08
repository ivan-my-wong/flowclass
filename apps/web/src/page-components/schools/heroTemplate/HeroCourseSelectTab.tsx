import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useRecoilValue } from 'recoil'

import useTranslation from 'next-translate/useTranslation'

import { GroupedOption, TagOption } from '@/components/Selector/MultiGroupedSelect'
import useResponsive from '@/hooks/useResponsive'
import ProvideCourseNotFound from '@/page-components/courses/ProvideCourseNotFound'
import SearchCourseWithTagButton, {
  searchCourseByTags,
} from '@/page-components/courses/SearchCourseWithTagButton'
import { useSchoolContext } from '@/stores/schoolContext'
import { wishlistState } from '@/stores/wishlist'
import { Course, School, Site } from '@/types'
import {
  createGroupTagOptions,
  createTagOptionsFromCourseTags,
  createTagOptionsFromParams,
  customOrderCourse,
} from '@/utils/courseDisplay'
import { setResponsiveWidth } from '@/utils/style'

import CourseTemplateCardV2 from '../template/CourseTemplateCardV2'
import WishlistedCourseInfo from '../WishlistedCourseInfo'

const HeroCourseSelectTab = (): JSX.Element => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useResponsive()
  const router = useRouter()
  const { schoolContext } = useSchoolContext()
  const { courses, site, school } = schoolContext as {
    site: Site
    courses: Course[]
    school: School
    baseUrl: string
  }

  const [filterCourses, setFilterCourses] = useState<Course[]>(courses)
  const [groupedOptions, setGroupedOptions] = useState<GroupedOption[]>([])
  const [, setTagOptions] = useState<TagOption[]>([])
  const [isClickSearch, setIsClickSearch] = useState<boolean>(false)
  const wishlist = useRecoilValue(wishlistState)
  useEffect(() => {
    setFilterCourses(customOrderCourse(school, filterCourses))
  }, [])

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
  }, [router.query, courses])

  if (courses && courses?.length !== 0) {
    return (
      <div
        id="courses"
        className="relative flex h-full w-full flex-col items-center justify-center"
      >
        <div id="results" className="mt-4 flex h-full w-full flex-col gap-2 px-8 py-4">
          <SearchCourseWithTagButton
            courses={courses}
            groupedOptions={groupedOptions}
            selectedTagOptions={selectedTagOptions}
            setFilterCourses={setFilterCourses}
            setGroupedOptions={setGroupedOptions}
            setIsClickSearch={setIsClickSearch}
            setSelectedTagOptions={setSelectedTagOptions}
          />

          {/* <Heading align="center">{t('school:heading.providedCourse')}</Heading> {isClickSearch && (
            <Text align="center">
              {t('course:showSearchResult')}: {filterCourses.length}
            </Text>
          )} */}

          <div className="mt-4 flex flex-wrap justify-center gap-8">
            {filterCourses?.map((course, index) => {
              return (
                <CourseTemplateCardV2
                  id={`course-card-${index}`}
                  key={course.name}
                  course={course}
                  school={school}
                  site={site}
                  baseUrl={`/@${school.url ?? ''}`}
                  className={setResponsiveWidth(isTablet, isMobile)}
                  fullWidth={isMobile}
                />
              )
            })}
          </div>
        </div>

        {/* Wishlist Overlay */}
        {wishlist.wishlistItems && wishlist.wishlistItems.length > 0 && (
          <div className="fixed bottom-10 left-0 right-0 z-50 p-8">
            <WishlistedCourseInfo />
          </div>
        )}
      </div>
    )
  } else {
    return (
      <div className="flex h-full w-screen flex-col items-center justify-center overflow-x-hidden">
        <ProvideCourseNotFound />
      </div>
    )
  }
}

export default HeroCourseSelectTab
