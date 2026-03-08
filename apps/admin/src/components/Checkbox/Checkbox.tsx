/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
  useRef,
} from 'react'

import { cn } from '@/utils/cn'

import { InputMeta } from '../../types/options'

type CheckboxProps = {
  isChecked: boolean
  onChange: (e: boolean) => void
  onBlur?: FocusEventHandler<HTMLInputElement>
  invalid?: boolean
  className?: string
} & InputMeta

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { id, label, isChecked = false, onChange, onBlur, invalid, className },
    ref
  ) => {
    const checkmarkRef = useRef<HTMLDivElement>(null)

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        checkmarkRef.current?.click()
      }
    }

    return (
      <label
        className={cn(
          'flex items-center cursor-pointer relative',
          invalid && '[&>div:first-child]:border-warn'
        )}
      >
        <div
          ref={checkmarkRef}
          tabIndex={0}
          role="checkbox"
          aria-checked={isChecked}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          className={cn(
            'flex items-center justify-center rounded h-[30px] w-[30px] text-sm border-2 border-border bg-transparent text-background mr-4 shrink-0',
            isChecked &&
              'text-primary bg-white [&>span]:text-base [&>span]:font-black',
            invalid && 'border-warn'
          )}
        >
          {isChecked && <span>✓</span>}
        </div>
        <span className="leading-[1.5]">{label}</span>
        <input
          type="checkbox"
          id={id ?? 'checkbox'}
          checked={isChecked}
          onChange={e => onChange(e.target.checked)}
          hidden
          ref={ref}
        />
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
