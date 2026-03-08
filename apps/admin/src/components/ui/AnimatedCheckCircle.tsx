import React, { useEffect, useState } from 'react'

import { CheckIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/utils/cn'

interface DottedCheckCircleProps {
  isCompleted: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  dotCount?: number
  children?: React.ReactNode
}

/**
 * DottedCheckCircle Component
 *
 * A circle with evenly spaced gaps that transforms into a solid circle with checkmark when completed.
 * Uses Framer Motion for smooth animations and transitions.
 *
 * @example
 * ```tsx
 * <DottedCheckCircle isCompleted={true} />
 * ```
 */
const DottedCheckCircle = ({
  isCompleted = false,
  className,
  size = 'md',
  color = 'primary',
  dotCount = 12,
  children,
}: DottedCheckCircleProps) => {
  // States for animation sequencing
  const [showSolidCircle, setShowSolidCircle] = useState(false)
  const [showCheck, setShowCheck] = useState(false)

  // Size mappings - using pixels for more precise positioning
  const sizeMap = {
    sm: {
      circle: 24, // pixels
      innerCircle: 20, // pixels
      arcWidth: 2, // pixels
      icon: 'h-3.5 w-3.5',
    },
    md: {
      circle: 32, // pixels
      innerCircle: 28, // pixels
      arcWidth: 3, // pixels
      icon: 'h-4 w-4',
    },
    lg: {
      circle: 40, // pixels
      innerCircle: 36, // pixels
      arcWidth: 4, // pixels
      icon: 'h-5 w-5',
    },
  }

  // Animation sequence with delay
  useEffect(() => {
    let timer1: ReturnType<typeof setTimeout>
    let timer2: ReturnType<typeof setTimeout>

    if (isCompleted) {
      timer1 = setTimeout(() => {
        setShowSolidCircle(true)

        timer2 = setTimeout(() => {
          setShowCheck(true)
        }, 300) // Delay for check mark appearance
      }, 300) // Delay for solid circle appearance
    } else {
      setShowSolidCircle(false)
      setShowCheck(false)
    }

    return () => {
      if (timer1) clearTimeout(timer1)
      if (timer2) clearTimeout(timer2)
    }
  }, [isCompleted])

  // Get size values based on the size prop
  const circleSize = sizeMap[size].circle
  const { arcWidth } = sizeMap[size]

  const circleRadius = circleSize / 2
  const actualRadius = circleRadius - arcWidth / 2

  // Create array of arc segments
  const segments = Array.from({ length: dotCount }).map((_, i) => {
    const startAngle = (i / dotCount) * 2 * Math.PI
    const endAngle = ((i + 0.5) / dotCount) * 2 * Math.PI // Leave a gap between segments (0.8 instead of 1)
    return {
      id: i,
      startAngle,
      endAngle,
    }
  })

  // Function to create SVG arc path
  const describeArc = (startAngle: number, endAngle: number): string => {
    const start = {
      x: circleRadius + actualRadius * Math.cos(startAngle),
      y: circleRadius + actualRadius * Math.sin(startAngle),
    }

    const end = {
      x: circleRadius + actualRadius * Math.cos(endAngle),
      y: circleRadius + actualRadius * Math.sin(endAngle),
    }

    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'

    const { x: startX, y: startY } = start
    const { x: endX, y: endY } = end

    return [
      'M',
      startX,
      startY,
      'A',
      actualRadius,
      actualRadius,
      0,
      largeArcFlag,
      1,
      endX,
      endY,
    ].join(' ')
  }

  return (
    <div
      className={cn('relative', className)}
      style={{
        width: `${circleSize}px`,
        height: `${circleSize}px`,
      }}
    >
      {/* Loading spinner with blue arc segments */}
      <svg width={circleSize} height={circleSize}>
        {segments.map(segment => (
          <motion.path
            key={segment.id}
            d={describeArc(segment.startAngle, segment.endAngle)}
            fill="none"
            stroke={color === 'primary' ? '#3b82f6' : color}
            strokeWidth={arcWidth}
            strokeLinecap="butt"
            initial={{ opacity: 1 }}
            animate={{
              opacity: showSolidCircle ? 0 : 1,
            }}
            transition={{
              duration: 0.3,
              delay: isCompleted ? (segment.id / dotCount) * 0.4 : 0, // Staggered fade out
            }}
          />
        ))}
      </svg>

      {/* Solid blue circle with checkmark (appears when completed) */}
      <AnimatePresence>
        {showSolidCircle && (
          <motion.div
            style={{
              position: 'absolute',
              width: `${circleSize}px`,
              height: `${circleSize}px`,
              backgroundColor: color === 'primary' ? '#3b82f6' : color,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              left: '0',
              top: '0',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <AnimatePresence>
              {showCheck && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <CheckIcon className={cn('text-white', sizeMap[size].icon)} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional children content */}
      {!showSolidCircle && children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * DottedStepCircle Component
 *
 * A numeric step indicator with segmented circle that turns into a solid checkmark when completed.
 *
 * @example
 * ```tsx
 * <DottedStepCircle step={1} isCompleted={false} />
 * <DottedStepCircle step={2} isCompleted={true} />
 * ```
 */
export const DottedStepCircle = ({
  step,
  isCompleted,
  ...props
}: {
  step: number
  isCompleted: boolean
} & Omit<DottedCheckCircleProps, 'isCompleted'>) => {
  return (
    <DottedCheckCircle isCompleted={isCompleted} {...props}>
      <motion.span
        className="text-sm font-medium text-gray-600"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {step}
      </motion.span>
    </DottedCheckCircle>
  )
}

export default DottedCheckCircle
