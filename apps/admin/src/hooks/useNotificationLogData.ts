import { useQuery } from 'react-query'

import { getNotificationLogs, RecordLogPayload } from '@/api/recordLogs'
import { CACHE_TIME } from '@/constants/common'
import { SELECT_FIELDS_NOTIFICATION_LOGS } from '@/constants/notificationLogs'
import { QUERY_KEY } from '@/constants/queryKey'

import useSchoolData from './useSchoolData'
import useSiteData from './useSiteData'

const useNotificationLogData = () => {
  const { currentSchool } = useSchoolData()
  const { currentSite } = useSiteData()
  const institutionId = currentSchool?.id || 0
  const siteId = currentSite?.id || 0
  const useFetchNotificationLogs = (params?: RecordLogPayload) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.notificationLog.notificationLogsKey,
        siteId,
        institutionId,
      ],
      queryFn: () =>
        getNotificationLogs({
          siteId,
          institutionId,
          payload: {
            ...params,
            select: SELECT_FIELDS_NOTIFICATION_LOGS,
          },
        }),
      enabled: !!siteId && !!institutionId,
      cacheTime: CACHE_TIME,
    })
  }
  return {
    useFetchNotificationLogs,
  }
}
export default useNotificationLogData
