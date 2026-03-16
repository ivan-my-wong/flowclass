import React, {
  forwardRef,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Content, List, Root, Trigger } from '@radix-ui/react-tabs'
import { useTranslation } from 'react-i18next'

import { Mobile, NotMobile } from '@/hooks/useResponsive'
import { cn } from '@/utils/cn'

import SelectDefault from '../Selector/Select'
import Box from '../ui/Box'

export type TabProps = {
  tabName: string
  children: React.ReactNode
}

export type TabData = {
  label: string
  value: string
  status?: string
}

export type TabsProps = {
  defaultValue?: string
  tabData: TabData[]
  rightHeader?: JSX.Element
  children: ReactElement<TabProps>[]
}

export type TabWithListAndButtonHandle = {
  setCurrentTab: (tabIndex: string) => void
  getCurrentTab: () => string
}

const TabWithListAndButton = forwardRef<TabWithListAndButtonHandle, TabsProps>(
  ({ tabData, rightHeader, children, defaultValue }, ref) => {
    const { t } = useTranslation()
    const [currentTab, setCurrentTab] = useState(
      defaultValue || tabData[0].value
    )
    const location = useLocation()
    const navigate = useNavigate()
    const searchParams = new URLSearchParams(location.search)

    // Update URL when tab changes
    const updateUrlParams = useCallback(
      (tab: string) => {
        searchParams.set('tab', tab)
        navigate(`${location.pathname}?${searchParams.toString()}`, {
          replace: true,
        })
      },
      [location.pathname, navigate, searchParams]
    )

    // Handle tab change
    const handleTabChange = useCallback(
      (value: string) => {
        setCurrentTab(value)
        updateUrlParams(value)
      },
      [updateUrlParams]
    )

    // Initialize tab from URL params
    useEffect(() => {
      const defaultTab = searchParams.get('tab')
      if (
        defaultTab &&
        defaultTab !== currentTab &&
        tabData.find(tab => tab.value === defaultTab)
      ) {
        setCurrentTab(defaultTab)
      } else if (!defaultTab && defaultValue) {
        // Set default value in URL if not present
        updateUrlParams(defaultValue)
      }
    }, [defaultValue, searchParams, currentTab, tabData, updateUrlParams])

    useImperativeHandle(ref, () => ({
      setCurrentTab: handleTabChange,
      getCurrentTab: () => currentTab,
    }))

    const tabSelectProps = {
      placeholder: t('component:select.placeholder'),
      selectItems: [
        {
          group: t('component:select.section'),
          itemValues: tabData,
        },
      ],
      currentSelect: currentTab,
      onValueChange: handleTabChange,
    }

    const renderRightHeader = rightHeader ? (
      <Box justify="end" className="pr-4 flex-1">
        {rightHeader}
      </Box>
    ) : null

    return (
      <Root value={currentTab} className="flex flex-col w-full">
        <div className="mt-4" />

        <NotMobile>
          <Box justify="between">
            <List className="flex p-0 px-2 w-full flex-2 lg:flex-wrap lg:gap-y-2">
              {tabData.map(tab => (
                <Trigger
                  key={tab.value}
                  value={tab.value}
                  asChild
                  onClick={() => handleTabChange(tab.value)}
                  data-testid={`tab-${tab.value}`}
                  className={cn(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium',
                    'ring-offset-background transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-50',
                    'text-muted-foreground hover:text-primary',
                    'data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                    'flex-1 min-w-16 mx-1',
                    tab.status === 'error' &&
                      'text-destructive data-[state=active]:border-destructive'
                  )}
                >
                  <div>{tab.label}</div>
                </Trigger>
              ))}
            </List>
            {renderRightHeader}
          </Box>
        </NotMobile>

        <Mobile>
          <Box padding="sm">
            <SelectDefault
              fullWidth
              placeholder={tabSelectProps.placeholder}
              selectItems={tabSelectProps.selectItems}
              currentSelect={tabSelectProps.currentSelect}
              onValueChange={tabSelectProps.onValueChange}
            />
            {rightHeader && (
              <Box justify="end" fitContent className="pr-4 flex-shrink-0">
                {rightHeader}
              </Box>
            )}
          </Box>
        </Mobile>

        {children.map(child => {
          const { tabName } = child.props
          const match = tabData.find(tab => tab.value === tabName)
          return (
            match && (
              <Content
                key={tabName}
                value={tabName}
                className="mt-4 border-t border-gray-400 p-2"
              >
                {child}
              </Content>
            )
          )
        })}
      </Root>
    )
  }
)

// TabWithListAndButton.Content = TabsContent

export default TabWithListAndButton
