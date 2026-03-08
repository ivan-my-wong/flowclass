import { useState } from 'react'

import { cn } from '@/utils/cn'

export interface SwitchModeOption {
  value: string
  label: string
}

interface SwitchModeProps {
  options: SwitchModeOption[]
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
}

export default function SwitchMode({
  options,
  defaultValue,
  onChange,
  className,
}: SwitchModeProps) {
  const [activeValue, setActiveValue] = useState<string>(
    defaultValue || (options.length > 0 ? options[0].value : '')
  )

  const handleValueChange = (value: string) => {
    setActiveValue(value)
    onChange?.(value)
  }

  if (!options.length) {
    return null
  }

  return (
    <div
      className={cn(
        'flex w-full max-w-fit rounded-md bg-blue-500 p-1 text-white',
        className
      )}
      role="tablist"
      aria-orientation="horizontal"
    >
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={activeValue === option.value}
          aria-controls={`${option.value}-panel`}
          className={cn(
            'flex-1 rounded-md py-2 px-4 text-center font-medium transition-all',
            activeValue === option.value
              ? 'bg-white text-primary'
              : 'hover:bg-primary/20'
          )}
          onClick={() => handleValueChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
