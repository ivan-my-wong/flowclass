import { Corner, Root, Scrollbar, Thumb, Viewport } from '@radix-ui/react-scroll-area'
import clsx from 'clsx'

const SCROLLBAR_SIZE = 1

type ScrollAreaProps = {
  children: JSX.Element
  className?: string
}

const thumbClasses = clsx(
  'flex-1',
  'before:rounded',
  'relative',
  'before:content-[""]',
  'before:bg-textDisabled',
  'before:absolute',
  'before:top-1/2',
  'before:left-1/2',
  'before:-translate-x-1/2',
  'before:-translate-y-1/2',
  'before:w-full',
  'before:h-full',
  'before:min-h-[4px]'
)
const barClasses = clsx(
  'rounded',
  'bg-backgroundLayer3',
  'hover:bg-background',
  'flex',
  'touch-none',
  'select-none',
  'p-0.5',
  'transition-colors',
  'duration-[160ms]',
  'ease-out',
  'data-[orientation=horizontal]:flex-col'
)

const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className }) => {
  return (
    <Root className={`h-full w-full overflow-hidden pb-2 ${className ?? ''}`}>
      <Viewport className="h-full w-full">{children}</Viewport>
      <Scrollbar
        orientation="vertical"
        className={`${barClasses} data-[orientation=horizontal]:h-${SCROLLBAR_SIZE} data-[orientation=vertical]:w-${SCROLLBAR_SIZE}`}
      >
        <Thumb className={thumbClasses} />
      </Scrollbar>
      <Scrollbar
        orientation="horizontal"
        className={`${barClasses} data-[orientation=horizontal]:h-${SCROLLBAR_SIZE} data-[orientation=vertical]:w-${SCROLLBAR_SIZE}`}
      >
        <Thumb className={thumbClasses} />
      </Scrollbar>
      <Corner className="bg-backgroundLayer3" />
    </Root>
  )
}

export default ScrollArea
