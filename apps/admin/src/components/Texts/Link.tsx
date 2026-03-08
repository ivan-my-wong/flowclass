import { cn } from '@/utils/cn'

type LinkProps = {
  href: string
  align?: 'left' | 'center' | 'right'
  children?: React.ReactNode
  styled?: boolean
  inline?: boolean
} & React.ComponentProps<'a'>

const Link = ({
  href,
  children,
  align,
  styled,
  inline,
  className,
  ...rest
}: LinkProps): JSX.Element => {
  return (
    <a
      href={href}
      className={cn(
        'm-0 p-0 text-base w-full text-primary-highlight break-words',
        'visited:text-text-highlight',
        styled && 'cursor-pointer underline',
        inline && 'w-auto',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      {...rest}
    >
      {children}
    </a>
  )
}
Link.displayName = 'Link'
export default Link
