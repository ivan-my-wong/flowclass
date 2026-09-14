// Hong Kong Territories central coordinates as default map center
export const HKT_COORDINATE = {
  lat: 22.30953513130411,
  lng: 114.16187799982387,
}

// Default zoom level (12 shows a city-level view)
export const DEFAULT_ZOOM = 12
export const GOOGLE_MAP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
if (!GOOGLE_MAP_API_KEY) {
  console.warn('Google Maps API key is not defined in environment variables')
}
