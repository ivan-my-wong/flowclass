import { useCallback, useEffect, useRef } from 'react'

import { Marker, useMapsLibrary } from '@vis.gl/react-google-maps'

interface DraggableMarkerProps {
  position: { lat: number; lng: number } | null
  setPosition: (position: { lat: number; lng: number }) => void
  setAddress: (address: string | null) => void
  setCenter: (center: { lat: number; lng: number }) => void
}
function DraggableMarker({
  position,
  setCenter,
  setPosition,
  setAddress,
}: DraggableMarkerProps) {
  const tempPosition = useRef(position)
  const geocodingLibrary = useMapsLibrary('geocoding')
  const geocoder = useRef<google.maps.Geocoder | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    if (geocodingLibrary && !geocoder.current) {
      geocoder.current = new geocodingLibrary.Geocoder()
    }
  }, [geocodingLibrary])
  useEffect(() => {
    if (geocoder.current && position) {
      geocoder.current.geocode({ location: position }, (results, status) => {
        if (
          status === window.google.maps.GeocoderStatus.OK &&
          results &&
          results[0]
        ) {
          setAddress(results[0].formatted_address)
        } else {
          setAddress(null)
          console.error(`Geocoding failed: ${status}`)
          // Optionally show a user-friendly error message
        }
      })
    }
  }, [position])

  const onDragStart = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      tempPosition.current = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }
    }
  }, [])
  const onDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const coordinate = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }
      setPosition(coordinate)
      setCenter(coordinate)
      tempPosition.current = coordinate
    }
  }, [])

  return (
    <Marker
      ref={markerRef}
      position={position}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  )
}

export default DraggableMarker
