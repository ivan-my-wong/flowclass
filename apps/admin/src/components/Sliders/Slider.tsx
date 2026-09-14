import { forwardRef } from 'react'

import { Range, Root, SliderProps, Thumb, Track } from '@radix-ui/react-slider'
import { styled } from '@stitches/react'
import { DefaultTFuncReturn } from 'i18next'

import Label from '../Inputs/Label'
import Box from '../ui/Box'

const SliderRoot = styled(Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '15rem',
  height: '2rem',
})

const SliderTrack = styled(Track, {
  backgroundColor: '$backgroundLayer3',
  position: 'relative',
  flexGrow: 1,
  borderRadius: '9999px',
  height: 3,
})

const SliderRange = styled(Range, {
  position: 'absolute',
  backgroundColor: '$primary',
  borderRadius: '9999px',
  height: '100%',
})

const SliderThumb = styled(Thumb, {
  display: 'block',
  width: 20,
  height: 20,
  backgroundColor: '$backgroundLayer2',
  boxShadow: `0 2px 10px $colors$borderColor`,
  borderRadius: 10,
  '&:hover': { backgroundColor: '$colors$backgroundLayer3' },
  '&:focus': { outline: 'none', boxShadow: `0 0 0 5px $colors$shadowColor` },
})

type ThisSliderProps = {
  step?: number
  min: number
  defaultValue?: number
  label?: string | DefaultTFuncReturn
} & SliderProps

const Slider = forwardRef<HTMLFormElement, ThisSliderProps>(
  ({ step, min, defaultValue, label, ...props }, ref) => {
    return (
      <Box ref={ref as any}>
        <Label css={{ width: '20%' }}>{label ?? ''}</Label>
        <SliderRoot
          defaultValue={[defaultValue ?? min]}
          min={min}
          step={step ?? 1}
          {...props}
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </SliderRoot>
      </Box>
    )
  }
)

export default Slider
