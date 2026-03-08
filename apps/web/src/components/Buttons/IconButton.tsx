import { ButtonHTMLAttributes, forwardRef } from 'react'

import clsx from 'clsx'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  plain?: boolean
}

const sizes = {
  small: 'py-1 px-2 text-sm',
  medium: 'py-1 px-3',
  large: 'py-2 px-4 text-lg',
}

const plainStyles = {
  backgroundColor: 'transparent',
  color: 'text-primary',
}

const sizeVariants = {
  small: sizes.small,
  medium: sizes.medium,
  large: sizes.large,
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ type = 'button', icon, size = 'medium', plain = false, className, ...rest }, ref) => {
    const sizeClass = sizeVariants[size]
    const plainClass = plain ? plainStyles : {}
    const combinedClasses = clsx(plainStyles, sizeClass, plainClass, className)

    return (
      <button {...rest} {...{ type, ref }} className={combinedClasses}>
        {icon}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton
