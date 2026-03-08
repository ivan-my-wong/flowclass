import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import {
  getSiteEnabledFeature,
  mutateSiteEnabledFeature,
} from '@/api/sitesFeatureEnable'
import { QUERY_KEY } from '@/constants/queryKey'
import type { SiteFeatureRecord } from '@/types/site-feature'

import useAuth from './useAuth'

const useSitesFeatureEnabled = () => {
  const queryClient = useQueryClient()
  const useMutateSiteFeature = (onSuccess?: () => void) => {
    return useMutation({
      mutationFn: (dto: SiteFeatureRecord) => mutateSiteEnabledFeature(dto),
      onSuccess: () => {
        toast.success('Feature assignments updated')
        queryClient.invalidateQueries([
          QUERY_KEY.sitesFeatureEnabled.getAllSitesFeatureEnabled,
        ])
        onSuccess?.()
      },
      onError: (err: any) => {
        toast.error(err?.message ?? 'Failed to update feature assignments')
      },
    })
  }
  const useFetchSitesFeatureEnabled = () => {
    const { isLogin } = useAuth()

    return useQuery({
      queryKey: [QUERY_KEY.sitesFeatureEnabled.getAllSitesFeatureEnabled],
      queryFn: () => getSiteEnabledFeature(),
      enabled: isLogin,
      onError: (err: any) => {
        toast.error(err?.message ?? 'Failed to load site-feature assignments')
      },
    })
  }
  return {
    useFetchSitesFeatureEnabled,
    useMutateSiteFeature,
  }
}

export default useSitesFeatureEnabled
