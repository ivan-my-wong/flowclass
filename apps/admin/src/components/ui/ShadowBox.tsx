import { cn } from '@/utils/cn'

import Box, { BoxProps } from './Box'

const ShadowBox = ({
  children,
  className,
  ...props
}: BoxProps): JSX.Element => (
  <Box
    className={cn('bg-background-layer-2 p-4 rounded-md', className)}
    {...props}
  >
    {children}
  </Box>
)

export default ShadowBox
