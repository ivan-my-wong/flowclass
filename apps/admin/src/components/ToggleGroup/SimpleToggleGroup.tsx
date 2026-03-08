import { ComponentPropsWithoutRef, forwardRef } from 'react'

import { Item, Root } from '@radix-ui/react-toggle-group'

import { Spinner } from '@/components/Loaders/Spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { cn } from '@/utils/cn'

type ToggleGroupLabelsProps = {
  value: string
  label?: string
  icon?: React.ReactNode
  style?: React.CSSProperties
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
        <Root
          className={cn(
            'inline-flex rounded bg-background-layer-2 shadow-md',
            className
          )}
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
                    <Item
                      className={cn(
                        'flex h-8 w-12 items-center justify-center bg-background-layer-2 text-text [&:first-child]:rounded-l [&:last-child]:rounded-r hover:bg-background-layer-3 focus:relative focus:shadow-[0_0_0_2px_black]',
                        item.disabled &&
                          'pointer-events-none cursor-not-allowed bg-text-subtle/50 text-background'
                      )}
                      style={
                        currentItem === item.value ? item.style : undefined
                      }
                      value={item.value}
                      aria-label={item.value}
                      disabled={item.disabled}
                      onClick={() => {
                        onChange({ value: item.value, label: item.label })
                      }}
                    >
                      {item.icon}
                    </Item>
                  </TooltipTrigger>
                  <TooltipContent>{item.tooltip}</TooltipContent>
                </Tooltip>
              )
            })}
        </Root>
      </TooltipProvider>
    )
  }
)

export default SimpleToggleGroup
