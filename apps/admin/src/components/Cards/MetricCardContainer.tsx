import { cn } from '@/utils/cn'

import SkeletonLoader from '../Loaders/SkeletonLoader'
import Box from '../ui/Box'

type MetricCardContainerProps = {
  children: JSX.Element | JSX.Element[]
  isLoading: boolean
  className?: string
}

const MetricCardContainer = ({
  children,
  isLoading,
  className,
}: MetricCardContainerProps): JSX.Element => (
  <Box className={cn(className)}>
    {isLoading ? (
      <>
        {Array.from({ length: 2 }, (_, index) => (
          <SkeletonLoader
            key={index}
            width="100%"
            height="100px"
            boxClassName="flex flex-col items-start gap-4"
          />
        ))}
      </>
    ) : (
      children
    )}
  </Box>
)
export default MetricCardContainer
