import {
  Corner,
  Root,
  Scrollbar,
  Thumb,
  Viewport,
} from '@radix-ui/react-scroll-area'
import { styled } from '@stitches/react'

const SCROLLBAR_SIZE = 10

const StyledRoot = styled(Root, {
  height: '100%',
  width: '100%',
  overflow: 'auto',
})

const StyledViewport = styled(Viewport, {
  width: '100%',
  height: '100%',
})

const StyledScrollbar = styled(Scrollbar, {
  display: 'flex',
  // ensures no selection
  userSelect: 'none',
  // disable browser handling of all panning and zooming gestures on touch devices
  touchAction: 'none',
  padding: '2px',
  '&[data-orientation="vertical"]': { width: SCROLLBAR_SIZE },
  '&[data-orientation="horizontal"]': {
    flexDirection: 'column',
    height: SCROLLBAR_SIZE,
  },
})

const StyledThumb = styled(Thumb, {
  flex: 1,
  backgroundColor: '$primary',
  borderRadius: SCROLLBAR_SIZE,
  // increase target size for touch devices https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    minWidth: 44,
    minHeight: 44,
  },
})

const StyledCorner = styled(Corner, {})

// Exports
export const ScrollAreaViewport = StyledViewport
export const ScrollAreaScrollbar = StyledScrollbar
export const ScrollAreaThumb = StyledThumb
export const ScrollAreaCorner = StyledCorner

type ScrollAreaProps = {
  children: JSX.Element
}

const ScrollArea: React.FC<ScrollAreaProps> = ({ children }) => (
  <StyledRoot>
    <ScrollAreaViewport>{children}</ScrollAreaViewport>
    <ScrollAreaScrollbar orientation="vertical">
      <ScrollAreaThumb />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar orientation="horizontal">
      <ScrollAreaThumb />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner />
  </StyledRoot>
)

export default ScrollArea
