import { Root } from '@radix-ui/react-separator'

import { cn } from '@/utils/cn'

type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical'
  margin?: 'small' | 'medium' | 'large'
  thickness?: 'small' | 'medium' | 'large'
} & React.ComponentProps<typeof Root>

const marginClasses = {
  small: 'my-1',
  medium: 'my-2',
  large: 'my-4',
}

const thicknessClasses = {
  small: 'py-0.5',
  medium: 'py-px',
  large: 'py-0.5',
}

const Separator = (props: SeparatorProps) => {
  const {
    orientation = 'horizontal',
    margin,
    thickness,
    className,
    ...rest
  } = props

  return (
    <Root
      orientation={orientation}
      className={cn(
        'bg-text-disabled',
        orientation === 'horizontal' && 'h-px w-full',
        orientation === 'vertical' && 'h-full w-px',
        margin && marginClasses[margin],
        thickness && thicknessClasses[thickness],
        className
      )}
      {...rest}
    />
  )
}

export default Separator
