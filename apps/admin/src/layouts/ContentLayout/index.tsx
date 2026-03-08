import React from 'react'

import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import useSchoolData from '@/hooks/useSchoolData'
import { cn } from '@/utils/cn'

import ContentHeader from './ContentHeader'

type LayoutProps = {
  headerBackButton?: HeaderBackButtonStatus
  leftHeader?: React.ReactNode
  rightHeader?: React.ReactNode
  isCustomStylesApply?: boolean
  leftHeaderCSS?: string
  rightHeaderCSS?: string
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
    <div className={cn('flex flex-col w-full h-full', className)} {...props}>
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
      <main
        className={cn('flex flex-col items-center flex-grow', mainClassName)}
      >
        {children}
      </main>
    </div>
  )
}

export default ContentLayout
