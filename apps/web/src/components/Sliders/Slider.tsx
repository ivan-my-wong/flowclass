import React, { forwardRef } from 'react'

import { Range, Root, SliderProps, Thumb, Track } from '@radix-ui/react-slider'

type ThisSliderProps = {
  step?: number
  min: number
  defaultValue?: number
  label?: string
} & SliderProps

const Slider = forwardRef<HTMLFormElement, ThisSliderProps>(
  ({ step, min, defaultValue, label, ...props }, ref) => {
    return (
      <div ref={ref as any}>
        <p className="input-label">{label ?? ''}</p>
        <Root
          className="relative flex h-5 w-[200px] touch-none select-none items-center"
          defaultValue={[defaultValue ?? min]}
          step={step ?? 1}
          {...props}
        >
          <Track className="bg-textSubtle relative h-[3px] grow rounded-full">
            <Range className="bg-background absolute h-full rounded-full" />
          </Track>
          <Thumb className="bg-background shadow-shadowColor hover:bg-violet3 focus:shadow-shadowColor block h-5 w-5 rounded-[10px] shadow-[0_2px_10px] focus:shadow-[0_0_0_5px] focus:outline-none" />
        </Root>
      </div>
    )
  }
)

export default Slider

Slider.displayName = 'Sliders'
