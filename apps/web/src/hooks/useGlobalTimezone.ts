import { useEffect } from 'react'

import moment from 'moment'

import { Site } from '@/types/site'

export const useGlobalTimezone = (site: Site): void => {
  useEffect(() => {
    if (site?.timeZone) {
      moment.tz?.setDefault(site.timeZone.id)
    }
    return () => {
      moment.tz?.setDefault(moment.tz.guess())
    }
  }, [site])
}
