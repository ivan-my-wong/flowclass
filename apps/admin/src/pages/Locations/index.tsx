import { useCallback, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'

import { ColDef, ICellRendererParams, IRowNode } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useTranslation } from 'react-i18next'
import { LuMapPin } from 'react-icons/lu'
import { MultiValue, StylesConfig } from 'react-select'

import LabelSelector, {
  LabelSelectorRef,
} from '@/components/Selector/LabelSelector'
import { SelectItemValuesProps } from '@/components/Selector/Select'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import Heading from '@/components/Texts/Heading'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import useDynamicHeight from '@/hooks/useDynamicHeight'
import { useLocationRoom } from '@/hooks/useRoomLocation'
import ContentLayout from '@/layouts/ContentLayout'
import { LocationRoom } from '@/types/classes'

import { ActionButton } from './components/ActionButton'
import LocationModal from './components/LocationModal'

type FilterKeys = 'locationGroup' | 'capacity' | 'equipment'
type FilterParamsType = Record<FilterKeys, SelectItemValuesProps[]>
const LocationsPage = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [address, setAddress] = useState<string | null>(null)
  const [filterParams, setFilterParams] = useState<FilterParamsType>({
    locationGroup: [],
    capacity: [],
    equipment: [],
  })

  const { useFetchLocationRooms, useFetchLocationGroupAndEquipment } =
    useLocationRoom()
  const { data: locationRooms, isLoading: isLoadingLocationRooms } =
    useFetchLocationRooms()
  const { data: locationGroupAndEquipment } =
    useFetchLocationGroupAndEquipment()

  const [params, setParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const capacityRef = useRef<LabelSelectorRef>(null)
  const locationGroupRef = useRef<LabelSelectorRef>(null)
  const equipmentRef = useRef<LabelSelectorRef>(null)
  const gridRef = useRef<AgGridReact>(null)

  const columns: ColDef[] = useMemo(() => {
    return [
      {
        field: 'Action',
        headerName: t('location:locations.action'),
        filter: false,
        sortable: false,
        width: 70,
        cellClass: '!flex !items-start !justify-center',
        cellRenderer: (data: ICellRendererParams) => {
          const locationData: LocationRoom = data?.data

          return <ActionButton locationData={locationData} />
        },
      },
      {
        headerName: t('location:locations.name').toString(),
        field: 'name',
      },
      {
        headerName: t('location:locations.capacity').toString(),
        field: 'capacity',
      },
      {
        headerName: t('location:locations.locationGroup').toString(),
        field: 'locationGroup',
        minWidth: 150,
        cellRenderer: ({ data }: ICellRendererParams<LocationRoom>) => {
          if (!data) return null
          return (
            <div className="flex flex-wrap gap-1 items-center h-full line-clamp-2">
              {data.locationGroups.map((locationGroup, index) => {
                return (
                  <Badge variant="light" key={index}>
                    {locationGroup}
                  </Badge>
                )
              })}
            </div>
          )
        },
      },
      {
        headerName: t('location:locations.equipment').toString(),
        field: 'equipment',
        minWidth: 150,
        cellRenderer: ({ data }: ICellRendererParams<LocationRoom>) => {
          if (!data) return null
          return (
            <div className="flex flex-wrap gap-1 items-center h-full">
              {data.equipment.map(equipment => {
                return (
                  <Badge variant="light" key={equipment}>
                    {equipment}
                  </Badge>
                )
              })}
            </div>
          )
        },
      },
      {
        headerName: t('location:locations.description').toString(),
        field: 'description',
      },
      {
        headerName: t('location:locations.address').toString(),
        field: 'address',
        cellClass: 'justify-start',
        // address is an object (Coordinate/Address shape); cellRenderer handles
        // display, so silence AG Grid's "object cell data type needs a value
        // formatter" warning with a no-op valueFormatter.
        valueFormatter: () => '',
        cellRenderer: ({ data }: ICellRendererParams<LocationRoom>) => {
          if (!data) return null
          return (
            <div className="flex items-center gap-2 justify-start">
              {data.coordinate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsOpen(true)
                    setPosition(data.coordinate)
                    setAddress(data.address || null)
                  }}
                >
                  <LuMapPin />
                </Button>
              )}
              <div className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">
                {data.address}
              </div>
            </div>
          )
        },
      },
    ] as ColDef[]
  }, [t, locationRooms])
  const locationGroupOptions = useMemo(() => {
    return (locationGroupAndEquipment?.locationGroups || []).map(
      locationGroup => ({
        label: locationGroup,
        value: locationGroup,
      })
    )
  }, [locationGroupAndEquipment])
  const equipmentOptions = useMemo(() => {
    return (locationGroupAndEquipment?.equipment || []).map(equipment => ({
      label: equipment,
      value: equipment,
    }))
  }, [locationGroupAndEquipment])
  const capacityOptions = useMemo(() => {
    return Array.from(
      new Set(
        (locationRooms || [])?.map(
          (location: LocationRoom) => location.capacity
        )
      )
    ).map(capacity => ({
      label: capacity.toString(),
      value: capacity.toString(),
    }))
  }, [locationRooms])
  const getRowId = (params: IRowNode<LocationRoom>) => {
    if (!params.data?.id) return crypto.randomUUID()
    return params.data?.id.toString()
  }

  const handleReset = () => {
    setFilterParams({
      locationGroup: [],
      capacity: [],
      equipment: [],
    })
    setParams(prev => {
      prev.delete('search')
      return prev
    })
    gridRef?.current?.api.setFilterModel(null)
    if (inputRef.current) inputRef.current.value = ''
    if (locationGroupRef.current) locationGroupRef.current.clearValue()
    if (capacityRef.current) capacityRef.current.clearValue()
  }
  const onChangeFilterParams = useCallback(
    (key: FilterKeys, value: MultiValue<SelectItemValuesProps>) => {
      const valueArray = Array.isArray(value) ? value : [value]
      setFilterParams(prev => ({
        ...prev,
        [key]: valueArray,
      }))
    },
    []
  )
  const filteredLocationRooms = useMemo(() => {
    if (Object.values(filterParams).every(param => param.length === 0)) {
      return locationRooms
    }
    return (locationRooms || [])?.filter(location => {
      const locationGroupMatch = (filterParams?.locationGroup || []).some(
        group => location.locationGroups.includes(group.value.toString())
      )
      const capacityMatch = (filterParams?.capacity || []).some(
        capacity => location.capacity.toString() === capacity.value.toString()
      )
      const equipmentMatch = (filterParams?.equipment || []).some(equipment =>
        location.equipment.includes(equipment.value.toString())
      )
      return locationGroupMatch || capacityMatch || equipmentMatch
    })
  }, [filterParams, locationRooms])
  const navigate = useNavigate()
  const dynamicHeight = useDynamicHeight()
  return (
    <ContentLayout
      leftHeader={<Heading>{t('location:locations.title')}</Heading>}
      rightHeader={
        <Button
          onClick={() => navigate('/locations/add')}
          data-testid="add-location-button"
        >
          {t('location:locations.addLocation')}
        </Button>
      }
    >
      <div className="p-4 box-col-full">
        <div className="box-col-full">
          <QuickFilterTable
            getRowId={getRowId}
            rowData={filteredLocationRooms || []}
            columns={columns}
            isLoading={isLoadingLocationRooms}
            gridRef={gridRef}
            height={dynamicHeight}
            hasFilterSelection
            useUrlSearch
            searchPlaceholder={t(
              'location:locations.searchByLocationName'
            ).toString()}
            handleReset={handleReset}
            filterSelector={({ handleReset: reset }) => (
              <div className="box-responsive-full">
                <div className="box-row-full">
                  <LabelSelector
                    options={locationGroupOptions}
                    width="100%"
                    inputId="locationGroupFilterSelector"
                    onChange={e => onChangeFilterParams('locationGroup', e)}
                    selectOption={filterParams.locationGroup}
                    placeHolder={t('location:locations.searchByLocationGroup')}
                    ref={locationGroupRef}
                    isMulti
                    selectStyles={selectorStyles()}
                  />
                  <LabelSelector
                    options={capacityOptions ?? []}
                    width="100%"
                    inputId="capacityFilterSelector"
                    selectOption={filterParams.capacity}
                    onChange={e => onChangeFilterParams('capacity', e)}
                    placeHolder={t('location:locations.searchByCapacity')}
                    ref={capacityRef}
                    isMulti
                    selectStyles={selectorStyles()}
                  />
                </div>
                <div className="box-row-full">
                  <LabelSelector
                    options={equipmentOptions}
                    width="100%"
                    inputId="equipmentFilterSelector"
                    onChange={e => onChangeFilterParams('equipment', e)}
                    selectOption={filterParams.equipment}
                    placeHolder={t('location:locations.searchByEquipment')}
                    ref={equipmentRef}
                    isMulti
                    selectStyles={selectorStyles()}
                  />

                  <Button className="w-[20%]" variant="outline" onClick={reset}>
                    {t('recordLogs:notificationLogs.selectLabels.reset')}
                  </Button>
                </div>
              </div>
            )}
          />
        </div>
      </div>
      <Outlet />
      <LocationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position={position}
        address={address}
      />
    </ContentLayout>
  )
}

const selectorStyles = (): StylesConfig => ({
  control: styles => ({
    ...styles,
    backgroundColor: 'white',
  }),
  container: styles => ({
    ...styles,
    flex: '1',
  }),
})
export default LocationsPage
