import { forwardRef } from 'react'

import { cn } from '@/utils/cn'

interface SwitchProps {
  value: boolean
  disabled: boolean
  onChange: (value: boolean) => void
  trueLabel?: string
  falseLabel?: string
  className?: string
}

const SegmentedSwitch = forwardRef<HTMLDivElement, SwitchProps>(
  ({ value, disabled, onChange, trueLabel, falseLabel, className }, ref) => {
    const baseButtonStyles = [
      'px-4 py-2',
      'text-sm font-medium',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
      'transition-all duration-200 ease-in-out',
      'border-0',
      'relative z-10',
    ]

    const activeButtonStyles = [
      'bg-white',
      'text-gray-900',
      'shadow-sm',
      'ring-1 ring-gray-200',
    ]

    const inactiveButtonStyles = [
      'bg-transparent',
      'text-gray-500',
      'hover:text-gray-700',
      'hover:bg-gray-50',
    ]

    const disabledButtonStyles = [
      'cursor-not-allowed',
      'select-none',
      'bg-gray-100',
      'text-gray-400',
      'hover:text-gray-400',
      'hover:bg-gray-100',
      'focus:ring-0',
    ]

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          'rounded-lg',
          'border border-gray-200',
          'bg-gray-50',
          'p-1',
          disabled && 'opacity-60',
          className
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className={cn(
            baseButtonStyles,
            'rounded-l-md',
            value ? activeButtonStyles : inactiveButtonStyles,
            disabled && disabledButtonStyles
          )}
          aria-pressed={value}
          aria-label={trueLabel}
        >
          {trueLabel}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className={cn(
            baseButtonStyles,
            'rounded-r-md',
            !value ? activeButtonStyles : inactiveButtonStyles,
            disabled && disabledButtonStyles
          )}
          aria-pressed={!value}
          aria-label={falseLabel}
        >
          {falseLabel}
        </button>
      </div>
    )
  }
)

SegmentedSwitch.displayName = 'SegmentedSwitch'

export default SegmentedSwitch
