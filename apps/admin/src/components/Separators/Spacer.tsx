import { cn } from '@/utils/cn'

const spaceClasses = {
  y1: 'my-1',
  y2: 'my-2',
  y3: 'my-4',
  y4: 'my-6',
  y5: 'my-8',
  y6: 'my-12',
  x1: 'mx-1',
  x2: 'mx-2',
  x3: 'mx-4',
  x4: 'mx-6',
  x5: 'mx-8',
  x6: 'mx-12',
} as const

type SpacerProps = {
  space?: keyof typeof spaceClasses
  className?: string
}

const Spacer = ({ space, className }: SpacerProps) => (
  <div className={cn('flex-1', space && spaceClasses[space], className)} />
)

Spacer.displayName = 'Spacer'

export default Spacer
