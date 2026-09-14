import React from 'react'

import clsx from 'clsx'

import HeaderBackButton, {
  HeaderBackButtonStatus,
} from '@/components/TabWithListAndButton/HeaderBackButton'
import { css } from '@/styles'
import { cn } from '@/utils/cn'

type HeaderProps = {
  headerBackButton?: HeaderBackButtonStatus
  leftHeader?: React.ReactNode
  rightHeader?: React.ReactNode
  isCustomStylesApply?: boolean
  leftHeaderCSS?: any
  rightHeaderCSS?: any
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
  const leftAndCustomStyles = clsx({
    [leftStyles()]: true,
    [customStyles()]: isCustomStylesApply,
    [leftHeaderCSS]: leftHeaderCSS,
  })
  const rightAndCustomStyles = clsx({
    [rightStyles()]: true,
    [rightHeaderCSS]: rightHeaderCSS,
  })
  return (
    <header
      className={cn(
        'py-2 gap-2 items-center flex flex-row',
        'md:flex',
        bordered && 'border-b border-solid border-textDisabled',
        className
      )}
    >
      <div className={leftAndCustomStyles}>
        {headerBackButton && <HeaderBackButton {...headerBackButton} />}
        <div className="flex items-center flex-row font-bold gap-2">
          {leftHeader}
        </div>
      </div>
      {rightHeader && <div className={rightAndCustomStyles}>{rightHeader}</div>}
    </header>
  )
}

const leftStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  fontWeight: 'bold',
  gap: '$2',
  paddingLeft: '$4',
})

const customStyles = css({
  width: '90%',
  '@xl': {
    width: '80%',
  },
  '@lg': {
    width: '78%',
  },
  '@md': {
    width: '68%',
  },
  '@sm': {
    width: '90%',
  },
})

const rightStyles = css({
  marginLeft: 'auto',
  justifyContent: 'flex-end',
  paddingRight: '$4',
})

export default ContentHeader
