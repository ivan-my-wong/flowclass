/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
  RefObject,
  useRef,
} from 'react'

import { Indicator, Root } from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'

import { cn } from '@/utils/cn'

type CheckboxProps = {
  value: boolean
  onChange: (val: boolean) => void
  onBlur?: FocusEventHandler<HTMLInputElement>
  label?: string
  invalid?: boolean
  disabled?: boolean
}

const Checkbox = forwardRef<RefObject<HTMLInputElement> | null, CheckboxProps>(
  ({ label, value = false, onChange, onBlur, disabled }, ref) => {
    const checkmarkRef = useRef<HTMLDivElement>(null)

    const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
      onChange(e.target.checked)
    }

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        checkmarkRef.current?.click()
      }
    }

    return (
      <div
        className="flex items-center"
        onClick={() => {
          onChange(!value)
        }}
      >
        <Root
          className={cn(
            'hover:bg-violet3 bg-background flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-[4px] border outline-none focus:shadow-[0_0_0_2px_black]',
            disabled && 'bg-background-layer-3 cursor-not-allowed'
          )}
          tabIndex={0}
          checked={value}
          disabled={disabled}
        >
          <Indicator className="text-primary">{value && <CheckIcon />}</Indicator>
        </Root>

        <input
          type="checkbox"
          checked={value}
          onChange={handleChange}
          hidden
          ref={ref as RefObject<HTMLInputElement>}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
        />
      </div>
    )
  }
)

export default Checkbox

Checkbox.displayName = 'Checkbox'
