import React, { useState } from 'react'

import ReactPaginate from 'react-paginate'

import Text from '../Texts/Text'

import Box from './Box'
import PaginationButton from './PaginationButton'

type PageButtonTextProps = {
  next: string
  back: string
  onClickNext?: (...props: any) => any
  onClickBack?: (...props: any) => any
}

interface PaginatedItemsProps {
  children: React.ReactNode[]
  itemsPerPage: number
  title?: string
  actionButton?: JSX.Element
  pageButtonProps?: PageButtonTextProps
  currentOffset?: number
  currentPage?: number
}

const PaginatedItems = ({
  children = [],
  title,
  actionButton,
  itemsPerPage,
  pageButtonProps,
  currentOffset,
  currentPage,
}: PaginatedItemsProps): JSX.Element => {
  const [itemOffset, setItemOffset] = useState(currentOffset ?? 0)
  const pageCount = Math.ceil(children.length / (itemsPerPage || 1))
  // react-paginate logs a warning when `forcePage` is out of [0, pageCount-1].
  // Clamp it so we never feed it a stale page index (e.g. when the list shrinks
  // or there are 0 items).
  const safeForcePage =
    typeof currentPage === 'number' && pageCount > 0
      ? Math.min(Math.max(currentPage, 0), pageCount - 1)
      : undefined

  const handlePageClick = (event: { selected: number }): void => {
    const newOffset = (event.selected * itemsPerPage) % children.length
    setItemOffset(newOffset)
  }

  const endOffset = itemOffset + itemsPerPage
  const currentItems = children.slice(itemOffset, endOffset)
  const hasBack = itemOffset > 0
  const hasNext = endOffset < children.length

  return (
    <Box direction="column">
      <Box>
        {actionButton}
        {title && <Text className="shrink-0">{title}</Text>}
        <div className="w-full flex justify-center items-center py-2 [&_ul]:list-none [&_ul]:p-0 [&_ul]:m-0 [&_ul]:flex [&_ul]:justify-center [&_ul]:gap-4 [&_ul]:items-center [&_.selected]:font-bold">
          <ReactPaginate
            forcePage={safeForcePage}
            breakLabel="..."
            nextLabel={
              <PaginationButton
                type="next"
                disabled={!hasNext}
                onClick={pageButtonProps?.onClickNext}
                text={pageButtonProps?.next}
              />
            }
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            pageCount={pageCount}
            previousLabel={
              <PaginationButton
                type="back"
                disabled={!hasBack}
                onClick={pageButtonProps?.onClickBack}
                text={pageButtonProps?.back}
              />
            }
            renderOnZeroPageCount={null}
          />
        </div>
      </Box>

      {currentItems}
    </Box>
  )
}
export default PaginatedItems
