import React from 'react'

// eslint-disable-next-line no-restricted-syntax
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDownIcon } from '@radix-ui/react-icons'

import { cn } from '@/utils/cn'

import Text from '../Texts/Text'

type AccordionTriggerProps = {
  children: React.ReactNode
}

type AccordionContentProps = {
  children: React.ReactNode
}

export type AccordionItemProps = {
  itemValue: string
  triggerTitle: string
  triggerContent: React.ReactNode
}

type AccordionProps = {
  items: AccordionItemProps[]
  className?: string
}

const CustomAccordion: React.FC<AccordionProps> = ({ items, className }) => (
  <Accordion.Root
    type="single"
    collapsible
    className={cn('rounded-md w-full', className)}
  >
    {items.map(item => (
      <Accordion.Item
        key={item.itemValue}
        value={item.itemValue}
        className="overflow-hidden mt-px first:mt-0 first:rounded-t-md last:rounded-b-md focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px_hsl(var(--mauve-12))]"
      >
        <Accordion.Header className="flex justify-center w-full">
          <Accordion.Trigger
            className={cn(
              'flex flex-1 items-center justify-center w-full h-11 px-5',
              'font-inherit text-[15px] leading-none',
              'rounded border border-border',
              'text-text hover:bg-background-layer-3',
              'data-[state=open]:[&>svg]:rotate-180'
            )}
          >
            <Text align="center">{item.triggerTitle}</Text>
            <ChevronDownIcon
              className="text-text transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] shrink-0"
              aria-hidden
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          className={cn(
            'overflow-hidden text-[15px] text-text bg-background-layer-2',
            'data-[state=open]:animate-accordion-down',
            'data-[state=closed]:animate-accordion-up',
            'overflow-hidden'
          )}
        >
          <div className="py-4 px-5">{item.triggerContent}</div>
        </Accordion.Content>
      </Accordion.Item>
    ))}
  </Accordion.Root>
)

export default CustomAccordion
