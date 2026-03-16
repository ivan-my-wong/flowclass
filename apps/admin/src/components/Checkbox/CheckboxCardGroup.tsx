// eslint-disable-next-line no-restricted-syntax
import React from 'react'

import { cn } from '@/utils/cn'

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
    <Box className="flex gap-3 w-full flex-wrap">
      {items.map(item => (
        <HorizontalBaseCard key={item.id}>
          <Box className={cn('w-full h-full flex items-center')}>
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
            <label
              htmlFor={item.id}
              className={cn(
                'flex flex-grow items-center whitespace-nowrap',
                'text-text text-base font-semibold leading-none pl-[15px]'
              )}
            >
              {item.label}
            </label>
          </Box>
        </HorizontalBaseCard>
      ))}
    </Box>
  )
}

export default CheckboxCardGroup
