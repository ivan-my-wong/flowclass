import React from 'react'

import HeaderBackButton, {
  HeaderBackButtonStatus,
} from '@/components/TabWithListAndButton/HeaderBackButton'
import { cn } from '@/utils/cn'

type HeaderProps = {
  headerBackButton?: HeaderBackButtonStatus
  leftHeader?: React.ReactNode
  rightHeader?: React.ReactNode
  isCustomStylesApply?: boolean
  leftHeaderCSS?: string
  rightHeaderCSS?: string
  bordered?: boolean
} & React.ComponentPropsWithoutRef<'header'>

const ContentHeader = ({
  headerBackButton,
  leftHeader,
  leftHeaderCSS,
  rightHeader,
  rightHeaderCSS,
  isCustomStylesApply,
  bordered = true,
  className,
  ...props
}: HeaderProps): React.ReactElement => {
  const leftStyles = cn(
    'flex flex-row items-center font-bold gap-2 pl-4',
    isCustomStylesApply && 'w-[90%] xl:w-4/5 lg:w-[78%] md:w-[68%] sm:w-[90%]',
    leftHeaderCSS
  )
  const rightStyles = cn('ml-auto justify-end pr-4', rightHeaderCSS)

  return (
    <header
      className={cn(
        'py-2 gap-2 items-center flex flex-row md:flex',
        bordered && 'border-b border-solid border-text-disabled',
        className
      )}
      {...props}
    >
      <div className={leftStyles}>
        {headerBackButton && <HeaderBackButton {...headerBackButton} />}
        <div className="flex items-center flex-row font-bold gap-2">
          {leftHeader}
        </div>
      </div>
      {rightHeader && <div className={rightStyles}>{rightHeader}</div>}
    </header>
  )
}

export default ContentHeader
