import React from 'react'

import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import useSchoolData from '@/hooks/useSchoolData'
import { css } from '@/styles'
import { cn } from '@/utils/cn'

import ContentHeader from './ContentHeader'

type LayoutProps = {
  headerBackButton?: HeaderBackButtonStatus
  leftHeader?: React.ReactNode
  rightHeader?: React.ReactNode
  isCustomStylesApply?: boolean
  leftHeaderCSS?: any
  rightHeaderCSS?: any
  mainClassName?: string
  headerClassName?: string
  bordered?: boolean
} & React.ComponentPropsWithoutRef<'div'>

const ContentLayout = ({
  headerBackButton,
  leftHeader,
  leftHeaderCSS,
  rightHeader,
  rightHeaderCSS,
  children,
  isCustomStylesApply,
  mainClassName,
  headerClassName,
  bordered = true,
  className,
  ...props
}: LayoutProps): JSX.Element => {
  const { useFetchCurrentSchoolNotificationsSetting, useFetchCurrentSchool } =
    useSchoolData()

  useFetchCurrentSchool()
  useFetchCurrentSchoolNotificationsSetting()

  return (
    <div className={cn(containerStyles().toString(), className)} {...props}>
      {(headerBackButton || leftHeader || rightHeader) && (
        <ContentHeader
          headerBackButton={headerBackButton}
          leftHeader={leftHeader}
          rightHeader={rightHeader}
          leftHeaderCSS={leftHeaderCSS}
          rightHeaderCSS={rightHeaderCSS}
          isCustomStylesApply={isCustomStylesApply}
          bordered={bordered}
          className={headerClassName}
        />
      )}
      <main className={cn(mainStyles().toString(), mainClassName)}>
        {children}
      </main>
    </div>
  )
}

const containerStyles = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
})

const mainStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexGrow: 1,
})

export default ContentLayout
