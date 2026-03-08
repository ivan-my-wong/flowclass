import { ComponentPropsWithoutRef, useEffect, useMemo, useState } from 'react'

import { AgEventTypeParams, GridApi } from 'ag-grid-community'
import { useTranslation } from 'react-i18next'
import { LuChevronsLeft, LuChevronsRight } from 'react-icons/lu'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/Pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  DEFAULT_ROWS_PER_PAGE,
  ELLIPSIS_TEXT,
  MAX_PAGES_TO_SHOW,
  ROWS_OPTIONS,
} from '@/constants/common'
import { cn } from '@/utils/cn'

type CustomPaginationPanelProps = {
  api: GridApi
  align?: 'left' | 'center' | 'right'
  pageSizeOptions?: number[]
} & ComponentPropsWithoutRef<'div'>

const CustomPaginationPanel = ({
  api,
  align = 'center',
  className,
  pageSizeOptions = ROWS_OPTIONS,
}: CustomPaginationPanelProps): JSX.Element => {
  const { t } = useTranslation()
  const [pageSize, setPageSize] = useState(
    api.getGridOption('paginationPageSize') || DEFAULT_ROWS_PER_PAGE
  )
  const [totalPages, setTotalPages] = useState(
    api.paginationGetTotalPages() || 1
  )
  const [currentPage, setCurrentPage] = useState(
    api.paginationGetCurrentPage() || 0
  )
  const goToFirst = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    api.paginationGoToFirstPage()
  }
  const goToPrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    api.paginationGoToPreviousPage()
  }
  const goToNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    api.paginationGoToNextPage()
  }
  const goToLast = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    api.paginationGoToLastPage()
  }
  const goToPage = (e: React.MouseEvent<HTMLButtonElement>, page: number) => {
    e.preventDefault()
    api.paginationGoToPage(page)
  }
  const onPageSizeChange = (value: string) => {
    const newSize = Number(value)
    if (Number.isNaN(newSize) || newSize <= 0) {
      console.error('Invalid page size:', value)
      return
    }

    setPageSize(newSize)
    api.setGridOption('paginationPageSize', newSize)
    api.paginationGoToFirstPage()
  }

  const onPaginationChanged = (
    params: AgEventTypeParams['paginationChanged']
  ) => {
    setTotalPages(params.api.paginationGetTotalPages())
    setCurrentPage(params.api.paginationGetCurrentPage())
  }

  useEffect(() => {
    api.addEventListener('paginationChanged', onPaginationChanged)
    return () => {
      api.removeEventListener('paginationChanged', onPaginationChanged)
    }
  }, [api])

  const pagesWithMore = useMemo(() => {
    const maxPagesToShow = MAX_PAGES_TO_SHOW
    const pages: (number | string)[] = []

    if (totalPages <= maxPagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(0)
      if (currentPage > 2) {
        pages.push(ELLIPSIS_TEXT)
      }
      const startPage = Math.max(1, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push(ELLIPSIS_TEXT)
      }
      if (totalPages - 1 !== pages[pages.length - 1]) {
        pages.push(totalPages - 1)
      }
    }

    return pages
  }, [totalPages, currentPage])

  return (
    <Pagination
      className={cn(
        'flex',
        align === 'left' && 'justify-start',
        align === 'right' && 'justify-end',
        className
      )}
    >
      <PaginationContent className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <PaginationItem className="flex items-center gap-2 justify-end">
          <span>{t('common:pagination.pageSize')}</span>
          <Select onValueChange={onPageSizeChange} value={pageSize.toString()}>
            <SelectTrigger className="w-[4rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(option => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PaginationItem>
        <div className="flex items-center gap-2">
          <PaginationItem>
            <PaginationLink
              className="gap-1 pr-2.5"
              size="icon"
              onClick={goToFirst}
              disabled={currentPage === 0}
            >
              <LuChevronsLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              disabled={api.paginationGetCurrentPage() === 0}
              onClick={goToPrevious}
            />
          </PaginationItem>
          {pagesWithMore.map((page, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <PaginationItem key={`${page}-${index}`}>
              {page === ELLIPSIS_TEXT ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={e => goToPage(e, +page)}
                  isActive={+page === currentPage}
                >
                  {+page + 1}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={goToNext}
              disabled={currentPage === totalPages - 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              size="icon"
              className="gap-1 pl-2.5"
              onClick={goToLast}
              disabled={currentPage === totalPages - 1}
            >
              <LuChevronsRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </div>
      </PaginationContent>
    </Pagination>
  )
}

export default CustomPaginationPanel
