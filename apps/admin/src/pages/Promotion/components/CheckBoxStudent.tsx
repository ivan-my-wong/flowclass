// eslint-disable-next-line no-restricted-syntax
import React from 'react'

import Checkbox from '../../../components/Checkbox/Checkbox'
import Box from '../../../components/Containers/Box'
import ImageAspect from '../../../components/Images/ImageAspect'

export type CheckboxStudentProps = {
  items: CheckboxCourseOptionProps[]
  handleValueChange: (checked: boolean, value: string, subvalue: string) => void
}

export type CheckboxCourseOptionProps = {
  value: boolean
  id: string
  label: React.ReactNode
  imageUrl?: string
}

const CheckboxStudent: React.FC<CheckboxStudentProps> = ({
  items,
  handleValueChange,
}) => {
  return (
    <Box className="flex gap-6 w-full flex-wrap">
      {items.map(item => (
        <Box key={item.id} direction="column" className="mt-4">
          <Box className="w-full h-full flex items-center">
            <Box gap="large" justify="flex-start">
              <Checkbox
                name="test"
                isChecked={item.value}
                onChange={e => {
                  handleValueChange(e, item.id, '-1')
                }}
              />

              {item.imageUrl && (
                <ImageAspect
                  src={item.imageUrl}
                  ratio={2 / 1}
                  width="42px"
                  alt={item.id}
                />
              )}
              <label
                htmlFor={item.id}
                className="flex flex-grow items-center whitespace-nowrap text-text text-base font-semibold leading-none pl-[15px]"
              >
                {item.label}
              </label>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default CheckboxStudent
