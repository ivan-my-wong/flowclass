import { Content, List, Root, Trigger } from '@radix-ui/react-tabs'

import { styled } from '../../styles'
import Button from '../Buttons/Button'

const StyledTabs = styled(Root, {})

const StyledTabList = styled(List, {})

const StyledTabButton = styled(Button, {
  padding: '$small $small',
  '&[data-state="active"]': {
    outline: '2px solid $borderColor',
  },
})

const TabsContent = styled(Content, {
  padding: '$medium',
})

type TabsProps = {
  labels: string[]
  defaultValue: string
  children: React.ReactNode
}

const Tabs: React.FC<TabsProps> & { Content: typeof TabsContent } = ({
  labels,
  defaultValue,
  children,
}) => {
  return (
    <StyledTabs defaultValue={defaultValue}>
      <StyledTabList>
        {labels.map(label => {
          return (
            <Trigger key={label} value={label} asChild>
              <StyledTabButton variants="text">{label}</StyledTabButton>
            </Trigger>
          )
        })}
      </StyledTabList>
      {children}
    </StyledTabs>
  )
}

Tabs.Content = TabsContent

export default Tabs
