// eslint-disable-next-line no-restricted-syntax
import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaChevronLeft } from 'react-icons/fa'
import { MultiValue } from 'react-select'

import Box from '@/components/Containers/Box'
import Drawer from '@/components/Drawer/Drawer'
import RadioGroup, {
  RadioItemProps,
} from '@/components/RadioGroup/RadioButtonGroup'
import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import useCourseData from '@/hooks/useCourseData'
import { ClassProps, CourseProps } from '@/types/coupon'
import {
  CourseAndClassOptionProps,
  CourseSelectorItem,
  OptionProps,
} from '@/types/courseSelector.type'

enum CouponCourseOptionSelect {
  ALL_COURSES = 'ALL_COURSES',
  SELECTED_COURSES = 'SELECTED_COURSES',
}

type OptionDialogProps = {
  open: boolean
  courses: CourseProps[]
  setOpen: () => void
  actionSelectOption: (value: CourseAndClassOptionProps[]) => void
  actionSelectClassOption: (value: MultiValue<OptionProps>) => void
}

const OptionCourseDialog = ({
  open,
  setOpen,
  actionSelectOption,
  actionSelectClassOption,
  courses,
}: OptionDialogProps): JSX.Element => {
  const { t } = useTranslation()
  const [optionSelect, setOptionSelect] = useState<string>(
    CouponCourseOptionSelect.ALL_COURSES
  )

  const { getFilteredCourseOptions } = useCourseData()
  const allowedCourseIds = useMemo(
    () => new Set(courses.map(c => c.id)),
    [courses]
  )
  const options = useMemo(() => {
    const raw = getFilteredCourseOptions()
    return raw
      .map(group => ({
        ...group,
        options: group.options.filter(o => allowedCourseIds.has(o.courseId)),
      }))
      .filter(group => group.options.length > 0)
  }, [getFilteredCourseOptions, allowedCourseIds])

  const handleSelectOption = (e: MultiValue<OptionProps>) => {
    const courseIndexMap: { [key: number]: number } = {}
    const listCourse: CourseAndClassOptionProps[] = []

    e.map((institution: OptionProps) => {
      const courseId = +institution.courseId
      const classId = institution.value
      const className = institution.label

      if (courseIndexMap[courseId] === undefined) {
        courseIndexMap[courseId] = listCourse.length
        listCourse.push({
          course: institution.course,
          courseId,
          previewImageUrl: institution.previewImageUrl,
          classes: [{ id: +classId, name: className }],
        })
      } else {
        const courseIndex = courseIndexMap[courseId]
        listCourse[courseIndex].classes.push({ id: +classId, name: className })
      }

      return true
    })

    actionSelectOption([...listCourse]) // Create a new array to avoid mutation
    actionSelectClassOption(e)
  }
  const handleChangeOption = (value: string) => {
    setOptionSelect(value)
    actionSelectOption([])
    actionSelectClassOption([])
  }
  useEffect(() => {
    actionSelectOption([])
    actionSelectClassOption([])
  }, [])
  const radioOptions: RadioItemProps[] = [
    {
      value: CouponCourseOptionSelect.ALL_COURSES,
      label: t('promotion:teachingServiceOption1') as string,
    },

    {
      value: CouponCourseOptionSelect.SELECTED_COURSES,
      label: t('promotion:teachingServiceOption2') as string,
    },
  ]

  return (
    <Drawer open={open} onClose={setOpen}>
      <Box direction="column">
        <Box
          justify="space-between"
          css={{
            paddingBottom: '$4',
            // margin: '0 $2',
            borderBottom: '1px solid $colors$textDisabled',
          }}
        >
          <Box
            justify="flex-start"
            onClick={() => setOpen()}
            css={{ fontWeight: 'bold', fontSize: '$6', cursor: 'pointer' }}
          >
            <FaChevronLeft />
            {t('promotion:teachingService')}
          </Box>
        </Box>
        <Box direction="column" css={{ paddingTop: '$6' }} align="flex-start">
          <Box
            align="flex-start"
            direction="column"
            css={{
              borderBottom: '1px solid $colors$textDisabled',
              paddingBottom: '$6',
            }}
          >
            <RadioGroup
              itemValues={radioOptions}
              defaultValue={optionSelect}
              onValueChange={(value: string) => handleChangeOption(value)}
            />
          </Box>

          {optionSelect === CouponCourseOptionSelect.SELECTED_COURSES && (
            <>
              <Box css={{ width: '100%', marginBottom: '30vh' }}>
                <CourseAndClassSelector
                  options={options}
                  onChange={handleSelectOption}
                  width="100%"
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}

export default OptionCourseDialog
