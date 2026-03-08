import type React from 'react'

import { cn } from '@/utils/cn'

export interface ProgressCircleProps extends React.ComponentProps<'svg'> {
  completed: number
  total: number
  className?: string
}

/**
 * Clamps a number between two values
 * @param input - The number to clamp
 * @param a - First boundary
 * @param b - Second boundary
 * @returns {number} - The clamped value
 */

function clamp(input: number, a: number, b: number): number {
  return Math.max(Math.min(input, Math.max(a, b)), Math.min(a, b))
}

// Constants for SVG circle dimensions
const size = 24 // Total size of the SVG in pixels
const strokeWidth = 4 // Width of the circle stroke

/**
 * ProgressCircle Component
 *
 * A circular progress indicator that shows completion status.
 * Uses SVG to render a circular progress bar with a background track.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ProgressCircle completed={3} total={5} />
 *
 * // With custom color
 * <ProgressCircle completed={3} total={5} className="text-green-500" />
 * ```
 */

const ProgressCircle = ({
  completed,
  total,
  className,
  ...restSvgProps
}: ProgressCircleProps) => {
  const safeTotal = total > 0 ? total : 1
  const normalizedValue = clamp(completed, 0, safeTotal)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? (normalizedValue / total) * circumference : 0
  const halfSize = size / 2

  const commonParams = {
    cx: halfSize,
    cy: halfSize,
    r: radius,
    fill: 'none',
    strokeWidth,
  }

  return (
    <svg
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      className={cn('size-6 text-primary', className)}
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...restSvgProps}
    >
      {/* Background circle - shows total progress track */}
      <circle {...commonParams} className="stroke-primary/10" />
      {/* Progress circle - shows current progress */}
      <circle
        {...commonParams}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${halfSize} ${halfSize})`}
        className="transition-all duration-300"
      />
    </svg>
  )
}

export default ProgressCircle
