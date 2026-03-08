import React from 'react'

import { cn } from '@/utils/cn'

type StepIndicatorProps = {
  steps: string[]
  currentStep: number
  handleClick?: (step: number) => void
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, handleClick }) => {
  return (
    <div className="box-row-full max-w-[90vw] justify-start overflow-x-scroll pb-4 md:justify-center md:overflow-x-auto md:pb-2">
      {steps.map((text, index) => (
        <div
          className={cn('mx-2 flex flex-shrink-0 flex-row items-center gap-2')}
          key={text}
          onClick={() => {
            if (handleClick) handleClick(currentStep)
          }}
        >
          <div
            className={cn(
              'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
              index === currentStep
                ? 'bg-primary text-background'
                : 'bg-background text-borderColor border-borderColor border',
              'animate-fade-right animate-once animate-duration-500 animate-ease-in-out'
            )}
          >
            {index + 1}
          </div>
          <span
            className={cn(
              'step-text flex-shrink-0 text-sm',
              index === currentStep ? 'font-extrabold' : 'font-normal'
            )}
          >
            {text}
          </span>
        </div>
      ))}
    </div>
  )
}

export default StepIndicator
