// eslint-disable-next-line no-restricted-syntax
import React from 'react'

import Checkbox from '../../../components/Checkbox/Checkbox'
import Box from '../../../components/Containers/Box'
import ImageAspect from '../../../components/Images/ImageAspect'

export type CheckboxCourseProps = {
  items: CheckboxCourseOptionProps[]
  handleValueChange: (checked: boolean, value: string, subvalue: string) => void
}

export type CheckboxCourseOptionProps = {
  value: boolean
  id: string
  label: React.ReactNode
  imageUrl?: string
  children?: CheckboxCourseOptionProps[]
}

const CheckboxCourse: React.FC<CheckboxCourseProps> = ({
  items,
  handleValueChange,
}) => {
  return (
    <Box className="flex gap-4 w-full flex-wrap">
      {items.map(item => (
        <Box key={item.id} direction="column" className="mt-6">
          <Box className="w-full h-full flex items-center">
            <Box gap="large" justify="flex-start">
              <Checkbox
                name="test"
                isChecked={item.value}
                onChange={e => {
                  handleValueChange(e, item.id, '-1')
                }}
              />

              <ImageAspect
                src={item.imageUrl || ''}
                ratio={2 / 1}
                width="42px"
                alt={item.id}
              />

              <label
                htmlFor={item.id}
                className="flex flex-grow items-center whitespace-nowrap text-text text-base font-semibold leading-none pl-[15px]"
              >
                {item.label}
              </label>
            </Box>
          </Box>
          <Box
            direction="column"
            className="mt-6 ml-8 pl-[25px] border-l border-text-disabled"
          >
            {item.children &&
              item.children.map(subItem => (
                <Box key={subItem.id} direction="column" className="mb-6">
                  <Box className="w-full h-full flex items-center">
                    <Box gap="large" justify="flex-start">
                      <Checkbox
                        name="test"
                        isChecked={subItem.value}
                        onChange={e => {
                          handleValueChange(e, '-1', subItem.id)
                        }}
                      />

                      {subItem.imageUrl && (
                        <ImageAspect
                          src={subItem.imageUrl}
                          ratio={2 / 1}
                          width="42px"
                          alt={item.id}
                        />
                      )}
                      <label
                        htmlFor={subItem.id}
                        className="flex flex-grow items-center whitespace-nowrap text-text text-base font-semibold leading-none pl-[15px]"
                      >
                        {subItem.label}
                      </label>
                    </Box>
                  </Box>
                </Box>
              ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default CheckboxCourse
