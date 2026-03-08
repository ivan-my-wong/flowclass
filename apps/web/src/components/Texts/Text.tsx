type TextProps = {
  id?: string
  children?: React.ReactNode
  align?: 'left' | 'center' | 'right'
  lineHeight?: `${number}`
  fontSize?: string
  bold?: boolean
  className?: string
  variant?: 'plain' | 'error' | 'primary' | 'disabled'
} & Partial<typeof HTMLParagraphElement>

const Text = ({
  id,
  children,
  lineHeight = '5',
  align,
  variant,
  className,
  ...props
}: TextProps) => {
  let variantClasses = ''

  if (variant) {
    if (variant === 'error') {
      variantClasses = 'text-warn mt-2 text-bold text-3'
    } else if (variant === 'primary') {
      variantClasses = 'text-primary'
    } else if (variant === 'disabled') {
      variantClasses = 'text-textDisabled'
    }
  }

  return (
    <p
      id={id}
      className={`m-0 p-0 leading-${lineHeight} text-${align} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}

export default Text
