import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { List, Root, Trigger } from '@radix-ui/react-tabs'
import clsx from 'clsx'

import useResponsive from '@/hooks/useResponsive'

import ScrollArea from '../Containters/ScrollArea'
import { SelectItemValuesProps } from '../Selector/Select'

export type TabsProps = {
  currentSelectedTab?: string
  items: SelectItemValuesProps[]
  onChange: (value: any) => void
}

const Tabs: React.FC<TabsProps> = ({ currentSelectedTab, items, onChange }) => {
  const { isMobile } = useResponsive()
  const router = useRouter()

  useEffect(() => {
    if (location?.search) {
      const searchParams = new URLSearchParams(window.location.search)
      const defaultTab = searchParams.get('tab')
      if (
        defaultTab &&
        defaultTab !== currentSelectedTab &&
        items.find(tab => tab.value === defaultTab)
      ) {
        onChange(defaultTab)
      }
    }
  }, [])

  const triggerClasses = clsx(
    'text-text',
    'shrink-0',
    'min-h-12',
    'hover:text-primary',
    'radix-state-active:box-shadow-inset',
    'radix-state-active:box-shadow-negative-y-5',
    'radix-state-active:text-primary',
    'radix-state-active:border-b-2',
    'mx-1',
    'flex',
    'h-10',
    'lg:h-12',
    'cursor-pointer',
    'select-none',
    'items-center',
    'justify-center',
    'grow',
    'px-4'
  )

  if (!isMobile) {
    return (
      <Root className="flex items-center" value={currentSelectedTab}>
        <List className="flex flex-shrink-0 px-2">
          {items.map(tab => (
            <Trigger
              key={tab.value}
              value={tab.value}
              asChild
              onClick={() => onChange(tab.value)}
              className={triggerClasses}
            >
              <p className="break-keep">{tab.label}</p>
            </Trigger>
          ))}
        </List>
      </Root>
    )
  }
  return (
    <Root className="flex items-center" value={currentSelectedTab}>
      <ScrollArea>
        <List className="flex flex-shrink-0 ">
          {items.map(tab => (
            <Trigger
              key={tab.value}
              value={tab.value}
              asChild
              onClick={() => {
                onChange(tab.value)
              }}
              className={triggerClasses}
            >
              <p>{tab.label}</p>
            </Trigger>
          ))}
        </List>
      </ScrollArea>
    </Root>
  )
}

export default Tabs
