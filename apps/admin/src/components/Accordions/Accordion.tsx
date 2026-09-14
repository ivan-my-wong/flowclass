import React from 'react'

import { mauve } from '@radix-ui/colors'
// eslint-disable-next-line no-restricted-syntax
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { CSS, keyframes, styled } from '@stitches/react'

import Text from '../Texts/Text'

type AccordionTriggerProps = {
  children: React.ReactNode
  // other props
}

type AccordionContentProps = {
  children: React.ReactNode
  // other props
}

export type AccordionItemProps = {
  itemValue: string
  triggerTitle: string
  triggerContent: React.ReactNode
}

type AccordionProps = {
  items: AccordionItemProps[]
  css?: CSS
}

const CustomAccordion: React.FC<AccordionProps> = ({ items, css }) => (
  <AccordionRoot type="single" collapsible css={css}>
    {items.map(item => (
      <AccordionItem key={item.itemValue} value={item.itemValue}>
        <AccordionTrigger>
          <Text align="center">{item.triggerTitle}</Text>
        </AccordionTrigger>
        <AccordionContent>{item.triggerContent}</AccordionContent>
      </AccordionItem>
    ))}
  </AccordionRoot>
)

const AccordionRoot = styled(Accordion.Root, {
  borderRadius: 6,
  width: '100%',
})

const AccordionItem = styled(Accordion.Item, {
  overflow: 'hidden',
  marginTop: 1,

  '&:first-child': {
    marginTop: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  '&:last-child': {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  '&:focus-within': {
    position: 'relative',
    zIndex: 1,
    boxShadow: `0 0 0 2px ${mauve.mauve12}`,
  },
})

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ children, ...props }: AccordionTriggerProps, forwardedRef) => (
  <StyledHeader>
    <StyledTrigger {...props} ref={forwardedRef}>
      {children}
      <StyledChevron aria-hidden />
    </StyledTrigger>
  </StyledHeader>
))

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ children, ...props }: AccordionContentProps, forwardedRef) => (
  <StyledContent {...props} ref={forwardedRef}>
    <StyledContentText>{children}</StyledContentText>
  </StyledContent>
))

const StyledHeader = styled(Accordion.Header, {
  all: 'unset',
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
})

const StyledTrigger = styled(Accordion.Trigger, {
  all: 'unset',
  fontFamily: 'inherit',
  padding: '0 20px',
  height: 45,
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 15,
  lineHeight: 1,
  width: '100%',
  color: '$text',
  borderRadius: '$1',
  border: '1px solid $colors$borderColor',
  '&:hover': { backgroundColor: '$backgroundLayer3' },
})

const StyledChevron = styled(ChevronDownIcon, {
  color: '$text',
  transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  '[data-state=open] &': { transform: 'rotate(180deg)' },
})

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
})

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
})

const StyledContent = styled(Accordion.Content, {
  overflow: 'hidden',
  fontSize: 15,
  color: '$text',
  backgroundColor: '$backgroundLayer2',

  '&[data-state="open"]': {
    animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
})

const StyledContentText = styled('div', {
  padding: '15px 20px',
})

export default CustomAccordion
