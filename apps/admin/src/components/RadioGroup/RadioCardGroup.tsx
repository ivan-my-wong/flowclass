// eslint-disable-next-line no-restricted-syntax
import React, { useState } from 'react'

import { RadioGroup, RadioGroupPrimitive } from '@/components/ui/RadioGroup'
import { cn } from '@/utils/cn'

import HorizontalBaseCard from '../Cards/HorizontalCard'
import ImageAspect from '../Images/ImageAspect'
import Spacer from '../Separators/Spacer'
import Box from '../ui/Box'
import Text from '../ui/Text'

export type RadioCardProps = {
  items: RadioCardOptionProps[]
  selectedValue: string
  columns?: 1 | 2 | 3
  cardContentDirection?: 'row' | 'column'
  cardDirection?: 'row' | 'column'
  handleValueChange: (value: string) => void
  className?: string
  showIndicator?: boolean
  onItemClick?: (value: string) => void
  cardContentStyle?: string
}

export type RadioCardOptionProps = {
  value: string
  id: string
  label: React.ReactNode
  description?: string
  imageUrl?: string
  gifUrl?: string
  icon?: React.ReactNode
  className?: string
}

const RadioCardGroup: React.FC<RadioCardProps> = ({
  items,
  cardContentDirection = 'column',
  cardDirection = 'row',
  columns,
  selectedValue,
  handleValueChange,
  className,
  showIndicator = true,
  onItemClick,
  cardContentStyle,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const handleItemClick = (value: string) => {
    if (onItemClick) {
      onItemClick(value)
    }
  }

  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={handleValueChange}
      aria-label="Radio Card Group"
      className={cn(
        className,
        cardDirection === 'row' ? 'flex-row' : 'flex-col'
      )}
    >
      {items.map(item => (
        <HorizontalBaseCard
          key={item.value}
          columns={columns}
          direction={cardDirection}
          onClick={() => handleItemClick(item.value)}
          onMouseEnter={() => setHoveredItem(item.value)}
          onMouseLeave={() => setHoveredItem(null)}
          className={cn('border border-gray-200', item.className)}
        >
          <RadioGroupPrimitive.Item
            value={item.value}
            className={cn(showIndicator ? 'group' : '', 'focus:outline-none')}
          >
            {cardContentDirection ? (
              <Box
                gap="xl"
                justify="start"
                direction={
                  cardContentDirection === 'column' ? 'col-reverse' : 'row'
                }
                className={cardContentStyle}
              >
                {showIndicator && (
                  <div className="flex items-center justify-center bg-backgroundLayer2 border-2 border-backgroundDisabled w-6 h-6 rounded-full shadow-1 hover:shadow-2 flex-shrink-0 cursor-pointer group-data-[state='checked']:border-primary">
                    <RadioGroupPrimitive.Indicator className="flex items-center justify-center w-full h-full">
                      <div className="w-[0.7rem] h-[0.7rem] rounded-full bg-primary" />
                    </RadioGroupPrimitive.Indicator>
                  </div>
                )}

                <>
                  {item.icon}
                  {item.imageUrl ? (
                    <ImageAspect
                      src={
                        item.gifUrl && hoveredItem === item.value
                          ? item.gifUrl
                          : item.imageUrl
                      }
                      ratio={1 / 1}
                      width="10rem"
                      alt={item.value}
                      data-hover-image={item.gifUrl}
                    />
                  ) : (
                    <Spacer space="x1" />
                  )}

                  <Box direction="col" className="mt-4">
                    <Text
                      align="center"
                      bold
                      className={`text-xl break-words ${
                        hoveredItem === item.value ? 'text-primary' : ''
                      }`}
                    >
                      {item.label}
                    </Text>
                    {item.description && (
                      <Text
                        fontSize="$small"
                        align="center"
                        className={`leading-normal break-words whitespace-pre-wrap ${
                          hoveredItem === item.value ? 'text-primary' : ''
                        }`}
                      >
                        {item.description}
                      </Text>
                    )}
                  </Box>
                </>
              </Box>
            ) : (
              <></>
            )}
          </RadioGroupPrimitive.Item>
        </HorizontalBaseCard>
      ))}
    </RadioGroup>
  )
}

export default RadioCardGroup
