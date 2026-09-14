import { forwardRef } from 'react'

import { CSS } from '@stitches/react'

import Skeleton, { SkeletonProps, SkeletonTheme } from 'react-loading-skeleton'

import { theme } from '../../styles'
import Box from '../Containers/Box'

type SkeletonLoaderProps = {
  height?: string
  boxCSS?: CSS
} & SkeletonProps

const SkeletonLoader = forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  (props, ref) => {
    const { height, boxCSS, ...rest } = props

    return (
      <Box
        css={{
          all: 'unset',
          width: '100% !important',
          height: '100% !important',
          ...boxCSS,
        }}
      >
        <SkeletonTheme
          baseColor={theme.colors.backgroundLayer2.toString()}
          highlightColor={theme.colors.backgroundLayer3.toString()}
        >
          <Skeleton {...rest} {...ref} height={height} />
        </SkeletonTheme>
      </Box>
    )
  }
)

export default SkeletonLoader
