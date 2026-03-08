import Image from 'next/image'
import React from 'react'

import { Indicator, Item, Root } from '@radix-ui/react-radio-group'

import HorizontalCard from '@/components/Cards/HorizontalCard'

export type RadioCardProps = {
  items: RadioCardOptionProps[]
  selectedValue: string
  handleValueChange: (value: string) => void
  className?: string
}

export type RadioCardOptionProps = {
  value: string
  label?: React.ReactNode
  imageUrl?: string
}

const RadioCardGroup: React.FC<RadioCardProps> = ({
  items,
  selectedValue,
  handleValueChange,
  className,
}) => (
  <Root
    className={`flex w-full flex-row items-center gap-2.5 md:h-[9rem] ${className}`}
    value={selectedValue}
    onValueChange={handleValueChange}
    aria-label="View density"
  >
    {items.map(item => {
      return (
        <HorizontalCard key={item.value} className="cursor-pointer">
          <Item value={item.value} className="box-row cursor-pointer justify-start">
            <div className="bg-background hover:bg-backgroundLayer3 focus:shadow-shadowColor border-backgroundLayer3 h-[25px] w-[25px] shrink-0 rounded-full border shadow-lg">
              <Indicator className="after:bg-primary relative flex h-full w-full items-center justify-center after:block after:h-[11px] after:w-[11px] after:rounded-[50%] after:content-['']" />
            </div>
            <div className="box-col" id={item.value}>
              {item.imageUrl ? (
                <div className="relative h-12 w-full shrink-0">
                  <Image
                    src={item.imageUrl}
                    fill
                    className="object-contain"
                    alt="Visa & MasterCard"
                  />
                </div>
              ) : (
                <div className="mx-1" />
              )}
              {item.label && <p className="grow-1 flex items-center text-center">{item.label}</p>}
            </div>
          </Item>
        </HorizontalCard>
      )
    })}
  </Root>
)

export default RadioCardGroup
