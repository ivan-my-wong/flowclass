import { useEffect, useState } from 'react'

import { useMapsLibrary } from '@vis.gl/react-google-maps'

import { cn } from '@/utils/cn'

type AddressInfoBoxProps = {
  address?: string | null
  setAddress?: (address: string | null) => void
  coordinate?: { lat: number; lng: number } | null
}
const AddressInfoBox = ({
  address,
  setAddress,
  coordinate,
}: AddressInfoBoxProps) => {
  const geocodingLibrary = useMapsLibrary('geocoding')
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)

  useEffect(() => {
    if (geocodingLibrary && !geocoder) {
      setGeocoder(new geocodingLibrary.Geocoder())
    }
  }, [geocodingLibrary, geocoder])
  useEffect(() => {
    if (geocoder && coordinate && setAddress) {
      geocoder.geocode({ location: coordinate }, (results, status) => {
        if (
          status === window.google.maps.GeocoderStatus.OK &&
          results &&
          results[0]
        ) {
          setAddress(results[0].formatted_address)
        } else {
          setAddress(null)
        }
      })
    }
  }, [coordinate])
  return (
    <div
      className={cn(
        'bottom-2 left-2 right-2 absolute flex flex-col gap-2 bg-white p-4 rounded-lg shadow-md',
        {
          hidden: !address,
        }
      )}
    >
      <p className="text-sm text-gray-500" data-testid="address-info">
        {address}
      </p>
    </div>
  )
}

export default AddressInfoBox
