import { cn } from '@/utils/cn'

type LabelProps = {
  marginBottom?: 'medium'
  className?: string
} & React.ComponentProps<'p'>

const Label = ({ marginBottom, className, ...props }: LabelProps) => (
  <p
    className={cn(
      'bg-transparent text-text font-bold text-sm',
      marginBottom === 'medium' && 'mb-4',
      className
    )}
    {...props}
  />
)

export default Label
