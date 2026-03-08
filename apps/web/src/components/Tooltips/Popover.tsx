import React from 'react'

import { Arrow, Content, Portal, Root, Trigger } from '@radix-ui/react-popover'
import { keyframes, styled } from '@stitches/react'

type PopoverProps = {
  trigger: JSX.Element
  children: JSX.Element
  isDayPicker?: boolean
}

const Popover: React.FC<PopoverProps> = ({ trigger, children, isDayPicker }) => (
  <Root>
    <Trigger asChild>{trigger}</Trigger>
    <Portal>
      <PopoverContent sideOffset={5} css={{ padding: isDayPicker ? 0 : 20 }}>
        <Flex css={{ flexDirection: 'column', gap: 10 }}>{children}</Flex>
        <PopoverArrow />
      </PopoverContent>
    </Portal>
  </Root>
)

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const PopoverContent = styled(Content, {
  borderRadius: 4,

  width: 'fit-content',
  overflow: 'auto',
  backgroundColor: '$backgroundLayer2',
  maxHeight: 'var(--radix-popover-content-available-height)',
  maxWidth: 'var(--radix-popover-content-available-width)',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  animationDuration: '400ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  '&[data-state="open"]': {
    '&[data-side="top"]': { animationName: slideDownAndFade },
    '&[data-side="right"]': { animationName: slideLeftAndFade },
    '&[data-side="bottom"]': { animationName: slideUpAndFade },
    '&[data-side="left"]': { animationName: slideRightAndFade },
  },
  zIndex: '$modalContent',
})

const PopoverArrow = styled(Arrow, {
  fill: '$backgroundLayer2',
})

const Flex = styled('div', { display: 'flex' })

export default Popover
