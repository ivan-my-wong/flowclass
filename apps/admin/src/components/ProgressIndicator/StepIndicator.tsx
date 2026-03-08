import React from 'react'

import { cn } from '@/utils/cn'

import { FadeInAndLeftAnimation } from '../Animations/FadeInAnimations'
import Text from '../ui/Text'

type StepIndicatorProps = {
  steps: string[]
  currentStep: number
  handleClick?: (step: number) => void
  className?: string
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  handleClick,
  className,
}) => {
  return (
    <>
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideInLoop {
              0% {
                width: 0;
                opacity: 0;
              }
              20% {
                opacity: 1;
              }
              80% {
                width: 3rem; /* w-12 */
                opacity: 1;
              }
              100% {
                width: 3rem; /* w-12 */
                opacity: 1;
              }
            }
          `,
        }}
      />
      <div
        className={cn(
          'box-row-full items-center w-full overflow-x-scroll justify-center lg:overflow-x-auto sticky top-0 z-10 rounded shadow-none',
          className
        )}
      >
        <div className="flex flex-col items-center">
          {/* Current step text - above all lines */}
          <Text
            className={cn('text-sm font-bold text-primary whitespace-nowrap')}
          >
            {steps[currentStep] ?? ''}
          </Text>

          {/* Step lines */}
          <div className="flex items-center space-x-2">
            {steps.map((text, index) => (
              <FadeInAndLeftAnimation delay={index * 0.1} key={text}>
                <button
                  type="button"
                  aria-label={text}
                  aria-current={index === currentStep ? 'step' : undefined}
                  className={cn(
                    'cursor-pointer bg-transparent border-none p-0',
                    handleClick && 'hover:opacity-80'
                  )}
                  onClick={() => {
                    if (handleClick) handleClick(index)
                  }}
                >
                  {/* Step line indicator */}
                  <div
                    className={cn(
                      'h-1 rounded-full relative overflow-hidden',
                      (() => {
                        if (index === currentStep) return 'w-12 bg-gray-300'
                        if (index < currentStep) return 'w-10 bg-gray-400'
                        return 'w-8 bg-gray-300'
                      })()
                    )}
                  >
                    {/* Animated blue line for current step */}
                    {index === currentStep && (
                      <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full"
                        style={{
                          animation: 'slideInLoop 2s ease-in-out infinite',
                        }}
                      />
                    )}
                  </div>
                </button>
              </FadeInAndLeftAnimation>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default StepIndicator
