// eslint-disable-next-line no-restricted-syntax
import React from 'react'

const HorizontalBaseCard = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
}): JSX.Element => {
  return (
    <div
      className={`border-textSubtle flex h-full w-full items-center justify-center rounded border pl-4 hover:opacity-70 sm:flex-col lg:w-64 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default HorizontalBaseCard
