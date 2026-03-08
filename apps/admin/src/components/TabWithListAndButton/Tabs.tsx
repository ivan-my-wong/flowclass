import { Content, List, Root, Trigger } from '@radix-ui/react-tabs'

import { cn } from '@/utils/cn'

import Button from '../Buttons/Button'

type TabsContentProps = React.ComponentProps<typeof Content>

const TabsContent = ({ className, ...props }: TabsContentProps) => (
  <Content className={cn('p-4', className)} {...props} />
)

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
    <Root defaultValue={defaultValue}>
      <List>
        {labels.map(label => (
          <Trigger key={label} value={label} asChild>
            <Button
              variants="text"
              className="px-2 py-2 data-[state=active]:outline data-[state=active]:outline-2 data-[state=active]:outline-border"
            >
              {label}
            </Button>
          </Trigger>
        ))}
      </List>
      {children}
    </Root>
  )
}

Tabs.Content = TabsContent

export default Tabs
