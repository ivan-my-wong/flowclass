import * as React from 'react'

import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight, LuMoreHorizontal } from 'react-icons/lu'

import { Button, ButtonProps, buttonVariants } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const Pagination = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'nav'>): JSX.Element => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn(className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'
/**
 * Props for the PaginationLink component
 * @property {boolean} isActive - Whether the link represents the current page
 * @property {boolean} disabled - Whether the link is disabled
 * @property {boolean} withText - Whether to show text alongside icons
 */

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
  withText?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentPropsWithoutRef<'button'>

const PaginationLink = ({
  className,
  isActive,
  disabled,
  size = 'icon',
  ...props
}: PaginationLinkProps): JSX.Element => (
  <Button
    type="button"
    aria-current={isActive ? 'page' : undefined}
    aria-disabled={disabled}
    variant="ghost"
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      'cursor-pointer',
      className,
      disabled && 'btn-disabled cursor-not-allowed'
    )}
    {...props}
  >
    {props.children}
  </Button>
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  withText = false,
  ...props
}: React.ComponentPropsWithoutRef<typeof PaginationLink>): JSX.Element => {
  const { t } = useTranslation()
  return (
    <PaginationLink
      aria-label={t('common:pagination.aria.previous') as string}
      size="default"
      className={cn('gap-1 pl-2.5', className)}
      {...props}
    >
      <LuChevronLeft className="h-4 w-4" />
      {withText && <span>{t('common:pagination.previous')}</span>}
    </PaginationLink>
  )
}
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  withText = false,
  ...props
}: React.ComponentPropsWithoutRef<typeof PaginationLink>): JSX.Element => {
  const { t } = useTranslation()
  return (
    <PaginationLink
      aria-label={t('common:pagination.aria.next') as string}
      size="default"
      className={cn('gap-1 pr-2.5', className)}
      {...props}
    >
      {withText && <span>{t('common:pagination.next')}</span>}
      <LuChevronRight className="h-4 w-4" />
    </PaginationLink>
  )
}
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'>): JSX.Element => {
  const { t } = useTranslation()
  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <LuMoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{t('common:pagination.more')}</span>
    </span>
  )
}
PaginationEllipsis.displayName = 'PaginationEllipsis'

const PaginationComponent = ({
  currentPage,
  setCurrentPage,
  pageCount,
  itemsPerPage,
  children,
}: {
  currentPage: number
  setCurrentPage: (page: number) => void
  pageCount: number
  itemsPerPage: number
  children: React.ReactNode[]
}) => {
  const childrenArray = React.Children.toArray(children)
  const childrenToRender = childrenArray.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  const pageNumbers = React.useMemo(() => {
    if (pageCount <= 0) return []

    const delta = 1
    const range: (number | string)[] = []

    if (pageCount <= 7) {
      for (let i = 0; i < pageCount; i++) {
        range.push(i)
      }
      return range
    }

    range.push(0)

    const leftBoundary = Math.max(1, currentPage - delta)
    if (leftBoundary > 1) {
      range.push('left-ellipsis')
    }

    for (
      let i = leftBoundary;
      i <= Math.min(pageCount - 2, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    const rightBoundary = Math.min(pageCount - 2, currentPage + delta)
    if (rightBoundary < pageCount - 2) {
      range.push('right-ellipsis')
    }

    range.push(pageCount - 1)

    return range
  }, [currentPage, pageCount])

  if (pageCount <= 0) {
    return <>{childrenToRender}</>
  }

  return (
    <>
      <Pagination>
        <PaginationContent className="flex flex-wrap justify-center">
          <PaginationItem>
            <PaginationPrevious
              withText
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            />
          </PaginationItem>
          <div className="flex w-64 justify-center">
            {pageNumbers.map(pageNum => {
              if (pageNum === 'left-ellipsis' || pageNum === 'right-ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${pageNum}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              const page = pageNum as number
              return (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
          </div>
          <PaginationItem>
            <PaginationNext
              withText
              disabled={currentPage === pageCount - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {childrenToRender}
    </>
  )
}

export {
  Pagination,
  PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
