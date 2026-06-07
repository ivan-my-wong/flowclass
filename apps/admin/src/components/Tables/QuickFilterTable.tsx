import {
  ComponentPropsWithoutRef,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDebounce } from '@uidotdev/usehooks'
import {
  CellSpanModule,
  CellStyleModule,
  checkboxStyleDefault,
  ClientSideRowModelModule,
  ColDef,
  ColumnMovedEvent,
  EventApiModule,
  iconSetMaterial,
  ModuleRegistry,
  PaginationModule,
  provideGlobalGridOptions,
  QuickFilterModule,
  RenderApiModule,
  RowApiModule,
  RowAutoHeightModule,
  RowHeightParams,
  RowSelectionModule,
  RowSelectionOptions,
  RowStyleModule,
  TextFilterModule,
  themeAlpine,
  ValidationModule /* Development Only */,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useTranslation } from 'react-i18next'

import {
  DEBOUNCE_TIME,
  DEFAULT_ROWS_PER_PAGE,
  HEADER_HEIGHT,
  ROW_HEIGHT,
} from '@/constants/common'
import { cn } from '@/utils/cn'

import FilterSelectorContainer from '../Cards/FilterSelectorContainer'
import { TextInput } from '../Inputs/TextInput'
import { Spinner } from '../Loaders/Spinner'
import Select, { SelectItemValuesProps } from '../Selector/Select'

import CustomPaginationPanel from './CustomPaginationPanel'

// Mark all grids as using legacy themes
provideGlobalGridOptions({
  theme: 'legacy',
})
ModuleRegistry.registerModules([
  CellSpanModule,
  EventApiModule,
  TextFilterModule,
  RowSelectionModule,
  QuickFilterModule,
  RenderApiModule,
  PaginationModule,
  ClientSideRowModelModule,
  RowAutoHeightModule,
  CellStyleModule,
  RowStyleModule,
])
if (process.env.NODE_ENV !== 'production') {
  ModuleRegistry.registerModules([ValidationModule /* Development Only */])
}

const theme = themeAlpine
  .withPart(iconSetMaterial)
  .withPart(checkboxStyleDefault)

type TableProps = {
  rowData: any[]
  columns: ColDef[]
  height?: string
  hasCheckboxSelection?: boolean
  columnMinWidth?: number
  hasSortSelection?: boolean
  gridRef: RefObject<AgGridReact>
  hasFilterSelection?: boolean
  /** Receives handleReset that clears search input before calling parent's reset */
  filterSelector?:
    | ((props: { handleReset: () => void }) => React.ReactNode)
    | React.ReactNode
  isLoading?: boolean
  useUrlSearch?: boolean
  handleReset?: () => void
  inputRef?: RefObject<HTMLInputElement>
  /** When this changes, the search input is cleared (e.g. increment on reset) */
  resetSearchTrigger?: number
  onPaginationChanged?: (page: number) => void
  onSelectionChanged?: () => void
  getRowId?: (params: any) => string
  showFilterBox?: boolean
  searchPlaceholder?: string
  getRowClass?: (params: any) => string
  onColumnMoved?: (event: ColumnMovedEvent) => void
  alwaysMultiSort?: boolean
  getRowHeight?: (params: RowHeightParams) => number
  checkboxColumnOverrides?: Partial<ColDef>
} & ComponentPropsWithoutRef<'div'>

