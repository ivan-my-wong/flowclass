import { useEffect, useState } from 'react'

import i18n from '@/i18n'

const useUserCountry = () => {
  const [country, setCountry] = useState<string>('Unknown')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => setCountry(data.country))
      .catch(() => setCountry('Unknown'))
      .finally(() => setIsLoading(false))
  }, [])

  return [country, isLoading]
}

export { useUserCountry }
