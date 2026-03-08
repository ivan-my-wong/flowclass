import * as React from 'react'

import { LuEye, LuEyeOff } from 'react-icons/lu'

import SvgIcon from '@/components/Images/SvgIcon'
import usePasswordToggler from '@/hooks/usePasswordToggler'
import { cn } from '@/utils/cn'

import { Button } from '../Button'

export type InputProps = {
  showPasswordToggler?: boolean
  prefixIcon?: React.ReactNode
  prefixText?: string
  containerClassName?: string
} & React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, showPasswordToggler, containerClassName, ...props },
    ref
  ) => {
    const {
      ref: inputRef,
      togglePassword,
      isShown,
    } = usePasswordToggler(type, ref)
    const passwordToggler = React.useCallback(
      () => (
        <Button
          onClick={togglePassword}
          type="button"
          variant="ghost"
          className="absolute cursor-pointer right-1 top-0 text-black dark:text-white"
        >
          {isShown ? (
            <LuEye className="h-5 w-5" />
          ) : (
            <LuEyeOff className="h-5 w-5" />
          )}
        </Button>
      ),
      [togglePassword, isShown]
    )
    return (
      <div
        className={cn([
          'w-full',
          (props.prefixIcon || props.prefixText || showPasswordToggler) &&
            'relative',
          containerClassName,
        ])}
      >
        {props.prefixIcon && (
          <SvgIcon className="absolute left-3 top-1/4">
            {props.prefixIcon}
          </SvgIcon>
        )}
        {props.prefixText && (
          <span
            className={cn([
              'absolute text-gray-400 top-1/2 -translate-y-1/2',
              props.prefixIcon ? 'left-12' : 'left-2',
            ])}
          >
            {props.prefixText}
          </span>
        )}
        <input
          {...props}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background dark:bg-dark-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
            props.prefixIcon && 'pl-12',
            props.prefixText && !props.prefixIcon && 'pl-5',
            props.prefixText && props.prefixIcon && 'pl-16'
          )}
          ref={inputRef}
        />

        {showPasswordToggler && passwordToggler()}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
