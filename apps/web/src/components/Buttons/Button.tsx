import { ButtonHTMLAttributes, FC } from 'react'

import clsx from 'clsx'
import { LucideLoader } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
  align?: 'left' | 'center' | 'right'
  type?: 'submit' | 'button' | 'reset'
  outlined?: boolean
  variant?:
    | 'text'
    | 'outlined'
    | 'disabledText'
    | 'disabledOutlined'
    | 'outlinedPlain'
    | 'textPrimary'
    | 'disabled'
    | 'danger'
    | 'whatsapp'
  isLoading?: boolean
}

const Button: FC<ButtonProps> = ({
  iconBefore,
  children,
  iconAfter,
  type = 'button',
  variant,
  className,
  isLoading,
  ...props
}) => {
  let variantClasses = 'border-0 bg-primary text-background'

  switch (variant) {
    case 'text':
      variantClasses = 'text-text bg-transparent hover:text-Subtle'
      break

    case 'textPrimary':
      variantClasses = 'text-primary bg-transparent hover:text-primary-highlight'
      break
    case 'outlined':
      variantClasses = 'text-primary border border-primary bg-transparent'
      break
    case 'whatsapp':
      variantClasses = 'text-background bg-whatsapp hover:bg-whatsapp/80'
      break
    case 'disabled':
      variantClasses = 'bg-textDisabled text-background cursor-default'
      break
    case 'outlinedPlain':
      variantClasses = 'text-text border border-text bg-transparent'
      break
    case 'disabledText':
      variantClasses = 'text-textDisabled bg-transparent cursor-not-allowed'
      break
    case 'disabledOutlined':
      variantClasses = 'text-textDisabled border border-textDisabled bg-transparent cursor-default'
      break
    case 'danger':
      variantClasses = 'text-[#fff] bg-dark-warn cursor-default'
      break
  }

  const defaultClasses = clsx(
    `flex items-center justify-center cursor-pointer rounded-md font-bold py-2 px-4 text-center`,
    variantClasses,
    className,
    props.disabled && 'opacity-50 cursor-not-allowed'
  )

  if (isLoading) {
    return (
      <button type={type} className={defaultClasses} {...props}>
        <LucideLoader className="animate-spin" />
      </button>
    )
  }

  return iconBefore || iconAfter ? (
    <button type={type} className={defaultClasses} {...props}>
      {iconBefore && <span className="mr-2">{iconBefore}</span>}
      <span>{children}</span>
      {iconAfter && <span className="ml-2">{iconAfter}</span>}
    </button>
  ) : (
    <button type={type} className={defaultClasses} {...props}>
      {children}
    </button>
  )
}

Button.displayName = 'Button'

export default Button
