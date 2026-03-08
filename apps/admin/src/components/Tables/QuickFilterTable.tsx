import {
  ComponentPropsWithoutRef,
  RefObject,
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
  RowAutoHeightModule,
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
  filterSelector?: JSX.Element | JSX.Element[]
  isLoading?: boolean
  useUrlSearch?: boolean
  handleReset?: () => void
  inputRef?: RefObject<HTMLInputElement>
  onPaginationChanged?: (page: number) => void
  onSelectionChanged?: () => void
  getRowId?: (params: any) => string
  showFilterBox?: boolean
  searchPlaceholder?: string
  getRowClass?: (params: any) => string
  onColumnMoved?: (event: ColumnMovedEvent) => void
  alwaysMultiSort?: boolean
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
  searchPlaceholder,
  onSelectionChanged,
  getRowId,
  getRowClass,
  useUrlSearch = false,
  showFilterBox = true,
  onColumnMoved,
  alwaysMultiSort = false,
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
    if (!useUrlSearch) return

    if (!debouncedQuickFilterText) {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('search')
      setSearchParams(newSearchParams)
      return
    }

    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('search', debouncedQuickFilterText)
    setSearchParams(newSearchParams)
  }, [debouncedQuickFilterText, searchParams, setSearchParams, useUrlSearch])

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
              containerCSSProps={{ width: '100%' }}
            />
          </div>
          {hasFilterSelection && filterSelector && handleReset && (
            <>
              <FilterSelectorContainer>
                {filterSelector}
              </FilterSelectorContainer>
            </>
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
        rowHeight={ROW_HEIGHT}
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
