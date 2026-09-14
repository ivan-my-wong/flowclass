import React, {
  ComponentProps,
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
import { css, styled } from '@/styles'

import SelectDefault from '../Selector/Select'
import Box from '../ui/Box'

const StyledTabs = styled(Root, {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
})

const StyledTabList = styled(List, {
  display: 'flex',
  padding: '0 $2',
  width: '100%',
  flex: 2,

  '@lg': {
    flexWrap: 'wrap',
    rowGap: '$2',
  },
})

const StyledTrigger = styled(Trigger, {
  all: 'unset',
  cursor: 'pointer',
  color: '$textSubtle',
  borderRadius: 5,
  border: '1px solid grey',
  padding: '0 20px',
  height: '3rem',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$4',
  lineHeight: 1,
  margin: '0 $1',
  minWidth: '4rem',
  userSelect: 'none',
  '&:hover': { color: '$primary' },
  '&[data-state="active"]': {
    color: '$primary',
    boxShadow: `inset 0 -4px 0 0 $colors$primary, 0 1px 0 0 $colors$primary`,
    border: `1px solid $colors$primary`,
  },

  variants: {
    status: {
      normal: {},
      highlight: {},
      error: {
        color: '$text',
        boxShadow: `inset 0 -2px 0 0 $colors$tertiary, 0 1px 0 0 $colors$tertiary`,
        border: `1px solid $colors$tertiary`,
      },
    },
  },
})

const SelectorStyles = css({
  marginTop: '$4',
})

const TabsContent = styled(Content, {
  marginTop: '1rem',
  borderTop: '1px solid grey',
  padding: '$small',
})

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
      <StyledTabs value={currentTab}>
        <div className={SelectorStyles()} />

        <NotMobile>
          <Box justify="between">
            <StyledTabList>
              {tabData.map(tab => (
                <StyledTrigger
                  key={tab.value}
                  value={tab.value}
                  status={
                    tab.status as ComponentProps<typeof StyledTrigger>['status']
                  }
                  asChild
                  onClick={() => handleTabChange(tab.value)}
                  data-testid={`tab-${tab.value}`}
                >
                  <div>{tab.label}</div>
                </StyledTrigger>
              ))}
            </StyledTabList>
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
              <TabsContent key={tabName} value={tabName}>
                {child}
              </TabsContent>
            )
          )
        })}
      </StyledTabs>
    )
  }
)

// TabWithListAndButton.Content = TabsContent

export default TabWithListAndButton
