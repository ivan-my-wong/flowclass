type LocationMapProps = {
  onCenterChange?: (center: { lat: number; lng: number }) => void
  children?: React.ReactNode
  address?: string | null
  position?: {
    lat: number
    lng: number
  } | null
  searchable?: boolean
  setAddress?: (address: string | null) => void
}

const LocationMap = (_props: LocationMapProps) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-muted rounded-md border">
      <div className="text-center text-muted-foreground p-4">
        <p className="text-sm">Map placeholder</p>
        <p className="text-xs mt-1">
          Configure a map provider to enable location selection.
        </p>
      </div>
    </div>
  )
}

export default LocationMap
