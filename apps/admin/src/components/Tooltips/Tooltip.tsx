import {
  Arrow,
  Content,
  Provider,
  Root,
  Trigger,
} from '@radix-ui/react-tooltip'

import { cn } from '@/utils/cn'

type TooltipProps = {
  trigger: JSX.Element
  children: JSX.Element
}

const Tooltip: React.FC<TooltipProps> = ({ trigger, children }) => {
  return (
    <Provider>
      <Root delayDuration={0}>
        <Trigger asChild>{trigger}</Trigger>

        <Content
          className={cn(
            'rounded-md px-2 py-2 text-base shadow-md text-text max-w-[300px] bg-background-layer-2 z-tooltip',
            '[&[data-radix-popper-content-wrapper]>svg]:fill-background-layer-2'
          )}
        >
          {children}
          <Arrow className="fill-background-layer-2" />
        </Content>
      </Root>
    </Provider>
  )
}

export default Tooltip
