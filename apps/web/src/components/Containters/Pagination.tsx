import React, { useState } from 'react'

import ReactPaginate from 'react-paginate'

import Text from '@/components/Texts/Text'

import PaginationButton from '../Buttons/PaginationButton'

interface PaginatedItemsProps {
  children: React.ReactNode[]
  itemsPerPage: number
  title?: string
  actionButton?: JSX.Element
  hidePaginationIfOnePage?: boolean
}

const PaginatedItems = ({
  children,
  title,
  actionButton,
  itemsPerPage,
  hidePaginationIfOnePage = false,
}: PaginatedItemsProps): JSX.Element => {
  const [itemOffset, setItemOffset] = useState(0)

  const endOffset = itemOffset + itemsPerPage
  const currentItems = children.slice(itemOffset, endOffset)
  const pageCount = Math.ceil(children.length / itemsPerPage)

  const handlePageClick = (event: { selected: number }): void => {
    const newOffset = (event.selected * itemsPerPage) % children.length
    setItemOffset(newOffset)
  }

  const hasBack = itemOffset > 0
  const hasNext = endOffset < children.length

  if (hidePaginationIfOnePage && pageCount === 1) {
    return <div className="box-col-full">{currentItems}</div>
  }

  return (
    <div className="box-col w-full p-0">
      <div className="box-row w-full">
        {actionButton}
        {title && <Text className="shrink-0">{title}</Text>}
        <ReactPaginate
          breakLabel="..."
          nextLabel={<PaginationButton type="next" disabled={!hasNext} />}
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel={<PaginationButton type="back" disabled={!hasBack} />}
          renderOnZeroPageCount={null}
          className="box-row w-full gap-6"
          activeClassName="font-bold"
        />
      </div>

      {currentItems}
    </div>
  )
}
export default PaginatedItems
