// import { Indicator, Root } from '@radix-ui/react-progress'
// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useState } from 'react'

import * as Progress from '@radix-ui/react-progress'
import { styled } from '@stitches/react'

type ProgressBarProps = {
  percentage: number
  css?: any
}
const ProgressBar = ({ percentage, css }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(Math.min(percentage, 100)), 0)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <ProgressRoot value={progress} css={css}>
      <ProgressIndicator
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </ProgressRoot>
  )
}

const ProgressRoot = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  background: '$shadowColor',
  borderRadius: '99999px',
  width: '100%',
  height: '$3',

  '@md': {
    width: '100%',
  },

  transform: 'translateZ(0)',
})

const ProgressIndicator = styled(Progress.Indicator, {
  backgroundColor: '$primary',
  width: '100%',
  height: '100%',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
})

export default ProgressBar
