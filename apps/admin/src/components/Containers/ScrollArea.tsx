import {
  Corner,
  Root,
  Scrollbar,
  Thumb,
  Viewport,
} from '@radix-ui/react-scroll-area'

import { cn } from '@/utils/cn'

export const ScrollAreaViewport = ({
  className,
  ...props
}: React.ComponentProps<typeof Viewport>) => (
  <Viewport className={cn('w-full h-full', className)} {...props} />
)

export const ScrollAreaScrollbar = ({
  className,
  ...props
}: React.ComponentProps<typeof Scrollbar>) => (
  <Scrollbar
    className={cn('flex select-none touch-none p-0.5', className)}
    {...props}
  />
)

export const ScrollAreaThumb = ({
  className,
  ...props
}: React.ComponentProps<typeof Thumb>) => (
  <Thumb
    className={cn(
      'flex-1 bg-primary rounded-[10px] relative',
      'before:content-[""] before:absolute before:top-1/2 before:left-1/2',
      'before:-translate-x-1/2 before:-translate-y-1/2',
      'before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]',
      className
    )}
    {...props}
  />
)

export const ScrollAreaCorner = (
  props: React.ComponentProps<typeof Corner>
) => <Corner {...props} />

type ScrollAreaProps = {
  children: JSX.Element
}

const ScrollArea: React.FC<ScrollAreaProps> = ({ children }) => (
  <Root className="h-full w-full overflow-auto">
    <ScrollAreaViewport>{children}</ScrollAreaViewport>
    <Scrollbar
      orientation="vertical"
      className={cn(
        'flex select-none touch-none p-0.5',
        'data-[orientation=vertical]:w-[10px]',
        'data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-[10px]'
      )}
    >
      <ScrollAreaThumb />
    </Scrollbar>
    <Scrollbar
      orientation="horizontal"
      className={cn(
        'flex select-none touch-none p-0.5',
        'data-[orientation=vertical]:w-[10px]',
        'data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-[10px]'
      )}
    >
      <ScrollAreaThumb />
    </Scrollbar>
    <ScrollAreaCorner />
  </Root>
)

export default ScrollArea
