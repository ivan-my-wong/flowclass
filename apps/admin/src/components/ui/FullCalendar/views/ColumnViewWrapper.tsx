import { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/utils/cn'

type ColumnViewWrapperProps = {
  children: React.ReactNode
} & ComponentPropsWithoutRef<'div'>

const ColumnViewWrapper = ({
  children,
  ...props
}: ColumnViewWrapperProps): JSX.Element => {
  return (
    <div className={cn('flex h-full flex-col', props.className)} {...props}>
      {children}
    </div>
  )
}

export default ColumnViewWrapper
