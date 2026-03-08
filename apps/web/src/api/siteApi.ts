import { Site, SiteMap } from '@/types/site'

import customFetch from './baseClient'

export const getSiteByDomain = async (domain: string): Promise<Site> => {
  const { data } = await customFetch<Site>('/student/sites/detail', {
    query: { domain },
  })
  return data
}

export const getSiteMap = async (): Promise<SiteMap[]> => {
  const { data } = await customFetch<SiteMap[]>('/student/sites/siteMap', {})
  return data
}

export const getSiteMapByDomain = async (domain: string): Promise<SiteMap[]> => {
  const { data } = await customFetch<SiteMap[]>(`/student/sites/siteMap/${domain}`, {})
  return data
}

export const getSiteByCustomDomain = async (domain: string): Promise<Site> => {
  const { data } = await customFetch<Site>('/student/sites/custom-domain/detail', {
    query: { domain },
  })
  return data
}
