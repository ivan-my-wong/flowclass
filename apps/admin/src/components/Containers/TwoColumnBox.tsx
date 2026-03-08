import { cn } from '@/utils/cn'

import Box from './Box'

const TwoColumnBox = ({
  leftColumn,
  rightColumn,
}: {
  leftColumn: JSX.Element
  rightColumn: JSX.Element
}): JSX.Element => {
  return (
    <Box justify="flex-start" className="md:justify-between">
      <div
        className={cn(
          'w-[30%] max-w-[40%] flex justify-start text-base',
          'sm:w-1/2 sm:max-w-none'
        )}
      >
        {leftColumn}
      </div>
      <div
        className={cn(
          'w-[70%] max-w-[60%] flex justify-start text-base',
          'sm:w-1/2 sm:max-w-none sm:justify-end'
        )}
      >
        {rightColumn}
      </div>
    </Box>
  )
}

export default TwoColumnBox
