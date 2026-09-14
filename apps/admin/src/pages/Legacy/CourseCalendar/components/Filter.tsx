import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import Checkbox from '@/components/Checkbox/Checkbox'
import Drawer from '@/components/Drawer/Drawer'
import Label from '@/components/Inputs/Label'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import usePromotionData from '@/hooks/usePromotionData'
import ContentLayout from '@/layouts/ContentLayout'
import { CourseProps } from '@/types/coupon'

type PropTypes = {
  open: boolean
  handleClose: () => void
  handleClassSelect: (value: number[]) => void
}

const Filter = ({
  open,
  handleClose,
  handleClassSelect,
}: PropTypes): JSX.Element => {
  const { t } = useTranslation()
  const { useFetchCourseAndStudentData } = usePromotionData()
  const fetchCourseAndStudentResult = useFetchCourseAndStudentData(!open)
  const { data } = fetchCourseAndStudentResult
  const [courseOption, setCourseOption] = useState<CourseProps[]>(
    data ? JSON.parse(JSON.stringify(data?.listCourse)) : []
  )
  useEffect(() => {
    if (data) {
      const filteredCourse = data.listCourse.filter(
        course => course.type === 'recurring'
      )
      setCourseOption(JSON.parse(JSON.stringify(filteredCourse)))
    }
  }, [data])

  const onChangeCheckboxParent = (groupId: number): void => {
    setCourseOption(prevOptions => {
      if (!prevOptions) {
        return []
      }

      const groupIndexMap: { [key: number]: number } = {}
      prevOptions.forEach((group, index) => {
        groupIndexMap[group.id] = index
      })

      const groupIndex = groupIndexMap[groupId]
      if (groupIndex === undefined) {
        return prevOptions
      }

      const updatedOptions = [...prevOptions]
      const group = { ...updatedOptions[groupIndex] }
      const isChecked = !group.checked
      const updatedClasses = group.classes.map(menu => {
        // if (isChecked) {
        //   IdClassSelected.push(menu.id) // Add selected class ID to the array
        // }
        return {
          ...menu,
          checked: isChecked,
        }
      })

      updatedOptions[groupIndex] = {
        ...group,
        checked: isChecked,
        classes: updatedClasses,
      }

      return updatedOptions
    })
    // handleClassSelect(IdClassSelected)
  }

  const onChangeCheckboxChild = (groupId: number, menuId: number): void => {
    const groupIndex = courseOption?.findIndex(group => group.id === groupId)

    if (groupIndex !== undefined && groupIndex !== -1) {
      const menuIndex = courseOption[groupIndex].classes.findIndex(
        menu => menu.id === menuId
      )

      if (menuIndex !== undefined && menuIndex !== -1) {
        const updatedCourseOption = [...courseOption]

        const menu = { ...updatedCourseOption[groupIndex].classes[menuIndex] }
        menu.checked = !menu.checked

        updatedCourseOption[groupIndex].classes[menuIndex] = menu
        updatedCourseOption[groupIndex].checked = updatedCourseOption[
          groupIndex
        ].classes.every(menu => menu.checked)
        // IdClassSelected = updatedCourseOption[groupIndex].classes
        //   .filter(menu => menu.checked)
        //   .map(menu => menu.id)
        setCourseOption(updatedCourseOption)
      }
    }
    // handleClassSelect(IdClassSelected)
  }
  const onChangeReset = (): void => {
    if (data) {
      const filteredCourse = data.listCourse.filter(
        course => course.type === 'recurring'
      )
      setCourseOption(JSON.parse(JSON.stringify(filteredCourse)))
    }
  }

  const handleSave = () => {
    const IdClassSelected: number[] = courseOption
      .flatMap(course => course.classes) // Flatten the classes arrays into a single array
      .filter(el => el.checked) // Filter only the checked classes
      .map(el => el.id) // Extract the IDs of the checked classes

    handleClassSelect(IdClassSelected)
    handleClose()
  }
  // const headerBackButton: HeaderBackButtonStatus = ()
  const leftBackButton = (
    <Box className="bg-transparent text-black">
      {t('lessonDateTime:filter')}
    </Box>
  )
  const rightHeaderContent = (
    <Box>
      <Button
        className="bg-transparent text-primary text-md"
        onClick={onChangeReset}
      >
        {t('lessonDateTime:action:reset')}
      </Button>
      <Button className="bg-background-disabled" onClick={handleClose}>
        {t('lessonDateTime:action:cancel')}
      </Button>
      <Button onClick={handleSave}>{t('lessonDateTime:action:save')}</Button>
    </Box>
  )
  const handleCloseDrawer = () => {
    // reset()
    handleClose()
  }

  return (
    <Drawer open={open} onClose={handleCloseDrawer}>
      <ContentLayout
        // headerBackButton={headerBackButton}
        leftHeader={leftBackButton}
        rightHeader={rightHeaderContent}
      >
        <Box direction="col" className="mt-4">
          {courseOption &&
            courseOption.map(course => {
              return (
                <Box key={course.id} direction="col" className="my-2">
                  <Box align="center">
                    <Box gap="lg" justify="start">
                      <Checkbox
                        name={course.id.toString()}
                        isChecked={course.checked || false}
                        onChange={() => onChangeCheckboxParent(course.id)}
                      />

                      <Label
                        // htmlFor={course.id.toString()}
                        css={{
                          display: 'flex',
                          flexGrow: 1,
                          alignItems: 'center',
                          whiteSpace: 'wrap',
                        }}
                      >
                        {course.name}
                      </Label>
                    </Box>
                  </Box>
                  <Box
                    direction="col"
                    className="mt-3 ml-8 pl-6 border-l border-l-text-disabled"
                  >
                    {course.classes &&
                      course.classes.map(subItem => (
                        <Box key={subItem.id} direction="col" className="mb-6">
                          <Box align="center" className="w-full h-full">
                            <Box gap="lg" justify="start">
                              <Checkbox
                                name={subItem.id.toString()}
                                isChecked={subItem.checked || false}
                                onChange={() =>
                                  onChangeCheckboxChild(course.id, subItem.id)
                                }
                              />

                              <Label
                                // htmlFor={subItem.id.toString()}
                                css={{
                                  display: 'flex',
                                  flexGrow: 1,
                                  alignItems: 'center',
                                  whiteSpace: 'wrap',
                                }}
                              >
                                {subItem.name}
                              </Label>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                  </Box>
                </Box>
              )
            })}
        </Box>
      </ContentLayout>
    </Drawer>
  )
}

export default Filter
