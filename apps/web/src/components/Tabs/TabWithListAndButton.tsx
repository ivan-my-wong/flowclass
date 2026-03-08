import { useRouter } from 'next/router'
import React, { HTMLAttributes, ReactElement, useEffect, useState } from 'react'

import { Content, List, Root, Trigger } from '@radix-ui/react-tabs'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

import ScrollArea from '@/components/Containters/ScrollArea'

import useResponsive from '../../hooks/useResponsive'

export type TabProps = {
  tabName: string
  children: React.ReactNode
}

export type TabData = {
  label: string
  value: string
}

export type TabsProps = {
  tabData: TabData[]
  children: ReactElement<TabProps>[]
  handleChange?: (value: string) => void
  selectedTab?: string
} & HTMLAttributes<HTMLDivElement>

const TabWithListAndButton: React.FC<TabsProps> = ({
  tabData,
  children,
  handleChange,
  selectedTab,
}) => {
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const [currentTab, setCurrentTab] = useState(selectedTab ?? tabData[0]?.value)
  const router = useRouter()
  const searchParams = router.query

  useEffect(() => {
    const defaultTab = searchParams.tab?.toString()
    if (defaultTab && defaultTab !== currentTab && tabData.find(tab => tab.value === defaultTab)) {
      setCurrentTab(defaultTab)
    }
  }, [isMobile])

  const tabSelectProps = {
    placeholder: t('component:select.placeholder'),
    selectItems: [
      {
        group: t('component:select.section'),
        itemValues: tabData,
      },
    ],
    currentSelect: currentTab,
    onValueChange: (value: string) => {
      setCurrentTab(value)
      if (handleChange) {
        handleChange(value)
      }
    },
  }

  const triggerClasses = clsx(
    'text-text',
    'shrink-0',
    'rounded',
    'min-h-12',
    'hover:text-primary',
    'radix-state-active:text-primary',
    'radix-state-active:box-shadow-inset',
    'radix-state-active:box-shadow-negative-y-5',
    'radix-state-active:border-primary',
    'flex',
    'h-10',
    'lg:h-12',
    'cursor-pointer',
    'select-none',
    'items-center',
    'justify-center',
    'border',
    // 'grow',
    'px-8',
    'py-7',
    'lg:px-20',
    'break-words',
    'line-clamp-2'
  )

  return (
    <Root value={currentTab} className="box-col-full items-start gap-4">
      {!isMobile ? (
        <List className="box-row-full flex-wrap justify-start gap-2">
          {tabData.map(tab => (
            <Trigger
              key={tab.value}
              value={tab.value}
              asChild
              onClick={() => {
                setCurrentTab(tab.value)
                if (handleChange) {
                  handleChange(tab.value)
                }
              }}
              className={triggerClasses}
            >
              <p className="break-keep">{tab.label}</p>
            </Trigger>
          ))}
        </List>
      ) : (
        <ScrollArea>
          <List className="box-col-full flex-shrink-0 gap-2">
            {tabData.map(tab => (
              <Trigger
                key={tab.value}
                value={tab.value}
                asChild
                onClick={() => {
                  setCurrentTab(tab.value)
                  if (handleChange) {
                    handleChange(tab.value)
                  }
                }}
                className={`${triggerClasses} w-full`}
              >
                <p>{tab.label}</p>
              </Trigger>
            ))}
          </List>
        </ScrollArea>
      )}

      {children.map(child => {
        const { tabName } = child.props
        const match = tabData.find(tab => tab.value === tabName)
        return (
          match && (
            <Content key={tabName} value={tabName} className="w-full">
              {child}
            </Content>
          )
        )
      })}
    </Root>
  )
}

export default TabWithListAndButton
