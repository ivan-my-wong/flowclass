import { useEffect, useMemo, useRef, useState } from 'react'

import { ICellRendererParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useTranslation } from 'react-i18next'

import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import { AppointmentForm } from '@/types/appointment'
import { Availability } from '@/types/availability.type'
import { getRowId } from '@/utils/misc'

export type ListClassProps = {
  data?: Availability & { appointments?: AppointmentForm[] }
  tabName?: string
}

const ListClass = ({ data, tabName }: ListClassProps): React.ReactElement => {
  const { t } = useTranslation()
  const gridRef = useRef<AgGridReact<AppointmentForm>>(null)

  const [filteredData, setFilteredData] = useState<AppointmentForm[]>([])

  useEffect(() => {
    if (data?.appointments) {
      setFilteredData(data.appointments)
    }
  }, [data?.appointments])

  const tableColumns = useMemo(() => {
    return [
      {
        field: 'course',
        filter: false,
        headerName: t('onboarding:welcome.courseName'),
        cellRenderer: (row: ICellRendererParams) => {
          const classess = row?.data?.class
          return classess?.course?.name
        },
        getQuickFilterText: (row: any) => {
          const classess = row?.data?.class
          return classess?.course?.name ?? ''
        },
      },
      {
        field: 'class',
        filter: false,
        headerName: t('onboarding:welcome.className'),
        cellRenderer: (row: ICellRendererParams) => {
          const classess = row?.data?.class
          return classess?.name
        },
        getQuickFilterText: (row: any) => {
          const classess = row?.data?.class
          return classess?.name ?? ''
        },
      },
    ]
  }, [t, filteredData])

  return (
    <QuickFilterTable
      columns={tableColumns}
      getRowId={row => getRowId('id', row)}
      gridRef={gridRef}
      rowData={filteredData}
      hasFilterSelection
      filterSelector={<div className="w-full" />}
      handleReset={() => {}}
      searchPlaceholder={t(`availability:filterPlaceholder`) as string}
    />
  )
}

export default ListClass
