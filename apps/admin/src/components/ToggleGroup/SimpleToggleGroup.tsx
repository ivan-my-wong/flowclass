import { ComponentPropsWithoutRef, forwardRef } from 'react'

import { blackA, mauve } from '@radix-ui/colors'
import { Item, Root } from '@radix-ui/react-toggle-group'
import { CSS } from '@stitches/react'

import { Spinner } from '@/components/Loaders/Spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { styled } from '@/styles'
import { cn } from '@/utils/cn'

type ToggleGroupLabelsProps = {
  value: string
  label?: string
  icon?: React.ReactNode
  style?: CSS
  tooltip?: string
  disabled?: boolean
  isHide?: boolean
}
type ToggleGroupProps = {
  isLoading?: boolean
  disabled?: boolean
  currentItem: string
  items: ToggleGroupLabelsProps[]
  onChange: (value: any) => void
} & ComponentPropsWithoutRef<'div'>
const SimpleToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ currentItem, items, onChange, disabled, isLoading, className }, ref) => {
    if (isLoading) return <Spinner size="small" />

    return (
      <TooltipProvider delayDuration={350}>
        <ToggleGroupRoot
          className={className}
          disabled={disabled}
          ref={ref}
          type="single"
          value={currentItem}
        >
          {items
            .filter(o => !o.isHide)
            .map((item: ToggleGroupLabelsProps) => {
              return (
                <Tooltip key={item.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      className={cn(
                        item.disabled &&
                          'pointer-events-none cursor-not-allowed bg-text-subtle/50 text-background'
                      )}
                      value={item.value}
                      aria-label={item.value}
                      disabled={item.disabled}
                      onClick={() => {
                        onChange({ value: item.value, label: item.label })
                      }}
                      css={currentItem === item.value ? item.style : {}}
                    >
                      {item.icon}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{item.tooltip}</TooltipContent>
                </Tooltip>
              )
            })}
        </ToggleGroupRoot>
      </TooltipProvider>
    )
  }
)

const ToggleGroupRoot = styled(Root, {
  display: 'inline-flex',
  backgroundColor: mauve.mauve6,
  borderRadius: 4,
  boxShadow: `0 2px 10px ${blackA.blackA4}`,
})

const ToggleGroupItem = styled(Item, {
  all: 'unset',
  background: '$backgroundLayer2',
  backgroundColor: 'white',
  color: '$text',
  height: '$8',
  width: '$12',
  display: 'flex',
  fontSize: '$4',
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 1,
  '&:first-child': {
    marginLeft: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  '&:last-child': { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  '&:hover': {
    backgroundColor: '$tableEvenRowColor',
  },

  '&:focus': { position: 'relative', boxShadow: `0 0 0 2px black` },
})

export default SimpleToggleGroup
