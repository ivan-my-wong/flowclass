import { forwardRef } from 'react'

import Skeleton, { SkeletonProps, SkeletonTheme } from 'react-loading-skeleton'

type SkeletonLoaderProps = {
  className?: string
} & SkeletonProps

const SkeletonLoader = forwardRef<HTMLDivElement, SkeletonLoaderProps>((props, ref) => {
  const { height = '100%', className = '', count = 1, ...rest } = props

  return (
    <div className={`h-[${height}] w-full ${className}`}>
      <SkeletonTheme baseColor="#f0f0f0" highlightColor="#f8f8f8">
        <Skeleton {...rest} {...ref} count={count} height={height} />
      </SkeletonTheme>
    </div>
  )
})

SkeletonLoader.displayName = 'SkeletonLoader'
export default SkeletonLoader
