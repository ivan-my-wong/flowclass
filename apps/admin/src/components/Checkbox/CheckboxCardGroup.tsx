// eslint-disable-next-line no-restricted-syntax
import React from 'react'

import { styled } from '../../styles'
import HorizontalBaseCard from '../Cards/HorizontalCard'
import Box from '../Containers/Box'
import ImageAspect from '../Images/ImageAspect'
import Spacer from '../Separators/Spacer'

import Checkbox from './Checkbox'

export type CheckboxCardProps = {
  items: CheckboxCardOptionProps[]
  handleValueChange: (checked: boolean, value: string) => void
}

export type CheckboxCardOptionProps = {
  value: boolean
  id: string
  label: React.ReactNode
  imageUrl?: string
}

const CheckboxCardGroup: React.FC<CheckboxCardProps> = ({
  items,
  handleValueChange,
}) => {
  return (
    <Box css={{ display: 'flex', gap: '$3', width: '100%', flexWrap: 'wrap' }}>
      {items.map(item => (
        <HorizontalBaseCard key={item.id}>
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
                  handleValueChange(e, item.id)
                }}
              />
              {item.imageUrl ? (
                <ImageAspect
                  src={item.imageUrl}
                  ratio={1 / 1}
                  width="$16"
                  alt={item.id}
                />
              ) : (
                <Spacer space="x1" />
              )}
            </Box>
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
        </HorizontalBaseCard>
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

export default CheckboxCardGroup
