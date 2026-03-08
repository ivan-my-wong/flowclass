// import { Indicator, Root } from '@radix-ui/react-progress'
// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useState } from 'react'

import * as Progress from '@radix-ui/react-progress'

import { cn } from '@/utils/cn'

type ProgressBarProps = {
  percentage: number
  className?: string
}

const ProgressBar = ({ percentage, className }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(Math.min(percentage, 100)), 0)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <Progress.Root
      value={progress}
      className={cn(
        'relative overflow-hidden bg-shadow rounded-full w-full h-3 translate-z-0',
        className
      )}
    >
      <Progress.Indicator
        className="bg-primary w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </Progress.Root>
  )
}

export default ProgressBar
