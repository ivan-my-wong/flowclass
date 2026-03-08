import { ComponentPropsWithoutRef } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion'
import { cn } from '@/utils/cn'

type CollapsibleTaskGroupProps = {
  title: string
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
} & ComponentPropsWithoutRef<typeof Accordion>

const CollapsibleTaskGroup = ({
  title,
  children,
  className,
  headingLevel = 'h3',
}: CollapsibleTaskGroupProps): JSX.Element => {
  const Heading = headingLevel as keyof JSX.IntrinsicElements

  return (
    <Accordion
      type="single"
      collapsible
      className={cn('w-full border-b border-text-disabled', className)}
    >
      <AccordionItem
        value={title || 'item-1'}
        className="py-2 overflow-hidden border-b-0 px-4 data-[state=open]:bg-gray-100 data-[state=open]:border-l-4 data-[state=open]:border-l-gray-500 transition-all duration-200"
      >
        <AccordionTrigger className="[&>svg]:text-gray-500 [&>svg]:text-2xl">
          <Heading className="text-base font-semibold">{title}</Heading>
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default CollapsibleTaskGroup
