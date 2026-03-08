import { useMemo, useRef } from 'react'

import { ClientSideRowModelModule, RowHeightParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useTranslation } from 'react-i18next'

type TableProps = {
  rowData: Array<any>
  columns: Array<Object>
  height?: string
  rowHeight?: (params: RowHeightParams<any, any>) => number
  action?: React.ReactNode
  columnMinWidth?: number
}

const AgGridReactTable: React.FC<TableProps> = ({
  rowData,
  columns,
  height = '80vh',
  columnMinWidth,
  action,
  rowHeight,
  ...props
}) => {
  const { t } = useTranslation()
  const thisColumns = useMemo(() => {
    if (action) {
      return [
        ...columns,
        {
          headerName: t('common:action.update'),
          field: 'action',
          cellRenderer: 'ActionButton',
          cellRendererFramework: action,
        },
      ]
    }
    return columns
  }, [columns, action])

  const gridRef = useRef<AgGridReact<any>>(null)
  const defaultColDef = useMemo(() => {
    return {
      // flex: 1,
      sortable: true,
      resizable: true,
      filter: true,
      minWidth: columnMinWidth,
    }
  }, [])

  return (
    <div className="ag-theme-alpine" style={{ width: '100%', height }}>
      <AgGridReact<any>
        ref={gridRef}
        getRowHeight={rowHeight}
        rowData={rowData} // Row Data for Rows
        columnDefs={thisColumns} // Column Defs for Columns
        defaultColDef={defaultColDef}
        animateRows // Optional - set to 'true' to have rows animate when sorted
        components={
          action
            ? {
                ActionButton: () => action,
              }
            : undefined
        }
        modules={[ClientSideRowModelModule]}
        {...props}
      />
    </div>
  )
}
export default AgGridReactTable
