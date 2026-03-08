import { Arrow, Content, Provider, Root, Trigger } from '@radix-ui/react-tooltip'

type TooltipProps = {
  trigger: JSX.Element
  children: JSX.Element
}

const Tooltip: React.FC<TooltipProps> = ({ trigger, children }) => {
  return (
    <Provider delayDuration={300}>
      <Root>
        <Trigger asChild>{trigger}</Trigger>
        <Content className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-text select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]">
          {children}
          <Arrow />
        </Content>
      </Root>
    </Provider>
  )
}

export default Tooltip
