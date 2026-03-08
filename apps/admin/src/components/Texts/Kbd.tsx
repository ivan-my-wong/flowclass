import { cn } from '@/utils/cn'

type KbdProps = React.ComponentProps<'kbd'>

const Kbd = ({ className, ...props }: KbdProps) => (
  <kbd
    className={cn(
      'text-sm font-bold p-1 border border-solid border-border border-x-[1px] border-b-[3px] rounded-sm bg-primary inline-block',
      className
    )}
    {...props}
  />
)

export default Kbd