const QuickFilterTable: React.FC<TableProps> = ({
  rowData,
  columns,
  height = '60vh',
  hasSortSelection = false,
  hasCheckboxSelection,
  columnMinWidth,
  gridRef,
  hasFilterSelection = false,
  filterSelector,
  isLoading,
  handleReset,
  inputRef,
  resetSearchTrigger,
  searchPlaceholder,
  onSelectionChanged,
  getRowId,
  getRowClass,
  useUrlSearch = false,
  showFilterBox = true,
  onColumnMoved,
  alwaysMultiSort = false,
  getRowHeight,
  checkboxColumnOverrides,
  ...props
}) => {
  const { t } = useTranslation()
  const defaultSortBy = {
    label: t('component:table.selectSortBy') as string,
    value: 'all',
  }

  const [selectedSortBy, setSelectedSortBy] = useState<string>('all')
  const processedColumnsSelectOptions: SelectItemValuesProps[] = columns.map(
    column => {
      return {
        value: column.field as string,
        label: column.headerName as string,
      }
    }
  )

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      resizable: true,
      filter: true,
      minWidth: columnMinWidth,
      cellClass: '!flex !items-center',
    }
  }, [columnMinWidth])

  const processedColumns = useMemo(() => {
    return columns.map(column => {
      if (selectedSortBy && column.field === selectedSortBy) {
        return {
          ...column,
          sortable: true,
        }
      }
      return column
    })
  }, [columns, selectedSortBy])

  const [searchParams, setSearchParams] = useSearchParams()
  const search = useMemo(() => {
    if (!useUrlSearch) {
      return ''
    }
    return searchParams.get('search') || ''
  }, [searchParams, useUrlSearch])
  const [quickFilterText, setQuickFilterText] = useState(search)
  const debouncedQuickFilterText = useDebounce(quickFilterText, DEBOUNCE_TIME)

  const onFilterTextBoxChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickFilterText(e.target.value)
  }

  useEffect(() => {
    if (!useUrlSearch) return
    setQuickFilterText(search)
  }, [search, useUrlSearch])

  useEffect(() => {
    if (resetSearchTrigger != null && resetSearchTrigger > 0) {
      setQuickFilterText('')
    }
  }, [resetSearchTrigger])

  const wrappedHandleReset = useCallback(() => {
    setQuickFilterText('')
    handleReset?.()
  }, [handleReset])

  useEffect(() => {
    if (!useUrlSearch) return

    // When user clears input (e.g. reset), quickFilterText is empty immediately but
    // debouncedQuickFilterText lags. Prioritize quickFilterText so we clear URL right away.
    const shouldClear = !quickFilterText || !debouncedQuickFilterText
    if (shouldClear) {
      const currentSearch = searchParams.get('search') ?? ''
      if (currentSearch !== '') {
        const next = new URLSearchParams(searchParams.toString())
        next.delete('search')
        setSearchParams(next)
      }
      return
    }

    const currentSearch = searchParams.get('search') ?? ''
    if (currentSearch !== debouncedQuickFilterText) {
      const next = new URLSearchParams(searchParams.toString())
      next.set('search', debouncedQuickFilterText)
      setSearchParams(next)
    }
  }, [
    quickFilterText,
    debouncedQuickFilterText,
    searchParams,
    setSearchParams,
    useUrlSearch,
  ])

  const rowSelection = useMemo<
    RowSelectionOptions | 'single' | 'multiple' | undefined
  >(() => {
    return hasCheckboxSelection
      ? ({
          mode: 'multiRow',
          selectAll: 'currentPage',
        } as RowSelectionOptions)
      : undefined
  }, [hasCheckboxSelection])

  return (
    <div
      className={cn('ag-theme-alpine', props.className)}
      style={{ width: '100%', height }}
    >
      {showFilterBox && (
        <div className="pb-2 box-responsive-full">
          <div
            className={cn(
              'w-full min-w-[10rem]',
              hasFilterSelection && 'lg:w-[30%]'
            )}
          >
            <TextInput
              id="filter-text-box"
              placeholder={
                searchPlaceholder || (t('student:filterPlaceholder') as string)
              }
              onChange={onFilterTextBoxChanged}
              value={quickFilterText}
              variants="border"
              ref={inputRef}
              containerClassName="w-full"
            />
          </div>
          {hasFilterSelection && filterSelector && handleReset && (
            <FilterSelectorContainer>
              <>
                {typeof filterSelector === 'function'
                  ? filterSelector({ handleReset: wrappedHandleReset })
                  : filterSelector}
              </>
            </FilterSelectorContainer>
          )}
          {hasSortSelection && (
            <Select
              currentSelect={selectedSortBy}
              id="tableSort"
              selectItems={[
                {
                  itemValues: [defaultSortBy, ...processedColumnsSelectOptions],
                },
              ]}
              placeholder={t('component:table.selectSortBy') as string}
              onValueChange={(e: string) => {
                setSelectedSortBy(e)
              }}
            />
          )}
        </div>
      )}

      <AgGridReact<any>
        ref={gridRef}
        className="z-0"
        theme={theme}
        rowData={rowData} // Row Data for Rows
        columnDefs={processedColumns} // Column Defs for Columns
        defaultColDef={defaultColDef}
        animateRows // Optional - set to 'true' to have rows animate when sorted
        pagination
        headerHeight={HEADER_HEIGHT}
        rowHeight={getRowHeight ? undefined : ROW_HEIGHT}
        getRowHeight={getRowHeight}
        paginationPageSize={
          gridRef.current?.api?.getGridOption('paginationPageSize') ||
          DEFAULT_ROWS_PER_PAGE
        }
        quickFilterText={useUrlSearch ? search : quickFilterText}
        onSelectionChanged={onSelectionChanged}
        getRowId={getRowId}
        rowSelection={rowSelection}
        suppressPaginationPanel
        getRowClass={getRowClass}
        onColumnMoved={onColumnMoved}
        enableCellSpan
        alwaysMultiSort={alwaysMultiSort}
        loading={isLoading}
      />

      {gridRef.current?.api ? (
        <CustomPaginationPanel
          api={gridRef.current?.api}
          align="right"
          className="mt-4 pb-4"
        />
      ) : (
        <Spinner size="small" />
      )}
    </div>
  )
}
export default QuickFilterTable
