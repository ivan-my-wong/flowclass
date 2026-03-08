import { useCallback, useEffect, useRef, useState } from 'react'

import { useDebounce } from '@uidotdev/usehooks'
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'

import { Spinner2 } from '@/components/Loaders/Spinner'
import { Input } from '@/components/ui/Inputs/Input'

interface SearchBoxProps {
  setCenter: (center: { lat: number; lng: number }) => void
  setZoom: (zoom: number) => void
}

function SearchPlaceBox({ setCenter, setZoom }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<google.maps.places.PlaceResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const map = useMap()
  const placesLibrary = useMapsLibrary('places')
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  const searchPlaces = useCallback(
    (query: string) => {
      if (!placesLibrary || !map || !query) return

      if (!placesService.current) {
        placesService.current = new placesLibrary.PlacesService(map)
      }
      setIsLoading(true)
      const request = {
        query,
        fields: [
          'name',
          'geometry',
          'formatted_address',
          'place_id',
          'types',
          'rating',
        ],
      }
      placesService.current.findPlaceFromQuery(request, (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          setResults(results)
          setShowResults(true)
        } else {
          setResults([])
          if (
            status ===
            window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
          ) {
            setError('No places found matching your search')
          } else if (
            status ===
            window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT
          ) {
            setError('API query limit reached. Please try again later')
          } else {
            setError('An error occurred while searching. Please try again')
          }
        }
        setIsLoading(false)
      })
    },
    [map, placesLibrary, query]
  )

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }
      setCenter(location)
      setZoom(15)
      setShowResults(false)
      setQuery(place.name || '')
    }
  }

  const queryDebounced = useDebounce(query, 500)

  useEffect(() => {
    if (queryDebounced) {
      searchPlaces(queryDebounced)
    }
  }, [queryDebounced])

  return (
    <div className="absolute top-4 left-0 right-0 mx-auto w-full max-w-md px-4 z-auto">
      <div className="relative">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for a place..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search for a place"
            aria-expanded={showResults && results.length > 0}
            className="w-full bg-white shadow-lg"
            aria-owns={
              showResults && results.length > 0 ? 'search-results' : undefined
            }
            aria-busy={isLoading}
            onKeyDown={e => {
              if (e.key === 'ArrowDown' && showResults && results.length > 0) {
                e.preventDefault()
                document.getElementById('search-result-0')?.focus()
              }
            }}
          />
          {isLoading && <Spinner2 />}
        </div>

        {showResults && results.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto"
            id="search-results"
            role="listbox"
          >
            <ul className="py-1">
              {results.map((place, index) => (
                <li
                  id={`search-result-${index}`}
                  key={`${place.place_id || place.name}-${index}`}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePlaceSelect(place)}
                  tabIndex={0}
                  role="option"
                  aria-selected={false}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handlePlaceSelect(place)
                    else if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      document
                        .getElementById(
                          `search-result-${
                            index + 1 < results.length ? index + 1 : 0
                          }`
                        )
                        ?.focus()
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      document
                        .getElementById(
                          `search-result-${
                            index - 1 >= 0 ? index - 1 : results.length - 1
                          }`
                        )
                        ?.focus()
                    }
                  }}
                >
                  <div className="font-medium">{place.name}</div>
                  <div className="text-sm text-gray-500">
                    {place.formatted_address}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 text-red-700 rounded-md shadow-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPlaceBox
