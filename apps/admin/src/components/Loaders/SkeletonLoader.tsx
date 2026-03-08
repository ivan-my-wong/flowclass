import { forwardRef } from 'react'

import Skeleton, { SkeletonProps, SkeletonTheme } from 'react-loading-skeleton'

import { cn } from '@/utils/cn'

type SkeletonLoaderProps = {
  height?: string
  boxCSS?: React.CSSProperties
  boxClassName?: string
} & SkeletonProps

const SkeletonLoader = forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  (props, ref) => {
    const { height, boxCSS, boxClassName, ...rest } = props

    return (
      <div
        ref={ref}
        className={cn('w-full h-full', boxClassName)}
        style={boxCSS}
      >
        <SkeletonTheme
          baseColor="var(--color-background-layer-2)"
          highlightColor="var(--color-background-layer-3)"
        >
          <Skeleton {...rest} height={height} />
        </SkeletonTheme>
      </div>
    )
  }
)

SkeletonLoader.displayName = 'SkeletonLoader'

export default SkeletonLoader
