import { Arrow, Content, Provider, Root, Trigger } from '@radix-ui/react-tooltip'
import { styled } from '@stitches/react'

type TooltipProps = {
  trigger: JSX.Element
  children: JSX.Element
}

const StyledArrow = styled(Arrow, {})

const StyledContent = styled(Content, {
  borderRadius: '$medium',
  padding: '$small $small',
  fontSize: '$medium',
  boxShadow: '$1',
  color: '$text',
  maxWidth: '300px',
  backgroundColor: '$backgroundLayer2',
  [`& ${StyledArrow}`]: {
    fill: '$backgroundLayer2',
  },
  zIndex: 999,
})

const Tooltip: React.FC<TooltipProps> = ({ trigger, children }) => {
  return (
    <Provider>
      <Root delayDuration={0}>
        <Trigger asChild>{trigger}</Trigger>

        <StyledContent>
          {children}
          <StyledArrow />
        </StyledContent>
      </Root>
    </Provider>
  )
}

export default Tooltip
