// eslint-disable-next-line no-restricted-syntax
import React from 'react'

import * as Collapsible from '@radix-ui/react-collapsible'
import { LuChevronDown, LuChevronUp } from 'react-icons/lu'

import { cn } from '@/utils/cn'

import Text from '../Texts/Text'
import Box from '../ui/Box'

export type CollapsibleProps = {
  title: string
  visibleChildren: JSX.Element[]
  hiddenChildren: JSX.Element[]
  setCollapsibleOpen?: (open: boolean) => void
  collapsibleOpen?: boolean
}

const CollapsibleWrapper = ({
  title,
  visibleChildren,
  hiddenChildren,
  setCollapsibleOpen,
  collapsibleOpen,
}: CollapsibleProps): JSX.Element => {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <Collapsible.Root
      open={collapsibleOpen || isOpen}
      onOpenChange={setCollapsibleOpen ?? setIsOpen}
    >
      <Box justify="between" align="center">
        <Collapsible.Trigger asChild>
          <Box justify="between" className="cursor-pointer">
            <Text>{title}</Text>
            <button
              type="button"
              className={cn(
                'font-inherit rounded-full h-8 w-8',
                'inline-flex items-center justify-center text-primary',
                'data-[state=closed]:bg-background',
                'data-[state=open]:bg-background-layer-3',
                'hover:bg-background-layer-3',
                'focus:shadow-[0_0_0_2px_hsl(var(--text))]'
              )}
            >
              {collapsibleOpen || isOpen ? <LuChevronUp /> : <LuChevronDown />}
            </button>
          </Box>
        </Collapsible.Trigger>
      </Box>

      {visibleChildren}

      <Collapsible.Content>{hiddenChildren}</Collapsible.Content>
    </Collapsible.Root>
  )
}

export default CollapsibleWrapper
