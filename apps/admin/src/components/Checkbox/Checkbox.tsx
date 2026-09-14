/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
  useRef,
} from 'react'

import type { CSS } from '@stitches/react'

import { styled } from '../../styles'
import { InputMeta } from '../../types/options'

type CheckboxProps = {
  isChecked: boolean
  onChange: (e: boolean) => void
  onBlur?: FocusEventHandler<HTMLInputElement>
  invalid?: boolean
  css?: CSS
} & InputMeta

const Checkmark = styled('div', {
  $$size: '30px',
  flexRowCenter: 'center',
  borderRadius: '$small',
  height: '$$size',
  width: '$$size',
  fontSize: '$2',
  border: '2px solid $borderColor',
  color: '$background',
  backgroundColor: 'transparent',
  marginRight: '$4',
  flex: '0 0 $$size',

  variants: {
    checked: {
      true: {
        color: '$primary',
        backgroundColor: 'white',

        span: {
          fontSize: '$4',
          fontWeight: 900,
        },
      },
    },
  },
})

const CheckboxLabel = styled('span', {
  lineHeight: '1.5',
})

const CheckboxWrapper = styled('label', {
  flexRowCenter: 'start',
  position: 'relative',
  cursor: 'pointer',
  // [`&:hover ${Checkmark}`]: {
  //   borderColor: '$primary',
  // },
  variants: {
    invalid: {
      true: {
        [`& > ${Checkmark}`]: {
          borderColor: '$warn',
        },
      },
    },
  },
})

const Checkbox = forwardRef<any, CheckboxProps>(
  ({ id, label, isChecked = false, onChange, onBlur, invalid, css }, ref) => {
    const checkmarkRef = useRef<HTMLDivElement>(null)

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        checkmarkRef.current?.click()
      }
    }

    return (
      <CheckboxWrapper invalid={invalid} css={css}>
        <Checkmark
          ref={checkmarkRef}
          tabIndex={0}
          checked={isChecked}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
        >
          {isChecked && <span>✓</span>}
        </Checkmark>
        <CheckboxLabel onClick={() => checkmarkRef.current?.focus()}>
          {label}
        </CheckboxLabel>
        <input
          type="checkbox"
          id={id ?? 'checkbox'}
          checked={isChecked}
          onChange={e => {
            onChange(e.target.checked)
          }}
          hidden
          ref={ref as any}
        />
      </CheckboxWrapper>
    )
  }
)

export default Checkbox
