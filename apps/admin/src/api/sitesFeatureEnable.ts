import { SiteFeatureRecord } from '@/types/site-feature'

import apiClient from '.'

export const getSiteEnabledFeature = async (): Promise<SiteFeatureRecord[]> => {
  const res = await apiClient.get({
    url: '/admin/sites-feature-enabled',
    needAuth: true,
  })
  return res.data?.data
}

export const mutateSiteEnabledFeature = async (
  payload: SiteFeatureRecord
): Promise<SiteFeatureRecord> => {
  const res = await apiClient.post({
    url: '/admin/sites-feature-enabled/mutate',
    needAuth: true,
    data: payload,
  })
  return res.data?.data
}
