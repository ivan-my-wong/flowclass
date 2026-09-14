import React, { useState } from 'react'

import ReactPaginate from 'react-paginate'

import { styled } from '../../styles'
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

const PaginationWrapper = styled('div', {
  width: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0.5rem 0',
  ul: {
    listStyleType: 'none' /* Remove bullets */,
    padding: 0 /* Remove padding */,
    margin: 0 /* Remove margins */,
    display: 'flex',
    justifyContent: 'center',
    gap: '$4',
    alignItems: 'center',
    '.selected': {
      fontWeight: 'bold',
    },
  },
})

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
        <PaginationWrapper>
          <ReactPaginate
            forcePage={currentPage}
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
        </PaginationWrapper>
      </Box>

      {currentItems}
    </Box>
  )
}
export default PaginatedItems
