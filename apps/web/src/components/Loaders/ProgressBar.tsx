import { useEffect, useState } from 'react'

import { Indicator, Root } from '@radix-ui/react-progress'

type ProgressBarProps = {
  percentage: number
  className?: string
}
const ProgressBar = ({ percentage, className }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 10)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <Root
      value={progress}
      className={`bg-backgroundLayer3 translate-z-0 relative h-4 w-full overflow-hidden rounded-full ${className}`}
      style={{
        // Fix overflow clipping in Safari
        // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
        transform: 'translateZ(0)',
      }}
    >
      <Indicator
        className={`bg-textSubtle ease-[cubic-bezier(0.65, 0, 0.35, 1)] h-full w-full transition-transform duration-[660ms]`}
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </Root>
  )
}

export default ProgressBar
