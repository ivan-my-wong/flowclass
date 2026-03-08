import { useRouter } from 'next/router'
import React, { HTMLAttributes, useEffect } from 'react'

import { List, Root, Trigger } from '@radix-ui/react-tabs'
// import { Content, List, Root, Trigger } from '@radix-ui/react-tabs'
import clsx from 'clsx'
import { defaultFallbackInView } from 'react-intersection-observer'

import ScrollArea from '@/components/Containters/ScrollArea'

import useResponsive from '../../hooks/useResponsive'

defaultFallbackInView(true)

export type AnchorData = {
  label: string
  value: string
}

export type TabsProps = {
  anchorData: AnchorData[]
  children?: JSX.Element[]
  currentTab: string
  setCurrentTab: (value: string) => void
  scrollRefs: React.MutableRefObject<Record<string, HTMLDivElement>>
} & HTMLAttributes<HTMLDivElement>

const TabWithAnchorScroll: React.FC<TabsProps> = ({
  anchorData,
  children,
  currentTab,
  scrollRefs,
  setCurrentTab,
}) => {
  const { isMobile } = useResponsive()

  const router = useRouter()
  const searchParams = router.query

  useEffect(() => {
    const defaultTab = searchParams.tab?.toString()
    if (
      defaultTab &&
      defaultTab !== currentTab &&
      anchorData.find(tab => tab.value === defaultTab)
    ) {
      setCurrentTab(defaultTab)
    }
  }, [isMobile])

  const triggerClasses = clsx(
    'text-text',
    'rounded',
    'text-center',

    'hover:text-primary',
    'radix-state-active:text-primary',
    'radix-state-active:box-shadow-inset',
    'radix-state-active:box-shadow-negative-y-5',
    'radix-state-active:border-primary',

    'flex',

    'lg:h-12',
    'shrink-0',

    'cursor-pointer',
    'select-none',
    'items-center',
    'justify-center',
    'border',
    'grow',

    'px-4',
    'py-2',
    'lg:py-4',

    'ml-0',
    'mr-2'
  )

  return (
    <Root value={currentTab} className="flex w-full flex-col">
      <ScrollArea>
        <List className="flex w-full max-w-[85vw] py-1">
          {anchorData.map(tab => (
            <Trigger
              key={tab.value}
              value={tab.value}
              asChild
              onClick={() => setCurrentTab(tab.value)}
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

export default TabWithAnchorScroll
