import { forwardRef } from 'react'

import { Range, Root, SliderProps, Thumb, Track } from '@radix-ui/react-slider'
import { DefaultTFuncReturn } from 'i18next'

import { cn } from '@/utils/cn'

import Label from '../Inputs/Label'
import Box from '../ui/Box'

type ThisSliderProps = {
  step?: number
  min: number
  defaultValue?: number
  label?: string | DefaultTFuncReturn
} & SliderProps

const Slider = forwardRef<HTMLDivElement, ThisSliderProps>(
  ({ step, min, defaultValue, label, ...props }, ref) => {
    return (
      <Box ref={ref}>
        <Label className="w-1/5">{label ?? ''}</Label>
        <Root
          defaultValue={[defaultValue ?? min]}
          min={min}
          step={step ?? 1}
          className="relative flex items-center select-none touch-none w-60 h-8"
          {...props}
        >
          <Track className="relative flex-grow rounded-full h-[3px] bg-background-layer-3">
            <Range className="absolute bg-primary rounded-full h-full" />
          </Track>
          <Thumb
            className={cn(
              'block w-5 h-5 bg-background-layer-2 rounded-[10px]',
              'shadow-[0_2px_10px_hsl(var(--border))]',
              'hover:bg-background-layer-3',
              'focus:outline-none focus:shadow-[0_0_0_5px_hsl(var(--shadow))]'
            )}
          />
        </Root>
      </Box>
    )
  }
)

Slider.displayName = 'Slider'

export default Slider
