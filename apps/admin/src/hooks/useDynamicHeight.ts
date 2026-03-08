import { useMemo } from 'react'

import { DEFAULT_TABLE_HEIGHT, VIEWPORT_OFFSETS } from '@/constants/common'

import { useResponsive } from './useResponsive'
/**
 * A custom hook that returns a dynamic height value based on the device type.
 * Used for responsive container heights across different screen sizes.
 *
 * @returns {string} A CSS height value:
 *                   - Small mobile: calc(100vh - 19rem)
 *                   - Mobile: calc(100vh - 20rem)
 *                   - Tablet: calc(100vh - 17rem)
 *                   - Default: 500px (used for desktop and larger screens)
 */

const useDynamicHeight = (): string => {
  const { isMobile, isTablet, isSmallMobile } = useResponsive()

  const dynamicHeight = useMemo(() => {
    if (isSmallMobile) {
      return `calc(90vh - ${VIEWPORT_OFFSETS.smallMobile})`
    }
    if (isMobile) {
      return `calc(90vh - ${VIEWPORT_OFFSETS.mobile})`
    }
    if (isTablet) {
      return `calc(90vh - ${VIEWPORT_OFFSETS.tablet})`
    }
    return DEFAULT_TABLE_HEIGHT
  }, [isSmallMobile, isMobile, isTablet])

  return dynamicHeight
}

export default useDynamicHeight
