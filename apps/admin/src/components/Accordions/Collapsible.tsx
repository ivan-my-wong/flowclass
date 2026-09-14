// eslint-disable-next-line no-restricted-syntax
import React from 'react'

import * as Collapsible from '@radix-ui/react-collapsible'
import { styled } from '@stitches/react'
import { LuChevronDown, LuChevronUp } from 'react-icons/lu'

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
            <IconButton>
              {collapsibleOpen || isOpen ? <LuChevronUp /> : <LuChevronDown />}
            </IconButton>
          </Box>
        </Collapsible.Trigger>
      </Box>

      {visibleChildren}

      <Collapsible.Content>{hiddenChildren}</Collapsible.Content>
    </Collapsible.Root>
  )
}

const IconButton = styled('button', {
  all: 'unset',
  fontFamily: 'inherit',
  borderRadius: '100%',
  height: '$8',
  width: '$8',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$primary',
  //   boxShadow: `$1`,
  '&[data-state="closed"]': { backgroundColor: '$background' },
  '&[data-state="open"]': { backgroundColor: 'backgroundLayer3' },
  '&:hover': { backgroundColor: '$backgroundLayer3' },
  '&:focus': { boxShadow: `0 0 0 2px $text` },
})

export default CollapsibleWrapper
