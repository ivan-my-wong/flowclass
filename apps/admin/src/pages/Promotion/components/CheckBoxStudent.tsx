// eslint-disable-next-line no-restricted-syntax
import React from 'react'

import Checkbox from '../../../components/Checkbox/Checkbox'
import Box from '../../../components/Containers/Box'
import ImageAspect from '../../../components/Images/ImageAspect'
import { styled } from '../../../styles'

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
    <Box
      css={{
        display: 'flex',
        gap: '$3',
        width: '100%',
        flexWrap: 'wrap',
      }}
    >
      {items.map(item => (
        <Box key={item.id} direction="column" css={{ marginTop: '$4' }}>
          <Box
            css={{
              all: 'unset',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
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
              <Label
                htmlFor={item.id}
                css={{
                  display: 'flex',
                  flexGrow: 1,
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Label>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const Label = styled('label', {
  color: '$text',
  fontSize: '$4',
  fontWeight: 600,
  lineHeight: 1,
  paddingLeft: 15,
})

export default CheckboxStudent
