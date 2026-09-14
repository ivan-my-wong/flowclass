import { useEffect, useRef, useState } from 'react'

import { APIProvider, Map } from '@vis.gl/react-google-maps'

import {
  DEFAULT_ZOOM,
  GOOGLE_MAP_API_KEY,
  HKT_COORDINATE,
} from '@/constants/room-location'

import AddressInfoBox from './AddressInfoBox'
import SearchPlaceBox from './SearchPlaceBox'

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

const LocationMap = ({
  onCenterChange,
  children,
  address,
  position,
  searchable = true,
  setAddress,
}: LocationMapProps) => {
  const [center, setCenter] = useState(position || HKT_COORDINATE)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const centerChangedTimeout = useRef<NodeJS.Timeout | null>(null)

  const setCenterFromEvent = (center: { lat: number; lng: number }) => {
    if (centerChangedTimeout.current) {
      clearTimeout(centerChangedTimeout.current)
    }
    setCenter(center)
    centerChangedTimeout.current = setTimeout(() => {
      if (onCenterChange) {
        onCenterChange(center)
      }
    }, 500) // Small delay to avoid too frequent updates
  }
  useEffect(() => {
    return () => {
      if (centerChangedTimeout.current) {
        clearTimeout(centerChangedTimeout.current)
      }
    }
  }, [])

  return (
    <APIProvider apiKey={GOOGLE_MAP_API_KEY}>
      <div className="relative w-full h-full">
        <Map
          style={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          gestureHandling="cooperative"
          disableDefaultUI
          minZoom={2}
          maxZoom={20}
          onZoomChanged={e => setZoom(e.map.getZoom() || 0)}
          onCenterChanged={e => {
            if (!e.detail) return
            setCenterFromEvent(e.detail.center)
          }}
          onClick={e => {
            if (e.detail) {
              const newCenter = e.detail.latLng
              if (newCenter) {
                setCenterFromEvent(newCenter)
              }
            }
          }}
        >
          {children}
        </Map>
        {searchable && (
          <SearchPlaceBox setCenter={setCenter} setZoom={setZoom} />
        )}

        <AddressInfoBox
          address={address}
          setAddress={setAddress}
          coordinate={position}
        />
      </div>
    </APIProvider>
  )
}

export default LocationMap
