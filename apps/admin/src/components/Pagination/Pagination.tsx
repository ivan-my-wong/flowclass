import React from 'react'

import ReactPaginate from 'react-paginate'

import { MetaType } from '@/types/pagination'
import { cn } from '@/utils/cn'

import Text from '../Texts/Text'
import Box from '../ui/Box'

import PaginationButton from './PaginationButton'

type PageButtonTextProps = {
  next: string
  back: string
  onChangePage?: (page: number) => void
  onClickNext?: () => void
  onClickBack?: () => void
}

type PaginatedItemsProps = {
  children: React.ReactNode[]
  meta: MetaType
  title?: string
  actionButton?: JSX.Element
  pageButtonProps?: PageButtonTextProps
  itemWrapperClassName?: string
  isBottomPagination?: boolean
}

const PaginatedItems = ({
  title,
  actionButton,
  meta,
  pageButtonProps,
  children,
  itemWrapperClassName,
  isBottomPagination,
  ...props
}: PaginatedItemsProps &
  React.ComponentPropsWithoutRef<'div'>): JSX.Element => {
  const pageCount = Math.ceil(meta.itemCount / (meta.num || 1))
  // Clamp the active page into a valid range so we never feed react-paginate
  // a `forcePage` greater than `pageCount - 1` (which logs an out-of-range
  // warning) or a negative value (when there are 0 items).
  const safeForcePage =
    pageCount > 0 ? Math.min(Math.max(meta.page - 1, 0), pageCount - 1) : 0

  return (
    <Box direction="col" {...props}>
      <Box className="w-full">
        {actionButton}
        {title && <Text className="shrink-0">{title}</Text>}
      </Box>

      <div
        className={cn({
          'flex flex-col w-full': true,
          'flex-col-reverse': isBottomPagination,
        })}
      >
        <div className="w-full flex justify-center items-center py-2 [&_ul]:flex-wrap [&_ul]:list-none [&_ul]:p-0 [&_ul]:m-0 [&_ul]:flex [&_ul]:justify-center [&_ul]:gap-4 [&_ul]:items-center [&_.selected]:font-bold">
          <ReactPaginate
            breakLabel="..."
            nextLabel={
              <PaginationButton
                type="next"
                disabled={!meta.hasNextPage}
                onClick={pageButtonProps?.onClickNext}
                text={pageButtonProps?.next}
              />
            }
            onPageChange={({ selected }) =>
              pageButtonProps?.onChangePage?.(selected + 1)
            }
            pageClassName="h-8 w-8 rounded-md flex justify-center items-center"
            activeClassName="bg-primary text-primary-foreground"
            pageRangeDisplayed={2}
            forcePage={safeForcePage}
            pageCount={pageCount}
            previousLabel={
              <PaginationButton
                type="back"
                disabled={!meta.hasPreviousPage}
                onClick={pageButtonProps?.onClickBack}
                text={pageButtonProps?.back}
              />
            }
            renderOnZeroPageCount={null}
          />
        </div>
        <div className={cn('w-full', itemWrapperClassName)}>{children}</div>
      </div>
    </Box>
  )
}
export default PaginatedItems
